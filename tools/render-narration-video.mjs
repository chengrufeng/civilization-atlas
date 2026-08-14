#!/usr/bin/env node
/* 无头渲染解说视频：页面自动播放 + 录屏 + 音轨合成 mp4
 *
 * 用法：
 *   node tools/render-narration-video.mjs data/narrations/liubei.json
 *   node tools/render-narration-video.mjs --all            # 渲染全部（跳过已存在）
 *   node tools/render-narration-video.mjs --all --force     # 全部重渲
 *   可选：--width 1920 --height 1080 --tail 2500
 *
 * 依赖：playwright（channel:chrome 复用系统 Chrome）+ ffmpeg（brew）
 * 输出：video/narrations/<personId>.mp4（1920x1080 H.264 + 原 m4a 音轨）
 */

import { createServer } from 'node:http';
import { readFile, stat, mkdir, access } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

/* ---------- 参数 ---------- */
const argv = process.argv.slice(2);
const flag = (name) => argv.includes(name);
const opt = (name, dflt) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : dflt;
};
const WIDTH = parseInt(opt('--width', '1920'), 10);
const HEIGHT = parseInt(opt('--height', '1080'), 10);
const TAIL_MS = parseInt(opt('--tail', '2500'), 10); // 结束后再录的尾巴，让收尾动画播完
const FORCE = flag('--force');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.m4a': 'audio/mp4',
  '.mp3': 'audio/mpeg',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

/* ---------- 极简静态服务器（根目录 = 项目根） ---------- */
function startServer(port) {
  const server = createServer(async (req, res) => {
    try {
      let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (p.endsWith('/')) p += 'index.html';
      const file = path.join(ROOT, p);
      if (!file.startsWith(ROOT) || !existsSync(file)) {
        res.writeHead(404); res.end('404'); return;
      }
      const st = await stat(file);
      if (!st.isFile()) { res.writeHead(404); res.end('404'); return; }
      res.writeHead(200, {
        'content-type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
        'cache-control': 'no-store',
      });
      res.end(await readFile(file));
    } catch { res.writeHead(500); res.end('500'); }
  });
  return new Promise((resolve) => server.listen(port, '127.0.0.1', () => resolve(server)));
}

function findFfmpeg() {
  for (const c of ['/opt/homebrew/bin/ffmpeg', '/usr/local/bin/ffmpeg']) {
    if (existsSync(c)) return c;
  }
  const r = spawnSync('which', ['ffmpeg'], { encoding: 'utf8' });
  if (r.stdout) return r.stdout.trim();
  return null;
}

/* ---------- 渲染单个视频 ---------- */
async function renderOne({ chromium }, jsonPath, ffmpeg, port) {
  const script = JSON.parse(await readFile(jsonPath, 'utf8'));
  const { personId, atlasId, audio } = script;
  const outDir = path.join(ROOT, 'video', 'narrations');
  await mkdir(outDir, { recursive: true });
  const outFile = path.join(outDir, `${personId}.mp4`);
  if (existsSync(outFile) && !FORCE) {
    console.log(`↷ 跳过（已存在）：${personId}.mp4`);
    return { personId, skipped: true };
  }

  console.log(`▶ 渲染：${personId}（${script.title}）`);
  const browser = await chromium.launch({
    headless: true,
    channel: 'chrome',
    args: [
      '--autoplay-policy=no-user-gesture-required',
      '--mute-audio',
      '--disable-dev-shm-usage',
      '--force-device-scale-factor=1',
    ],
  });
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: { dir: path.join(ROOT, 'video', '.tmp'), size: { width: WIDTH, height: HEIGHT } },
  });
  const page = await context.newPage();
  page.on('pageerror', (e) => console.log(`  ⚠ 页面错误：${String(e).split('\n')[0]}`));

  const t0 = Date.now();
  try {
    await page.goto(`http://127.0.0.1:${port}/index.html?atlas=${atlasId}`, {
      waitUntil: 'networkidle', timeout: 60000,
    });
    // 等地图瓦片就绪
    await page.waitForTimeout(2500);

    // 启动解说并等待播完（音频推进即页面推进）
    await page.evaluate(async (pid) => {
      const m = await import('./js/core/narration.js');
      await m.startNarration(pid);
    }, personId);

    await page.waitForFunction(async () => {
      const m = await import('./js/core/narration.js');
      return !m.isNarrationActive();
    }, { timeout: 300000, polling: 1000 });

    await page.waitForTimeout(TAIL_MS); // 收尾动画
    const video = page.video();
    await context.close();
    var webmPath = await video.path();
    await browser.close();
  } catch (e) {
    await browser.close().catch(() => {});
    return { personId, error: `页面渲染失败：${String(e).split('\n')[0]}` };
  }

  // context.close() 后才能拿到完整 webm；video() 要在 close 前拿路径 —— 上面顺序已保证拿到 path
  if (!webmPath || !existsSync(webmPath)) {
    return { personId, error: '未能获取录屏文件' };
  }

  // 合成：录屏画面 + 原始 m4a 音轨（音画天然同步——页面就是被这条音轨驱动的）
  const r = spawnSync(ffmpeg, [
    '-y', '-i', webmPath, '-i', path.join(ROOT, audio),
    '-map', '0:v:0', '-map', '1:a:0',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '160k',
    '-movflags', '+faststart',
    '-shortest',
    outFile,
  ], { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' });
  if (r.status !== 0) {
    return { personId, error: `ffmpeg 失败：${(r.stderr || '').split('\n').slice(-3).join(' ')}` };
  }
  const st = await stat(outFile);
  console.log(`✅ ${personId}.mp4（${(st.size / 1e6).toFixed(1)}MB，耗时 ${((Date.now() - t0) / 1000).toFixed(0)}s）`);
  return { personId, ok: true };
}

/* ---------- main ---------- */
async function main() {
  const targets = [];
  if (flag('--all')) {
    const { readdir } = await import('node:fs/promises');
    for (const f of (await readdir(path.join(ROOT, 'data', 'narrations'))).sort()) {
      if (f.endsWith('.json')) targets.push(path.join(ROOT, 'data', 'narrations', f));
    }
  } else {
    for (const a of argv) {
      if (!a.startsWith('--') && a.endsWith('.json')) targets.push(path.resolve(a));
    }
  }
  if (!targets.length) {
    console.log('用法：render-narration-video.mjs <json...> | --all [--force] [--width 1920 --height 1080]');
    process.exit(1);
  }

  const ffmpeg = findFfmpeg();
  if (!ffmpeg) {
    console.error('✗ 未找到 ffmpeg，请先：brew install ffmpeg');
    process.exit(1);
  }

  await mkdir(path.join(ROOT, 'video', '.tmp'), { recursive: true });
  const port = 8199;
  const server = await startServer(port);
  const { chromium } = await import('playwright');

  const results = [];
  for (const t of targets) {
    try { results.push(await renderOne({ chromium }, t, ffmpeg, port)); }
    catch (e) { results.push({ personId: path.basename(t, '.json'), error: String(e).split('\n')[0] }); }
  }

  server.close();
  const ok = results.filter((r) => r.ok).length;
  const skip = results.filter((r) => r.skipped).length;
  const fail = results.filter((r) => r.error);
  console.log(`\n汇总：成功 ${ok} / 跳过 ${skip} / 失败 ${fail.length}`);
  fail.forEach((f) => console.log(`  ✗ ${f.personId}: ${f.error}`));
  process.exit(fail.length ? 2 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
