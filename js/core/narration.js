/* =========================================================================
 * 解说播放（Narration Playback）
 *
 * 数据驱动版 Life Journey：以预生成的音频为时间轴，按 segment.t 触发：
 *   - state.yearFilter = segment.year → 关系图层自动按年份高亮
 *   - state.map.flyTo(place.coord) → 镜头跟随
 *   - 累计绘制轨迹 polyline（橙色虚线）+ 头部 circleMarker
 *   - 底部居中字幕（segment.caption）随音频同步显示
 *
 * 与 timeline play / life journey 互斥：启动前会 stop 两者。
 *
 * 数据来源：data/narrations/<personId>.json（含 audio + segments）
 * ========================================================================= */

import { state, ll, formatYear } from './state.js';
import { current, getPerson, manifest } from './atlas.js';
import { stopPlay } from './timeline.js';
import { stopLifeJourney } from './life-journey.js';
import { render, updateStats } from './render.js';
import { buildEventList } from './event-list.js';
import { syncUrlState } from './url-state.js';
import { t } from './i18n.js';

const NARRATION_BASE = '../data/narrations/';

let session = null;   // { script, audio, steps, idx, pathLayer, headMarker, cleanup }

/* 复用 life-journey 的轨迹线样式（独立常量，避免循环引用） */
const PATH_STYLE = {
  color: '#d4691c', weight: 3, opacity: 0.85,
  dashArray: '6 8', lineCap: 'round', lineJoin: 'round',
};
const HEAD_STYLE = {
  radius: 7, color: '#fff', weight: 2,
  fillColor: '#d4691c', fillOpacity: 1,
};

/* 解析脚本的 step 字段 → 实际坐标。
 *  step 对应当前 atlas 的 person.events 顺序（含去重过滤后的可定位事件）。
 *  返回 [{ year, place, coord }] */
function resolveSteps(personId) {
  const atlas = current();
  const person = getPerson(personId);
  if (!person?.events) return [];
  return person.events
    .filter(e => {
      const place = atlas.places.find(p => p.name === e.place);
      return place && place.coord;
    })
    .slice()
    .sort((a, b) => a.year - b.year)
    .map(e => {
      const place = atlas.places.find(p => p.name === e.place);
      return { year: e.year, place: e.place, coord: place.coord, desc: e.desc };
    });
}

/* ---------- UI ---------- */

function ensureBar() {
  let bar = document.getElementById('narration-bar');
  if (bar) return bar;
  bar = document.createElement('div');
  bar.id = 'narration-bar';
  bar.className = 'narration-bar';
  bar.innerHTML = `
    <button class="nr-play-pause" title="${t('common.pause') || '暂停'}">⏸</button>
    <div class="nr-info">
      <div class="nr-title"></div>
      <div class="nr-progress">
        <div class="nr-progress-track"><div class="nr-progress-fill"></div></div>
        <div class="nr-progress-text"></div>
      </div>
    </div>
    <button class="nr-stop" title="${t('common.close') || '退出'}">✕</button>
  `;
  document.body.appendChild(bar);
  bar.querySelector('.nr-play-pause').addEventListener('click', togglePause);
  bar.querySelector('.nr-stop').addEventListener('click', () => stopNarration());
  return bar;
}

function ensureCaption() {
  let cap = document.getElementById('narration-caption');
  if (cap) return cap;
  cap = document.createElement('div');
  cap.id = 'narration-caption';
  cap.className = 'narration-caption';
  document.body.appendChild(cap);
  return cap;
}

function removeUI() {
  document.getElementById('narration-bar')?.remove();
  document.getElementById('narration-caption')?.remove();
}

function updateBar() {
  const bar = document.getElementById('narration-bar');
  if (!bar || !session) return;
  const cur = session.audio.currentTime;
  const dur = session.audio.duration || session.script.totalDurationSec || 0;
  const pct = dur > 0 ? (cur / dur) * 100 : 0;
  bar.querySelector('.nr-progress-fill').style.width = `${pct}%`;
  bar.querySelector('.nr-progress-text').textContent = `${formatTs(cur)} / ${formatTs(dur)}`;
  const seg = currentSegment();
  bar.querySelector('.nr-title').textContent = seg
    ? `${formatYear(seg.year || 0)}${seg.place ? ' · ' + seg.place : ''}`
    : (session.script.title || '');
  bar.querySelector('.nr-play-pause').textContent = session.audio.paused ? '▶' : '⏸';
}

