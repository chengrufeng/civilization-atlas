/* =========================================================================
 * 华夏人物图鉴 · 人物详情面板 + 事件信息
 * ========================================================================= */

import { state, ll, formatYear, formatYearShort, relationStyle, relationLabel } from './state.js';
import {
  current, FACTION_NAME,
  getPerson, getFaction, getRelationsOf, getPersonImage,
  getPersonPositionAtYear, getBirthplaceModern, getEventCoord,
} from './atlas.js';
import { isRelationActive } from './render.js';
import { render, updateStats } from './render.js';
import { buildEventList } from './event-list.js';
import { stopPlay, updateEventTrackCurrent } from './timeline.js';
import { syncUrlState } from './url-state.js';
import { findCrossLinks } from '../data/cross-links.js';
import { ATLAS_MANIFEST } from '../data/index.js';
import { t, tf, localized } from './i18n.js';

/* 缓存其它数据集的 atlas 对象，避免每次详情打开都重新加载 */
const otherAtlasCache = new Map();
async function getOtherAtlas(id) {
  if (otherAtlasCache.has(id)) return otherAtlasCache.get(id);
  const meta = ATLAS_MANIFEST.find(m => m.id === id);
  if (!meta) return null;
  const atlas = await meta.load();
  otherAtlasCache.set(id, atlas);
  return atlas;
}

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
  syncUrlState({ atlas: current().id, year: state.yearFilter, person: personId });
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
    const style = relationStyle(r.type);
    return `<span class="relation-chip" data-person="${other.id}" style="--rc:${style.color}">${dir} ${other.name}<span class="rel-type">${relationLabel(r.type)}</span></span>`;
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
        <div class="courtesy">${t('detail.courtesy_label')} ${person.courtesy}${person.alias.length ? ' · ' + person.alias.join(t('detail.alias_sep')) : ''}</div>
        <span class="detail-tag" style="background:${faction.color}">${faction.name}</span>
      </div>
    </div>
    <div class="detail-section">
      <h4>${t('detail.basic')}</h4>
      <div class="detail-fact"><span class="k">${t('detail.birth_death')}</span><span>${tf('detail.year_range', { a: formatYearShort(person.birth), b: formatYearShort(person.death) })}（${tf('detail.age', { n: person.death - person.birth })}）</span></div>
      <div class="detail-fact"><span class="k">${t('detail.hometown')}</span><span>${person.birthPlace}${getBirthplaceModern(person.birthPlace) ? `<span class="modern-loc">（${getBirthplaceModern(person.birthPlace)}）</span>` : ''}</span></div>
      <div class="detail-fact"><span class="k">${t('detail.title')}</span><span>${person.title}</span></div>
      <div class="detail-fact"><span class="k">${t('detail.identity')}</span><span>${person.roles.join(t('detail.alias_sep'))}</span></div>
    </div>
    <div class="detail-section">
      <h4>${t('detail.bio')}</h4>
      <p>${person.bio}</p>
    </div>
    <div class="detail-section">
      <h4>${t('detail.events_count')}</h4>
      ${eventsHtml || `<p style="color:var(--ink-light)">${t('detail.no_data')}</p>`}
    </div>
    <div class="detail-section">
      <h4>${tf('detail.relations_count', { n: relations.length })}</h4>
      <div class="detail-relations">${relationsHtml || `<span style="color:var(--ink-light)">${t('detail.no_data')}</span>`}</div>
    </div>
    <div class="detail-section" id="cross-links-section" style="display:none">
      <h4>${t('detail.cross_links')}</h4>
      <div class="detail-cross-links" id="cross-links-body"><span style="color:var(--ink-light)">${t('contemp.loading')}</span></div>
    </div>
  `;

  document.querySelectorAll('.relation-chip').forEach(chip => {
    chip.addEventListener('click', () => openDetail(chip.dataset.person));
  });

  // 异步填充跨数据集关联
  fillCrossLinks(person);

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
  syncUrlState({ atlas: current().id, year: state.yearFilter, person: null });
  render();
}

/* 填充跨数据集关联区块 */
async function fillCrossLinks(person) {
  const section = document.getElementById('cross-links-section');
  const body = document.getElementById('cross-links-body');
  if (!section || !body) return;
  const atlas = current();
  const links = findCrossLinks(atlas.id, person.id);
  if (links.length === 0) { section.style.display = 'none'; return; }
  section.style.display = '';

  const manifestMap = new Map(ATLAS_MANIFEST.map(m => [m.id, m]));
  const cards = [];
  for (const link of links) {
    const others = [];
    for (const o of link.others) {
      const otherAtlas = await getOtherAtlas(o.atlas);
      const otherPerson = otherAtlas?.persons.find(p => p.id === o.id);
      const meta = manifestMap.get(o.atlas);
      others.push({ ...o, name: otherPerson?.name || o.id, atlasName: localized(meta || {}, 'name') || o.atlas });
    }
    const tag = link.kind === 'same-person' ? t('detail.cross_same_person') : t('detail.cross_interaction');
    cards.push(`
      <div class="cross-link">
        <div class="cross-link-label"><span class="cross-link-tag cross-link-tag-${link.kind}">${tag}</span>${link.label}</div>
        <div class="cross-link-others">
          ${others.map(o => `
            <button class="cross-link-card" data-atlas="${o.atlas}" data-id="${o.id}">
              <span class="cross-link-name">${o.name}</span>
              <span class="cross-link-atlas">${o.atlasName}</span>
            </button>`).join('')}
        </div>
      </div>`);
  }
  body.innerHTML = cards.join('') || `<span style="color:var(--ink-light)">${t('detail.no_data')}</span>`;

  body.querySelectorAll('.cross-link-card').forEach(btn => {
    btn.addEventListener('click', async () => {
      const aid = btn.dataset.atlas;
      const pid = btn.dataset.id;
      if (aid !== current().id) {
        const { switchAtlas } = await import('./atlas.js');
        await switchAtlas(aid);
      }
      openDetail(pid);
    });
  });
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
