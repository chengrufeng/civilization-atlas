/* =========================================================================
 * 时代对照浮层：将所有数据集按真实年代比例画成水平条带，
 * 直观呈现不同文明/朝代的同时代关系。
 * ========================================================================= */

import { manifest, getGlobalPersonIndex } from './atlas.js';
import { formatYear, formatYearShort } from './state.js';
import { t, localized } from './i18n.js';

/* 缓存最近一次构建对照面板时的年份映射，供 axis 点击复用 */
let compareAxis = null;

function eraRange(meta) {
  if (typeof meta.startYear === 'number' && typeof meta.endYear === 'number') {
    return [meta.startYear, meta.endYear];
  }
  return null;
}

export function buildCompareOverlay() {
  const body = document.getElementById('compare-overlay-body');
  if (!body) return;

  const items = manifest().map(m => {
    let [s, e] = (typeof m.startYear === 'number' && typeof m.endYear === 'number')
      ? [m.startYear, m.endYear]
      : parseFromSubtitle(m.subtitle);
    return { ...m, startYear: s, endYear: e };
  }).filter(m => Number.isFinite(m.startYear) && Number.isFinite(m.endYear));

  if (items.length === 0) {
    body.innerHTML = `<p class="compare-empty">${t('compare_overlay.empty')}</p>`;
    return;
  }

  const minYear = Math.min(...items.map(m => m.startYear));
  const maxYear = Math.max(...items.map(m => m.endYear));
  const span = Math.max(1, maxYear - minYear);
  const pct = y => ((y - minYear) / span) * 100;
  compareAxis = { minYear, maxYear, span };

  const groups = [];
  for (const m of items) {
    let g = groups.find(x => x.name === m.group);
    if (!g) { g = { name: m.group, items: [] }; groups.push(g); }
    g.items.push(m);
  }
  groups.forEach(g => g.items.sort((a, b) => a.startYear - b.startYear));

  const step = chooseStep(span);
  const ticks = [];
  for (let y = minYear; y <= maxYear; y += step) ticks.push(y);
  if (ticks[ticks.length - 1] !== maxYear) ticks.push(maxYear);

  body.innerHTML = `
    <div class="compare-axis-container" id="compare-axis-container">
      <div class="compare-axis" style="margin-left:0">
        <div class="compare-axis-line"></div>
        ${ticks.map(y => `<div class="compare-tick" style="left:${pct(y)}%">
          <div class="compare-tick-line"></div>
          <div class="compare-tick-label">${formatYearShort(y)}</div>
        </div>`).join('')}
        <div class="compare-axis-cursor" id="compare-axis-cursor"></div>
      </div>
      <div class="compare-axis-hint">${t('compare_overlay.hint')}</div>
    </div>
    ${groups.map(g => `
      <div class="compare-group">
        <div class="compare-group-title">${localized({ group: g.name, groupEn: g.items[0]?.groupEn || g.name }, 'group')}</div>
        <div class="compare-rows">
          ${g.items.map(m => `
            <div class="compare-row" data-atlas="${m.id}">
              <div class="compare-row-label">${localized(m, 'name')}</div>
              <div class="compare-row-track">
                <div class="compare-bar" style="left:${pct(m.startYear)}%; width:${pct(m.endYear) - pct(m.startYear)}%"
                  title="${localized(m, 'name')}：${formatYearShort(m.startYear)}–${formatYearShort(m.endYear)}">
                  <span class="compare-bar-text">${formatYearShort(m.startYear)}–${formatYearShort(m.endYear)}</span>
                </div>
              </div>
            </div>`).join('')}
        </div>
      </div>`).join('')}
    </div>
  `;

  // 行点击 → 切数据集
  body.querySelectorAll('.compare-row').forEach(row => {
    row.addEventListener('click', () => {
      const id = row.dataset.atlas;
      closeCompareOverlay();
      window.dispatchEvent(new CustomEvent('compare:select', { detail: id }));
    });
  });

  // 轴点击/悬停 → 显示该年同时代
  const axisEl = document.getElementById('compare-axis-container');
  const cursor = document.getElementById('compare-axis-cursor');
  const handleMove = (clientX) => {
    const tracks = document.querySelectorAll('.compare-row-track');
    if (!tracks.length) return;
    const rect = tracks[0].getBoundingClientRect();
    const x = clientX - rect.left;
    if (x < 0 || x > rect.width) return;
    cursor.style.left = `${(x / rect.width) * 100 + 0}%`;
    cursor.style.opacity = '1';
  };
  axisEl.addEventListener('mousemove', (e) => handleMove(e.clientX));
  axisEl.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
  axisEl.addEventListener('click', (e) => {
    const tracks = document.querySelectorAll('.compare-row-track');
    if (!tracks.length) return;
    const rect = tracks[0].getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < 0 || x > rect.width) return;
    const ratio = x / rect.width;
    const year = Math.round(compareAxis.minYear + ratio * compareAxis.span);
    showContemporaries(year);
  });
}

