/* =========================================================================
 * 华夏人物图鉴 · 右侧大事记面板 + 人物名册浮层
 * ========================================================================= */

import { state, DOMAIN_COLOR, DOMAIN_ORDER, formatYearShort } from './state.js';
import { current, FACTION_NAME, getPerson } from './atlas.js';
import { render, updateStats } from './render.js';
import { buildTimelineEvents } from './timeline.js';
import { showEventInfo, openDetail } from './detail.js';
import { t, tf } from './i18n.js';
import * as CompareFigures from './compare-figures.js';

/* ---------- 事件一览表 ---------- */
export function buildEventList() {
  const body = document.getElementById('event-list-body');
  const atlas = current();
  const allEvents = [...atlas.events].sort((a, b) => a.year - b.year || a.id.localeCompare(b.id));
  const visibleCount = allEvents.filter(e => state.domainFilter.has(e.domain)).length;
  document.getElementById('event-list-count').textContent = `${visibleCount}${t('event_list.count_suffix')}`;

  let html = '';
  for (const domain of DOMAIN_ORDER) {
    const dc = DOMAIN_COLOR[domain] || '#888';
    const enabled = state.domainFilter.has(domain);
    const collapsed = state.collapsedDomains.has(domain);
    const events = allEvents.filter(e => e.domain === domain);

    html += `
      <div class="el-group-header" data-domain="${domain}">
        <span class="el-fold ${collapsed ? 'folded' : ''}">${collapsed ? '▶' : '▼'}</span>
        <span class="el-dot" style="background:${dc}"></span>
        <span class="el-group-name">${domain}</span>
        <span class="el-group-count">${events.length}</span>
        <input type="checkbox" class="el-group-toggle" data-domain="${domain}" ${enabled ? 'checked' : ''} />
      </div>
    `;

    if (enabled && !collapsed) {
      html += '<div class="el-group-body">';
      for (const e of events) {
        const isExpanded = state.expandedEvent === e.id;
        const participantNames = (e.participants || [])
          .map(pid => getPerson(pid)?.name).filter(Boolean);
        html += `
          <div class="event-list-item ${isExpanded ? 'expanded' : ''}" data-event="${e.id}" data-year="${e.year}">
            <div class="el-year">${formatYearShort(e.year)}</div>
            <div class="el-body">
              <div class="el-name">${e.name}<span class="el-tag" style="--dc:${dc}">${e.domain}</span></div>
              ${isExpanded ? `
                <div class="el-detail">
                  <div class="el-loc">📍 ${e.location}</div>
                  <div class="el-desc">${e.desc}</div>
                  ${participantNames.length ? `<div class="el-people">👤 ${participantNames.join('、')}</div>` : ''}
                </div>
              ` : ''}
            </div>
          </div>
        `;
      }
      html += '</div>';
    }
  }

  body.innerHTML = html;

  body.querySelectorAll('.event-list-item').forEach(item => {
    item.addEventListener('click', () => {
      const eid = item.dataset.event;
      if (state.expandedEvent === eid) {
        state.expandedEvent = null;
        buildEventList();
      } else {
        showEventInfo(eid);
      }
    });
  });

  body.querySelectorAll('.el-group-header').forEach(header => {
    header.addEventListener('click', (e) => {
      if (e.target.classList.contains('el-group-toggle')) return;
      const domain = header.dataset.domain;
      if (state.collapsedDomains.has(domain)) {
        state.collapsedDomains.delete(domain);
      } else {
        state.collapsedDomains.add(domain);
      }
      buildEventList();
    });
  });

  body.querySelectorAll('.el-group-toggle').forEach(cb => {
    cb.addEventListener('change', (e) => {
      e.stopPropagation();
      const d = cb.dataset.domain;
      if (cb.checked) state.domainFilter.add(d);
      else state.domainFilter.delete(d);
      const leftCb = document.querySelector(`.domain-toggle input[data-domain="${d}"]`);
      if (leftCb) leftCb.checked = cb.checked;
      buildTimelineEvents();
      buildEventList();
      updateStats();
      render();
    });
  });

  highlightCurrentEvent();
}

/** 高亮当前年份的事件并自动滚动 */
export function highlightCurrentEvent() {
  const items = document.querySelectorAll('.event-list-item');
  if (!items.length) return;
  const year = state.yearFilter;
  let firstActive = null;

  items.forEach(item => {
    const evYear = parseInt(item.dataset.year);
    const isActive = year !== null && evYear === year;
    const isPast = year !== null && evYear < year;
    item.classList.toggle('active', isActive);
    item.classList.toggle('past', isPast);
    if (isActive && !firstActive) firstActive = item;
  });

  if (firstActive) {
    firstActive.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

/* ---------- 人物名册浮层 ---------- */
export function buildListOverlay() {
  const body = document.getElementById('list-overlay-body');
  const atlas = current();
  const grid = atlas.persons.map(p => `
    <div class="person-card ${p.faction} ${CompareFigures.isSelected(p.id) ? 'cf-selected' : ''}" data-id="${p.id}">
      <button class="person-card-select" data-id="${p.id}" title="${t('compare_figures.toggle_select')}">${CompareFigures.isSelected(p.id) ? '✓' : '+'}</button>
      <div class="person-avatar">${p.avatar}</div>
      <div class="person-name">${p.name}</div>
      <div class="person-courtesy">${t('list.courtesy_prefix')} ${p.courtesy}</div>
      <div class="person-role">${FACTION_NAME[p.faction]} · ${p.title}</div>
      <div class="person-years">${formatYearShort(p.birth)}–${formatYearShort(p.death)}年</div>
    </div>
  `).join('');
  body.innerHTML = `
    <div class="person-grid">${grid}</div>
    <div class="list-overlay-actions">
      <span class="loa-count">${tf('compare_figures.selected_count', { n: CompareFigures.selectedCount(), max: 3 })}</span>
      <button class="loa-btn" id="loa-compare" ${CompareFigures.selectedCount() < 2 ? 'disabled' : ''}>${t('compare_figures.open_btn')}</button>
      <button class="loa-btn loa-clear" id="loa-clear">${t('compare_figures.clear_btn')}</button>
    </div>
  `;
  body.querySelectorAll('.person-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.classList.contains('person-card-select')) return;
      document.getElementById('list-overlay').classList.remove('open');
      openDetail(card.dataset.id);
    });
  });
  body.querySelectorAll('.person-card-select').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      CompareFigures.toggleSelect(btn.dataset.id);
      buildListOverlay();
    });
  });
  const cmpBtn = document.getElementById('loa-compare');
  if (cmpBtn) cmpBtn.addEventListener('click', () => {
    document.getElementById('list-overlay').classList.remove('open');
    CompareFigures.openCompareOverlay();
  });
  const clrBtn = document.getElementById('loa-clear');
  if (clrBtn) clrBtn.addEventListener('click', () => {
    CompareFigures.clearSelection();
    buildListOverlay();
  });
}
