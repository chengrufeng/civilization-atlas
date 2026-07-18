/* =========================================================================
 * 跨数据集领域浏览：浮层显示所有数据集中选定领域的事件，
 * 按数据集分组、按年份排序。点事件切换至该数据集并打开。
 * ========================================================================= */

import { ATLAS_MANIFEST } from '../data/index.js';
import { formatYear, formatYearShort } from './state.js';
import { t, tf, localized } from './i18n.js';

const otherAtlasCache = new Map();
async function loadAtlasCached(id) {
  if (otherAtlasCache.has(id)) return otherAtlasCache.get(id);
  const meta = ATLAS_MANIFEST.find(m => m.id === id);
  if (!meta) return null;
  const atlas = await meta.load();
  otherAtlasCache.set(id, atlas);
  return atlas;
}

/** 打开浮层，展示所有 atlas 中匹配指定 domain 的事件 */
export async function openDomainBrowser(initialDomain) {
  ensureOverlay();
  const overlay = document.getElementById('domain-browser-overlay');
  const mask = document.getElementById('domain-browser-mask');
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  mask.classList.add('show');
  await renderDomainBrowser(initialDomain);
}

export function closeDomainBrowser() {
  document.getElementById('domain-browser-overlay')?.classList.remove('open');
  document.getElementById('domain-browser-mask')?.classList.remove('show');
}

async function listAllDomains() {
  const all = new Map(); // domain → Set<atlasId>
  for (const meta of ATLAS_MANIFEST) {
    const a = await loadAtlasCached(meta.id);
    for (const d of a.domains || []) {
      if (!all.has(d.name)) all.set(d.name, new Set());
      all.get(d.name).add(meta.id);
    }
  }
  // 按 atlas 数排序
  return [...all.entries()].sort((a, b) => b[1].size - a[1].size).map(([name, set]) => ({ name, count: set.size, color: pickColor(name) }));
}

function pickColor(name) {
  // 与 RELATION_TYPES/DOMAIN_COLOR 风格一致
  const map = {
    '军事': '#b23a2e', '政治': '#2f5d8a', '文化': '#7b4b94', '宗教': '#b8893a',
    '科技': '#2d8a6e', '外交': '#8a6d3b', '哲学': '#5a6d8a', '商贸': '#b8893a',
  };
  return map[name] || '#6d8a5a';
}

let currentDomain = null;

async function renderDomainBrowser(initialDomain) {
  const body = document.getElementById('domain-browser-body');
  if (!body) return;
  body.innerHTML = `<div class="db-loading">${t('contemp.loading')}</div>`;

  const domainsList = await listAllDomains();
  if (!currentDomain) currentDomain = initialDomain || domainsList[0]?.name;

  // 顶部领域 chips
  const chips = domainsList.map(d =>
    `<button class="db-chip ${d.name === currentDomain ? 'active' : ''}" data-domain="${d.name}" style="--dc:${d.color}">${d.name}<span class="db-chip-count">${d.count}</span></button>`
  ).join('');

  // 当前领域的事件列表
  const eventsByAtlas = [];
  for (const meta of ATLAS_MANIFEST) {
    const a = await loadAtlasCached(meta.id);
    const evs = a.events.filter(e => e.domain === currentDomain).map(e => ({ ...e, atlasId: meta.id, atlasName: localized(meta, 'name'), atlasStart: meta.startYear }));
    if (evs.length) eventsByAtlas.push({ atlasId: meta.id, atlasName: localized(meta, 'name'), events: evs });
  }
  eventsByAtlas.sort((a, b) => (ATLAS_MANIFEST.find(m => m.id === a.atlasId)?.startYear || 0) -
                              (ATLAS_MANIFEST.find(m => m.id === b.atlasId)?.startYear || 0));

  body.innerHTML = `
    <div class="db-toolbar">
      <div class="db-chips">${chips}</div>
      <div class="db-summary">${tf('domain_browser.summary', { events: eventsByAtlas.reduce((s, g) => s + g.events.length, 0), domain: currentDomain, atlases: eventsByAtlas.length })}</div>
    </div>
    <div class="db-list">
      ${eventsByAtlas.length === 0 ? `<div class="db-empty">${t('domain_browser.empty')}</div>` :
        eventsByAtlas.map(g => `
          <div class="db-group">
            <div class="db-group-title">${g.atlasName} <span class="db-group-count">${g.events.length}</span></div>
            ${g.events.sort((a, b) => a.year - b.year).map(e => `
              <button class="db-event" data-atlas="${g.atlasId}" data-event="${e.id}">
                <span class="db-event-year">${formatYearShort(e.year)}</span>
                <span class="db-event-name">${e.name}</span>
                <span class="db-event-desc">${e.desc}</span>
              </button>`).join('')}
          </div>`).join('')}
    </div>
  `;

  body.querySelectorAll('.db-chip').forEach(c => {
    c.addEventListener('click', () => {
      currentDomain = c.dataset.domain;
      renderDomainBrowser(currentDomain);
    });
  });
  body.querySelectorAll('.db-event').forEach(b => {
    b.addEventListener('click', () => {
      const aid = b.dataset.atlas;
      const eid = b.dataset.event;
      closeDomainBrowser();
      window.dispatchEvent(new CustomEvent('domainbrowser:select', { detail: { atlasId: aid, eventId: eid } }));
    });
  });
}

function ensureOverlay() {
  if (document.getElementById('domain-browser-overlay')) return;
  const html = `
    <div class="db-overlay-mask" id="domain-browser-mask"></div>
    <div class="db-overlay" id="domain-browser-overlay" aria-hidden="true">
      <div class="db-header">
        <h3>${t('domain_browser.title')}</h3>
        <button class="db-close" id="domain-browser-close" aria-label="${t('common.close')}">×</button>
      </div>
      <div class="db-body" id="domain-browser-body"></div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
  document.getElementById('domain-browser-mask').addEventListener('click', closeDomainBrowser);
  document.getElementById('domain-browser-close').addEventListener('click', closeDomainBrowser);
}
