/* =========================================================================
 * 华夏人物图鉴 · 时间轴
 *
 * 职责：播放、滑块事件点、刻度、年份 toast、自动追踪
 * ========================================================================= */

import { state, DOMAIN_COLOR, ll, formatYear, formatYearShort } from './state.js';
import {
  current, ERA_START, ERA_END,
  getEventCoord, getPerson,
} from './atlas.js';
import { render, updateStats } from './render.js';
import { buildEventList, highlightCurrentEvent } from './event-list.js';
import { showPersonDetail, closeDetail } from './detail.js';
import { t } from './i18n.js';

/* ---------- 播放 ---------- */
export async function startPlay() {
  state.playing = true;
  state.detailClosedByUser = false;
  document.getElementById('play-btn').textContent = '⏸';

  const atlas = current();
  const sortedEvents = atlas.events
    .filter(e => state.domainFilter.has(e.domain))
    .sort((a, b) => a.year - b.year || a.id.localeCompare(b.id));
  if (sortedEvents.length === 0) { stopPlay(); return; }

  let idx = 0;
  if (state.yearFilter !== null) {
    idx = sortedEvents.findIndex(e => e.year > state.yearFilter);
    if (idx === -1) idx = 0;
  }

  const jumpToEvent = (i) => {
    const ev = sortedEvents[i];
    if (!ev) return;
    const coord = getEventCoord(ev);

    state.expandedEvent = ev.id;
    state.yearFilter = ev.year;
    document.getElementById('year-slider').value = ev.year;
    document.getElementById('year-display').textContent = formatYear(ev.year);

    state.eventFocus = (coord && ev.participants && ev.participants.length > 0)
      ? { coord, participants: ev.participants } : null;
    state.highlightedPersons.clear();
    if (ev.participants) ev.participants.forEach(pid => state.highlightedPersons.add(pid));

    if (coord) state.map.flyTo(ll(coord), Math.max(state.map.getZoom(), 6), { duration: 0.6 });

    updateStats();
    render();
    buildEventList();
    updateEventTrackCurrent();

    if (state.detailClosedByUser) {
      // 尊重用户选择，保持关闭
    } else if (ev.participants && ev.participants.length > 0) {
      showPersonDetail(ev.participants[0]);
    } else {
      closeDetail();
    }
  };

  jumpToEvent(idx);
  // 播放间隔：默认按事件密度自适应（事件多→快、事件少→慢，固定在 1.5–4s）
  // 若用户在设置里手动指定速度，则用固定值
  let playInterval = Math.max(1500, Math.min(4000, Math.round(60000 / Math.max(8, sortedEvents.length))));
  try {
    const { playSpeedMultiplier } = await import('./settings.js');
    const mult = playSpeedMultiplier();
    if (mult !== null) playInterval = Math.round(2200 * mult);
  } catch {}
  state.playTimer = setInterval(() => {
    idx = (idx + 1) % sortedEvents.length;
    jumpToEvent(idx);
  }, playInterval);
}

export function stopPlay() {
  state.playing = false;
  document.getElementById('play-btn').textContent = '▶';
  if (state.playTimer) { clearInterval(state.playTimer); state.playTimer = null; }
}

