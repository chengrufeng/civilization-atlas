/* =========================================================================
 * 人生回放模式（Life Journey）
 *
 * 选定人物后，按其生平事件顺序自动推进：
 *   1. 镜头 flyTo 该事件地点
 *   2. 显示 toast：年份 + 地点 + 事件描述
 *   3. state.yearFilter 推进到事件年份 → 关系图层自动按 isRelationActive 高亮
 *   4. 走完所有生平事件后停止
 *
 * UI：
 *   - 顶部胶囊浮层 `.lj-bar`：人物名 / 进度 / 暂停 / 继续 / 退出
 *   - 详情面板的"生平大事"区块加"▶ 人生回放"按钮（由 detail.js 注入）
 *
 * 与 timeline play 互斥：启动 life journey 时会 stopPlay()。
 * ========================================================================= */

import { state, ll, formatYear } from './state.js';
import { current, getPerson, manifest } from './atlas.js';
import { switchAtlas } from './atlas.js';
import { render } from './render.js';
import { stopPlay } from './timeline.js';
import { buildEventList } from './event-list.js';
import { updateStats } from './render.js';
import { syncUrlState } from './url-state.js';
import { t, tf, localized } from './i18n.js';
import { findCrossLinks } from '../data/cross-links.js';

const STEP_DURATION = 3000;   // 每站停留 3s
const FLY_DURATION = 1.2;     // 镜头飞行动画时长
const ATLAS_SWITCH_BUFFER = 600;  // 切换 atlas 后额外等待

let journey = null;           // { personId, steps, idx, timer, paused, crossAtlases, path:[latlngs], pathLayer, headMarker }
let switchingAtlas = false;   // life journey 自己触发的 atlas 切换中
export function isSwitchingAtlas() { return switchingAtlas; }

/* F21 轨迹线样式（纯 Leaflet，不引入新依赖） */
const PATH_STYLE = {
  color: '#d4691c',
  weight: 3,
  opacity: 0.85,
  dashArray: '6 8',
  lineCap: 'round',
  lineJoin: 'round',
};
const HEAD_STYLE = {
  radius: 7,
  color: '#fff',
  weight: 2,
  fillColor: '#d4691c',
  fillOpacity: 1,
};

function clearPathArtifacts() {
  if (journey?.pathLayer) { journey.pathLayer.remove(); journey.pathLayer = null; }
  if (journey?.headMarker) { journey.headMarker.remove(); journey.headMarker = null; }
  if (journey) journey.path = [];
}

/** 按 steps 截至当前 idx 重画路径 + 头部标记 */
function redrawPath() {
  if (!journey || !state.map) return;
  const latlngs = journey.steps
    .slice(0, journey.idx + 1)
    .map(s => ll(s.coord))
    .filter(Boolean);
  journey.path = latlngs;
  if (latlngs.length >= 2) {
    if (!journey.pathLayer) {
      journey.pathLayer = L.polyline(latlngs, PATH_STYLE).addTo(state.map);
    } else {
      journey.pathLayer.setLatLngs(latlngs);
    }
  } else if (journey.pathLayer) {
    journey.pathLayer.remove();
    journey.pathLayer = null;
  }
  const head = latlngs[latlngs.length - 1];
  if (head) {
    if (!journey.headMarker) {
      journey.headMarker = L.circleMarker(head, HEAD_STYLE).addTo(state.map);
    } else {
      journey.headMarker.setLatLng(head);
    }
  }
}

/* 缓存其他 atlas（已在 atlas.js 内有缓存，这里只是再缓存 promise） */
const otherAtlasCache = new Map();
async function loadOtherAtlas(id) {
  if (otherAtlasCache.has(id)) return otherAtlasCache.get(id);
  const promise = (async () => {
    const meta = manifest().find(m => m.id === id);
    if (!meta) return null;
    return await meta.load();
  })();
  otherAtlasCache.set(id, promise);
  return promise;
}

/** 找出该人物在所有 atlas 中的"同一个人"映射。
 *  返回 [{ atlasId, personId }]，第一项总是当前 (atlasId, personId)。 */
function findPersonaVariants(personId) {
  const startAtlasId = current().id;
  const variants = [{ atlasId: startAtlasId, personId }];
  for (const link of findCrossLinks(startAtlasId, personId)) {
    if (link.kind !== 'same-person') continue;
    for (const other of link.others) {
      if (variants.some(v => v.atlasId === other.atlas && v.personId === other.id)) continue;
      variants.push({ atlasId: other.atlas, personId: other.id });
    }
  }
  return variants;
}

