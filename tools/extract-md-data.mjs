import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import ffmpeg from 'ffmpeg-static';

const dir = 'video/narrations';
const mp4s = readdirSync(dir).filter(f => f.endsWith('.mp4'));

function probeDuration(id) {
  const r = spawnSync(ffmpeg, ['-i', `${dir}/${id}.mp4`], { encoding: 'utf8' });
  const m = r.stderr.match(/Duration: (\d+):(\d+):([\d.]+)/);
  if (!m) return null;
  return (+m[1]) * 3600 + (+m[2]) * 60 + (+m[3]);
}

function fmtClock(sec) {
  const mm = String(Math.floor(sec / 60)).padStart(2, '0');
  const ss = String(Math.floor(sec % 60)).padStart(2, '0');
  return `${mm}:${ss}`;
}

const out = [];
for (const mp4 of mp4s) {
  const id = mp4.replace(/\.mp4$/, '');
  const mdPath = `${dir}/${id}.md`;
  if (existsSync(mdPath)) continue; // skip already done
  const jsonPath = `data/narrations/${id}.json`;
  if (!existsSync(jsonPath)) { console.error('NO JSON:', id); continue; }
  const j = JSON.parse(readFileSync(jsonPath, 'utf8'));
  const dur = probeDuration(id);
  out.push({
    id,
    title: j.title,
    subtitle: j.subtitle,
    totalDurationSec: j.totalDurationSec,
    mp4Duration: dur,
    segments: j.segments.map(s => ({
      t: s.t,
      year: s.year,
      place: s.place,
      caption: s.caption,
      imageCaption: s.imageCaption,
    })),
  });
}
console.log(JSON.stringify(out, null, 2));
