// 8号 h8 · L2 接入壳：母版 HTML + canonical/hreflang + 法务页渲染。
// L1 模块以 toString() 原样注入浏览器；页面自身零第三方请求、零硬编码主机名。
import { LANGS, XDEFAULT, STRUCTURES, LEGAL_KEYS, GEO_ZH, pathFor, dictFor, t } from './i18n.js';
import { CSS } from './styles.js';
import { renderResultBlocks } from './core/render.js';
import { buildSourceBar, renderSourceBarHtml } from './core/sourcebar.js';
import { RTC_BROWSER_SRC } from './core/rtc.js';
import { RENDER_BROWSER_SRC } from './core/render.js';
import { SOURCE_BROWSER_SRC } from './core/sourcebar.js';
import { CLIENT_JS } from './client.js';
import { FLAG_SVG } from './core/flags.js';
// [v50-r12 本轮变更 ②] 14 个规范页的服务端直出静态正文（中英各自原创，不依赖 JS 执行）。
import { staticContentHtml, staticLeadHtml, metaDesc, faqList } from './content.js';
// [v50-r11] 旗表序列化一次；把 < > & 转成 unicode 转义，防止 </script> 截断与 HTML 注入。
const FLAGS_JSON = JSON.stringify(FLAG_SVG).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');

// [v41 本轮变更 ①] Bing Webmaster Tools「HTML Meta 标记」所有权验证。
//   msvalidate.01 的 content 是 Bing 账号级验证码，同一串可用于该账号下所有站点。
//   默认写死本次复制下来的值；部署后若 Bing 后台换了码，不必改代码，
//   在 CF 面板加变量 BING_VERIFY_META 即可覆盖（留空走默认值）。
const BING_VERIFY_CONTENT = '922DCA6E549674B12068F412FE444631';

// ---------------------------------------------------------------------------
// h8 · 浏览器 helper shim（修 iOS Safari 真机 "Can't find variable: __name"）
// 成因：wrangler / esbuild 的 keepNames 会把函数体内的匿名函数表达式包装成
// __name(function(){...}, "L")；本模板用 Function.toString() 把模块注入浏览器，
// helper 定义留在 Worker bundle 顶层，浏览器端没有 → Safari 严格抛 ReferenceError，
// Chromium 直跑源码时不复现。每段内联脚本自带一份幂等兜底，从此不依赖外层作用域。
// 用 var 声明（可重复），覆盖 esbuild 常用 helper，全部为无副作用的安全版本。
// ---------------------------------------------------------------------------
const BROWSER_SHIM = [
  "var __name = function (f, n) { try { Object.defineProperty(f, 'name', { value: n, configurable: true }); } catch (e) {} return f; };",
  "var __defProp = function (o, k, d) { try { return Object.defineProperty(o, k, d); } catch (e) { return o; } };",
  "var __defNormalProp = function (o, k, v) { try { o[k] = v; } catch (e) {} return o; };",
  "var __publicField = function (o, k, v) { try { o[k] = v; } catch (e) {} return o; };",
  "var __accessCheck = function () {};",
  "var __copyProps = function (a, b) { try { return Object.assign(a, b); } catch (e) { return a; } };",
  "var __getOwnPropDesc = Object.getOwnPropertyDescriptor;",
  "var __getOwnPropNames = Object.getOwnPropertyNames;",
  "var __hasOwnProp = Object.prototype.hasOwnProperty;",
  "var __spreadValues = function (a, b) { try { return Object.assign({}, a, b); } catch (e) { return a; } };",
  "var __spreadArray = function (a, b) { try { return a.concat(b); } catch (e) { return a; } };",
].join('\n');

