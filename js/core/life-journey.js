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
import { current, getPerson, getRelationsOf } from './atlas.js';
import { render } from './render.js';
import { stopPlay, showYearToasts } from './timeline.js';
import { buildEventList } from './event-list.js';
import { updateStats } from './render.js';
import { syncUrlState } from './url-state.js';
import { t } from './i18n.js';

const STEP_DURATION = 3000;   // 每站停留 3s
const FLY_DURATION = 1.2;     // 镜头飞行动画时长

let journey = null;           // { personId, steps, idx, timer, paused }

function ensureBar() {
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
}

/** 构建人物的生平事件步骤（按年份排序，过滤无坐标的） */
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
    };
  });
}

function updateBar() {
  const bar = document.getElementById('lj-bar');
  if (!bar || !journey) return;
  const person = getPerson(journey.personId);
  const total = journey.steps.length;
  const idx = journey.idx + 1; // 1-based
  bar.querySelector('.lj-title').textContent = `${person?.name || ''} · ${formatYear(journey.steps[journey.idx]?.year || 0)}`;
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

function advance() {
  if (!journey || journey.paused) return;
  const step = journey.steps[journey.idx];
  if (!step) { finish(); return; }

  // 1. 推进年份 + 同步 UI（关系/事件图层会跟着刷新）
  state.yearFilter = step.year;
  state.expandedEvent = null;

  // 2. 高亮：清除旧的，按当前年份重算活跃关系
  state.highlightedPersons.clear();
  for (const r of getRelationsOf(journey.personId)) {
    const rYear = r.year ?? step.year;
    // 关系记录年份 ±10 年内的算"同期"
    if (Math.abs(rYear - step.year) <= 10) {
      const otherId = r.source === journey.personId ? r.target : r.source;
      state.highlightedPersons.add(otherId);
    }
  }

  // 3. 镜头 flyTo + 显示事件 toast
  state.map.flyTo(ll(step.coord), Math.max(state.map.getZoom(), 6), { duration: FLY_DURATION });
  showYearToasts(step.year, true);

  // 4. 同步 slider / year-display / URL / 事件列表
  const slider = document.getElementById('year-slider');
  if (slider) slider.value = step.year;
  const yd = document.getElementById('year-display');
  if (yd) yd.textContent = formatYear(step.year);
  syncUrlState({ atlas: current().id, year: step.year, person: journey.personId });
  updateStats();
  render();
  buildEventList();
  updateBar();

  // 5. 安排下一站
  journey.idx += 1;
  if (journey.idx >= journey.steps.length) {
    journey.timer = setTimeout(finish, STEP_DURATION);
  } else {
    journey.timer = setTimeout(advance, STEP_DURATION);
  }
}

function finish() {
  if (!journey) return;
  clearTimer();
  const person = getPerson(journey.personId);
  journey = null;
  state.lifeJourney = null;
  removeBar();
  // 不清理 selectedPerson / yearFilter，停留在最后一站
  if (person) {
    showJourneyToast(`${person.name} · ${t('life_journey.finished')}`, 2500);
  }
}

/* ---------- 公共 API ---------- */

export function startLifeJourney(personId) {
  const person = getPerson(personId);
  if (!person) return;
  const steps = buildSteps(personId);
  if (steps.length === 0) {
    showJourneyToast(t('life_journey.no_events'), 2200);
    return;
  }
  stopPlay();
  stopLifeJourney();  // 清理上一次

  journey = {
    personId,
    steps,
    idx: 0,
    timer: null,
    paused: false,
  };
  state.lifeJourney = { personId, total: steps.length, idx: 0 };
  state.selectedPerson = personId;
  state.eventFocus = null;
  ensureBar();
  updateBar();
  // 立即触发首站
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
function showJourneyToast(text, duration = 2000) {
  let host = document.getElementById('lj-toast');
  if (!host) {
    host = document.createElement('div');
    host.id = 'lj-toast';
    host.className = 'lj-toast';
    document.body.appendChild(host);
  }
  host.textContent = text;
  host.classList.add('show');
  clearTimeout(host._t);
  host._t = setTimeout(() => host.classList.remove('show'), duration);
}
