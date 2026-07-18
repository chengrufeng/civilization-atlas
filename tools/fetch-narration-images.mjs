#!/usr/bin/env node
/* =========================================================================
 * 解说脚本自动配图工具
 *
 * 从 Wikipedia / Wikimedia Commons 抓取每段关键词的图片，写入脚本 JSON 的
 * segment.image / segment.imageCaption / segment.imageSource 字段。
 *
 * 用法：
 *   node tools/fetch-narration-images.mjs data/narrations/liubei.json
 *   node tools/fetch-narration-images.mjs data/narrations/liubei.json --clear
 *
 * segment 应包含可选 `keywords` 字段（如"三顾茅庐"），工具会用它查询 Wikipedia。
 * 若没有 keywords，跳过该段。
 *
 * Wikipedia REST API：https://zh.wikipedia.org/api/rest_v1/page/summary/<title>
 *   - CORS 全开放
 *   - 返回 thumbnail.source（小图，~320px）+ originalimage.source（原图）
 *   - 我们取 originalimage 以保证清晰度，再让浏览器 CSS 缩放
 * ========================================================================= */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const UA = 'CivilizationAtlas/1.0 (https://github.com/local; narration-image-fetcher)';

async function fetchSummary(title) {
  const url = `https://zh.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!r.ok) return null;
  const j = await r.json().catch(() => null);
  return j;
}

async function main() {
  const args = process.argv.slice(2);
  const scriptPath = resolve(ROOT, args.find(a => !a.startsWith('--')));
  const doClear = args.includes('--clear');
  if (!scriptPath) {
    console.error('用法：node tools/fetch-narration-images.mjs <脚本路径> [--clear]');
    process.exit(2);
  }
  const script = JSON.parse(readFileSync(scriptPath, 'utf8'));

  if (doClear) {
    script.segments = script.segments.map(s => {
      const { image, imageCaption, imageSource, ...rest } = s;
      return rest;
    });
    writeFileSync(scriptPath, JSON.stringify(script, null, 2) + '\n', 'utf8');
    console.log('✅ 已清除所有 image 字段');
    return;
  }

  console.log(`▶ ${script.personId} · ${script.segments.length} 段`);
  let hit = 0, miss = 0;
  for (let i = 0; i < script.segments.length; i++) {
    const seg = script.segments[i];
    const kw = seg.keywords;
    if (!kw) { console.log(`  [${i}] 跳过（无 keywords）`); continue; }
    // 多个候选关键词依次尝试
    const candidates = Array.isArray(kw) ? kw : [kw];
    let found = null;
    for (const title of candidates) {
      console.log(`  [${i}] 查询：${title}`);
      const sum = await fetchSummary(title);
      if (sum && (sum.originalimage?.source || sum.thumbnail?.source)) {
        found = {
          image: sum.originalimage?.source || sum.thumbnail?.source,
          imageCaption: sum.description || sum.extract || title,
          imageSource: `© Wikipedia · ${title}`,
        };
        break;
      }
      await new Promise(r => setTimeout(r, 200)); // 礼貌延迟
    }
    if (found) {
      script.segments[i] = { ...seg, ...found };
      console.log(`  [${i}] ✓ ${found.image.split('/').pop()}`);
      hit++;
    } else {
      console.log(`  [${i}] ✗ 未找到图片`);
      miss++;
    }
  }

  writeFileSync(scriptPath, JSON.stringify(script, null, 2) + '\n', 'utf8');
  console.log(`\n✅ 写回：${scriptPath}（命中 ${hit} / 失败 ${miss}）`);
}

main().catch(e => { console.error('✗', e); process.exit(1); });
