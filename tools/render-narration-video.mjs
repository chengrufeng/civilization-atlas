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
import { createRequire } from 'node:module';
import { readFile, stat, mkdir, access, writeFile, rm } from 'node:fs/promises';
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
  // 优先：项目内 ffmpeg-static（npm 安装，自带 libx264/aac）
  try {
    const p = createRequire(import.meta.url)('ffmpeg-static');
    if (p && existsSync(p)) return p;
  } catch { /* 未安装则继续找系统版本 */ }
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
  });
  const page = await context.newPage();
  page.on('pageerror', (e) => console.log(`  ⚠ 页面错误：${String(e).split('\n')[0]}`));

  const t0 = Date.now();
  // CDP Screencast 逐帧捕获（不用 playwright recordVideo——它会启用虚拟时钟把音频快进）
  // 每帧带真实时间戳 metadata.timestamp，合成时按时间戳精确对齐音画
  const frameDir = path.join(ROOT, 'video', '.tmp', personId);
  await mkdir(frameDir, { recursive: true });
  const cdp = await context.newCDPSession(page);
  const frames = []; // { file, ts }
  let frameSeq = 0;
  cdp.on('Page.screencastFrame', async ({ data, metadata, sessionId }) => {
    const file = path.join(frameDir, `f${String(frameSeq++).padStart(5, '0')}.png`);
    try {
      await writeFile(file, Buffer.from(data, 'base64'));
      frames.push({ file, ts: metadata.timestamp });
    } catch { /* 磁盘错误则丢帧 */ }
    await cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
  });

  try {
    await cdp.send('Page.startScreencast', {
      format: 'png', maxWidth: WIDTH, maxHeight: HEIGHT, everyNthFrame: 1,
    });
    // 带 person 参数：走真实用户路径（打开人物详情面板，地图 flyTo 到人物位置）
    await page.goto(
      `http://127.0.0.1:${port}/index.html?atlas=${atlasId}&person=${personId}`,
      { waitUntil: 'networkidle', timeout: 60000 },
    );

    // 1) 等地图瓦片全部加载完（灰块 = 未加载瓦片，进正片前必须干净）
    // 2) 沿解说轨迹逐点预热瓦片（提前进缓存，正片中 flyTo 秒出图）
    // 3) 回到首个地点视野，再开始解说
    await page.evaluate(async ({ atlas, pid }) => {
      const waitTiles = async (timeoutMs = 30000) => {
        const t0 = performance.now();
        while (performance.now() - t0 < timeoutMs) {
          const imgs = [...document.querySelectorAll('#map-chart img.leaflet-tile')];
          if (imgs.length && imgs.every(i => i.complete && i.naturalWidth > 0)) return true;
          await new Promise(r => setTimeout(r, 250));
        }
        return false;
      };
      // 等开放详情的 flyTo + 初始瓦片
      await new Promise(r => setTimeout(r, 1200));
      await waitTiles();

      // 轨迹地点预热
      const script = await (await fetch(`../data/narrations/${pid}.json`)).json();
      const { state } = await import('./js/core/state.js');
      // 数据集导出形如 sanguoAtlas（具名导出，按文件名转驼峰）
      const camel = atlas.replace(/_([a-z])/g, (_, c) => c.toUpperCase()) + 'Atlas';
      const dsMod = await import(`./js/data/${atlas}.js`);
      const ds = dsMod[camel] || dsMod.default || Object.values(dsMod)[0];
      const seen = new Set();
      const coords = [];
      for (const s of script.segments) {
        if (!s.place) continue;
        const p = ds.places.find(x => x.name === s.place);
        if (p && !seen.has(p.name)) { seen.add(p.name); coords.push(p.coord); }
      }
      if (coords.length) {
        for (const c of coords) {
          // setView 立即定位（不产生 flyTo 动画帧），等瓦片后继续
          state.map.setView([c[1], c[0]], 6, { animate: false });
          await waitTiles(8000);
        }
        // 回到首个地点
        state.map.setView([coords[0][1], coords[0][0]], 6, { animate: false });
        await waitTiles(8000);
      }
    }, { atlas: atlasId, pid: personId });

    frames.length = 0; frameSeq = 0; // 起点前的帧不进正片

    // 启动解说并等待播完（音频实时推进即页面推进）
    // 注意：不要在 waitForFunction 里 import() 业务模块 —— Playwright 注入上下文会
    // 重新实例化 ES 模块（session 变量为 null），第一轮 poll 就误判结束。
    // 改用 DOM 信号：narration-focus 在 startNarration 添加、stopNarration 移除。
    await page.evaluate(async (pid) => {
      const m = await import('./js/core/narration.js');
      await m.startNarration(pid);
    }, personId);

    await page.waitForFunction(
      () => !document.body.classList.contains('narration-focus'),
      null, // arg
      { timeout: 600000, polling: 1000 },
    );

    await page.waitForTimeout(TAIL_MS); // 收尾动画
    await cdp.send('Page.stopScreencast').catch(() => {});
    await page.waitForTimeout(300); // 收净在途帧
  } catch (e) {
    await browser.close().catch(() => {});
    return { personId, error: `页面渲染失败：${String(e).split('\n')[0]}` };
  }
  await browser.close().catch(() => {});

  if (frames.length < 2) {
    return { personId, error: `捕获帧不足（${frames.length} 帧）` };
  }

  // 生成 ffmpeg concat 清单：每帧带精确 duration（时间戳差值）
  const listFile = path.join(frameDir, 'list.txt');
  const durations = [];
  for (let i = 1; i < frames.length; i++) durations.push(frames[i].ts - frames[i - 1].ts);
  // 清理异常间隔（掉帧/卡顿保护：单帧最长 1s）
  const clamp = (d) => Math.min(Math.max(d, 1 / 60), 1.0);
  const lines = [];
  for (let i = 0; i < frames.length; i++) {
    const d = i < frames.length - 1 ? clamp(durations[i]) : clamp(durations[durations.length - 1]);
    lines.push(`file '${frames[i].file.replace(/'/g, "'\\''")}'`);
    lines.push(`duration ${d.toFixed(4)}`);
  }
  // concat demuxer 需要重复最后一帧
  lines.push(`file '${frames[frames.length - 1].file.replace(/'/g, "'\\''")}'`);
  await writeFile(listFile, lines.join('\n'));

  // 合成：帧序列(按时间戳) + 原始 m4a 音轨 → CFR 25fps H.264
  const r = spawnSync(ffmpeg, [
    '-y',
    '-f', 'concat', '-safe', '0', '-i', listFile,
    '-i', path.join(ROOT, audio),
    '-map', '0:v:0', '-map', '1:a:0',
    '-vf', 'fps=25,format=yuv420p',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18',
    '-c:a', 'aac', '-b:a', '160k',
    '-movflags', '+faststart',
    '-shortest',
    outFile,
  ], { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' });
  // 清理帧目录
  spawnSync('rm', ['-rf', frameDir]);
  if (r.status !== 0) {
    return { personId, error: `ffmpeg 失败：${(r.stderr || '').split('\n').slice(-3).join(' ')}` };
  }
  const st = await stat(outFile);
  console.log(`✅ ${personId}.mp4（${(st.size / 1e6).toFixed(1)}MB，${frames.length} 帧，耗时 ${((Date.now() - t0) / 1000).toFixed(0)}s）`);
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
    console.error('✗ 未找到 ffmpeg，请先：npm i -D ffmpeg-static（或 brew install ffmpeg）');
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