/* ---------- 年份事件 toast + 自动追踪 ---------- */
export function showYearToasts(year, skipAutoTrack) {
  const atlas = current();
  const events = atlas.events.filter(e =>
    e.year === year && state.domainFilter.has(e.domain)
  );
  if (!events.length) {
    if (!skipAutoTrack && state.highlightedPersons.size > 0) {
      state.eventFocus = null;
      state.highlightedPersons.clear();
      render();
    }
    return;
  }

  const container = document.getElementById('toast-container');
  for (const ev of events) {
    const color = DOMAIN_COLOR[ev.domain] || '#b23a2e';
    const participantNames = (ev.participants || [])
      .map(pid => getPerson(pid)?.name)
      .filter(Boolean);
    const participantsHtml = participantNames.length
      ? `<div class="toast-people">👤 ${participantNames.join('、')}</div>`
      : '';
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.setProperty('--toast-color', color);
    toast.dataset.eventId = ev.id;
    toast.innerHTML = `
      <div class="toast-year">${formatYearShort(ev.year)}</div>
      <div class="toast-body">
        <div class="toast-title">
          <span class="toast-name">${ev.name}</span>
          <span class="toast-domain">${ev.domain}</span>
          <span class="toast-loc">📍 ${ev.location}</span>
        </div>
        <div class="toast-desc">${ev.desc}</div>
        ${participantsHtml}
        <div class="toast-hint">${t('timeline.click_to_view')}</div>
      </div>
    `;
    toast.addEventListener('click', () => {
      toast.remove();
      import('./detail.js').then(m => m.showEventInfo(ev.id));
    });
    let removeTimer;
    const scheduleRemove = () => { removeTimer = setTimeout(() => toast.remove(), 5200); };
    const cancelRemove = () => clearTimeout(removeTimer);
    toast.addEventListener('mouseenter', cancelRemove);
    toast.addEventListener('mouseleave', scheduleRemove);
    container.appendChild(toast);
    scheduleRemove();
  }

  if (state.autoTrack && !skipAutoTrack) autoTrackEvents(events);
}

function autoTrackEvents(events) {
  state.eventFocus = null;
  const trackedEvent = events.find(e => getEventCoord(e));
  if (trackedEvent) {
    const coord = getEventCoord(trackedEvent);
    state.map.flyTo(ll(coord), 7, { duration: 1.2 });
  }
  state.highlightedPersons.clear();
  for (const ev of events) {
    if (ev.participants) ev.participants.forEach(pid => state.highlightedPersons.add(pid));
  }
  render();
}

/* ---------- 时间轴事件标记 ---------- */
export function buildTimelineEvents() {
  const track = document.getElementById('event-track');
  const atlas = current();
  const span = ERA_END - ERA_START;
  const dots = atlas.events
    .filter(e => state.domainFilter.has(e.domain))
    .map(e => {
      const pct = ((e.year - ERA_START) / span) * 100;
      const color = DOMAIN_COLOR[e.domain] || '#b23a2e';
      return `<div class="event-dot" style="left:${pct}%;background:${color}"
        data-year="${e.year}" data-event="${e.id}"
        title="${formatYear(e.year)} · ${e.name}（${e.domain}）"></div>`;
    }).join('');
  track.innerHTML = dots;
  track.querySelectorAll('.event-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      const year = parseInt(dot.dataset.year);
      state.yearFilter = year;
      document.getElementById('year-slider').value = year;
      document.getElementById('year-display').textContent = formatYear(year);
      stopPlay();
      updateStats();
      render();
      showYearToasts(year);
      updateEventTrackCurrent();
    });
  });
  updateEventTrackCurrent();
}

export function updateEventTrackCurrent() {
  document.querySelectorAll('.event-dot').forEach(dot => {
    const dotYear = parseInt(dot.dataset.year);
    dot.classList.toggle('current',
      state.yearFilter !== null && dotYear === state.yearFilter
    );
    dot.classList.toggle('future',
      state.yearFilter !== null && dotYear > state.yearFilter
    );
  });
  // 同步事件一览表高亮和滚动
  highlightCurrentEvent();
}

export function buildTimelineTicks() {
  const ticks = document.getElementById('timeline-ticks');
  const atlas = current();
  const years = atlas.timelineTicks || [ERA_START, ERA_END];
  const span = ERA_END - ERA_START;
  ticks.innerHTML = years.map(y => {
    const pct = ((y - ERA_START) / span) * 100;
    return `<span class="tick" style="left:${pct}%">${formatYearShort(y)}</span>`;
  }).join('');
}
