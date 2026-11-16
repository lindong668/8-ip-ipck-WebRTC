// 8号 自身网络状态自查站 · ipck.piccalc.com · h24（对外收录态 · IP 归属 + 浏览器地址自查）
// h22：修好建库脚本真断点，离线库随包带齐、push 即生效（8 列含地区）。
// h23-seo：规范主机固定；补 sitemap.xml / sitemap.txt / robots.txt / ads.txt，
//   并把 canonical / hreflang / OG / JSON-LD 全部钉到绝对新域；
//   默认对外开放（不再 noindex、不再 Disallow）。
import { LANGS, XDEFAULT, SITE, STRUCTURES, LEGAL_KEYS, matchPath, pathFor, t } from './i18n.js';
import { renderPage } from './ui.js';
import { readIpInfo, readArbitraryIp } from './core/ip.js';
import { libMeta, ATTRIBUTION } from './core/geodb.js';
import { autoInstall, lastError, installedMonth, RUNTIME_NOTE } from './core/autolib.js';
// [v33] 站点功能收敛为 IP 归属查询 + WebRTC 自查；其余模块整体移除。

// ---------------------------------------------------------------------------
// 规范主机：所有绝对 URL 只认这一个，不跟随请求 host。
// [v37 本轮变更 · 收录优化] 非规范 host（workers.dev 预览 / 历史旧域 / 误绑域名）
//   的页面请求统一 301 收敛到唯一规范主机，避免多域名同内容造成重复内容。
//   SEO 文件、GSC 验证文件、favicon、API 仍按各自规则直出，不受影响。
//   调试预览域名时可设 CANON_REDIRECT="false" 临时回到 noindex 直出。
// ---------------------------------------------------------------------------
export const CANON_HOST = 'ipck.piccalc.com';
export const CANON_ORIGIN = 'https://' + CANON_HOST;

const NOINDEX = 'noindex, nofollow, noarchive';
// 站点功能收敛为两项：IP 归属查询 + 浏览器地址暴露自查（rtc.js 真 ICE 候选采集）。
// 采集只在同意 + 点击后执行；解析路径相关页面、入口、字典、接口全部移除，
// 以后要加回按 git 历史恢复即可，当前不留任何半成品页。
const SITEMAP_LASTMOD = '2026-11-16';

const ADS_TXT = [
  '# ipckit · ' + CANON_HOST,
  'google.com, pub-8915931557404979, DIRECT, f08c47fec0942fa0',
  '',
].join('\n');

const ROBOTS_TXT = [
  'User-agent: *',
  'Allow: /',
  'Disallow: /api/',
  '',
  'Sitemap: ' + CANON_ORIGIN + '/sitemap.xml',
  '',
].join('\n');

function buildSitemapXml() {
  const langs = Object.values(LANGS);
  const out = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
  ];
  for (const s of STRUCTURES) {
    for (const l of langs) {
      const loc = CANON_ORIGIN + pathFor(l.slug, s.slug);
      const pri = s.key === 'overview' ? '1.0' : (LEGAL_KEYS.indexOf(s.key) >= 0 ? '0.4' : '0.8');
      out.push('  <url>');
      out.push('    <loc>' + loc + '</loc>');
      out.push('    <lastmod>' + SITEMAP_LASTMOD + '</lastmod>');
      out.push('    <changefreq>weekly</changefreq>');
      out.push('    <priority>' + pri + '</priority>');
      for (const a of langs) {
        out.push('    <xhtml:link rel="alternate" hreflang="' + a.hreflang + '" href="' + CANON_ORIGIN + pathFor(a.slug, s.slug) + '"/>');
      }
      out.push('    <xhtml:link rel="alternate" hreflang="x-default" href="' + CANON_ORIGIN + pathFor(LANGS[XDEFAULT].slug, s.slug) + '"/>');
      out.push('  </url>');
    }
  }
  out.push('</urlset>');
  return out.join('\n') + '\n';
}

// Google 支持的纯文本站点地图备用入口；每行一个绝对 URL，无标签、无空格、无日期。
function buildSitemapTxt() {
  const out = [];
  for (const s of STRUCTURES) {
    for (const l of Object.values(LANGS)) out.push(CANON_ORIGIN + pathFor(l.slug, s.slug));
  }
  return out.join('\n') + '\n';
}

// 默认即公开；只有显式 PUBLIC_MODE="false" 才回到隔离测试态。
function isPublic(env) {
  return !(env && String(env.PUBLIC_MODE || '').toLowerCase() === 'false');
}
// [v37] 非规范主机 301 收敛开关：默认开启，"false" 才关闭（仅调试用）。
function canonRedirect(env) {
  return !(env && String(env.CANON_REDIRECT || '').toLowerCase() === 'false');
}

