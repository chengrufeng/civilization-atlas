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
const FPS = parseInt(opt('--fps', '12'), 10); // 逐帧渲染采样率（地图移动平滑度）
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
  // ── 确定性逐帧渲染（不依赖 screencast 实时出帧——它出帧率低且不均匀，是卡顿根源）──
  // 思路：音频暂停，仅作时间轴；逐帧设置 audio.currentTime（'seeked' 事件在
  // narration.js 里已接 onTimeUpdate → applySegment 同步切字幕/轨迹/图片/特效）；
  // 相机不交给 flyTo（壁钟动画），由我们按视频时间插值 jumpTo；每帧等瓦片/图片
  // 加载完再截图 → 均匀 FPS 序列，音画逐帧对齐。
  const frameDir = path.join(ROOT, 'video', '.tmp', personId);
  await mkdir(frameDir, { recursive: true });
  let frameSeq = 0;

  try {
    // 带 person 参数：走真实用户路径（打开人物详情面板，地图 flyTo 到人物位置）
    await page.goto(
      `http://127.0.0.1:${port}/index.html?atlas=${atlasId}&person=${personId}`,
      { waitUntil: 'networkidle', timeout: 60000 },
    );

    // 1) 等地图瓦片全部加载完 2) 沿轨迹预热瓦片 3) 进入渲染模式
    const setup = await page.evaluate(async ({ atlas, pid }) => {
      const waitTiles = async (timeoutMs = 30000) => {
        const s = performance.now();
        while (performance.now() - s < timeoutMs) {
          const imgs = [...document.querySelectorAll('#map-chart img.leaflet-tile')];
          if (imgs.length && imgs.every(i => i.complete && i.naturalWidth > 0)) return true;
          await new Promise(r => setTimeout(r, 250));
        }
        return false;
      };
      await new Promise(r => setTimeout(r, 1200));
      await waitTiles();

      const script = await (await fetch(`../data/narrations/${pid}.json`)).json();
      const { state } = await import('./js/core/state.js');
      const camel = atlas.replace(/_([a-z])/g, (_, c) => c.toUpperCase()) + 'Atlas';
      const dsMod = await import(`./js/data/${atlas}.js`);
      const ds = dsMod[camel] || dsMod.default || Object.values(dsMod)[0];

      // 轨迹地点预热（沿途瓦片全部进缓存）
      const seen = new Set();
      const coords = [];
      for (const s of script.segments) {
        if (!s.place) continue;
        const p = ds.places.find(x => x.name === s.place);
        if (p && !seen.has(p.name)) { seen.add(p.name); coords.push(p.coord); }
      }
      if (coords.length) {
        for (const c of coords) {
          state.map.setView([c[1], c[0]], 6, { animate: false });
          await waitTiles(8000);
        }
        state.map.setView([coords[0][1], coords[0][0]], 6, { animate: false });
        await waitTiles(8000);
      }

      // ── 渲染模式接管 ──
      // 1. 捕获 startNarration 内部创建的 Audio 实例
      window.__audioEl = null;
      const OrigAudio = window.Audio;
      window.Audio = class extends OrigAudio {
        constructor(...a) { super(...a); window.__audioEl = this; }
      };
      // 2. 屏蔽 flyTo（壁钟动画），相机由外部逐帧驱动
      state.map.flyTo = () => {};

      const m = await import('./js/core/narration.js');
      await m.startNarration(pid);
      const a = window.__audioEl;
      if (!a) throw new Error('未捕获到解说音频实例');
      a.pause(); a.muted = true; a.currentTime = 0;

      // 3. 隐藏暂停态控制条（视频里不应出现"已暂停"的样子）
      const bar = document.querySelector('.narration-bar');
      if (bar) bar.style.display = 'none';

      // 4. 相机轨道
      window.__cam = {
        segs: script.segments.map(s => {
          const p = s.place ? ds.places.find(x => x.name === s.place) : null;
          return { t: s.t, lat: p ? p.coord[1] : null, lng: p ? p.coord[0] : null };
        }),
        lastIdx: -1, from: null, to: null, glideT0: 0,
      };
      return { duration: isFinite(a.duration) && a.duration > 0 ? a.duration : (script.totalDurationSec || 0) };
    }, { atlas: atlasId, pid: personId });

    const duration = setup.duration;
    if (!duration || duration < 5) throw new Error(`音频时长异常：${duration}`);

    // ── 逐帧循环：seek → 相机插值 → 等资源 → 截图 ──
    const frameStep = async (t) => {
      await page.evaluate(async (tt) => {
        const a = window.__audioEl;
        // seek 触发 applySegment（字幕/轨迹/图片/特效同步切换）
        const seeked = new Promise(r => {
          a.addEventListener('seeked', r, { once: true });
          setTimeout(r, 150);
        });
        a.currentTime = Math.min(tt, (a.duration || tt) - 0.05);
        await seeked;

        // 相机：与字幕同基准（currentTime + 0.2s 提前量）
        const cam = window.__cam;
        const vt = a.currentTime + 0.2;
        let idx = -1;
        for (let i = 0; i < cam.segs.length; i++) if (vt >= cam.segs[i].t) idx = i;
        if (idx >= 0 && cam.segs[idx].lat != null) {
          const seg = cam.segs[idx];
          if (idx !== cam.lastIdx) {
            const prev = cam.lastIdx >= 0 ? cam.segs[cam.lastIdx] : null;
            cam.from = prev && prev.lat != null ? [prev.lat, prev.lng] : [seg.lat, seg.lng];
            cam.to = [seg.lat, seg.lng];
            cam.glideT0 = seg.t;
            cam.lastIdx = idx;
          }
          const GLIDE = 0.8;
          let p = Math.min(Math.max((vt - cam.glideT0) / GLIDE, 0), 1);
          p = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; // easeInOutQuad
          const { state } = await import('./js/core/state.js');
          state.map.jumpTo({
            center: [cam.from[0] + (cam.to[0] - cam.from[0]) * p,
                      cam.from[1] + (cam.to[1] - cam.from[1]) * p],
            zoom: 6,
          }, { animate: false });
        }

        // 等本帧资源：瓦片 + 解说图片（每帧都齐，绝不带灰块/空图进正片）
        const s0 = performance.now();
        while (performance.now() - s0 < 3000) {
          const imgs = [...document.querySelectorAll(
            '#map-chart img.leaflet-tile, .narration-image-card img, .narration-hero-card img'
          )];
          if (imgs.length && imgs.every(i => i.complete && i.naturalWidth > 0)) break;
          await new Promise(r => setTimeout(r, 50));
        }
      }, t);
      const file = path.join(frameDir, `f${String(frameSeq++).padStart(5, '0')}.jpg`);
      await page.screenshot({ path: file, type: 'jpeg', quality: 90 });
    };

    const N = Math.ceil(duration * FPS);
    for (let i = 0; i < N; i++) {
      await frameStep(i / FPS);
      if (i % 100 === 0) console.log(`  帧 ${i}/${N}（t=${(i / FPS).toFixed(1)}s）`);
    }

    // ── 收尾：触发 ended → 恢复 UI（详情面板弹回），补 tail 帧 ──
    await page.evaluate(async () => {
      const m = await import('./js/core/narration.js');
      m.stopNarration();
      await new Promise(r => setTimeout(r, 400));
    });
    for (let k = 0; k < Math.round((TAIL_MS / 1000) * FPS); k++) {
      const file = path.join(frameDir, `f${String(frameSeq++).padStart(5, '0')}.jpg`);
      await page.screenshot({ path: file, type: 'jpeg', quality: 90 });
    }
  } catch (e) {
    await browser.close().catch(() => {});
    return { personId, error: `页面渲染失败：${String(e).split('\n')[0]}` };
  }
  await browser.close().catch(() => {});

  if (frameSeq < 2) {
    return { personId, error: `捕获帧不足（${frameSeq} 帧）` };
  }

  // 合成：均匀 FPS 帧序列 + 原始 m4a 音轨（音画由逐帧 seek 对齐，天然同步）
  // apad：把音频尾部补静音到视频长度（保留收尾帧），-shortest 以视频为准截断
  const r = spawnSync(ffmpeg, [
    '-y',
    '-framerate', String(FPS), '-i', path.join(frameDir, 'f%05d.jpg'),
    '-i', path.join(ROOT, audio),
    '-map', '0:v:0', '-map', '1:a:0',
    '-vf', 'fps=25,format=yuv420p',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18',
    '-af', 'apad',
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
  console.log(`✅ ${personId}.mp4（${(st.size / 1e6).toFixed(1)}MB，${frameSeq} 帧 @${FPS}fps，耗时 ${((Date.now() - t0) / 1000).toFixed(0)}s）`);
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
