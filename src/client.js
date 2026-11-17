// 8号 h8 · 浏览器编排。唯一触发点是按钮 click；页面加载不自动跑、不预取、不提前连 STUN。
// h7 修复（针对线上「结果渲染异常，连 IP 都出不来」）+ h8（__name 兜底 / 中文译名 / 红字降级）：
//   1) IP 块改为原生兜底渲染，不依赖 IPCK_RENDER / IPCK_SOURCE 任一模块或函数；
//   2) paint() 拆成 4 段独立 try/catch，一个模块坏了不拖垮其余三块；
//   3) catch 把真实异常 name + message 显示在诊断条，不再用一句笼统文案吞掉；
//   4) 能力自检从「模块对象存在」细化到「必需函数存在」，缺哪个直接点名；
//   5) 富渲染只作为增强覆盖，失败时保留兜底 IP，绝不把三个框一起清空。
// 合规门控不变：features.webrtc=false → 不创建 RTCPeerConnection、不连任何 STUN；
// v29：点击即检测，页面不写本地同意状态，服务端零留存；署名常驻。
export const CLIENT_JS = `
(function () {
  var L = window.IPCK_I18N || {};
  var page = window.IPCK_PAGE || {};
  var LEGAL = ['about', 'privacy', 'terms', 'rights'];

  // [v31 本轮变更 ⑨] JS 异常一律在页面输出，禁止静默失败 / 页面空白
  function jsErrText(e) {
    return String((e && e.name) || 'Error') + ': ' + String((e && e.message) || e || 'unknown');
  }
  function showJsError(msg) {
    var d = document.getElementById('ipck-diag');
    if (d) d.innerHTML = '<span class="ipck-diag-bad">' + esc(msg) + '</span>';
    var e2 = document.getElementById('ipck-rtc-error');
    if (e2) { e2.hidden = false; e2.textContent = msg; }
  }
  function reportScriptError(raw) {
    try {
      showJsError(T('diag.scriptError', 'Script error: {err}').split('{err}').join(String(raw || 'unknown')));
    } catch (x) {}
  }
  window.addEventListener('error', function (ev) {
    reportScriptError((ev && ev.message) || 'unknown');
  });
  window.addEventListener('unhandledrejection', function (ev) {
    var r = ev && ev.reason;
    reportScriptError((r && r.message) || r || 'unhandled rejection');
  });

  if (page && LEGAL.indexOf(page.structure) >= 0) return;
  // [v33] 编排层收口：以下逻辑只服务 IP 归属 / WebRTC / 任意 IP 查询。

  var features = page.features || { ip: true, webrtc: false };
  // [v50-r2] 检测与「输入 IP 查询」各自独立：慢检测（全局代理下 WebRTC 等满 8s）
  //   不再吞掉查询，也不在结束后用本机结果覆盖查询结果。
  //   paintSeq 保证只有「最后一次用户操作」的结果落地。
  var runBusy = false;
  var lookupBusy = false;
  var paintSeq = 0;
  var btn = document.getElementById('ipck-run');
  var bar = document.getElementById('ipck-progress');
  var diag = document.getElementById('ipck-diag');
  // [v50] 冷启动加载离线库 + 全局网络转发绕路时，旧的 4 秒上限会把正常请求误判成超时。
  //   放宽到 12 秒，并对「超时 / 5xx」自动重试一次：第二个请求到的是已热 isolate，通常毫秒级返回。
  //   GET 幂等，不写任何服务端状态、不重复触发采集。
  var API_TIMEOUT_MS = 12000;
  // h9 · 任意 IP 输入区
  var input = document.getElementById('ipck-ip-input');
  var lookupBtn = document.getElementById('ipck-lookup-run');
  var lookupClear = document.getElementById('ipck-lookup-clear');

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function T(k, d) { return Object.prototype.hasOwnProperty.call(L, k) ? L[k] : (d || k); }
  // h8 · 展示层中文译名：只在 zh-CN 生效，原始值放括号内，绝不改动数据。
  function geoCtx() {
    try { return (page.lang === 'zh-CN' && window.IPCK_GEO_ZH) ? window.IPCK_GEO_ZH : null; }
    catch (e) { return null; }
  }
  function loc(G, kind, v) {
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
  // [v32 本轮变更] 版本号随署名常驻，撤回 / 重绘后仍在
  function sbCtx() { return { lib: page.lib || null, contact: page.contact || '', appVersion: page.version || '' }; }

  // h7：不依赖任何注入模块的 IP 兜底渲染。只要 /api/ip 回了 JSON，IP 就一定看得见。
  function fallbackIpHtml(data) {
    var d = data || {};
    if (!d.started) return '<div class="ipck-empty">' + esc(T('ov.empty', '尚未检测')) + '</div>';
    if (d.ipError || !d.ip) {
      return '<div class="ipck-notice"><b>' + esc(T('ip.apiUnreachableTitle', '接口未连通')) + '</b><p>' +
        esc(T('ip.apiUnreachableBody', '本次检测未能完成，请稍后重试。')) + '</p></div>';
    }
    var ip = d.ip;
    if (ip.queryMode === 'manual') return manualIpHtml(ip);
    if (ip.ip == null && ip.edgeOk === false) {
      return '<div class="ipck-notice"><b>' + esc(T('ip.edgeMissingTitle', '未取得本次连接 IP')) + '</b><p>' +
        esc(T('ip.edgeMissingBody', '当前请求未取得该信息，请稍后重试。')) + '</p></div>';
    }
    var f = ip.fields || {};
    var G = geoCtx();
    // h21 · 库有什么就显示什么：候选四项，值为空整块不渲染，绝不摆空框、绝不写占位。
    var rows = [
      ['ov.country', '国家', loc(G, 'country', f.country)],
      ['ov.region', '地区', loc(G, 'region', f.region)],
      ['ov.asn', 'ASN', f.asn],
      ['ov.isp', '运营商', loc(G, 'isp', f.isp)]
    ];
    var out = subjectLine(ip, false) + '<div class="ipck-summary-ip"><span>' + esc(T('ov.ip', 'IP 地址')) + '</span><b>' +
      esc(ip.ip || T('state.notExposed', '浏览器未暴露')) + '</b></div>';
    out += '<div class="ipck-grid-fields">';
    for (var i = 0; i < rows.length; i++) {
      var v = rows[i][2];
      if (v == null || v === '') continue;
      out += '<div class="ipck-field"><span>' + esc(T(rows[i][0], rows[i][1])) + '</span><b>' + esc(v) + '</b></div>';
    }
    out += '</div>';
    // [v32 本轮变更] 库版本 / 数据源 / 译名注明不外显，页脚署名已常驻
    if (ip.attribution && ip.attribution.url) {
      out += '<div class="ipck-attr"><a href="' + esc(ip.attribution.url) +
        '" rel="noopener noreferrer nofollow" target="_blank">' + esc(ip.attribution.label) + '</a> · ' +
        esc(ip.attribution.license) + '</div>';
    }
    return out;
  }

  // h9 · 查询对象标签：本机观测 / 用户输入的 IP，绝不混为一谈。
  function subjectLine(ip, manual) {
    var key = manual ? 'lookup.subjectManual' : 'lookup.subjectSelf';
    var fallback = manual ? 'Subject: the IP you entered' : 'Subject: this connection';
    return '<div class="ipck-subject' + (manual ? ' manual' : '') + '">' + esc(T(key, fallback)) + '</div>';
  }
  function attrHtml(ip) {
    if (!ip || !ip.attribution || !ip.attribution.url) return '';
    return '<div class="ipck-attr"><a href="' + esc(ip.attribution.url) +
      '" rel="noopener noreferrer nofollow" target="_blank">' + esc(ip.attribution.label) + '</a> · ' +
      esc(ip.attribution.license) + '</div>';
  }
  // h9 · 输入模式专用渲染：库未加载 / 无归属行 / 非法输入都给明确结论，不铺一排「未暴露」。
  function manualIpHtml(ip) {
    var out = subjectLine(ip, true);
    var st = ip.status;
    if (st === 'invalid') {
      return out + '<div class="ipck-notice"><p>' +
        esc(T('lookup.invalid', 'Not a valid IPv4 or IPv6 address. No request was made.')) + '</p></div>' + attrHtml(ip);
    }
    if (st === 'lib-not-loaded') {
      return out + '<div class="ipck-notice"><b>' + esc(T('lookup.libMissingTitle', '离线库未加载')) + '</b><p>' +
        esc(T('lookup.libMissing', 'Offline library not loaded.')) + '</p></div>' +
        '<p class="ipck-scope">' + esc(ip.message || '') + '</p>' + attrHtml(ip);
    }
    if (st === 'no-row') {
      return out + '<div class="ipck-summary-ip"><span>' + esc(T('ov.ip', 'IP 地址')) + '</span><b>' +
        esc(ip.ip || '') + '</b></div>' +
        '<div class="ipck-notice"><b>' + esc(T('lookup.noRowTitle', '该地址无公开归属数据')) + '</b><p>' +
        esc(T('lookup.noRow', 'No public attribution row.')) + '</p></div>' +
        attrHtml(ip);
    }
    var f = ip.fields || {};
    var G = geoCtx();
    // h21 · 同上：只渲染该次命中里真实有值的字段。
    var rows = [
      ['ov.country', '国家', loc(G, 'country', f.country)],
      ['ov.region', '地区', loc(G, 'region', f.region)],
      ['ov.asn', 'ASN', f.asn],
      ['ov.isp', '运营商', loc(G, 'isp', f.isp)]
    ];
    out += '<div class="ipck-summary-ip"><span>' + esc(T('ov.ip', 'IP 地址')) + '</span><b>' + esc(ip.ip || '') + '</b></div>';
    out += '<div class="ipck-grid-fields">';
    for (var i = 0; i < rows.length; i++) {
      var v = rows[i][2];
      if (v == null || v === '') continue;
      out += '<div class="ipck-field"><span>' + esc(T(rows[i][0], rows[i][1])) + '</span><b>' + esc(v) + '</b></div>';
    }
    out += '</div>';
    // [v32 本轮变更] 只保留必要提示，库版本与译名注明不外显
    out += '<p class="ipck-scope">' + esc(T('lookup.scopeNote', 'Results describe an IP range, not a person.')) + '</p>';
    return out + attrHtml(ip);
  }

  // [v48] 上次观测对照：只在浏览器本地保存上次实际看到的公网候选地址，供复测比对。
  //   不上传、不写服务端；零公网候选时不覆盖，避免把上一次的观测抹掉。
  //   清除浏览器本站数据即可删除，页面 runNotice 已明确告知。
  var BASE_KEY = 'ipckit.lastObserved.v1';
  function loadBaseline() {
    try {
      var raw = localStorage.getItem(BASE_KEY);
      if (!raw) return null;
      var j = JSON.parse(raw);
      return (j && Array.isArray(j.addresses)) ? j : null;
    } catch (e) { return null; }
  }
  function saveBaseline(data) {
    try {
      var rtc = data && data.rtc;
      if (!rtc || !rtc.supported || !Array.isArray(rtc.candidates)) return;
      var addrs = [];
      rtc.candidates.forEach(function (c) {
        if (!c || c.obfuscated || !c.address) return;
        if (c.type !== 'srflx' && c.type !== 'host') return;
        var a = String(c.address).split('%')[0].trim().toLowerCase();
        if (/\.local\.?$/.test(a) || !/^[0-9a-fA-F:.]+$/.test(a)) return;
        if (addrs.indexOf(a) < 0) addrs.push(a);
      });
      if (!addrs.length) return;
      localStorage.setItem(BASE_KEY, JSON.stringify({
        addresses: addrs,
        exitV4: rtc.connectionIpv4 || null,
        exitV6: rtc.connectionIpv6 || null,
        srflxCount: rtc.candidates.filter(function (c) { return c && c.type === 'srflx'; }).length,
        at: new Date().toISOString()
      }));
    } catch (e) {}
  }

  function clearResults() {
    paintSeq++;   // [v50-r2] 清除也是一次用户操作，正在跑的慢检测不得再覆盖清空态
    ['ip', 'rtc'].forEach(function (k) {
      var el = document.getElementById('ipck-' + k);
      if (el) el.innerHTML = '<div class="ipck-empty">' + esc(T('ov.empty', '尚未检测')) + '</div>';
    });
    try {
      var sb = document.getElementById('ipck-sourcebar');
      var S = window.IPCK_SOURCE;
      if (sb && S && typeof S.buildSourceBar === 'function' && typeof S.renderSourceBarHtml === 'function') {
        sb.innerHTML = S.renderSourceBarHtml(S.buildSourceBar({}, sbCtx()), L, sbCtx());
      }
    } catch (e) { /* 撤回时源条失败不影响结果清空 */ }
    if (diag) diag.innerHTML = esc(T('diag.idle', '尚未检测'));
    if (input) input.value = '';
  }
  var MODULES = ['IPCK_RENDER', 'IPCK_RTC', 'IPCK_SOURCE'];
  var CAPS = [
    ['IPCK_RENDER', 'renderResultBlocks'], ['IPCK_RENDER', 'renderDiagHtml'],
    ['IPCK_RTC', 'collectCandidates'],
    ['IPCK_SOURCE', 'buildSourceBar'], ['IPCK_SOURCE', 'renderSourceBarHtml']
  ];
  var missingMods = MODULES.filter(function (k) { return !window[k]; });
  var missingFns = CAPS.filter(function (c) {
    return !window[c[0]] || typeof window[c[0]][c[1]] !== 'function';
  }).map(function (c) { return c[0] + '.' + c[1]; });

  function setRunUI(on) {
    if (bar) bar.hidden = !on;
    if (btn) {
      btn.disabled = on;
      btn.textContent = on ? (T('shell.running', 'Running') || 'Running') : (T('shell.run', 'Run') || 'Run');
    }
  }
  function setLookupUI(on) {
    if (lookupBtn) {
      lookupBtn.disabled = on;
      lookupBtn.textContent = on ? (T('lookup.running', 'Looking up…') || 'Looking up…') : (T('lookup.run', 'Look up') || 'Look up');
    }
    if (input) input.disabled = on;
  }
  function errText(e) {
    return String((e && e.name) || 'Error') + ': ' + String((e && e.message) || e || 'unknown');
  }
  function setDiag(html) { if (diag) diag.innerHTML = html; }
  function badDiag(msg) {
    setDiag('<span class="ipck-diag-bad">' + esc(msg) + '</span>');
  }

  // h7：四段独立。任何一段抛错都只影响自己，IP 永远先落地。
  function paint(data) {
    var errs = [];
    var gaps = [];
    var manual = !!(data.ip && data.ip.queryMode === 'manual');

    // 段 1：IP 原生兜底（零模块依赖）
    try {
      var ipEl = document.getElementById('ipck-ip');
      if (ipEl) ipEl.innerHTML = fallbackIpHtml(data);
    } catch (e) { errs.push('ip-fallback ' + errText(e)); }

    // 段 2：富渲染增强（失败保留段 1 的 IP）。
    // h9：手动查询由段 1 独占，避免富渲染把「库未加载 / 无归属行」盖成一排「未暴露」。
    if (!manual) {
      try {
        var R = window.IPCK_RENDER;
        if (R && typeof R.renderResultBlocks === 'function') {
          var blocks = R.renderResultBlocks(data, L, page.mode || 'overview');
          ['ip', 'rtc'].forEach(function (k) {
            var el = document.getElementById('ipck-' + k);
            if (el && blocks && blocks[k + 'Html']) el.innerHTML = blocks[k + 'Html'];
          });
        }
        if (R && typeof R.renderDiagHtml === 'function') {
          setDiag(R.renderDiagHtml(data, L));
        }
      } catch (e) { errs.push('render ' + errText(e)); }
      // [v50-r2] 富渲染会盖掉段 1 的「查询对象」标注，补回去：
      //   本机检测必须一眼可辨，不能再和「输入的 IP」混成同一张卡。
      try {
        var ipEl2 = document.getElementById('ipck-ip');
        if (ipEl2 && data.ip && !ipEl2.querySelector('.ipck-subject')) {
          ipEl2.insertAdjacentHTML('afterbegin', subjectLine(data.ip, false));
        }
      } catch (e) { errs.push('subject ' + errText(e)); }
    }

    // 段 3：底部来源条 + 常驻署名
    try {
      var S = window.IPCK_SOURCE;
      var sb = document.getElementById('ipck-sourcebar');
      if (S && sb && typeof S.buildSourceBar === 'function' && typeof S.renderSourceBarHtml === 'function') {
        sb.innerHTML = S.renderSourceBarHtml(S.buildSourceBar(data, sbCtx()), L, sbCtx());
      } else if (S && sb) {
        gaps.push('IPCK_SOURCE.buildSourceBar/renderSourceBarHtml');
      }
    } catch (e) { errs.push('sourcebar ' + errText(e)); }

    // 段 4：诊断条补真实异常（不再吞）；缺函数运行时重算，避免加载后版本错配被漏报
    try {
      CAPS.forEach(function (c) {
        if (!window[c[0]] || typeof window[c[0]][c[1]] !== 'function') {
          if (gaps.indexOf(c[0] + '.' + c[1]) < 0) gaps.push(c[0] + '.' + c[1]);
        }
      });
    } catch (e) { /* 自检本身失败不影响结果 */ }
    var ipOk = !!(data.ip && !data.ipError && data.ip.ip != null && data.ip.ip !== '');
    if (errs.length && !ipOk) {
      badDiag(T('diag.renderFail', '结果显示异常，请刷新重试'));
    } else if (errs.length && ipOk) {
      // h8：真实观测值已落地，增强层异常只记进 console，不再弹红条干扰用户。
      try { if (window.console && console.warn) console.warn('[ipckit] enhancement skipped: ' + errs.join(' | ')); } catch (e) {}
      setDiag('<span class="ipck-diag-ok">' + esc(T('diag.enhancedFallback', '检测完成')) + '</span>');
    } else if (gaps.length) {
      setDiag('<span class="ipck-diag-ok">' + esc(T('diag.enhancedFallback', '检测完成')) + '</span>');
    }
  }

  function fetchJsonOnce(path) {
    return new Promise(function (resolve, reject) {
      var ctl = (typeof AbortController !== 'undefined') ? new AbortController() : null;
      var settled = false;
      var timer = setTimeout(function () {
        if (settled) return;
        settled = true;
        if (ctl) { try { ctl.abort(); } catch (e) {} }
        reject(new Error('timeout'));
      }, API_TIMEOUT_MS);
      var opts = { cache: 'no-store' };
      if (ctl) opts.signal = ctl.signal;
      fetch(path, opts).then(function (r) {
        if (!r.ok) throw new Error('status-' + r.status);
        return r.json();
      }).then(function (j) {
        if (settled) return;
        settled = true; clearTimeout(timer); resolve(j);
      }).catch(function (e) {
        if (settled) return;
        settled = true; clearTimeout(timer); reject(e);
      });
    });
  }
  function fetchJson(path) {
    return fetchJsonOnce(path).catch(function (e) {
      var msg = String((e && e.message) || e || '');
      // 本文件是模板字符串，正则里不写反斜杠转义，避免外层吞掉。
      if (!/timeout|status-5/.test(msg)) throw e;
      return fetchJsonOnce(path);
    });
  }
  function probe(path, key) {
    return fetchJson(path).then(function (v) { return { key: key, ok: true, v: v }; })
      .catch(function (e) { return { key: key, ok: false, err: String((e && e.message) || e) }; });
  }

  // h7：WebRTC 未启用时不调用采集器，连 RTCPeerConnection 都不创建。
  function rtcDisabled() {
    return Promise.resolve({
      supported: false, candidates: [], reason: 'not available',
      source: 'none', observedAt: new Date().toISOString(), enabled: false
    });
  }

  // [v50-r3] 兑现页面文案：输入框里有地址时，点「开始检测」也只查这个地址，
  //   不再跑 8 秒 WebRTC 本机检测、不再把本机出口 IP 当成结果渲染。
  //   输入框留空才走本机检测；输入不合法给明确提示，不偷偷回退到查本机。
  //   查询期间本机检测若还在跑，paintSeq 保证慢检测结束后不会覆盖本次查询结果。
  async function run() {
    var raw = input ? String(input.value || '').trim() : '';
    if (raw !== '') {
      if (!plausibleIp(raw)) {
        badDiag(T('lookup.invalid', 'Not a valid IPv4 or IPv6 address. No request was made.'));
        return;
      }
      return runLookup();
    }
    if (runBusy) return;
    runBusy = true;
    var mySeq = ++paintSeq;
    setRunUI(true);
    if (mySeq === paintSeq) setDiag('<span>' + esc(T('shell.checking', '正在检测…')) + '</span>');
    var data = { ip: null, rtc: null, started: true, jsBroken: false, diag: {} };
    var runError = null;   // [v31] WebRTC 主流程异常，paint 之后在页面输出

    try {
      var rtcTask = features.webrtc
        ? (window.IPCK_RTC && typeof window.IPCK_RTC.collectCandidates === 'function'
            ? window.IPCK_RTC.collectCandidates({ timeoutMs: 8000 }).catch(rtcDisabled)
            : rtcDisabled())
        : rtcDisabled();

      var res = await Promise.all([
        probe('/api/health', 'health'),
        probe('/api/ip', 'ip'),
        probe('/api/selfcheck', 'selfcheck'),
        rtcTask
      ]);
      var h = res[0], a = res[1], sc = res[2];
      data.rtc = res[3];
      if (sc.ok && sc.v && typeof sc.v === 'object') {
        data.rtc = Object.assign({}, data.rtc, {
          connectionIp: sc.v.ip || null,
          connectionIpVersion: sc.v.ipVersion || null,
          connectionIpv4: sc.v.ipv4 || (sc.v.ipVersion === 4 ? sc.v.ip : null) || null,
          connectionIpv6: sc.v.ipv6 || (sc.v.ipVersion === 6 ? sc.v.ip : null) || null,
          connectionColo: sc.v.colo || null
        });
      }

      var timedOut = [h, a].some(function (x) { return x && !x.ok && /timeout/.test(x.err || ''); });
      if (h.ok && h.v && h.v.ok === true) {
        var eo = !!(h.v.edge && h.v.edge.hasCfConnectingIp);
        data.diag = { apiDown: false, apiTimeout: false, edgeOk: eo, edgeMissing: !eo, version: h.v.version };
      } else {
        data.diag = { apiDown: true, apiTimeout: timedOut, edgeOk: false, edgeMissing: false };
      }
      if (a.ok && a.v && typeof a.v === 'object' && ('ip' in a.v)) {
        a.v.edgeOk = !!(data.diag.edgeOk);
        data.ip = a.v;
      } else {
        data.ip = null; data.ipError = true;
      }
    } catch (e) {
      runError = jsErrText(e);
      data.diag = { apiDown: true, apiTimeout: false, edgeOk: false, edgeMissing: false };
    } finally {
      data.baseline = loadBaseline();   // 先取「上次」，再渲染，才会形成前后对照
      // [v50-r2] 期间用户又点了「查询该 IP」，慢检测结束后不再覆盖查询结果。
      if (mySeq === paintSeq) paint(data);
      saveBaseline(data);               // 本次观测留给下一次复测
      if (runError && mySeq === paintSeq) reportScriptError(runError);   // [v31] 不静默失败
      runBusy = false;
      setRunUI(false);
    }
  }

  // h9 · 任意 IP 查询：前端只做粗校验，严格解析由服务端 ipKind 完成；
  // 不合法就不发请求，避免把随手输入当成查询行为记录下来。
  function plausibleIp(s) {
    if (!s || s.length > 64) return false;
    // 注意：本文件是模板字符串，正则里的反斜杠会被外层吞掉，故一律不用带转义的正则。
    for (var i = 0; i < s.length; i++) {
      if (!/[0-9a-fA-F:.]/.test(s.charAt(i))) return false;
    }
    if (s.indexOf(':') >= 0) return true;
    var p = s.split('.');
    if (p.length !== 4) return false;
    for (var j = 0; j < 4; j++) {
      if (!/^[0-9]{1,3}$/.test(p[j]) || Number(p[j]) > 255) return false;
    }
    return true;
  }
  async function runLookup() {
    if (!input) return;
    // [v50-r2] 不再共用检测的锁：即使本机检测还在等 WebRTC，查询也立刻执行。
    if (lookupBusy) {
      setDiag('<span>' + esc(T('lookup.busy', '上一次查询还在进行，请稍候再点一次。')) + '</span>');
      return;
    }
    var raw = String(input.value || '').trim();
    if (!plausibleIp(raw)) {
      badDiag(T('lookup.invalid', 'Not a valid IPv4 or IPv6 address. No request was made.'), '');
      return;
    }
    lookupBusy = true;
    var mySeq = ++paintSeq;
    var say = function (html) { if (mySeq === paintSeq) setDiag(html); };
    var sayBad = function (txt) { if (mySeq === paintSeq) badDiag(txt); };
    setLookupUI(true);
    say('<span>' + esc(T('lookup.running', 'Looking up…')) + '</span>');
    try {
      var j = await fetchJson('/api/lookup?ip=' + encodeURIComponent(raw));
      var data = {
        ip: j, rtc: null, started: true, jsBroken: false,
        diag: { apiDown: false, apiTimeout: false, edgeOk: true, edgeMissing: false, version: page.version }
      };
      if (mySeq === paintSeq) {
        paint(data);
        // [v50-r3] 输入查询不跑 WebRTC，把本机检测面板复位，避免残留上一次的候选结果。
        var rtcEl = document.getElementById('ipck-rtc');
        if (rtcEl) rtcEl.innerHTML = '<div class="ipck-empty">' +
          esc(T('lookup.rtcSkipped', '本次仅查询输入地址，未做本机检测')) + '</div>';
      }
      if (j.status === 'ok') {
        say('<span class="ipck-diag-ok">' + esc(T('lookup.diagOk', '✓ 查询完成')) +
          ' · ' + esc(raw) + '</span>');
      } else if (j.status === 'lib-not-loaded') {
        say('<span class="ipck-diag-warn">' + esc(T('lookup.diagLib', '⚠ 离线库未加载，输入查询不可用')) + '</span>');
      } else if (j.status === 'no-row') {
        say('<span>' + esc(T('lookup.noRowTitle', '该地址无公开归属数据')) + '</span>');
      } else {
        sayBad(T('lookup.invalid', 'Not a valid IPv4 or IPv6 address. No request was made.'));
      }
    } catch (e) {
      sayBad(T('diag.apiDown', '服务暂时不可用，请稍后重试'));
    } finally {
      lookupBusy = false;
      setLookupUI(false);
    }
  }

  if (btn) btn.addEventListener('click', run);
  if (lookupBtn) lookupBtn.addEventListener('click', runLookup);
  if (input) input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); runLookup(); }
  });
  if (lookupClear) lookupClear.addEventListener('click', function () {
    clearResults();
  });
  // 刻意不注册 DOMContentLoaded / load 自动执行：一律等用户点按钮。
})();
`;
