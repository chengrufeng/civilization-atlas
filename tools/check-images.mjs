/* =========================================================================
 * 检查 personImages 中的 URL 是否可访问（HEAD 请求）。
 *   node tools/check-images.mjs            检查全部
 *   node tools/check-images.mjs sanguo     只检查某个
 * 当前大多数数据集 personImages 为空（用字符头像占位），此脚本主要面向
 * 未来批量补肖像后的体检。
 * ========================================================================= */

import { ATLAS_MANIFEST } from '../js/data/index.js';

const only = process.argv[2];
const TIMEOUT = 5000;

function head(url) {
  return new Promise((resolve) => {
    const lib = url.startsWith('https') ? import('node:https') : import('node:http');
    lib.then(({ default: mod }) => {
      const req = mod.request(url, { method: 'HEAD', timeout: TIMEOUT }, (res) => {
        resolve({ status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 400 });
      });
      req.on('error', () => resolve({ status: 0, ok: false }));
      req.on('timeout', () => { req.destroy(); resolve({ status: 0, ok: false }); });
      req.end();
    }).catch(() => resolve({ status: 0, ok: false }));
  });
}

async function checkAtlas(meta) {
  const a = await meta.load();
  const urls = a.personImages || {};
  const entries = Object.entries(urls);
  if (entries.length === 0) {
    console.log(`[${meta.id}] 无 personImages（用字符头像占位）`);
    return { total: 0, broken: 0 };
  }
  let broken = 0;
  for (const [pid, url] of entries) {
    const r = await head(url);
    const tag = r.ok ? 'OK' : 'BAD';
    if (!r.ok) broken++;
    console.log(`  [${tag}] ${meta.id}/${pid} ${r.status} ${url}`);
  }
  console.log(`[${meta.id}] ${entries.length} 个 URL，${broken} 个失效`);
  return { total: entries.length, broken };
}

async function main() {
  const metas = only ? ATLAS_MANIFEST.filter(m => m.id === only) : ATLAS_MANIFEST;
  let totalUrls = 0, totalBroken = 0;
  for (const m of metas) {
    const r = await checkAtlas(m);
    totalUrls += r.total; totalBroken += r.broken;
  }
  console.log(`\n汇总：${totalUrls} 个 URL，${totalBroken} 个失效`);
}

main();
