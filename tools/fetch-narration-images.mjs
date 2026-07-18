#!/usr/bin/env node
/* =========================================================================
 * 解说脚本自动配图工具
 *
 * 多 backend 支持（按可用性自动降级）：
 *   --backend bing    默认。爬 cn.bing.com 图片搜索（国内可达，免账号）
 *   --backend wiki    Wikipedia REST API（海外可用，质量最高）
 *
 * 用法：
 *   node tools/fetch-narration-images.mjs data/narrations/liubei.json
 *   node tools/fetch-narration-images.mjs data/narrations/liubei.json --backend wiki
 *   node tools/fetch-narration-images.mjs data/narrations/liubei.json --clear
 *
 * segment 应含 `keywords` 字段（字符串或数组，按优先级），无则跳过。
 *
 * 输出字段：
 *   image        图片 URL
 *   imageCaption 图片说明（自动从源获取 / 用 keyword 兜底）
 *   imageSource  版权归属
 * ========================================================================= */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const UA = 'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

const args = process.argv.slice(2);
const scriptPathArg = args.find(a => !a.startsWith('--'));
const getOpt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const BACKEND = getOpt('backend', 'bing');
const doClear = args.includes('--clear');

function curl(url, opts = {}) {
  const r = spawnSync('curl', [
    '-sS', '--max-time', String(opts.timeout || 8),
    '-A', UA,
    '-H', 'Accept-Language: zh-CN,zh;q=0.9',
    ...(opts.referer ? ['-e', opts.referer] : []),
    url,
  ], { encoding: 'utf8' });
  return r.stdout || '';
}

/** Bing 图片搜索：解析 murl 字段 */
function searchBing(keyword, limit = 5) {
  const url = `https://cn.bing.com/images/async?q=${encodeURIComponent(keyword)}&first=1&count=35&form=IRFLTR&ensearch=0`;
  const html = curl(url, { referer: 'https://cn.bing.com/' });
  // murl 是 JSON 字段（被 HTML 转义为 &quot;），抓所有 murl
  const matches = [...html.matchAll(/murl&quot;:&quot;([^&]+)&quot;/g)];
  const urls = matches.map(m => m[1]).filter(u =>
    /^https?:\/\//.test(u) &&
    !/(logo|icon|avatar|emoji|sprite)/i.test(u) &&
    /\.(jpg|jpeg|png|webp)(\?|$)/i.test(u)
  );
  return [...new Set(urls)].slice(0, limit);
}

/** Wikipedia REST API（海外可用） */
async function searchWiki(title) {
  const url = `https://zh.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  const text = curl(url);
  if (!text) return null;
  try {
    const j = JSON.parse(text);
    if (!j) return null;
    const img = j.originalimage?.source || j.thumbnail?.source;
    if (!img) return null;
    return {
      image: img,
      imageCaption: j.description || title,
      imageSource: `© Wikipedia · ${title}`,
    };
  } catch { return null; }
}

/** 给关键词选最合适的图：用最简单启发式（选 Bing 第一个结果，并指定 caption） */
async function findImage(keyword) {
  if (BACKEND === 'wiki') {
    return await searchWiki(keyword);
  }
  // bing
  const urls = searchBing(keyword, 1);
  if (!urls.length) return null;
  return {
    image: urls[0],
    imageCaption: keyword,
    imageSource: '© Bing 图片搜索结果',
  };
}

async function main() {
  if (doClear) {
    if (!scriptPathArg) return;
    const p = resolve(ROOT, scriptPathArg);
    const j = JSON.parse(readFileSync(p, 'utf8'));
    j.segments = j.segments.map(s => {
      const { image, imageCaption, imageSource, ...rest } = s;
      return rest;
    });
    writeFileSync(p, JSON.stringify(j, null, 2) + '\n', 'utf8');
    console.log('✅ 已清除 image 字段');
    return;
  }
  if (!scriptPathArg) {
    console.error('用法：node tools/fetch-narration-images.mjs <脚本路径> [--backend bing|wiki] [--clear]');
    process.exit(2);
  }
  const p = resolve(ROOT, scriptPathArg);
  const script = JSON.parse(readFileSync(p, 'utf8'));

  console.log(`▶ ${script.personId} · backend=${BACKEND} · ${script.segments.length} 段`);
  let hit = 0, miss = 0;
  for (let i = 0; i < script.segments.length; i++) {
    const seg = script.segments[i];
    const kw = seg.keywords;
    if (!kw) { console.log(`  [${i}] 跳过（无 keywords）`); continue; }
    const candidates = Array.isArray(kw) ? kw : [kw];
    let found = null;
    for (const title of candidates) {
      process.stdout.write(`  [${i}] 查询：${title} ... `);
      found = await findImage(title);
      if (found) { console.log(`✓ ${found.image.slice(0, 80)}...`); break; }
      else console.log('✗');
    }
    if (found) {
      script.segments[i] = { ...seg, ...found };
      hit++;
    } else {
      miss++;
    }
  }

  writeFileSync(p, JSON.stringify(script, null, 2) + '\n', 'utf8');
  console.log(`\n✅ 写回：${p}（命中 ${hit} / 失败 ${miss}）`);
}

main().catch(e => { console.error('✗', e); process.exit(1); });
