#!/usr/bin/env node
/* =========================================================================
 * 解说脚本 → 音频生成工具
 *
 * 支持 backend：
 *   --backend edge   默认。微软 Edge TTS（神经网络音色，免费无需 key，中文极自然）
 *   --backend say    macOS 系统自带（婷婷/Tingting，零依赖但机械感重）
 *
 * 用法：
 *   node tools/build-narration.mjs data/narrations/liubei.json
 *   node tools/build-narration.mjs data/narrations/liubei.json --backend say
 *   node tools/build-narration.mjs data/narrations/liubei.json --voice zh-CN-YunxiNeural
 *
 * 流程：
 *   1. 读取脚本 JSON
 *   2. 每段生成临时音频（mp3 / aiff）
 *   3. afinfo 测量每段实际时长（精确到 0.001s）
 *   4. 累加 → 校准 segment.t（覆盖原时间戳）
 *   5. 合并为单一 m4a 文件（afconvert，零外部依赖）
 *   6. 写回脚本 JSON（含 totalDurationSec 与 audio 路径）
 * ========================================================================= */

import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// ---------- CLI ----------
const args = process.argv.slice(2);
const scriptPathArg = args.find(a => !a.startsWith('--'));
const getOpt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const BACKEND = getOpt('backend', 'edge');
const VOICE = getOpt('voice', BACKEND === 'edge' ? 'zh-CN-XiaoxiaoNeural' : 'Tingting');
const RATE = getOpt('rate', BACKEND === 'edge' ? '+15%' : '180');

function sh(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', ...opts });
  if (r.error) throw r.error;
  return r;
}

function shQuiet(cmd, args) {
  return spawnSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

/** which 命令检查可执行文件存在 */
function hasBin(bin) {
  const r = shQuiet('which', [bin]);
  return r.status === 0;
}

// ---------- TTS backends ----------

/** 用 macOS say 生成单段 aiff */
function saySegment(text, voice, rate, outPath) {
  sh('say', ['-v', voice, '-r', String(rate), '-o', outPath, text]);
}

/** 用 edge-tts 生成单段 mp3 */
function edgeSegment(text, voice, rate, outPath) {
  const bin = hasBin('edge-tts') ? 'edge-tts' : '/Users/chengrufeng/.local/bin/edge-tts';
  const r = sh(bin, ['--voice', voice, '--rate', String(rate), '--text', text, '--write-media', outPath]);
  if (r.status !== 0) throw new Error(`edge-tts 失败: ${r.stderr || r.stdout}`);
}

function genSegment(text, outPath) {
  if (BACKEND === 'edge') edgeSegment(text, VOICE, RATE, outPath);
  else saySegment(text, VOICE, RATE, outPath);
}

/** afinfo 解析音频时长（支持 aiff/mp3/m4a） */
function mediaDuration(path) {
  const r = sh('afinfo', [path]);
  const m = r.stdout.match(/estimated duration:\s*([\d.]+)\s*s/i);
  if (!m) throw new Error(`无法解析 ${path} 时长：${r.stdout}`);
  return parseFloat(m[1]);
}

/** 合并多段音频为单一 m4a
 *  - 各段先统一转 22050Hz 16bit mono wav（afconvert 兼容性好）
 *  - Python wave 拼接
 *  - afconvert 输出 m4a (AAC)
 */
function concatToM4a(paths, outPath) {
  const tmpWavs = paths.map((_, i) => `/tmp/narr_${i}.wav`);
  paths.forEach((p, i) => {
    sh('afconvert', ['-f', 'WAVE', '-d', 'LEI16@22050', '-c', '1', p, tmpWavs[i]]);
  });
  const pyScript = `
import wave
out = wave.open('/tmp/narr_merged.wav', 'wb')
params = None
for f in ${JSON.stringify(tmpWavs)}:
    w = wave.open(f, 'rb')
    if params is None:
        params = w.getparams()
        out.setparams(params)
    out.writeframes(w.readframes(w.getnframes()))
    w.close()
out.close()
`;
  sh('python3', ['-c', pyScript]);
  sh('afconvert', ['/tmp/narr_merged.wav', '-f', 'm4af', '-d', 'aac', outPath]);
  tmpWavs.forEach(p => { try { rmSync(p); } catch {} });
  try { rmSync('/tmp/narr_merged.wav'); } catch {}
}

// ---------- 主流程 ----------

async function main() {
  if (!scriptPathArg) {
    console.error('用法：node tools/build-narration.mjs <脚本路径> [--backend edge|say] [--voice ...] [--rate ...]');
    process.exit(2);
  }
  const scriptPath = resolve(ROOT, scriptPathArg);
  const script = JSON.parse(readFileSync(scriptPath, 'utf8'));
  const { segments, audio: audioRel } = script;
  if (!segments?.length) throw new Error('segments 为空');

  // backend 可用性检查
  let backend = BACKEND;
  if (backend === 'edge' && !hasBin('edge-tts') && !hasBin('/Users/chengrufeng/.local/bin/edge-tts')) {
    console.warn('⚠ edge-tts 未安装，回退到 say（机械音）。安装：pip3 install --user edge-tts');
    backend = 'say';
  }

  console.log(`▶ ${script.personId} · ${segments.length} 段 · backend=${backend} voice=${backend === 'edge' ? VOICE : VOICE} rate=${RATE}`);

  const ext = backend === 'edge' ? 'mp3' : 'aiff';
  const tmpDir = `/tmp/narr_${script.personId}_${Date.now()}`;
  mkdirSync(tmpDir, { recursive: true });

  const paths = [];
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const out = `${tmpDir}/seg_${String(i).padStart(3, '0')}.${ext}`;
    genSegment(seg.caption, out);
    paths.push(out);
    const dur = mediaDuration(out);
    console.log(`  [${i}] ${dur.toFixed(2)}s  ${seg.caption.slice(0, 42)}${seg.caption.length > 42 ? '…' : ''}`);
  }

  // 按实测时长重算时间戳（保留 0.3s 间隔避免朗读接缝卡顿）
  const GAP = 0.3;
  let t = 0;
  const newSegments = segments.map((seg, i) => {
    const dur = mediaDuration(paths[i]);
    const updated = { ...seg, t: parseFloat(t.toFixed(2)) };
    t += dur + GAP;
    return updated;
  });
  const totalDuration = parseFloat(t.toFixed(2));
  console.log(`\n总时长：${totalDuration}s`);

  // 合并 → m4a
  const audioAbs = resolve(ROOT, audioRel || `audio/narrations/${script.personId}.m4a`);
  mkdirSync(dirname(audioAbs), { recursive: true });
  console.log(`▶ 合并音频 → ${audioAbs}`);
  concatToM4a(paths, audioAbs);

  // 写回脚本
  const updated = {
    ...script,
    segments: newSegments,
    totalDurationSec: totalDuration,
    audio: audioRel || `audio/narrations/${script.personId}.m4a`,
    voice: backend === 'edge' ? VOICE : VOICE,
    ttsBackend: backend,
    rate: RATE,
    builtAt: new Date().toISOString(),
  };
  writeFileSync(scriptPath, JSON.stringify(updated, null, 2) + '\n', 'utf8');
  console.log(`✅ 写回脚本：${scriptPath}`);

  try { rmSync(tmpDir, { recursive: true, force: true }); } catch {}
}

main().catch(e => {
  console.error('✗ 失败：', e);
  process.exit(1);
});
