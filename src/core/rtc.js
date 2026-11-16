// L1 · WebRTC ICE 候选采集（精准观测版）。
// 只报告浏览器本次实际产生的候选：严格按 RFC 5245 字段校验、按 type+address+raddr 去重，
// 等 gathering 完成或到达时限才收口（不再一拿到 srflx 就 200ms 截断，避免漏 relay / IPv6）。
// .local 一律标为浏览器临时名称（不是真实内网地址），不猜 192.168.x；不下「是否泄露」结论。
export const STUN_URLS = [
  'stun:stun.l.google.com:19302',
  'stun:stun1.l.google.com:19302',
  'stun:stun.cloudflare.com:3478',
];
export const STUN_SOURCE = 'standard public STUN endpoints (observed candidates only)';
export const COLLECT_TIMEOUT_MS = 5000;

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

export async function collectCandidates(options) {
  const opts = options || {};
  const stunUrls = opts.stunUrls || STUN_URLS;
  const timeoutMs = opts.timeoutMs || COLLECT_TIMEOUT_MS;
  const startedAt = Date.now();
  function unsupported(reason) {
    return {
      supported: false, candidates: [], uniqueCount: 0,
      gatheringComplete: false, timedOut: false, reason: reason,
      source: STUN_SOURCE, stunUrls: stunUrls, waitedMs: 0,
      observedAt: new Date().toISOString(),
    };
  }
  if (typeof RTCPeerConnection === 'undefined') return unsupported('RTCPeerConnection unavailable');
  let pc;
  try { pc = new RTCPeerConnection({ iceServers: [{ urls: stunUrls }] }); }
  catch (e) { return unsupported('RTCPeerConnection init failed'); }

  const found = [];
  const seen = Object.create(null);
  let settle;
  const done = new Promise(function (resolve) { settle = resolve; });
  let finished = false;
  let complete = false;
  let timedOut = false;
  function finish(why) {
    if (finished) return;
    finished = true;
    if (why === 'complete') complete = true;
    if (why === 'timeout') timedOut = true;
    settle();
  }
  function push(line) {
    const p = parseCandidate(line);
    if (!p) return;
    const key = p.type + '|' + p.address + '|' + (p.relatedAddress || '');
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
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
  } catch (e) { finish('error'); }
  const hardTimer = setTimeout(function () { finish('timeout'); }, timeoutMs);
  await done;
  clearTimeout(hardTimer);
  try { pc.close(); } catch (e) {}
  return {
    supported: true,
    candidates: found,
    uniqueCount: found.length,
    gatheringComplete: complete,
    timedOut: timedOut,
    source: STUN_SOURCE,
    stunUrls: stunUrls,
    waitedMs: Date.now() - startedAt,
    observedAt: new Date().toISOString(),
  };
}

export const RTC_BROWSER_SRC = [
  'const STUN_URLS = ' + JSON.stringify(STUN_URLS) + ';',
  'const STUN_SOURCE = ' + JSON.stringify(STUN_SOURCE) + ';',
  'const COLLECT_TIMEOUT_MS = ' + JSON.stringify(COLLECT_TIMEOUT_MS) + ';',
  'const CANDIDATE_TYPES = ' + JSON.stringify(CANDIDATE_TYPES) + ';',
  isIpLiteral.toString(),
  parseCandidate.toString(),
  collectCandidates.toString(),
  'window.IPCK_RTC = { parseCandidate, collectCandidates, isIpLiteral, STUN_URLS, STUN_SOURCE, COLLECT_TIMEOUT_MS };',
].join('\n');