function formatTs(s) {
  if (!Number.isFinite(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
}

function renderCaption(seg) {
  const cap = document.getElementById('narration-caption');
  if (!cap) return;
  if (!seg) { cap.classList.remove('show'); cap.textContent = ''; return; }
  cap.textContent = seg.caption || '';
  cap.classList.add('show');
}

/* ---------- 时间 → segment ---------- */

function currentSegment() {
  if (!session) return null;
  const t0 = session.audio.currentTime;
  const segs = session.script.segments;
  for (let i = segs.length - 1; i >= 0; i--) {
    if (t0 >= segs[i].t) return { ...segs[i], _idx: i };
  }
  return segs[0] ? { ...segs[0], _idx: 0 } : null;
}

/* ---------- step 推进（地图 + 轨迹 + 关系高亮） ---------- */

function applySegment(seg) {
  if (!seg) return;
  // 字幕
  renderCaption(seg);

  // step 对应 person.events 顺序：推进年份 + 镜头 + 关系
  if (typeof seg.step === 'number' && session.steps[seg.step]) {
    const step = session.steps[seg.step];
    state.yearFilter = step.year;
    state.selectedPerson = session.script.personId;
    state.expandedEvent = null;

    // 关系同期高亮（±10 年）
    state.highlightedPersons.clear();
    const atlas = current();
    const person = getPerson(session.script.personId);
    if (person) {
      for (const r of (atlas.relations || [])) {
        if (r.source !== session.script.personId && r.target !== session.script.personId) continue;
        const rYear = r.year ?? step.year;
        if (Math.abs(rYear - step.year) <= 10) {
          state.highlightedPersons.add(r.source === session.script.personId ? r.target : r.source);
        }
      }
    }

    // 镜头 flyTo
    state.map.flyTo(ll(step.coord), Math.max(state.map.getZoom(), 6), { duration: 1.2 });

    // 累计轨迹线 + 头标
    redrawTrail(seg.step);

    // 同步 slider / year-display
    const slider = document.getElementById('year-slider');
    if (slider) slider.value = step.year;
    const yd = document.getElementById('year-display');
    if (yd) yd.textContent = formatYear(step.year);

    updateStats();
    render();
    buildEventList();
  } else {
    // hook / 引入 / 结尾段：清状态
    state.highlightedPersons.clear();
    render();
  }
}

function redrawTrail(stepIdx) {
  if (!state.map) return;
  const latlngs = session.steps
    .slice(0, stepIdx + 1)
    .map(s => ll(s.coord));
  if (latlngs.length >= 2) {
    if (!session.pathLayer) {
      session.pathLayer = L.polyline(latlngs, PATH_STYLE).addTo(state.map);
    } else {
      session.pathLayer.setLatLngs(latlngs);
    }
  }
  const head = latlngs[latlngs.length - 1];
  if (head) {
    if (!session.headMarker) {
      session.headMarker = L.circleMarker(head, HEAD_STYLE).addTo(state.map);
    } else {
      session.headMarker.setLatLng(head);
    }
  }
}

function clearMapArtifacts() {
  if (session?.pathLayer) { session.pathLayer.remove(); session.pathLayer = null; }
  if (session?.headMarker) { session.headMarker.remove(); session.headMarker = null; }
}

/* ---------- 音频事件 ---------- */

let lastSegIdx = -1;

function onTimeUpdate() {
  if (!session) return;
  const seg = currentSegment();
  if (!seg) return;
  updateBar();
  if (seg._idx !== lastSegIdx) {
    lastSegIdx = seg._idx;
    applySegment(seg);
  }
}

function onEnded() {
  stopNarration();
}

/* ---------- 公共 API ---------- */

export async function startNarration(personId, opts = {}) {
  // 1. 加载脚本
  const url = `${NARRATION_BASE}${personId}.json`;
  let script;
  try {
    script = await (await fetch(url)).json();
  } catch (e) {
    console.error('解说脚本加载失败：', e);
    return;
  }

  // 2. 校验当前 atlas（脚本期望的 atlasId 与当前不一致则切换）
  if (script.atlasId && current().id !== script.atlasId) {
    const { switchAtlas } = await import('./atlas.js');
    await switchAtlas(script.atlasId);
  }

  // 3. 解析 steps（person.events 排序后）
  const steps = resolveSteps(personId);
  if (!steps.length) {
    console.warn('当前人物无可定位事件');
    return;
  }

  // 4. 互斥：停掉 life journey / timeline play
  stopPlay();
  stopLifeJourney();

  // 5. 准备音频
  const audio = new Audio(script.audio);
  audio.crossOrigin = 'anonymous';
  audio.preload = 'auto';

  session = {
    script, audio, steps, idx: 0,
    pathLayer: null, headMarker: null,
  };
  lastSegIdx = -1;
  state.lifeJourney = { personId, total: steps.length, idx: 0, narration: true };

  ensureBar();
  ensureCaption();
  audio.addEventListener('timeupdate', onTimeUpdate);
  audio.addEventListener('ended', onEnded);
  audio.addEventListener('play', updateBar);
  audio.addEventListener('pause', updateBar);

  try {
    await audio.play();
  } catch (e) {
    console.warn('自动播放被浏览器拦截，请点击 ▶：', e);
  }

  // 立即应用第一段（hook）
  applySegment(script.segments[0]);
  lastSegIdx = 0;
}

export function stopNarration() {
  if (!session) return;
  session.audio.pause();
  session.audio.removeEventListener('timeupdate', onTimeUpdate);
  session.audio.removeEventListener('ended', onEnded);
  clearMapArtifacts();
  session = null;
  state.lifeJourney = null;
  lastSegIdx = -1;
  removeUI();
}

export function togglePause() {
  if (!session) return;
  if (session.audio.paused) session.audio.play();
  else session.audio.pause();
}

export function isNarrationActive() { return !!session; }

/** 详情面板用：检查某人是否有解说脚本（返回相对 URL 或 null） */
export async function hasNarration(personId) {
  try {
    const r = await fetch(`${NARRATION_BASE}${personId}.json`, { method: 'HEAD' });
    return r.ok ? `${NARRATION_BASE}${personId}.json` : null;
  } catch {
    return null;
  }
}