// [v46 本轮变更 ①] 品牌图标重制：粗白圆角框 + 粗线地球 + 右上明显青绿节点，与参考图一致。
const LOGO_SVG = "<svg class=\"ipck-logo-svg\" viewBox=\"0 0 48 48\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"ipckit\"><rect x=\"1.6\" y=\"1.6\" width=\"44.8\" height=\"44.8\" rx=\"13\" fill=\"#ffffff\" fill-opacity=\"0.10\" stroke=\"#ffffff\" stroke-width=\"3.4\"/><circle cx=\"22.5\" cy=\"25.5\" r=\"13.2\" fill=\"none\" stroke=\"#ffffff\" stroke-width=\"3.2\"/><ellipse cx=\"22.5\" cy=\"25.5\" rx=\"5.8\" ry=\"13.2\" fill=\"none\" stroke=\"#ffffff\" stroke-width=\"2.6\"/><path d=\"M9.3 25.5h26.4\" stroke=\"#ffffff\" stroke-width=\"2.6\"/><path d=\"M12.5 18.6h20M12.5 32.4h20\" stroke=\"#ffffff\" stroke-width=\"2.2\"/><circle cx=\"36.4\" cy=\"11.2\" r=\"5.8\" fill=\"#7ff0bd\" stroke=\"#ffffff\" stroke-width=\"1.6\"/></svg>";

// [v47 本轮变更] 字标改为「G 双色分字极简」：左侧地球沿用 v46 原样，字标换成 ipc 白 / kit 青绿，
// 装饰只保留文字下方一道左粗右渐细的青绿线（无大斜杠、无斜叶、无穿字线）。
const WORDMARK_SVG = "<svg class=\"ipck-wordmark__swoosh\" viewBox=\"0 0 200 10\" preserveAspectRatio=\"none\" xmlns=\"http://www.w3.org/2000/svg\" aria-hidden=\"true\" focusable=\"false\"><defs><linearGradient id=\"ipckTaper\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"0\"><stop offset=\"0\" stop-color=\"#7ff0bd\" stop-opacity=\"1\"/><stop offset=\".62\" stop-color=\"#7ff0bd\" stop-opacity=\".9\"/><stop offset=\"1\" stop-color=\"#7ff0bd\" stop-opacity=\"0\"/></linearGradient></defs><path d=\"M0 2 C 58 3.2, 128 4.4, 200 5.1 L200 5.7 C 128 6.2, 58 7.4, 0 8.8 Z\" fill=\"url(#ipckTaper)\"/></svg>";

// [v44] favicon 同步换成粗线同款，标签页与页面 logo 一致。
const FAVICON_HREF = "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2048%2048%22%3E%3Crect%20width%3D%2248%22%20height%3D%2248%22%20rx%3D%2213%22%20fill%3D%22%230d717c%22%2F%3E%3Ccircle%20cx%3D%2223%22%20cy%3D%2225%22%20r%3D%2213.4%22%20fill%3D%22none%22%20stroke%3D%22%23eafff8%22%20stroke-width%3D%223%22%2F%3E%3Cellipse%20cx%3D%2223%22%20cy%3D%2225%22%20rx%3D%225.8%22%20ry%3D%2213.4%22%20fill%3D%22none%22%20stroke%3D%22%23eafff8%22%20stroke-width%3D%222.4%22%2F%3E%3Cpath%20d%3D%22M9.6%2025h26.8%22%20stroke%3D%22%23eafff8%22%20stroke-width%3D%222.4%22%2F%3E%3Cpath%20d%3D%22M12.6%2018.3h20.8M12.6%2031.7h20.8%22%20stroke%3D%22%23eafff8%22%20stroke-width%3D%222%22%2F%3E%3Ccircle%20cx%3D%2236.2%22%20cy%3D%2211.4%22%20r%3D%225.4%22%20fill%3D%22%237ff0bd%22%2F%3E%3C%2Fsvg%3E";

const LEGAL_SLUGS = {
  about: 'about', privacy: 'privacy', terms: 'terms', rights: 'data-rights',
};