function secHeaders(extra, nonce, env) {
  const publicMode = isPublic(env);
  const suppress = !!(env && env.__IPCK_NOINDEX_HOST__);
  // 页面用 per-response nonce（无 unsafe-inline）；非 HTML 响应直接禁脚本与样式。
  // [本次改造] 不再发起跨子域探测，connect-src 收紧为 'self' + WebRTC 所需 stun:
  const csp = nonce
    ? "default-src 'self'; script-src 'nonce-" + nonce + "'; style-src 'nonce-" + nonce + "'; connect-src 'self' stun:; img-src 'self' data:; base-uri 'none'; frame-ancestors 'none'; form-action 'none'"
    : "default-src 'self'; script-src 'none'; style-src 'none'; connect-src 'none'; img-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'";
  const h = {
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'X-Frame-Options': 'DENY',
    'Content-Security-Policy': csp,
  };
  if (!publicMode || suppress) h['X-Robots-Tag'] = NOINDEX;
  if (extra) for (const k of Object.keys(extra)) h[k] = extra[k];
  return h;
}

function json(obj, status, env) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: secHeaders({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }, null, env),
  });
}
function html(body, status, nonce, env, extra) {
  const base = { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' };
  return new Response(body, {
    status: status || 200,
    headers: secHeaders(extra ? Object.assign(base, extra) : base, nonce, env),
  });
}
function redirect(location, status, env) {
  return new Response('', {
    status: status || 301,
    headers: secHeaders({ 'Location': location, 'Cache-Control': 'no-store' }, null, env),
  });
}
// SEO 三件套专用响应：200、显式 Content-Type、无 301、无 noindex、无 CSP 干扰。
function seoText(body, contentType) {
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
    },
  });
}