/* 在同时代浮层显示该年所有 atlas 中的人物 */
async function showContemporaries(year) {
  const overlay = document.getElementById('contemp-overlay');
  const mask = document.getElementById('contemp-overlay-mask');
  const body = document.getElementById('contemp-body');
  const yearLabel = document.getElementById('contemp-year');
  if (!overlay || !body) return;
  yearLabel.textContent = formatYear(year);
  body.innerHTML = `<div class="contemp-loading">${t('contemp.loading')}</div>`;
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  mask.classList.add('show');

  let idx;
  try { idx = await getGlobalPersonIndex(); }
  catch { body.innerHTML = `<div class="contemp-empty">${t('contemp.index_failed')}</div>`; return; }

  const alive = idx.filter(p => p.birth <= year && p.death >= year);
  if (alive.length === 0) {
    body.innerHTML = `<div class="contemp-empty">${t('contemp.empty')}</div>`;
    return;
  }

  // 按 atlas 分组
  const manifestMap = new Map(manifest().map(m => [m.id, m]));
  const groupsMap = new Map();
  for (const p of alive) {
    if (!groupsMap.has(p.atlasId)) groupsMap.set(p.atlasId, []);
    groupsMap.get(p.atlasId).push(p);
  }

  // 按 group→atlas 排序
  const sortedGroups = [...groupsMap.entries()].sort((a, b) => {
    const ga = manifestMap.get(a[0])?.group || '';
    const gb = manifestMap.get(b[0])?.group || '';
    if (ga !== gb) return ga.localeCompare(gb);
    return (manifestMap.get(a[0])?.startYear || 0) - (manifestMap.get(b[0])?.startYear || 0);
  });

  body.innerHTML = sortedGroups.map(([atlasId, list]) => {
    const meta = manifestMap.get(atlasId);
    const groupTag = meta?.group || '';
    return `<div class="contemp-group">
      <div class="contemp-group-title">${localized({ group: groupTag, groupEn: meta?.groupEn || groupTag }, 'group')} · ${localized(meta || {}, 'name') || atlasId}</div>
      <div class="contemp-cards">
        ${list.map(p => `
          <button class="contemp-card" data-atlas="${p.atlasId}" data-id="${p.personId}">
            <span class="contemp-avatar">${(p.name || '?').slice(0, 1)}</span>
            <span class="contemp-name">${p.name}</span>
            <span class="contemp-meta">${p.factionName || ''}</span>
          </button>`).join('')}
      </div>
    </div>`;
  }).join('');

  body.querySelectorAll('.contemp-card').forEach(card => {
    card.addEventListener('click', () => {
      const aid = card.dataset.atlas;
      const pid = card.dataset.id;
      closeContemporaries();
      closeCompareOverlay();
      window.dispatchEvent(new CustomEvent('compare:selectPerson', { detail: { atlasId: aid, personId: pid } }));
    });
  });
}

export function closeContemporaries() {
  document.getElementById('contemp-overlay')?.classList.remove('open');
  document.getElementById('contemp-overlay-mask')?.classList.remove('show');
}

function parseFromSubtitle(subtitle = '') {
  const matches = [...subtitle.matchAll(/前?\d+/g)];
  if (matches.length < 2) return [NaN, NaN];
  const parse = s => {
    const neg = s.startsWith('前');
    const n = parseInt(s.replace(/[^0-9]/g, ''), 10);
    return neg ? -n : n;
  };
  return [parse(matches[0][0]), parse(matches[1][0])];
}

function chooseStep(span) {
  if (span > 3000) return 500;
  if (span > 1500) return 250;
  if (span > 600) return 100;
  if (span > 250) return 50;
  if (span > 100) return 20;
  return 10;
}

export function openCompareOverlay() {
  buildCompareOverlay();
  document.getElementById('compare-overlay').classList.add('open');
  document.getElementById('compare-overlay').setAttribute('aria-hidden', 'false');
  document.getElementById('compare-overlay-mask').classList.add('show');
  // 绑定同时代浮层关闭按钮
  const closeBtn = document.getElementById('contemp-close');
  const mask2 = document.getElementById('contemp-overlay-mask');
  if (closeBtn && !closeBtn.__bound) { closeBtn.__bound = true; closeBtn.addEventListener('click', closeContemporaries); }
  if (mask2 && !mask2.__bound) { mask2.__bound = true; mask2.addEventListener('click', closeContemporaries); }
}

export function closeCompareOverlay() {
  document.getElementById('compare-overlay').classList.remove('open');
  document.getElementById('compare-overlay').setAttribute('aria-hidden', 'true');
  document.getElementById('compare-overlay-mask').classList.remove('show');
}