function esc(v) {
  return String(v == null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function navHtml(lang, structure) {
  // [v34 本轮变更] 顶部只保留 3 个工具入口；法务入口统一移到页面最下方。
  const items = [
    ['shell.nav.dashboard', 'overview'],
    ['shell.nav.network', 'ip'],
    ['shell.nav.rtc', 'rtc'],
  ];
  let out = '';
  for (const [key, k] of items) {
    const s = STRUCTURES.find(function (x) { return x.key === k; });
    if (!s) continue;
    const active = structure.key === k ? ' is-active' : '';
    out += '<a class="' + active.trim() + '" href="' + esc(pathFor(lang.slug, s.slug)) + '">' + esc(t(lang.code, key)) + '</a>';
  }
  return out;
}

// [v34 本轮变更] 法务页入口移到页面最下方：独立 footer，不受 #ipck-sourcebar 前端重绘影响。
function legalNavHtml(lang, structure) {
  const items = [
    ['shell.nav.about', 'about'],
    ['shell.nav.privacy', 'privacy'],
    ['shell.nav.terms', 'terms'],
    ['shell.nav.rights', 'rights'],
  ];
  let out = '';
  for (const [key, k] of items) {
    const s = STRUCTURES.find(function (x) { return x.key === k; });
    if (!s) continue;
    const active = structure.key === k ? ' is-active' : '';
    out += '<a class="' + active.trim() + '" href="' + esc(pathFor(lang.slug, s.slug)) + '">' + esc(t(lang.code, key)) + '</a>';
  }
  return out;
}

function overviewCards(lang) {
  const L = dictFor(lang.code);
  const cards = [
    { key: 'ip', title: t(lang.code, 'ov.sectionIp'), body: L['ov.cardIp'] },
    { key: 'rtc', title: t(lang.code, 'ov.sectionRtc'), body: L['ov.cardRtc'] },
  ];
  let out = '<div class="ipck-cols">';
  for (const c of cards) {
    const s = STRUCTURES.find(function (x) { return x.key === c.key; });
    if (!s) continue;
    out += '<section class="ipck-panel"><h2>' + esc(c.title) + '</h2>';
    out += '<p>' + esc(c.body) + '</p>';
    out += '<a class="ipck-lang" href="' + esc(pathFor(lang.slug, s.slug)) + '">' + esc(L['ov.cardLink']) + '</a></section>';
  }
  return out + '</div>';
}

function methodHtml(lang, structure, labels) {
  const prefix = structure.key + '.method';
  const keys = [prefix + '1', prefix + '2', prefix + '3', prefix + '4'];
  let li = '';
  for (const k of keys) {
    if (labels[k]) li += '<li>' + esc(labels[k]) + '</li>';
  }
  if (!li) return '';
  // [v32 本轮变更] IP 页用「关于本次查询」，WebRTC 页维持原有原理说明标题
  const titleKey = structure.key === 'ip' ? 'ip.methodTitle' : 'method.title';
  return '<section class="ipck-method"><h2>' + esc(t(lang.code, titleKey)) + '</h2><ol>' + li + '</ol></section>';
}

// 法务页：把纯文本文案里的邮箱与内部页占位符转成真实链接（esc 之后替换，杜绝注入）。
function richText(lang, text, contact) {
  let out = esc(text);
  const mail = '<a href="mailto:' + esc(contact) + '" rel="noopener noreferrer">' + esc(contact) + '</a>';
  out = out.replace(/yokok8@outlook\.com/g, mail);
  const labels = {
    '{{about}}': t(lang.code, 'shell.nav.about'),
    '{{privacy}}': t(lang.code, 'shell.nav.privacy'),
    '{{terms}}': t(lang.code, 'shell.nav.terms'),
    '{{rights}}': t(lang.code, 'shell.nav.rights'),
  };
  for (const k of Object.keys(labels)) {
    const href = pathFor(lang.slug, LEGAL_SLUGS[{ '{{about}}': 'about', '{{privacy}}': 'privacy', '{{terms}}': 'terms', '{{rights}}': 'rights' }[k]]);
    out = out.split(k).join('<a href="' + esc(href) + '">' + esc(labels[k]) + '</a>');
  }
  return out;
}

function legalHtml(lang, structure, opts) {
  const L = dictFor(lang.code);
  let out = '<section class="ipck-legal">';
  out += '<h2>' + esc(t(lang.code, structure.key + '.sectionTitle')) + '</h2>';
  for (let i = 1; i <= 14; i++) {
    const k = structure.key + '.p' + i;
    if (L[k]) out += '<p>' + richText(lang, L[k], opts.contact) + '</p>';
  }
  out += '<p class="ipck-legal-meta">' + esc(t(lang.code, 'legal.effective')) + '</p>';
  out += '<p class="ipck-legal-links">' + richText(lang, t(lang.code, 'legal.links'), opts.contact) + '</p>';
  out += '<a class="ipck-lang" href="' + esc(pathFor(lang.slug, '')) + '">' + esc(t(lang.code, 'legal.back')) + '</a>';
  out += '</section>';
  return out;
}

function runbarHtml(lang) {
  const L = dictFor(lang.code);
  return '<div class="ipck-runbar">' +
    '<button class="ipck-btn ipck-run-main" id="ipck-run" type="button">' + esc(t(lang.code, 'shell.run')) + '</button>' +
    '<p class="ipck-run-note">' + esc(L['rtc.runNotice']) + '</p>' +
  '</div>';
}

// h9 · 任意 IP 输入区：只在含 IP 结果面板的页面出现；法务页不出现。
// 纯 input + button，不是 form（CSP form-action 'none' 不需放宽）。
function lookupHtml(lang, opts) {
  const L = dictFor(lang.code);
  return '<section class="ipck-lookup" id="ipck-lookup">' +
    '<div class="ipck-lookup-head">' +
      '<h2>' + esc(L['lookup.title']) + '</h2>' +
      '<p>' + esc(L['lookup.hint']) + '</p>' +
    '</div>' +
    '<div class="ipck-lookup-row">' +
      '<input id="ipck-ip-input" type="text" inputmode="url" autocomplete="off" autocapitalize="off" ' +
        'spellcheck="false" maxlength="64" aria-label="' + esc(L['lookup.title']) + '" ' +
        'placeholder="' + esc(L['lookup.placeholder']) + '">' +
      '<button class="ipck-btn" id="ipck-lookup-run" type="button">' + esc(L['lookup.run']) + '</button>' +
      '<button class="ipck-btn ghost" id="ipck-lookup-clear" type="button">' + esc(L['lookup.clear']) + '</button>' +
    '</div>' +
  '</section>';
}

function makeNonce() {
  const a = new Uint8Array(16);
  crypto.getRandomValues(a);
  let raw = '';
  for (let i = 0; i < a.length; i++) raw += String.fromCharCode(a[i]);
  return btoa(raw).replace(/=/g, '');
}

export function renderPage(opts) {
  const lang = opts.lang;
  const structure = opts.structure;
  const origin = opts.origin;
  const labels = dictFor(lang.code);
  const other = Object.values(LANGS).find(function (l) { return l.slug !== lang.slug; });
  const keyPrefix = structure.key === 'overview' ? 'ov' : structure.key;
  const title = t(lang.code, keyPrefix + '.title');
  const subtitle = t(lang.code, keyPrefix + '.subtitle');
  // [v50-r12] 14 页各自一条独立、更长、含长尾词的 description；h1 / title / 字典一律不动。
  const pageDesc = metaDesc(lang.code, structure.key) || subtitle;
  // [v50-r10] Bing SEO/GEO 报「标题太短」：<title>/og/twitter 追加站点 tagline；h1、字典、结构数据一律不动
  const seoTitle = title + ' · ' + t(lang.code, 'shell.tagline');
  const canonical = origin + pathFor(lang.slug, structure.slug);
  const xdefault = origin + pathFor(LANGS[XDEFAULT].slug, structure.slug);
  const isLegal = LEGAL_KEYS.indexOf(structure.key) >= 0;
  const nonce = makeNonce();
  const gscMeta = opts.gscMeta
    ? '<meta name="google-site-verification" content="' + esc(opts.gscMeta) + '">'
    : '';
  // [v41 本轮变更 ②] 14 个中英页面 head 全部输出 Bing 验证标记（含 /zh/ 与 /en/ 首页），
  //   位于第一个 <body> 之前；Bing 抓取 https://ipck.piccalc.com/ 跟随 302 后也能命中。
  //   纯所有权标记，不改 title / description / canonical / hreflang / 结构化数据。
  const bingMeta = '<meta name="msvalidate.01" content="' + esc(opts.bingMeta || BING_VERIFY_CONTENT) + '" />';
  const ogLocale = lang.code === 'zh-CN' ? 'zh_CN' : 'en_US';
  const ogAlt = lang.code === 'zh-CN' ? 'en_US' : 'zh_CN';
  const isApp = structure.key === 'overview' || structure.key === 'ip';
  // [v37 本轮变更 · 收录优化] 结构化数据补齐站点实体 + 面包屑，
  //   仍只用页面真实可见的 title / subtitle，不引入任何未在页面出现的内容。
  const siteRoot = origin + pathFor(LANGS[XDEFAULT].slug, '');
  const ldPage = {
    '@type': isApp ? 'WebApplication' : 'WebPage',
    '@id': canonical + '#page',
    name: title + ' · ipckit',
    url: canonical,
    description: pageDesc,
    inLanguage: lang.htmlLang,
    isPartOf: { '@id': origin + '/#website' },
    publisher: { '@id': origin + '/#org' },
  };
  if (isApp) { ldPage.applicationCategory = 'UtilitiesApplication'; ldPage.operatingSystem = 'Any'; }
  // 面包屑只列真实存在的两级：语言首页 → 当前页；总览页即语言首页，不重复列自己。
  const crumbs = [{ name: t(lang.code, 'shell.brand'), item: origin + pathFor(lang.slug, '') }];
  if (structure.key !== 'overview') crumbs.push({ name: title, item: canonical });
  const ldGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': origin + '/#org', name: 'ipckit', email: opts.contact, url: siteRoot },
      { '@type': 'WebSite', '@id': origin + '/#website', name: 'ipckit', url: siteRoot,
        inLanguage: lang.htmlLang, publisher: { '@id': origin + '/#org' } },
      ldPage,
      { '@type': 'BreadcrumbList', '@id': canonical + '#breadcrumb',
        itemListElement: crumbs.map(function (c, i) {
          return { '@type': 'ListItem', position: i + 1, name: c.name, item: c.item };
        }) },
    ],
  };
  // [v50-r12] 三个工具页追加 FAQPage；问与答逐字取自同页服务端直出的可见 FAQ 区，
  // 不引入页面上看不到的内容。法务页不加，避免结构化数据噪音。
  const faqItems = (structure.key === 'overview' || structure.key === 'ip' || structure.key === 'rtc')
    ? faqList(lang.code, structure.key) : [];
  if (faqItems.length) {
    ldGraph['@graph'].push({
      '@type': 'FAQPage',
      '@id': canonical + '#faq',
      mainEntity: faqItems.map(function (f) {
        return { '@type': 'Question', name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a } };
      }),
    });
  }
  const ldJson = JSON.stringify(ldGraph).replace(/</g, '\\u003c');

  const emptyData = { ip: null, rtc: null, started: false };
  const mode = structure.key === 'overview' ? 'overview' : structure.key;
  const blocks = renderResultBlocks(emptyData, labels, mode);
  const sbCtx = { lib: opts.lib || null, contact: opts.contact, labels: labels, appVersion: opts.version };
  const sourcebar = renderSourceBarHtml(buildSourceBar({}, sbCtx), labels, sbCtx);

  const showIp = structure.key === 'overview' || structure.key === 'ip';
  let panels = '';
  if (isLegal) {
    panels = legalHtml(lang, structure, opts);
  } else {
    if (showIp) panels += '<section class="ipck-panel"><h2>' + esc(t(lang.code, 'ov.sectionIp')) + '</h2><div id="ipck-ip">' + blocks.ipHtml + '</div></section>';
    if (structure.key === 'overview') {
      panels += overviewCards(lang);
    } else if (structure.key === 'rtc') {
      // [v31] 内网 IP 暴露风险说明（常驻，未检测时也能看到）+ WebRTC 错误框
      panels += '<section class="ipck-panel"><h2 class="ipck-result-title">' + esc(t(lang.code, 'ov.sectionRtc')) + '</h2>' +
        '<p class="ipck-risk-note">' + esc(labels['rtc.internalRiskNote']) + '</p>' +
        '<div class="ipck-error-box" id="ipck-rtc-error" role="alert" hidden></div>' +
        '<div id="ipck-rtc">' + blocks.rtcHtml + '</div></section>';
    }
    if (structure.key === 'ip' || structure.key === 'rtc') panels += methodHtml(lang, structure, labels);
    if (structure.key === 'rtc') {
      panels += '<p class="ipck-disclaimer">' + esc(labels['rtc.verdict.disclaimer']) + '</p>';
    }
  }

  const pageJson = JSON.stringify({
    lang: lang.code,
    structure: structure.key,
    mode: mode,
    version: opts.version,
    policyVersion: opts.policyVersion,
    contact: opts.contact,
    publicMode: !!opts.publicMode,
    features: { ip: true, arbitraryIp: true, webrtc: true },
    lib: opts.lib || null,
  });
  const dictJson = JSON.stringify(labels);
  const N = ' nonce="' + nonce + '"';
  // [v37 本轮变更] 规范可收录页显式声明可索引；隔离/预览态仍整页 noindex。
  const robotsMeta = (opts.publicMode && !opts.noindexPage)
    ? '<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">'
    : '<meta name="robots" content="noindex, nofollow, noarchive">';
  const altLinks = [
    ['zh-CN', 'zh'], ['en', 'en'], ['x-default', LANGS[XDEFAULT].slug],
  ].map(function (a) {
    return '<link rel="alternate" hreflang="' + a[0] + '" href="' + esc(origin + pathFor(a[1], structure.slug)) + '">';
  }).join('\n');
  const footNote = t(lang.code, 'shell.foot') ? ' · ' + esc(t(lang.code, 'shell.foot')) : '';

  const browserScripts = [
    '<script' + N + '>' + BROWSER_SHIM + '\n' + 'window.IPCK_I18N = ' + dictJson + ';</script>',
    '<script' + N + '>' + BROWSER_SHIM + '\n' + 'window.IPCK_PAGE = ' + pageJson + ';</script>',
    '<script' + N + '>' + BROWSER_SHIM + '\n' + 'window.IPCK_GEO_ZH = ' + JSON.stringify(GEO_ZH) + ';</script>',
    '<script' + N + '>window.IPCK_FLAGS=' + FLAGS_JSON + ';</script>',
    '<script' + N + '>' + BROWSER_SHIM + '\n' + RTC_BROWSER_SRC + '</script>',
    '<script' + N + '>' + BROWSER_SHIM + '\n' + RENDER_BROWSER_SRC + '</script>',
    '<script' + N + '>' + BROWSER_SHIM + '\n' + SOURCE_BROWSER_SRC + '</script>',
    '<script' + N + '>' + BROWSER_SHIM + '\n' + CLIENT_JS + '</script>',
  ].join('\n');

  const html = [
    '<!doctype html>',
    '<html lang="' + esc(lang.htmlLang) + '">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
    '<title>' + esc(seoTitle) + ' · ipckit</title>',
    robotsMeta,
    '<link rel="icon" href="' + FAVICON_HREF + '">',
    '<meta name="description" content="' + esc(pageDesc) + '">',
    '<meta name="theme-color" content="#0b1020">',
    gscMeta,
    bingMeta,
    '<meta property="og:type" content="website">',
    '<meta property="og:site_name" content="ipckit">',
    '<meta property="og:title" content="' + esc(seoTitle) + ' · ipckit">',
    '<meta property="og:description" content="' + esc(pageDesc) + '">',
    '<meta property="og:url" content="' + esc(canonical) + '">',
    '<meta property="og:locale" content="' + ogLocale + '">',
    '<meta property="og:locale:alternate" content="' + ogAlt + '">',
    '<meta name="twitter:card" content="summary">',
    '<meta name="twitter:title" content="' + esc(seoTitle) + ' · ipckit">',
    '<meta name="twitter:description" content="' + esc(pageDesc) + '">',
    '<link rel="canonical" href="' + esc(canonical) + '">',
    altLinks,
    '<style' + N + '>' + CSS + '</style>',
    '<script type="application/ld+json"' + N + '>' + ldJson + '</script>',
    '</head>',
    '<body>',
    '<div class="ipck-shell">',
    '  <aside class="ipck-side">',
    // [v47] 双色分字：ipc 白 / kit 青绿；站点名固定 ipckit，按 3+3 拆分，不新增字典键。
    '    <div class="ipck-brand">' + LOGO_SVG + '<span class="ipck-wordmark"><span class="ipck-wordmark__text"><span class="ipck-wordmark__ipc">' + esc(String(t(lang.code, 'shell.brand')).slice(0, 3)) + '</span><span class="ipck-wordmark__kit">' + esc(String(t(lang.code, 'shell.brand')).slice(3)) + '</span></span>' + WORDMARK_SVG + '</span></div>',
    '    <div class="ipck-tag">' + esc(t(lang.code, 'shell.tagline')) + '</div>',
    '    <nav class="ipck-nav">' + navHtml(lang, structure) + '</nav>',
    // [v39 本轮变更 ③] 顶部邮箱/版本号整体移到页脚，PC 与手机都可见
    '    <a class="ipck-lang ipck-lang-switch" href="' + esc(pathFor(other.slug, structure.slug)) + '">' + esc(t(lang.code, 'shell.langSwitch')) + '</a>',
    '  </aside>',
    '  <div class="ipck-main">',
    '    <header class="ipck-top">',
    '      <div class="ipck-top-row">',
    '        <div class="ipck-head-text"><h1>' + esc(title) + '</h1><p>' + esc(subtitle) + '</p></div>',
    '      </div>',
    '      <div class="ipck-progress" id="ipck-progress" hidden><div class="ipck-progress-fill"></div></div>',
    // [v50-r12] 首屏即有一段实质正文（不是提示条、不是链接农场），下方静态区不重复这段。
    staticLeadHtml(lang.code, structure.key),
    '    </header>',
    isLegal ? '' : runbarHtml(lang),
    (isLegal || !showIp) ? '' : lookupHtml(lang, opts),
    isLegal ? '' : ('    <div class="ipck-diag" id="ipck-diag">' + esc(t(lang.code, 'diag.idle')) + '</div>'),
    '    <main class="ipck-content">' + panels + staticContentHtml(lang.code, structure.key, lang.slug) + '</main>',
    '    <footer class="ipck-sourcebar" id="ipck-sourcebar">' + sourcebar + '</footer>',
    // [v34 本轮变更] 法务入口常驻页面最下方，PC/手机统一，不再挤在顶部被语言按钮遮挡。
    // [v39 本轮变更 ③] 联系方式 + 站点版本号落在页面最下方，不再只留一个邮箱
    '    <footer class="ipck-legalbar"><nav class="ipck-legal-nav" aria-label="' + esc(t(lang.code, 'shell.brand')) + '">' + legalNavHtml(lang, structure) + '</nav>' +
    '      <div class="ipck-foot-contact"><span class="ipck-foot-contact-label">' +
        esc(lang.code === 'zh-CN' ? '联系' : 'Contact') + '</span>' +
      '<a href="mailto:' + esc(opts.contact) + '">' + esc(opts.contact) + '</a>' +
      '<span class="ipck-build">' + esc(opts.version || '') + '</span>' +
      '<span class="ipck-flag-credit"> · flag-icons (MIT)</span></div></footer>',
    '  </div>',
    '</div>',
    browserScripts,
    '</body>',
    '</html>',
  ].join('\n');

  return { html: html, nonce: nonce };
}