/** 构建跨 atlas 的生平步骤：合并所有同人的 events，按年份排序，标注每步的 atlas */
async function buildStepsCrossAtlas(personId) {
  const variants = findPersonaVariants(personId);
  const allSteps = [];
  for (const v of variants) {
    const atlas = await loadOtherAtlas(v.atlasId);
    if (!atlas) continue;
    const person = atlas.persons.find(p => p.id === v.personId);
    if (!person || !person.events) continue;
    for (const e of person.events) {
      const place = atlas.places.find(p => p.name === e.place);
      if (!place || !place.coord) continue;
      allSteps.push({
        year: e.year,
        place: e.place,
        coord: place.coord,
        desc: e.desc,
        atlasId: v.atlasId,
        personId: v.personId,
        personName: person.name,
      });
    }
  }
  // 按年份排序；同年内同 atlas 排在一起
  allSteps.sort((a, b) => a.year - b.year || a.atlasId.localeCompare(b.atlasId));
  // 去重：完全相同的 (year, place, desc) 只保留一条
  const seen = new Set();
  return allSteps.filter(s => {
    const key = `${s.year}|${s.place}|${s.desc}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function ensureBar(crossAtlases = []) {
  let bar = document.getElementById('lj-bar');
  if (bar) return bar;
  bar = document.createElement('div');
  bar.id = 'lj-bar';
  bar.className = 'lj-bar';
  bar.innerHTML = `
    <button class="lj-btn lj-play-pause" title="${t('life_journey.pause')}">⏸</button>
    <div class="lj-info">
      <div class="lj-title"></div>
      <div class="lj-progress">
        <div class="lj-progress-track"><div class="lj-progress-fill"></div></div>
        <div class="lj-progress-text"></div>
      </div>
      ${crossAtlases.length > 1 ? `<div class="lj-cross-badge">${tf('life_journey.cross_badge', { n: crossAtlases.length })}</div>` : ''}
    </div>
    <button class="lj-btn lj-stop" title="${t('life_journey.exit')}">✕</button>
  `;
  document.body.appendChild(bar);
  bar.querySelector('.lj-play-pause').addEventListener('click', togglePause);
  bar.querySelector('.lj-stop').addEventListener('click', () => stopLifeJourney());
  return bar;
}

function removeBar() {
  const bar = document.getElementById('lj-bar');
  if (bar) bar.remove();
  // 同时清掉当前 step 的 toast（避免停止后还停留）
  const stepToast = document.getElementById('lj-step-toast');
  if (stepToast) stepToast.classList.remove('show');
  // F21 清除轨迹线与头部标记
  if (journey) clearPathArtifacts();
}

/** 构建当前数据集内人物的生平事件步骤（按年份排序，过滤无坐标的） */
function buildSteps(personId) {
  const person = getPerson(personId);
  if (!person || !person.events || person.events.length === 0) return [];
  const atlas = current();
  const validEvents = person.events
    .filter(e => {
      const place = atlas.places.find(p => p.name === e.place);
      return place && place.coord;
    })
    .slice()
    .sort((a, b) => a.year - b.year);
  return validEvents.map(e => {
    const place = atlas.places.find(p => p.name === e.place);
    return {
      year: e.year,
      place: e.place,
      coord: place.coord,
      desc: e.desc,
      atlasId: atlas.id,
      personId,
      personName: person.name,
    };
  });
}

function updateBar() {
  const bar = document.getElementById('lj-bar');
  if (!bar || !journey) return;
  const step = journey.steps[journey.idx];
  const total = journey.steps.length;
  const idx = journey.idx + 1; // 1-based
  const crossBadge = bar.querySelector('.lj-cross-badge');
  if (crossBadge && journey.crossAtlases?.length > 1) {
    const meta = manifest().find(m => m.id === step?.atlasId);
    crossBadge.textContent = `${tf('life_journey.cross_badge', { n: journey.crossAtlases.length })} · ${meta ? localized(meta, 'name') : ''}`;
  }
  bar.querySelector('.lj-title').textContent = `${step?.personName || ''} · ${formatYear(step?.year || 0)}`;
  bar.querySelector('.lj-progress-text').textContent = `${idx} / ${total}`;
  bar.querySelector('.lj-progress-fill').style.width = `${(idx / total) * 100}%`;
  bar.querySelector('.lj-play-pause').textContent = journey.paused ? '▶' : '⏸';
  bar.querySelector('.lj-play-pause').setAttribute('title', journey.paused ? t('life_journey.resume') : t('life_journey.pause'));
}

function clearTimer() {
  if (journey?.timer) {
    clearTimeout(journey.timer);
    journey.timer = null;
  }
}

async function advance() {
  if (!journey || journey.paused) return;
  const step = journey.steps[journey.idx];
  if (!step) { finish(); return; }

  // 0. 跨集切换：若步骤在另一个 atlas，先切过去
  if (step.atlasId !== current().id) {
    clearTimer();
    showJourneyToast(`${t('life_journey.switching')} · ${localized(manifest().find(m => m.id === step.atlasId) || {}, 'name')}`, 1500);
    switchingAtlas = true;
    try { await switchAtlas(step.atlasId); }
    catch (e) { /* 切换失败也继续 */ }
    finally { switchingAtlas = false; }
    await new Promise(r => setTimeout(r, ATLAS_SWITCH_BUFFER));
    if (journey?.paused || !journey) return;
  }

  // 1. 推进年份 + 同步 UI
  state.yearFilter = step.year;
  state.expandedEvent = null;
  state.selectedPerson = step.personId;

  // 2. 高亮同期关系（用 step 的 atlas/person 上下文）
  state.highlightedPersons.clear();
  const atlas = current();
  const person = atlas.persons.find(p => p.id === step.personId);
  if (person) {
    const rels = atlas.relations || [];
    for (const r of rels) {
      const involved = r.source === step.personId || r.target === step.personId;
      if (!involved) continue;
      const rYear = r.year ?? step.year;
      if (Math.abs(rYear - step.year) <= 10) {
        const otherId = r.source === step.personId ? r.target : r.source;
        state.highlightedPersons.add(otherId);
      }
    }
  }

  // 3. 镜头 flyTo + 当前 step 的专用 toast（只显示这一个事件，不再调用 showYearToasts 把同年的其他事件都弹出来）
  state.map.flyTo(ll(step.coord), Math.max(state.map.getZoom(), 6), { duration: FLY_DURATION });
  showJourneyStepToast(step);
  // F21 重画轨迹线 + 头部标记
  redrawPath();

  // 4. 同步 slider / year-display / URL / 事件列表
  const slider = document.getElementById('year-slider');
  if (slider) slider.value = step.year;
  const yd = document.getElementById('year-display');
  if (yd) yd.textContent = formatYear(step.year);
  syncUrlState({ atlas: current().id, year: step.year, person: step.personId });
  updateStats();
  render();
  buildEventList();
  updateBar();

  // 5. 下一站
  journey.idx += 1;
  if (journey.idx >= journey.steps.length) {
    journey.timer = setTimeout(finish, STEP_DURATION);
  } else {
    const next = journey.steps[journey.idx];
    const needSwitch = next && next.atlasId !== current().id;
    journey.timer = setTimeout(advance, STEP_DURATION + (needSwitch ? ATLAS_SWITCH_BUFFER : 0));
  }
}

function finish() {
  if (!journey) return;
  clearTimer();
  const lastName = journey.steps[journey.idx - 1]?.personName || '';
  journey = null;
  state.lifeJourney = null;
  removeBar();
  if (lastName) {
    showJourneyToast(`${lastName} · ${t('life_journey.finished')}`, 2500);
  }
}

/* ---------- 公共 API ---------- */

export async function startLifeJourney(personId) {
  const person = getPerson(personId);
  if (!person) return;

  // F19 跨集：优先用跨 atlas 步骤；没跨集时回退到单数据集
  let steps = await buildStepsCrossAtlas(personId);
  let crossAtlases = [];
  if (steps.length > 0) {
    crossAtlases = [...new Set(steps.map(s => s.atlasId))];
  } else {
    steps = buildSteps(personId);  // 单数据集内
  }
  if (steps.length === 0) {
    showJourneyToast(t('life_journey.no_events'), 2200);
    return;
  }
  stopPlay();
  stopLifeJourney();

  journey = {
    personId,
    steps,
    idx: 0,
    timer: null,
    paused: false,
    crossAtlases,
  };
  state.lifeJourney = { personId, total: steps.length, idx: 0, crossAtlases };
  state.selectedPerson = personId;
  state.eventFocus = null;
  ensureBar(crossAtlases);
  updateBar();
  advance();
}

export function stopLifeJourney() {
  if (!journey) return;
  clearTimer();
  journey = null;
  state.lifeJourney = null;
  removeBar();
}

export function togglePause() {
  if (!journey) return;
  journey.paused = !journey.paused;
  updateBar();
  if (!journey.paused) {
    // 恢复时直接跳到下一站（如果当前站已展示完）
    clearTimer();
    journey.timer = setTimeout(advance, 600);
  } else {
    clearTimer();
  }
}

export function isLifeJourneyActive() {
  return !!journey;
}

/* ---------- toast 兜底 ---------- */

/** Life Journey 当前 step 的专用 toast：只显示这一站，绝不显示同年其他事件 */
function showJourneyStepToast(step) {
  ensureToastHost();
  const host = document.getElementById('lj-step-toast');
  if (!host) return;
  host.innerHTML = `
    <div class="lj-step-year">${formatYear(step.year)}</div>
    <div class="lj-step-place">📍 ${step.place}</div>
    <div class="lj-step-desc">${step.desc || ''}</div>
  `;
  host.classList.add('show');
  clearTimeout(host._t);
}

/** 通用文字 toast（切换数据集 / 结束提示等） */
function showJourneyToast(text, duration = 2000) {
  ensureToastHost();
  const host = document.getElementById('lj-toast');
  if (!host) return;
  host.textContent = text;
  host.classList.add('show');
  clearTimeout(host._t);
  host._t = setTimeout(() => host.classList.remove('show'), duration);
}

/** 一次性创建两个 toast 宿主 */
function ensureToastHost() {
  if (!document.getElementById('lj-step-toast')) {
    const step = document.createElement('div');
    step.id = 'lj-step-toast';
    step.className = 'lj-step-toast';
    document.body.appendChild(step);
  }
  if (!document.getElementById('lj-toast')) {
    const text = document.createElement('div');
    text.id = 'lj-toast';
    text.className = 'lj-toast';
    document.body.appendChild(text);
  }
}
