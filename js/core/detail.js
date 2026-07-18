/* =========================================================================
 * 华夏人物图鉴 · 人物详情面板 + 事件信息
 * ========================================================================= */

import { state, ll, formatYear, formatYearShort } from './state.js';
import {
  current, FACTION_NAME,
  getPerson, getFaction, getRelationsOf, getPersonImage,
  getPersonPositionAtYear, getBirthplaceModern, getEventCoord,
} from './atlas.js';
import { isRelationActive } from './render.js';
import { render, updateStats } from './render.js';
import { buildEventList } from './event-list.js';
import { stopPlay, updateEventTrackCurrent } from './timeline.js';

/* =========================================================================
 * 人物详情
 * ========================================================================= */

export function openDetail(personId) {
  const person = getPerson(personId);
  if (!person) return;
  state.selectedPerson = personId;
  state.eventFocus = null;

  const coord = getPersonPositionAtYear(person, state.yearFilter);
  if (coord) state.map.flyTo(ll(coord), Math.max(state.map.getZoom(), 6), { duration: 0.8 });

  state.highlightedPersons.clear();
  for (const r of getRelationsOf(personId)) {
    if (!isRelationActive(r, state.yearFilter)) continue;
    const otherId = r.source === personId ? r.target : r.source;
    state.highlightedPersons.add(otherId);
  }

  renderDetailContent(person);
  render();
}

/** 仅渲染详情内容并打开面板（不改地图状态，播放时使用） */
export function showPersonDetail(personId) {
  const person = getPerson(personId);
  if (!person) return;
  renderDetailContent(person);
}

function renderDetailContent(person) {
  const faction = getFaction(person.faction);
  const relations = getRelationsOf(person.id);
  const events = person.events || [];

  const relationsHtml = relations.map(r => {
    const otherId = r.source === person.id ? r.target : r.source;
    const other = getPerson(otherId);
    if (!other) return '';
    const dir = r.source === person.id ? '→' : '←';
    return `<span class="relation-chip" data-person="${other.id}">${dir} ${other.name}<span class="rel-type">${r.type}</span></span>`;
  }).join('');

  const eventsHtml = events.map(e => `
    <div class="detail-fact">
      <span class="k">${formatYear(e.year)}</span>
      <span><b>${e.place}</b> · ${e.desc}</span>
    </div>
  `).join('');

  const img = getPersonImage(person.id);
  const avatarHtml = img
    ? `<img src="${img}" alt="${person.name}" onerror="this.outerHTML='${person.avatar}'" />`
    : person.avatar;

  document.getElementById('detail-content').innerHTML = `
    <div class="detail-hero">
      <div class="detail-avatar" style="background:${faction.color}">${avatarHtml}</div>
      <div class="detail-hero-info">
        <h3>${person.name}</h3>
        <div class="courtesy">字 ${person.courtesy}${person.alias.length ? ' · ' + person.alias.join('、') : ''}</div>
        <span class="detail-tag" style="background:${faction.color}">${faction.name}</span>
      </div>
    </div>
    <div class="detail-section">
      <h4>基本信息</h4>
      <div class="detail-fact"><span class="k">生卒</span><span>${formatYearShort(person.birth)}–${formatYearShort(person.death)}年（享年${person.death - person.birth}岁）</span></div>
      <div class="detail-fact"><span class="k">故里</span><span>${person.birthPlace}${getBirthplaceModern(person.birthPlace) ? `<span class="modern-loc">（${getBirthplaceModern(person.birthPlace)}）</span>` : ''}</span></div>
      <div class="detail-fact"><span class="k">官职</span><span>${person.title}</span></div>
      <div class="detail-fact"><span class="k">身份</span><span>${person.roles.join('、')}</span></div>
    </div>
    <div class="detail-section">
      <h4>生平简介</h4>
      <p>${person.bio}</p>
    </div>
    <div class="detail-section">
      <h4>生平大事（地图轨迹）</h4>
      ${eventsHtml || '<p style="color:var(--ink-light)">暂无</p>'}
    </div>
    <div class="detail-section">
      <h4>人物关系（${relations.length}）</h4>
      <div class="detail-relations">${relationsHtml || '<span style="color:var(--ink-light)">暂无</span>'}</div>
    </div>
  `;

  document.querySelectorAll('.relation-chip').forEach(chip => {
    chip.addEventListener('click', () => openDetail(chip.dataset.person));
  });

  document.getElementById('detail-panel').classList.add('open');
  document.getElementById('detail-panel').setAttribute('aria-hidden', 'false');
  document.getElementById('detail-mask').classList.add('show');
}

export function closeDetail(byUser) {
  if (byUser && state.playing) state.detailClosedByUser = true;
  state.selectedPerson = null;
  state.eventFocus = null;
  state.highlightedPersons.clear();
  document.getElementById('detail-panel').classList.remove('open');
  document.getElementById('detail-panel').setAttribute('aria-hidden', 'true');
  document.getElementById('detail-mask').classList.remove('show');
  render();
}

/* =========================================================================
 * 事件信息
 * ========================================================================= */

export function showEventInfo(eventId) {
  const atlas = current();
  const ev = atlas.events.find(e => e.id === eventId);
  if (!ev) return;
  stopPlay();
  if (state.selectedPerson) closeDetail();
  const coord = getEventCoord(ev);
  state.eventFocus = (coord && ev.participants && ev.participants.length > 0)
    ? { coord, participants: ev.participants }
    : null;
  if (coord) state.map.flyTo(ll(coord), 7, { duration: 1 });
  state.highlightedPersons.clear();
  if (ev.participants) ev.participants.forEach(pid => state.highlightedPersons.add(pid));
  state.yearFilter = ev.year;
  state.expandedEvent = eventId;
  document.getElementById('year-slider').value = ev.year;
  document.getElementById('year-display').textContent = formatYear(ev.year);
  updateStats();
  render();
  buildEventList();
  updateEventTrackCurrent();
}
