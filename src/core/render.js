// L1 · 结果渲染器。h8：中文页在展示层加译名，原始值放括号内，绝不写回数据。
export function escHtml(v) {
  return String(v == null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ---- v28 · 大众认知口径：host 公网 + srflx 公网都参与判定 ----
// host = 本机网卡上报地址；srflx = STUN 反射出口；relay / prflx 只做展示。
// IPv4 只比 IPv4 出口、IPv6 只比 IPv6 出口，绝不跨版本混比。
export function ipVersionOf(addr) {
  var s = String(addr || '').split('%')[0].trim();
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(s)) return 4;
  if (s.indexOf(':') >= 0 && /^[0-9a-fA-F:.]+$/.test(s)) return 6;
  return null;
}
export function normIp(addr) {
  var s = String(addr || '').split('%')[0].trim().toLowerCase();
  var v = ipVersionOf(s);
  if (v === 4) return s.split('.').map(function (p) { return String(Number(p)); }).join('.');
  if (v !== 6) return s;
  var t = s, head = [], tail = [], parts;
  if (t.indexOf('::') >= 0) {
    var sp = t.split('::');
    head = sp[0] ? sp[0].split(':') : [];
    tail = sp[1] ? sp[1].split(':') : [];
    var miss = 8 - head.length - tail.length;
    var mid = [];
    for (var i = 0; i < miss; i++) mid.push('0');
    parts = head.concat(mid, tail);
  } else parts = t.split(':');
  return parts.map(function (h) { return ('0000' + (h || '0')).slice(-4); }).join(':');
}
export function isPrivateHost(addr, obfuscated) {
  var s = String(addr || '').split('%')[0].trim().toLowerCase();
  if (!s) return true;
  if (/\.local\.?$/.test(s)) return true;
  if (obfuscated) return true;
  var v = ipVersionOf(s);
  if (v === 4) {
    var p = s.split('.').map(Number);
    if (p.length !== 4 || p.some(isNaN)) return true;
    if (p[0] === 10) return true;
    if (p[0] === 172 && p[1] >= 16 && p[1] <= 31) return true;
    if (p[0] === 192 && p[1] === 168) return true;
    if (p[0] === 127 || p[0] === 0) return true;
    if (p[0] === 169 && p[1] === 254) return true;
    return false;
  }
  if (v === 6) {
    var h = s.split(':')[0].replace(/^0+/, '') || '0';
    var n = parseInt(h, 16);
    if (isNaN(n)) return true;
    if ((n & 0xfe00) === 0xfc00) return true;
    if ((n & 0xffc0) === 0xfe80) return true;
    if (s === '::' || s === '::1') return true;
    return false;
  }
  return true;
}
export function classifyCandidate(c) {
  if (!c) return 'other';
  if (c.type === 'srflx') return 'srflx';
  if (c.type === 'prflx') return 'prflx';
  if (c.type === 'relay') return 'relay';
  if (c.type === 'host') return isPrivateHost(c.address, c.obfuscated) ? 'hostPrivate' : 'hostPublic';
  return 'other';
}
export function judgeLeak(list, conn) {
  var rows = list || [];
  var c4 = conn && conn.ipv4 ? normIp(conn.ipv4) : null;
  var c6 = conn && conn.ipv6 ? normIp(conn.ipv6) : null;
  var eligible = [], diffs = [], same = [], skipped = [];
  var hostPublicCount = 0, srflxPublicCount = 0;
  for (var i = 0; i < rows.length; i++) {
    var c = rows[i];
    if (!c) continue;
    var isHost = c.type === 'host';
    var isSrflx = c.type === 'srflx';
    if (!isHost && !isSrflx) continue;              // relay / prflx / other 仅展示
    if (c.obfuscated || isPrivateHost(c.address, c.obfuscated)) continue;  // 内网与临时名称剔除
    var v = ipVersionOf(c.address);
    if (v === null) { skipped.push(c); continue; }
    eligible.push(c);
    if (isHost) hostPublicCount++; else srflxPublicCount++;
    var exit = v === 4 ? c4 : c6;                    // 同版本出口，绝不跨 v4/v6
    if (!exit) { skipped.push(c); continue; }
    if (normIp(c.address) !== exit) diffs.push(c); else same.push(c);
  }
  var state;
  if (diffs.length) state = 'leak';                 // ① 任一同版本公网地址不一致
  else if (!eligible.length || !same.length) state = 'gray';  // ③ 无有效地址 / 无同版本出口
  else state = 'ok';                               // ② 全部一致
  return {
    state: state,
    hostPublicCount: hostPublicCount, srflxPublicCount: srflxPublicCount,
    eligibleCount: eligible.length,
    diffs: diffs, same: same, skipped: skipped, connV4: c4, connV6: c6
  };
}
export function verdictCardHtml(state, L, j) {
  var cls = state === 'leak' ? 'leak' : (state === 'gray' ? 'gray' : 'ok');
  var out = '<div class="ipck-verdict ' + cls + '">';
  if (state === 'leak') {
    out += '<h3>' + escHtml(L('rtc.verdict.leakTitle')) + '</h3>';
    out += '<p class="ipck-verdict-note">' + escHtml(L('rtc.verdict.leakNote')) + '</p>';
    out += '<p class="ipck-verdict-sup">' + escHtml(L('rtc.verdict.leakSup')) + '</p>';
  } else if (state === 'gray') {
    out += '<h3>' + escHtml(L('rtc.verdict.grayTitle')) + '</h3>';
    out += '<p class="ipck-verdict-note">' + escHtml(L('rtc.verdict.grayNote')) + '</p>';
  } else {
    out += '<h3>' + escHtml(L('rtc.verdict.okTitle')) + '</h3>';
    out += '<p class="ipck-verdict-note">' + escHtml(L('rtc.verdict.okNote')) + '</p>';
    out += '<p class="ipck-verdict-sup">' + escHtml(L('rtc.verdict.okSup')) + '</p>';
  }
  if (j) {
    var line = L('rtc.verdict.exitLine').split('{v4}').join(j.connV4 || L('rtc.cmp.na'))
      .split('{v6}').join(j.connV6 || L('rtc.cmp.na'));
    out += '<p class="ipck-verdict-exit">' + escHtml(line) + '</p>';
  }
  return out + '</div>';
}

export function renderResultBlocks(data, labels, mode) {
  var L = function (k) { return labels && Object.prototype.hasOwnProperty.call(labels, k) ? labels[k] : k; };
  var d = data || {};
  var started = !!d.started;
  var m = mode || 'overview';
  // 译名映射：Worker 端（globalThis.IPCK_PAGE 不存在）自动退化为不翻译。
  var G = (typeof globalThis !== 'undefined' && globalThis.IPCK_PAGE &&
           globalThis.IPCK_PAGE.lang === 'zh-CN' && globalThis.IPCK_GEO_ZH) ? globalThis.IPCK_GEO_ZH : null;
  function loc(kind, v) {
    if (!G || v == null || v === '') return v;
    var raw = String(v);
    var mp = (G.map && G.map[kind]) || {};
    if (mp[raw]) return mp[raw] + ' (' + raw + ')';
    if (kind === 'isp' && G.orgKeys) {
      for (var z = 0; z < G.orgKeys.length; z++) {
        if (raw.toLowerCase().indexOf(String(G.orgKeys[z][0]).toLowerCase()) >= 0)
          return G.orgKeys[z][1] + ' (' + raw + ')';
      }
    }
    return raw;
  }

  // ---- IP ----
  var ipHtml;
  if (!started) {
    ipHtml = '<div class="ipck-empty">' + escHtml(L('ov.empty')) + '</div>';
  } else if (d.ipError) {
    ipHtml = '<div class="ipck-notice"><b>' + escHtml(L('ip.apiUnreachableTitle')) + '</b><p>' + escHtml(L('ip.apiUnreachableBody')) + '</p></div>';
  } else if (!d.ip) {
    ipHtml = '<div class="ipck-empty">' + escHtml(L('state.notExposed')) + '</div>';
  } else if (d.ip.ip == null && d.ip.edgeOk === false) {
    // h3：边缘没注入头 ≠ 浏览器没暴露。明确区分部署层与观测层，不再误导。
    ipHtml = '<div class="ipck-notice"><b>' + escHtml(L('ip.edgeMissingTitle')) + '</b><p>' + escHtml(L('ip.edgeMissingBody')) + '</p></div>';
  } else {
    var f = d.ip.fields || {};
    // h21 · 库实际有值才渲染；本库无 city / timezone 列，故不摆这两格。
    var rows = [
      ['ov.country', loc('country', f.country)], ['ov.region', loc('region', f.region)],
      ['ov.asn', f.asn], ['ov.isp', loc('isp', f.isp)],
    ];
    var big = m === 'ip'
      ? '<div class="ipck-big">' + escHtml(d.ip.ip || L('state.notExposed')) + '</div>'
      : '<div class="ipck-summary-ip"><span>' + escHtml(L('ov.ip')) + '</span><b>' + escHtml(d.ip.ip || L('state.notExposed')) + '</b></div>';
    var grid = '<div class="ipck-grid-fields">';
    for (var i = 0; i < rows.length; i++) {
      var val = rows[i][1];
      if (val == null || val === '') continue;
      grid += '<div class="ipck-field"><span>' + escHtml(L(rows[i][0])) + '</span><b>' + escHtml(val) + '</b></div>';
    }
    grid += '</div>';
    // [v32 本轮变更] 结果区只留用户真正需要的数据 + 许可回链。
    // 旧横幅、库加载状态、精度说明与译名注明一律不外显。
    var attrHtml = '';
    if (d.ip.attribution && d.ip.attribution.url) {
      attrHtml = '<div class="ipck-attr"><a href="' + escHtml(d.ip.attribution.url) + '" rel="noopener noreferrer nofollow" target="_blank">' + escHtml(d.ip.attribution.label) + '</a> · ' + escHtml(d.ip.attribution.license) + '</div>';
    }
    ipHtml = big + grid + attrHtml;
  }

  // ---- WebRTC（v28 · host 公网 + srflx 公网参与判定；relay / prflx 只做展示）----
  var rtcHtml;
  if (!started) {
    rtcHtml = '<div class="ipck-empty">' + escHtml(L('ov.empty')) + '</div>';
  } else if (!d.rtc || !d.rtc.supported) {
    rtcHtml = verdictCardHtml('gray', L, null);
  } else {
    var list = d.rtc.candidates || [];
    var conn = { ipv4: d.rtc.connectionIpv4 || null, ipv6: d.rtc.connectionIpv6 || null };
    if (!conn.ipv4 && !conn.ipv6) {
      var legacy = d.rtc.connectionIp || (d.ip && d.ip.ip) || null;
      if (legacy) {
        if (ipVersionOf(legacy) === 4) conn.ipv4 = legacy;
        else if (ipVersionOf(legacy) === 6) conn.ipv6 = legacy;
      }
    }
    if (!list.length) {
      rtcHtml = verdictCardHtml('gray', L, null);
    } else {
      var j = judgeLeak(list, conn);
      // [v31 本轮变更 ⑩] 明确区分公网 IP / 内网局域网 IP：先统计，再给图例
      var pub = 0, priv = 0, otherN = 0;
      for (var z = 0; z < list.length; z++) {
        var kz = classifyCandidate(list[z]);
        if (kz === 'hostPublic' || kz === 'srflx' || kz === 'prflx' || kz === 'relay') pub += 1;
        else if (kz === 'hostPrivate' || list[z].obfuscated) priv += 1;
        else otherN += 1;
      }
      // v29 · 顶部统一提示风险结论；下方表格标注具体泄露类型与来源归类
      rtcHtml = verdictCardHtml(j.state, L, j);
      var legendLine = L('rtc.legendLine').split('{pub}').join(String(pub))
        .split('{priv}').join(String(priv)).split('{other}').join(String(otherN));
      rtcHtml += '<div class="ipck-net-legend"><b>' + escHtml(L('rtc.netLegendTitle')) + '</b>' +
        '<span class="ipck-badge pub">' + escHtml(L('rtc.badgePublic')) + '</span>' +
        '<span class="ipck-badge priv">' + escHtml(L('rtc.badgePrivate')) + '</span>' +
        '<span class="ipck-legend-line">' + escHtml(legendLine) + '</span></div>';
      rtcHtml += '<div class="ipck-table-wrap"><table class="ipck-table"><thead><tr>' +
        '<th>' + escHtml(L('rtc.col.type')) + '</th>' +
        '<th>' + escHtml(L('rtc.col.address')) + '</th>' +
        '<th>' + escHtml(L('rtc.col.network')) + '</th>' +
        '<th>' + escHtml(L('rtc.col.status')) + '</th>' +
        '<th>' + escHtml(L('rtc.col.compare')) + '</th>' +
        '<th>' + escHtml(L('rtc.col.category')) + '</th>' +
        '</tr></thead><tbody>';
      for (var k = 0; k < list.length; k++) {
        var c = list[k];
        var kind = classifyCandidate(c);
        var addr = c.obfuscated
          ? escHtml(c.address) + ' (' + escHtml(L('rtc.alias')) + ')'
          : escHtml(c.address);
        var net = kind === 'hostPrivate' ? L('rtc.private')
          : (kind === 'hostPublic' ? L('rtc.publicHost')
            : (kind === 'srflx' || kind === 'prflx' ? L('rtc.public')
              : L('rtc.notExposed')));
        var st = c.obfuscated ? L('rtc.notExposed') : L('state.observed');
        var dot = c.obfuscated ? 'n' : 'g';
        var cmp;
        if (kind === 'hostPublic' || kind === 'srflx') {
          var vv = ipVersionOf(c.address);
          var ex = vv === 4 ? conn.ipv4 : (vv === 6 ? conn.ipv6 : null);
          cmp = !ex ? L('rtc.cmp.noPeer')
            : (normIp(c.address) === normIp(ex) ? L('rtc.cmp.same') : L('rtc.cmp.diff'));
        } else {
          cmp = L('rtc.cmp.notUsed');
        }
        // [v31] 每行「网络」列用配色徽标标出公网 / 内网
        var netCls = kind === 'hostPrivate' ? 'priv'
          : ((kind === 'hostPublic' || kind === 'srflx' || kind === 'prflx' || kind === 'relay') ? 'pub' : 'other');
        var netBadge = '<span class="ipck-badge ' + netCls + '">' + escHtml(net) + '</span>';
        rtcHtml += '<tr><td>' + escHtml(c.type) + '</td><td>' + addr + '</td><td>' + netBadge +
          '</td><td><span class="ipck-dot ' + dot + '"></span>' + escHtml(st) + '</td><td>' +
          escHtml(cmp) + '</td><td>' + escHtml(L('rtc.cat.' + kind)) + '</td></tr>';
      }
      rtcHtml += '</tbody></table></div>';
      // [v32 本轮变更] 常驻滑动提示：不滑动也能一眼看出表格可横向查看
      rtcHtml += '<p class="ipck-swipe-hint">' + escHtml(L('rtc.swipeHint')) + '</p>';
      var stateTxt = d.rtc.timedOut ? L('rtc.metaTimeout') : L('rtc.metaComplete');
      var meta = L('rtc.metaLine').split('{n}').join(String(list.length))
        .split('{ms}').join(String(d.rtc.waitedMs == null ? 0 : d.rtc.waitedMs))
        .split('{state}').join(stateTxt);
      rtcHtml += '<p class="ipck-precision">' + escHtml(meta) + '</p>';
      rtcHtml += '<p class="ipck-precision">' + escHtml(L('rtc.precisionBody')) + '</p>';
      rtcHtml += '<p class="ipck-scope">' + escHtml(L('rtc.scope')) + '</p>';
    }
  }

  return { ipHtml: ipHtml, rtcHtml: rtcHtml };
}

// h3 · 诊断条：页面自己说清哪一层断了，用户不必去「证明版本」。
export function renderDiagHtml(data, labels) {
  var L = function (k) { return labels && Object.prototype.hasOwnProperty.call(labels, k) ? labels[k] : k; };
  var d = data || {};
  if (d.jsBroken) return '<span class="ipck-diag-bad">' + escHtml(L('diag.jsBroken')) + '</span>';
  if (!d.started) return '<span>' + escHtml(L('diag.idle')) + '</span>';
  var out = '';
  if (d.diag && d.diag.apiTimeout) out += '<span class="ipck-diag-bad">' + escHtml(L('diag.apiTimeout')) + '</span> ';
  else if (d.diag && d.diag.apiDown) out += '<span class="ipck-diag-bad">' + escHtml(L('diag.apiDown')) + '</span> ';
  else if (d.diag && d.diag.edgeMissing) out += '<span class="ipck-diag-bad">' + escHtml(L('diag.edgeMissing')) + '</span> ';
  else if (d.diag && d.diag.edgeOk) out += '<span class="ipck-diag-ok">' + escHtml(L('diag.edgeOk')) + '</span> ';
  return out || '<span>' + escHtml(L('common.error')) + '</span>';
}

export const RENDER_BROWSER_SRC = [
  escHtml.toString(),
  ipVersionOf.toString(),
  normIp.toString(),
  isPrivateHost.toString(),
  classifyCandidate.toString(),
  judgeLeak.toString(),
  verdictCardHtml.toString(),
  renderResultBlocks.toString(),
  renderDiagHtml.toString(),
  'window.IPCK_RENDER = { escHtml, renderResultBlocks, renderDiagHtml };',
].join('\n');
