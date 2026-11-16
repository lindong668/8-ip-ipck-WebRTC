// L1 · WebRTC ICE 候选采集（多端点并发观测版）。
// [v48 本轮变更] 真实泄露检测的地基：一个 STUN 端点没应答 ≠ 整条 UDP 路径没应答。
//   并发多组独立 RTCPeerConnection，每组绑不同公共 STUN / 不同端口，
//   任一组返回 srflx 就能与本次连接出口比对；合并去重后全量陈列，不做安全承诺。
//   零 srflx 只写「未收到应答」，不猜是谁拦的、不甩锅浏览器或扩展。
//   .local 一律标为浏览器临时名称（不是真实内网地址），不猜 192.168.x。
export const STUN_GROUPS = [
  { id: 'g1', urls: ['stun:stun.l.google.com:19302'] },
  { id: 'g2', urls: ['stun:stun1.l.google.com:19302'] },
  { id: 'g3', urls: ['stun:stun.cloudflare.com:3478', 'stun:stun.cloudflare.com:53'] },
  { id: 'g4', urls: ['stun:global.stun.twilio.com:3478'] },
];
export const STUN_URLS = STUN_GROUPS.reduce(function (a, g) { return a.concat(g.urls); }, []);
export const STUN_SOURCE = 'multiple public STUN endpoints, concurrent groups (observed candidates only)';
export const COLLECT_TIMEOUT_MS = 8000;

const CANDIDATE_TYPES = ['host', 'srflx', 'prflx', 'relay'];

function isIpLiteral(s) {
  var v = String(s || '').split('%')[0];
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(v)) {
    return v.split('.').every(function (p) { return Number(p) <= 255; });
  }
  if (v.indexOf(':') >= 0 && /^[0-9a-fA-F:.]+$/.test(v)) return true;
  return false;
}

export function parseCandidate(line) {
  if (!line || typeof line !== 'string') return null;
  var raw = line.trim();
  if (!raw) return null;
  var parts = raw.split(/\s+/);
  if (parts.length < 8) return null;
  // "candidate:<foundation> <component> <transport> <priority> <address> <port> typ <type> ..."
  var foundation = String(parts[0] || '').replace(/^candidate:/i, '');
  var component = parts[1];
  var transport = parts[2];
  var priority = parts[3];
  var address = parts[4];
  var port = parts[5];
  var typIdx = parts.indexOf('typ');
  var type = typIdx >= 0 ? parts[typIdx + 1] : null;
  if (!foundation || !/^[0-9a-zA-Z+/=]+$/.test(foundation)) return null;
  if (!/^\d+$/.test(component || '')) return null;
  if (['udp', 'tcp'].indexOf(String(transport || '').toLowerCase()) < 0) return null;
  if (!/^\d+$/.test(priority || '')) return null;
  if (!/^\d+$/.test(port || '')) return null;
  if (!address || !type) return null;
  if (CANDIDATE_TYPES.indexOf(type) < 0) return null;
  var obfuscated = /\.local\.?$/i.test(address);
  if (!obfuscated && !isIpLiteral(address)) return null;
  var ri = parts.indexOf('raddr');
  var raddr = ri >= 0 ? (parts[ri + 1] || null) : null;
  var rp = parts.indexOf('rport');
  var rport = rp >= 0 ? (parts[rp + 1] || null) : null;
  var network = (type === 'srflx' || type === 'prflx') ? 'public'
    : (type === 'relay' ? 'relay' : (obfuscated ? 'hidden' : 'private'));
  return {
    type: type,
    address: address,
    port: port,
    transport: transport,
    foundation: foundation,
    component: component,
    priority: priority,
    relatedAddress: raddr,
    relatedPort: rport,
    obfuscated: obfuscated,
    exposed: !obfuscated,
    network: network,
    raw: raw,
  };
}

