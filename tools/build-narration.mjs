#!/usr/bin/env node
/* =========================================================================
 * 解说脚本 → 音频生成工具（macOS say + afconvert，零外部依赖）
 *
 * 用法：
 *   node tools/build-narration.mjs data/narrations/liubei.json
 *
 * 流程：
 *   1. 读取脚本 JSON
 *   2. 为每个 segment 生成临时 aiff（say -v Tingting -r 180）
 *   3. 用 afinfo 测量每段实际时长
 *   4. 累加 → 校准 segment.t（覆盖原时间戳）
 *   5. 合并为单一 m4a 文件（afconvert）
 *   6. 写回脚本 JSON（含 totalDurationSec 与 audio 路径）
 *
 * 输出：audio/narrations/<id>.m4a
 * ========================================================================= */

import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import os from 'node:os';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function sh(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', ...opts });
  if (r.error) throw r.error;
  return r;
}

/** 用 say 生成单段 aiff */
function saySegment(text, voice, rate, outPath) {
  sh('say', ['-v', voice, '-r', String(rate), '-o', outPath, text]);
}

/** 用 afinfo 解析 aiff 时长（秒） */
function aiffDuration(path) {
  const r = sh('afinfo', [path]);
  const m = r.stdout.match(/estimated duration:\s*([\d.]+)\s*s/i);
  if (!m) throw new Error(`无法解析 ${path} 时长：${r.stdout}`);
  return parseFloat(m[1]);
}

/** 合并多个 aiff 为单一 m4a（用 afconvert 把 aiff 转 m4a，
 *  多 aiff 拼接用 say 的字串拼合策略：直接把所有文本一次性 say，
 *  这里我们改走"用 cat 拼接再转码"的简化路线——aiff 是 RIFF/wave 容器，
 *  cat 拼接需要重新写 header。改用临时 wav 拼接 + Python wave 模块。 */
function concatAiffToM4a(aiffPaths, outPath) {
  // 使用 Python 的 wave 模块拼接 aiff → wav（wave 不直接支持 aiff，
  // 所以先用 afconvert 把每个 aiff 转 wav，再用 wave 拼接，最后 afconvert 转 m4a）
  const tmpWavs = aiffPaths.map((p, i) => `/tmp/narr_${i}.wav`);
  aiffPaths.forEach((p, i) => {
    sh('afconvert', ['-f', 'WAVE', '-d', 'LEI16@22050', p, tmpWavs[i]]);
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

async function main() {
  const scriptPath = resolve(ROOT, process.argv[2] || 'data/narrations/liubei.json');
  const script = JSON.parse(readFileSync(scriptPath, 'utf8'));
  const { segments, voice = 'Tingting', rate = 180, audio: audioRel } = script;
  if (!segments?.length) throw new Error('segments 为空');

  console.log(`▶ ${script.personId} · ${segments.length} 段 · voice=${voice} rate=${rate}`);

  // 临时 aiff 目录
  const tmpDir = `/tmp/narr_${script.personId}_${Date.now()}`;
  mkdirSync(tmpDir, { recursive: true });

  const aiffPaths = [];
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const aiff = `${tmpDir}/seg_${String(i).padStart(3, '0')}.aiff`;
    saySegment(seg.caption, voice, rate, aiff);
    aiffPaths.push(aiff);
    const dur = aiffDuration(aiff);
    console.log(`  [${i}] ${dur.toFixed(2)}s  ${seg.caption.slice(0, 40)}${seg.caption.length > 40 ? '…' : ''}`);
  }

  // 按实际测量时长重算时间戳（保留 0.3s 间隔，避免朗读卡顿接缝）
  const GAP = 0.3;
  let t = 0;
  const newSegments = segments.map((seg, i) => {
    const dur = aiffDuration(aiffPaths[i]);
    const updated = { ...seg, t: parseFloat(t.toFixed(2)) };
    t += dur + GAP;
    return updated;
  });
  const totalDuration = parseFloat(t.toFixed(2));
  console.log(`\n总时长：${totalDuration}s`);

  // 合并为 m4a
  const audioAbs = resolve(ROOT, audioRel || `audio/narrations/${script.personId}.m4a`);
  mkdirSync(dirname(audioAbs), { recursive: true });
  console.log(`▶ 合并音频 → ${audioAbs}`);
  concatAiffToM4a(aiffPaths, audioAbs);

  // 写回脚本 JSON
  const updated = {
    ...script,
    segments: newSegments,
    totalDurationSec: totalDuration,
    audio: audioRel || `audio/narrations/${script.personId}.m4a`,
    builtAt: new Date().toISOString(),
  };
  writeFileSync(scriptPath, JSON.stringify(updated, null, 2) + '\n', 'utf8');
  console.log(`✅ 写回脚本：${scriptPath}`);

  // 清理临时
  try { rmSync(tmpDir, { recursive: true, force: true }); } catch {}
}

main().catch(e => {
  console.error('✗ 失败：', e);
  process.exit(1);
});
