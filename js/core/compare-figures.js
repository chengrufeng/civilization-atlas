/* =========================================================================
 * F15 人物并排对比
 *
 * 从「人物名册」浮层多选 2-3 个人物 → 「对比选中」按钮 → 对比浮层
 *   - 每列展示：头像 / 姓名 / 字号 / 势力 / 享年 / 角色 / 生平事件数 / bio 摘要
 *   - 高亮：年龄最大/最小、事件数最多
 *   - 点列头/列尾可移除该人；关闭浮层不清空选择
 * ========================================================================= */

import { current, FACTION_NAME, getPerson, getRelationsOf } from './atlas.js';
import { formatYear, formatYearShort } from './state.js';
import { t, tf } from './i18n.js';

const MAX_COMPARE = 3;
let selectedIds = [];   // 当前数据集内已选 personId

export function toggleSelect(personId) {
  const idx = selectedIds.indexOf(personId);
  if (idx >= 0) selectedIds.splice(idx, 1);
  else if (selectedIds.length < MAX_COMPARE) selectedIds.push(personId);
  return selectedIds;
}

export function isSelected(personId) { return selectedIds.includes(personId); }
export function selectedCount() { return selectedIds.length; }
export function clearSelection() { selectedIds = []; }
export function getSelected() { return [...selectedIds]; }

export function openCompareOverlay() {
  ensureOverlay();
  const overlay = document.getElementById('compare-figures-overlay');
  const mask = document.getElementById('compare-figures-mask');
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  mask.classList.add('show');
  renderCompare();
}

export function closeCompareOverlay() {
  document.getElementById('compare-figures-overlay')?.classList.remove('open');
  document.getElementById('compare-figures-mask')?.classList.remove('show');
}

function ensureOverlay() {
  if (document.getElementById('compare-figures-overlay')) return;
  const html = `
    <div class="cf-mask" id="compare-figures-mask"></div>
    <div class="cf-overlay" id="compare-figures-overlay" aria-hidden="true">
      <div class="cf-header">
        <h3>${t('compare_figures.title')}</h3>
        <button class="cf-close" id="compare-figures-close" aria-label="${t('common.close')}">×</button>
      </div>
      <div class="cf-body" id="compare-figures-body"></div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
  document.getElementById('compare-figures-mask').addEventListener('click', closeCompareOverlay);
  document.getElementById('compare-figures-close').addEventListener('click', closeCompareOverlay);
}

function renderCompare() {
  const body = document.getElementById('compare-figures-body');
  if (!body) return;

  if (selectedIds.length < 2) {
    body.innerHTML = `<div class="cf-empty">${tf('compare_figures.need_more', { n: 2 - selectedIds.length })}</div>`;
    return;
  }

  const persons = selectedIds.map(id => getPerson(id)).filter(Boolean);
  if (persons.length < 2) {
    body.innerHTML = `<div class="cf-empty">${t('compare_figures.empty')}</div>`;
    return;
  }

  // 统计用于高亮
  const ages = persons.map(p => p.death - p.birth);
  const eventCounts = persons.map(p => (p.events || []).length);
  const maxAge = Math.max(...ages);
  const minAge = Math.min(...ages);
  const maxEvents = Math.max(...eventCounts);

  const columns = persons.map((p, i) => {
    const faction = (current().factions.find(f => f.id === p.faction) || {});
    const relations = getRelationsOf(p.id);
    const age = ages[i];
    const evCount = eventCounts[i];
    const ageClass = age === maxAge ? 'max' : (age === minAge ? 'min' : '');
    const evClass = evCount === maxEvents ? 'max' : '';
    return `
      <div class="cf-col" data-id="${p.id}">
        <button class="cf-remove" data-id="${p.id}" title="${t('compare_figures.remove')}">✕</button>
        <div class="cf-avatar" style="background:${faction.color || '#888'}">${p.avatar}</div>
        <div class="cf-name">${p.name}</div>
        <div class="cf-courtesy">${p.courtesy ? t('detail.courtesy_label') + ' ' + p.courtesy : ''}</div>
        <div class="cf-tag" style="background:${faction.color || '#888'}">${faction.name || '—'}</div>
        <div class="cf-row ${ageClass}">
          <span class="cf-k">${t('compare_figures.lifespan')}</span>
          <span class="cf-v">${formatYearShort(p.birth)}–${formatYearShort(p.death)}</span>
        </div>
        <div class="cf-row ${ageClass}">
          <span class="cf-k">${t('compare_figures.age')}</span>
          <span class="cf-v">${age} ${t('compare_figures.years_unit')}</span>
        </div>
        <div class="cf-row">
          <span class="cf-k">${t('compare_figures.identity')}</span>
          <span class="cf-v">${p.roles.join(' / ') || '—'}</span>
        </div>
        <div class="cf-row">
          <span class="cf-k">${t('compare_figures.title_field')}</span>
          <span class="cf-v">${p.title || '—'}</span>
        </div>
        <div class="cf-row ${evClass}">
          <span class="cf-k">${t('compare_figures.events')}</span>
          <span class="cf-v">${evCount}</span>
        </div>
        <div class="cf-row">
          <span class="cf-k">${t('compare_figures.relations')}</span>
          <span class="cf-v">${relations.length}</span>
        </div>
        <div class="cf-bio">${p.bio || ''}</div>
      </div>`;
  }).join('');

  body.innerHTML = `
    <div class="cf-grid" style="--cols:${persons.length}">${columns}</div>
    <div class="cf-legend">
      <span class="cf-leg-max">${t('compare_figures.legend_max')}</span>
      <span class="cf-leg-min">${t('compare_figures.legend_min')}</span>
    </div>
  `;

  body.querySelectorAll('.cf-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = selectedIds.indexOf(btn.dataset.id);
      if (idx >= 0) selectedIds.splice(idx, 1);
      renderCompare();
    });
  });
}