// 单组独立采集：一个端点被掐不会拖垮其它组。
async function collectOne(group, timeoutMs) {
  var base = { id: group.id, urls: group.urls, supported: false, candidates: [],
    complete: false, timedOut: false, srflxCount: 0, reason: '' };
  if (typeof RTCPeerConnection === 'undefined') {
    base.reason = 'RTCPeerConnection unavailable';
    return base;
  }
  var pc;
  try { pc = new RTCPeerConnection({ iceServers: [{ urls: group.urls }] }); }
  catch (e) { base.reason = 'RTCPeerConnection init failed'; return base; }
  base.supported = true;

  var found = [];
  var seen = Object.create(null);
  var settle;
  var done = new Promise(function (resolve) { settle = resolve; });
  var finished = false, complete = false, timedOut = false;
  function finish(why) {
    if (finished) return;
    finished = true;
    if (why === 'complete') complete = true;
    if (why === 'timeout') timedOut = true;
    settle();
  }
  function push(line) {
    var p = parseCandidate(line);
    if (!p) return;
    var key = p.type + '|' + p.address + '|' + (p.relatedAddress || '');
    if (seen[key]) return;
    seen[key] = true;
    found.push(p);
  }
  pc.onicecandidate = function (ev) {
    if (ev.candidate && ev.candidate.candidate) push(ev.candidate.candidate);
    else if (ev.candidate === null) finish('complete');
  };
  try {
    pc.onicegatheringstatechange = function () {
      if (pc.iceGatheringState === 'complete') finish('complete');
    };
  } catch (e) {}
  try { pc.createDataChannel('ipckit'); } catch (e) {}
  try {
    var offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
  } catch (e) { finish('error'); }
  var hardTimer = setTimeout(function () { finish('timeout'); }, timeoutMs);
  await done;
  clearTimeout(hardTimer);
  try { pc.close(); } catch (e) {}

  base.candidates = found;
  base.complete = complete;
  base.timedOut = timedOut;
  base.srflxCount = found.filter(function (c) { return c.type === 'srflx'; }).length;
  if (!found.length) base.reason = complete ? 'gathering complete, no candidates' : 'no STUN response';
  return base;
}

export async function collectCandidates(options) {
  const opts = options || {};
  const groups = opts.stunGroups || STUN_GROUPS;
  const timeoutMs = opts.timeoutMs || COLLECT_TIMEOUT_MS;
  const startedAt = Date.now();

  const results = await Promise.all(groups.map(function (g) {
    return collectOne(g, timeoutMs).catch(function (e) {
      return { id: g.id, urls: g.urls, supported: false, candidates: [],
        complete: false, timedOut: false, srflxCount: 0, reason: String((e && e.message) || e) };
    });
  }));

  const found = [];
  const seen = Object.create(null);
  results.forEach(function (r) {
    (r.candidates || []).forEach(function (p) {
      const key = p.type + '|' + p.address + '|' + (p.relatedAddress || '');
      if (seen[key]) return;
      seen[key] = true;
      found.push(p);
    });
  });

  const anySupported = results.some(function (r) { return r.supported; });
  return {
    supported: anySupported,
    candidates: found,
    uniqueCount: found.length,
    gatheringComplete: results.every(function (r) { return r.complete; }),
    timedOut: results.some(function (r) { return r.timedOut; }),
    reason: anySupported ? '' : 'RTCPeerConnection unavailable',
    source: STUN_SOURCE,
    stunUrls: STUN_URLS,
    stunGroups: groups,
    groups: results.map(function (r) {
      return { id: r.id, urls: r.urls, supported: r.supported, srflxCount: r.srflxCount || 0,
        candidateCount: (r.candidates || []).length, complete: r.complete,
        timedOut: r.timedOut, reason: r.reason || '' };
    }),
    answeredGroups: results.filter(function (r) { return (r.srflxCount || 0) > 0; }).length,
    totalGroups: results.length,
    waitedMs: Date.now() - startedAt,
    observedAt: new Date().toISOString(),
  };
}

export const RTC_BROWSER_SRC = [
  'const STUN_GROUPS = ' + JSON.stringify(STUN_GROUPS) + ';',
  'const STUN_URLS = ' + JSON.stringify(STUN_URLS) + ';',
  'const STUN_SOURCE = ' + JSON.stringify(STUN_SOURCE) + ';',
  'const COLLECT_TIMEOUT_MS = ' + JSON.stringify(COLLECT_TIMEOUT_MS) + ';',
  'const CANDIDATE_TYPES = ' + JSON.stringify(CANDIDATE_TYPES) + ';',
  isIpLiteral.toString(),
  parseCandidate.toString(),
  collectOne.toString(),
  collectCandidates.toString(),
  'window.IPCK_RTC = { parseCandidate, collectCandidates, isIpLiteral, STUN_GROUPS, STUN_URLS, STUN_SOURCE, COLLECT_TIMEOUT_MS };',
].join('\n');
