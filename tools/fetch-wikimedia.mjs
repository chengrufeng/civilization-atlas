/* =========================================================================
 * 批量从 Wikipedia REST API 拉取人物肖像 URL。
 *   node tools/fetch-wikimedia.mjs
 *
 * 当前内置一份"必显清单"——15-20 位全球公认的核心人物。
 * 跑完后人工审阅输出，把 URL 写入对应数据集的 personImages。
 * 之后可用 check-images.mjs 验证 URL 是否仍有效。
 * ========================================================================= */

import { writeFileSync } from 'node:fs';

/* [atlasId, personId, wikipediaTitle, language] */
const TARGETS = [
  // 古希腊
  ['greece', 'socrates', 'Socrates', 'en'],
  ['greece', 'plato', 'Plato', 'en'],
  ['greece', 'aristotle', 'Aristotle', 'en'],
  ['greece', 'alexander', 'Alexander the Great', 'en'],
  // 古罗马
  ['rome', 'caesar', 'Julius Caesar', 'en'],
  ['rome', 'augustus', 'Augustus', 'en'],
  ['rome', 'nero', 'Nero', 'en'],
  ['rome', 'marcus_aurelius', 'Marcus Aurelius', 'en'],
  // 古埃及
  ['egypt', 'cleopatra', 'Cleopatra', 'en'],
  ['egypt', 'ramses_ii', 'Ramesses II', 'en'],
  // 中世纪
  ['medieval_eu', 'charlemagne', 'Charlemagne', 'en'],
  ['medieval_eu', 'saladin', 'Saladin', 'en'],
  ['medieval_eu', 'joan', 'Joan of Arc', 'en'],
  // 文艺复兴
  ['renaissance', 'leonardo', 'Leonardo da Vinci', 'en'],
  ['renaissance', 'michelangelo', 'Michelangelo', 'en'],
  ['renaissance', 'columbus', 'Christopher Columbus', 'en'],
  ['renaissance', 'shakespeare', 'William Shakespeare', 'en'],
  // 近代
  ['enlightenment', 'newton', 'Isaac Newton', 'en'],
  ['enlightenment', 'napoleon', 'Napoleon', 'en'],
  ['enlightenment', 'beethoven', 'Ludwig van Beethoven', 'en'],
  // 现代
  ['modern_world', 'einstein', 'Albert Einstein', 'en'],
  ['modern_world', 'churchill', 'Winston Churchill', 'en'],
  ['modern_world', 'gandhi', 'Mahatma Gandhi', 'en'],
  // 中国
  ['chunqiu', 'kong_qiu', 'Confucius', 'en'],
  ['qinhan', 'qin_shi_huang', 'Qin Shi Huang', 'en'],
];

async function fetchImage(title, lang) {
  const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'civilization-atlas/1.0 (educational)' } });
    if (!r.ok) return { ok: false, status: r.status };
    const j = await r.json();
    const img = j.originalimage || j.thumbnail;
    return { ok: true, url: img?.source || null };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

async function main() {
  const out = {};
  for (const [atlasId, personId, title, lang] of TARGETS) {
    process.stdout.write(`${atlasId}/${personId} ... `);
    const r = await fetchImage(title, lang);
    if (r.ok && r.url) {
      console.log('OK');
      if (!out[atlasId]) out[atlasId] = {};
      out[atlasId][personId] = r.url;
    } else {
      console.log(`FAIL (${r.status || r.error})`);
    }
  }
  writeFileSync('tools/_wikimedia_cache.json', JSON.stringify(out, null, 2));
  console.log('\n已写入 tools/_wikimedia_cache.json，请审阅后手动注入到对应数据集 personImages。');
}

main();
