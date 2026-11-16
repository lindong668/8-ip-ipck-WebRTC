// 8号 v51 · 用站点真实读取层 src/core/geodb.js 对刚重建的库做端到端查询校验。
// 不是只看 meta.json：必须真的能按分片路由查到国家 / ASN，才算这次更新没把库做坏。
// 用法：node tools/verify-lib.mjs [geo目录] [geodb.js路径] [--min-rows N]
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const argv = process.argv.slice(2);
const GEO = path.resolve(argv[0] || 'assets/geo');
const GEODB = path.resolve(argv[1] || 'src/core/geodb.js');
const mi = argv.indexOf('--min-rows');
const MIN_ROWS = mi >= 0 ? Number(argv[mi + 1]) : 4000000;

const fail = (m) => { console.error('[ipckit/verify-lib] FAIL:', m); process.exit(1); };
if (!fs.existsSync(path.join(GEO, 'meta.json'))) fail('missing ' + path.join(GEO, 'meta.json'));
if (!fs.existsSync(GEODB)) fail('missing geodb.js at ' + GEODB);

// 模拟 Workers 的 env.ASSETS.fetch：assetText() 请求 https://ipckit.assets/geo/xxx
const env = {
  ASSETS: {
    async fetch(req) {
      const p = new URL(req.url).pathname.replace(/^\//, '');
      const rel = p.replace(/^geo\//, '');
      const fp = path.join(GEO, rel);
      if (!fp.startsWith(GEO + path.sep) && fp !== GEO) return new Response('', { status: 403 });
      if (!fs.existsSync(fp)) return new Response('', { status: 404 });
      return new Response(fs.readFileSync(fp, 'utf8'), { status: 200 });
    },
  },
};

const { libMeta, lookup } = await import(pathToFileURL(GEODB).href);
const m = await libMeta(env);
if (!m || m.status !== 'ready') fail('libMeta status != ready');
if (m.mode !== 'shard6') fail('mode != shard6, got ' + m.mode);
if (!m.encoded) fail('encoded flag lost');
if (!m.ipv6) fail('ipv6 flag lost');
if (!(m.rowCount >= MIN_ROWS)) fail('rowCount ' + m.rowCount + ' < ' + MIN_ROWS);
if (!(m.shardCount >= 1)) fail('shardCount ' + m.shardCount);
if (!m.version || !m.fetchedAt) fail('version / fetchedAt missing');

const cases = ['8.8.8.8', '1.0.0.1', '2001:4860:4860::8888'];
let hits = 0;
for (const ip of cases) {
  const r = await lookup(ip, env);
  if (r && r.country) {
    hits++;
    console.log('[ipckit/verify-lib]', ip, '->', r.country, r.region || '-', r.asn || '-', r.org || '-');
  } else {
    console.log('[ipckit/verify-lib]', ip, '-> no hit');
  }
}
if (hits < 2) fail('only ' + hits + '/' + cases.length + ' IPs resolved');
const g = await lookup('8.8.8.8', env);
if (!g || !/^[A-Z]{2}$/.test(String(g.country))) fail('8.8.8.8 country invalid');
if (!g.asn || !/^AS\d+$/.test(String(g.asn))) fail('8.8.8.8 asn invalid: ' + (g && g.asn));

console.log('[ipckit/verify-lib] OK | version=' + m.version + ' fetchedAt=' + m.fetchedAt +
            ' rows=' + m.rowCount + ' shards=' + m.shardCount + ' hits=' + hits + '/' + cases.length);