export default {
  async fetch(request, env) {
    // [v33] 主域 ipck.piccalc.com 与全部页面 / API 直接进入下方业务逻辑，
    //   不存在任何需要放行或拦截的临时探测主机。
    const url = new URL(request.url);
    const pathname = url.pathname;
    const host = url.hostname.toLowerCase();
    const isCanonHost = host === CANON_HOST;
    const reqEnv = isCanonHost ? env : Object.assign({}, env || {}, { __IPCK_NOINDEX_HOST__: true });
    const publicMode = isPublic(reqEnv);

    // 0) SEO 文件：排在所有 301 / 404 / API 判断之前，任何 host 访问都直出 200。
    if (pathname === '/sitemap.xml') return seoText(buildSitemapXml(), 'application/xml; charset=utf-8');
    if (pathname === '/sitemap.txt') return seoText(buildSitemapTxt(), 'text/plain; charset=utf-8');
    if (pathname === '/robots.txt') return seoText(ROBOTS_TXT, 'text/plain; charset=utf-8');
    if (pathname === '/ads.txt') return seoText(ADS_TXT, 'text/plain; charset=utf-8');
    // 0a) [v37] GSC 所有权验证文件：优先读 env.GSC_VERIFY_FILE（新域重新验证时填新文件名），
    //     未配置时保留历史 token 兼容；内容可用 GSC_VERIFY_CONTENT 覆盖。
    //     排在所有 .html 301 / 404 之前，直出 200，不可 noindex、不可 301。
    const gscFile = String((env && env.GSC_VERIFY_FILE) || 'google6474e28bb6098302.html').replace(/^\/+/, '');
    if (gscFile && pathname === '/' + gscFile) {
      const gscBody = String((env && env.GSC_VERIFY_CONTENT) || ('google-site-verification: ' + gscFile));
      return seoText(gscBody + '\n', 'text/plain; charset=utf-8');
    }

    // 0b) www / 明文 http 收敛到唯一规范主机
    if (host === 'www.' + CANON_HOST || url.protocol === 'http:') {
      return redirect(CANON_ORIGIN + pathname + url.search, 301, reqEnv);
    }

    // 0c) [v37 本轮变更] 其余非规范主机（workers.dev 预览 / 旧域 / 误绑域）→ 301 到规范 URL。
    //     只收敛页面类路径；/api/* 保留 noindex 直出，便于预览调试。
    if (!isCanonHost && publicMode && canonRedirect(reqEnv) && pathname.indexOf('/api/') !== 0) {
      return redirect(CANON_ORIGIN + pathname + url.search, 301, env);
    }

    // 1) 历史 .html 地址：永久 301 收敛到无扩展名（对齐 7号 v18 口径，绝不留 307）
    if (pathname.endsWith('.html')) {
      const stripped = pathname.slice(0, -5);
      const m = matchPath(stripped);
      if (m) return redirect(pathFor(m.lang.slug, m.structure.slug), 301, reqEnv);
    }

    // 2) 根路径按 Accept-Language 分流到各自独立 URL（不用 ?lang=、不靠 cookie）
    if (pathname === '/') {
      const al = (request.headers.get('accept-language') || '').toLowerCase();
      const slug = al.indexOf('zh') >= 0 ? 'zh' : 'en';
      return redirect(pathFor(slug, ''), 302, reqEnv);
    }

    // 3) favicon 兜底，避免刷 404
    if (pathname === '/favicon.ico') {
      return new Response(null, { status: 204, headers: secHeaders(null, null, reqEnv) });
    }

    // 4) API
    if (pathname === '/api/health') {
      const hasCfIp = !!request.headers.get('cf-connecting-ip');
      return json({
        ok: true,
        site: SITE.name,
        version: SITE.version,
        noindex: !publicMode,
        publicMode: publicMode,
        contact: SITE.contact,
        policyVersion: SITE.policyVersion,
        edge: {
          hasCfConnectingIp: hasCfIp,
          hint: hasCfIp
            ? 'connecting IP present; attribution from offline library only'
            : 'no connecting IP header available for this request',
        },
        lib: await libMeta(reqEnv),
        attribution: ATTRIBUTION,
        consentRequired: false,
        features: { ip: true, arbitraryIp: true, webrtc: true },
        ipVersions: [4, 6],
        dataSource: 'DB-IP Lite offline library only (unified for self + manual)',
        edgeAttributionUsed: false,
        time: new Date().toISOString(),
      }, 200, reqEnv);
    }
    if (pathname === '/api/ip') {
      return json(Object.assign(await readIpInfo(request, reqEnv), { edgeOk: !!request.headers.get('cf-connecting-ip') }), 200, reqEnv);
    }
    // h9 · 任意 IP 查询：只接受一个 ip 参数，严格校验，本地离线库查表，零外网、零留存。
    if (pathname === '/api/lookup') {
      if ((request.method || 'GET') !== 'GET') return json({ status: 'invalid', error: 'GET only' }, 405, reqEnv);
      const raw = url.searchParams.get('ip');
      if (raw == null || raw.length > 128) {
        return json({ status: 'invalid', error: 'ip parameter required (max 128 chars)' }, 400, reqEnv);
      }
      if (/[^\x20-\x7e]/.test(raw) || /[\s,<>"'\\]/.test(raw)) {
        return json({ status: 'invalid', error: 'illegal characters in ip parameter' }, 400, reqEnv);
      }
      return json(await readArbitraryIp(raw.trim(), reqEnv), 200, reqEnv);
    }
    if (pathname === '/api/lib') {
      return json(Object.assign(await libMeta(reqEnv), {
        observedAt: new Date().toISOString(),
        attribution: ATTRIBUTION,
        note: 'Offline index is local (bundled inline or in static library files deployed with this site); no third-party lookup is performed.',
        auto: { builtIn: false, mode: 'ci-built', builtAt: 'deploy-time [build].command',
                monthly: 'GitHub Actions empty commit → Workers Builds',
                refresh: '/api/lib/refresh (status only, no runtime install)', runtime: RUNTIME_NOTE },
        lastError: await lastError(reqEnv),
      }), 200, reqEnv);
    }
    if (pathname === '/api/lib/refresh') {
      const r = await autoInstall(reqEnv);
      return json(r, 200, reqEnv);
    }
    // 本次连接侧可确认的事实：只回显边缘给出的元数据，零留存、零查库、零外网。
    // 仅用于把浏览器本次观测到的候选地址与本次连接出口做逐项对照。
    if (pathname === '/api/selfcheck') {
      const cf = request.cf || {};
      const seen = request.headers.get('cf-connecting-ip') || null;
      const ver = seen ? (seen.indexOf(':') >= 0 ? 6 : 4) : null;
      return json({
        ip: seen,
        ipVersion: ver,
        ipv4: ver === 4 ? seen : null,
        ipv6: ver === 6 ? seen : null,
        colo: cf.colo || null,
        asn: cf.asn || null,
        httpProtocol: cf.httpProtocol || null,
        tlsVersion: cf.tlsVersion || null,
        observedAt: new Date().toISOString(),
        scope: 'Connection-level facts only.'
      }, 200, reqEnv);
    }


    // [本次改造] 旧探测引信、会话、权威回写、结果聚合四个接口与对应的
    // KV 会话读写整体删除，不再依赖外部权威解析服务。

    // 5) 14 个独立页面（IP 归属 + WebRTC 自查 + 4 个法务页）
    const m = matchPath(pathname);
    if (!m) {
      return html(
        '<!doctype html><html><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>404</title></head>' +
        '<body style="background:#0b1020;color:#e8edf7;font-family:system-ui;padding:40px"><h1>404</h1><p>Page not found / 页面不存在</p></body></html>',
        404, null, reqEnv, { 'X-Robots-Tag': NOINDEX }
      );
    }
    const canonical = pathFor(m.lang.slug, m.structure.slug);
    if (pathname !== canonical) return redirect(canonical, 301, reqEnv);

    const rendered = renderPage({
      lang: m.lang,
      structure: m.structure,
      origin: CANON_ORIGIN,
      pathname: canonical,
      publicMode: publicMode,
      noindexPage: !isCanonHost || !publicMode,
      gscMeta: String((reqEnv && reqEnv.GSC_VERIFY_META) || ''),
      contact: SITE.contact,
      version: SITE.version,
      policyVersion: SITE.policyVersion,
      lib: await libMeta(reqEnv),
    });
    return html(rendered.html, 200, rendered.nonce, reqEnv);
  },

  // h16 · cron 仅作轻量心跳：纯读一个 KV key，0 下载 / 0 解压 / 0 解析 / 0 写入。
  async scheduled(event, env, ctx) {
    ctx.waitUntil(installedMonth(env).then(() => null).catch(() => null));
  },
};
