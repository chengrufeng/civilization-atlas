#!/usr/bin/env node
/* =========================================================================
 * 把解说脚本里的远程图片下载到本地，避免 hotlink 防护 / 域名失效
 *
 * 用法：node tools/localize-narration-images.mjs data/narrations/liubei.json
 * ========================================================================= */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const UA = 'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/120.0 Safari/537.36';

const args = process.argv.slice(2);
const scriptPath = resolve(ROOT, args.find(a => !a.startsWith('--')));
if (!scriptPath) {
  console.error('用法：node tools/localize-narration-images.mjs <脚本路径>');
  process.exit(2);
}

function curlDownload(url, outPath) {
  // 加 Referer 兜底（用同域名）
  let referer = '';
  try {
    const u = new URL(url);
    referer = `${u.protocol}//${u.host}/`;
  } catch {}
  const r = spawnSync('curl', [
    '-sS', '-L', '--max-time', '10',
    '-A', UA,
    '-e', referer,
    '-o', outPath,
    url,
  ], { encoding: 'utf8' });
  return r.status === 0;
}

async function main() {
  const script = JSON.parse(readFileSync(scriptPath, 'utf8'));
  const personId = script.personId || 'unknown';
  const imgDir = resolve(ROOT, 'audio/narrations/images', personId);
  mkdirSync(imgDir, { recursive: true });

  let hit = 0, miss = 0, skipped = 0;
  script.segments.forEach((seg, i) => {
    if (!seg.image) { skipped++; return; }
    if (seg.image.startsWith('audio/') || seg.image.startsWith('./')) {
      skipped++; return;  // 已是本地路径
    }
    // 推断扩展名
    let ext = 'jpg';
    const m = seg.image.match(/\.(jpg|jpeg|png|webp|gif)(\?|$)/i);
    if (m) ext = m[1].toLowerCase().replace('jpeg', 'jpg');
    const fname = `seg-${String(i).padStart(2, '0')}.${ext}`;
    const outPath = join(imgDir, fname);
    const relPath = `audio/narrations/images/${personId}/${fname}`;

    process.stdout.write(`  [${i}] ${seg.image.slice(0, 80)} ... `);
    if (curlDownload(seg.image, outPath)) {
      // 校验下载是否真的是图片（前几个字节）
      const buf = readFileSync(outPath);
      const isJpeg = buf[0] === 0xFF && buf[1] === 0xD8;
      const isPng = buf[0] === 0x89 && buf[1] === 0x50;
      const isGif = buf[0] === 0x47 && buf[1] === 0x49;
      const isWebp = buf.slice(0, 4).toString() === 'RIFF';
      if (isJpeg || isPng || isGif || isWebp) {
        seg.image = relPath;
        hit++;
        console.log(`✓ ${buf.length}B → ${relPath}`);
      } else {
        console.log(`✗ 不是图片（前 4 字节：${buf.slice(0, 4).toString('hex')}）`);
        miss++;
      }
    } else {
      console.log('✗ curl 失败');
      miss++;
    }
  });

  writeFileSync(scriptPath, JSON.stringify(script, null, 2) + '\n', 'utf8');
  console.log(`\n✅ 写回：${scriptPath}`);
  console.log(`汇总：成功 ${hit} / 失败 ${miss} / 已本地 ${skipped}`);
}

main().catch(e => { console.error('✗', e); process.exit(1); });
