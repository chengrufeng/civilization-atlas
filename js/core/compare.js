/* =========================================================================
 * 时代对照浮层：将所有数据集按真实年代比例画成水平条带，
 * 直观呈现不同文明/朝代的同时代关系。
 * ========================================================================= */

import { manifest } from './atlas.js';
import { formatYearShort } from './state.js';

function eraRange(meta) {
  // manifest 不含数值年份，需从对应 atlas 取。为避免全部加载，
  // 这里要求 manifest 携带 startYear/endYear，否则回退解析 subtitle。
  if (typeof meta.startYear === 'number' && typeof meta.endYear === 'number') {
    return [meta.startYear, meta.endYear];
  }
  return null;
}

export function buildCompareOverlay() {
  const body = document.getElementById('compare-overlay-body');
  if (!body) return;

  // 从已加载的 manifest 直接取（manifest 元素带 startYear/endYear 字段）
  // 若数据集未在 manifest 提供数值年份，从 subtitle 兜底解析
  const items = manifest().map(m => {
    let [s, e] = (typeof m.startYear === 'number' && typeof m.endYear === 'number')
      ? [m.startYear, m.endYear]
      : parseFromSubtitle(m.subtitle);
    return { ...m, startYear: s, endYear: e };
  }).filter(m => Number.isFinite(m.startYear) && Number.isFinite(m.endYear));

  if (items.length === 0) {
    body.innerHTML = '<p class="compare-empty">暂无可对照数据</p>';
    return;
  }

  const minYear = Math.min(...items.map(m => m.startYear));
  const maxYear = Math.max(...items.map(m => m.endYear));
  const span = Math.max(1, maxYear - minYear);
  const pct = y => ((y - minYear) / span) * 100;

  // 按 group 分组，每组按 startYear 排序
  const groups = [];
  for (const m of items) {
    let g = groups.find(x => x.name === m.group);
    if (!g) { g = { name: m.group, items: [] }; groups.push(g); }
    g.items.push(m);
  }
  groups.forEach(g => g.items.sort((a, b) => a.startYear - b.startYear));

  // 整数刻度：自动选合适步长
  const step = chooseStep(span);

  body.innerHTML = `
    <div class="compare-axis">
      <div class="compare-axis-line"></div>
      ${Array.from({ length: Math.floor(span / step) + 1 }, (_, i) => {
        const y = minYear + i * step;
        if (y > maxYear) return '';
        return `<div class="compare-tick" style="left:${pct(y)}%">
          <div class="compare-tick-line"></div>
          <div class="compare-tick-label">${formatYearShort(y)}</div>
        </div>`;
      }).join('')}
    </div>
    ${groups.map(g => `
      <div class="compare-group">
        <div class="compare-group-title">${g.name}</div>
        <div class="compare-rows">
          ${g.items.map(m => `
            <div class="compare-row" data-atlas="${m.id}">
              <div class="compare-row-label">${m.name}</div>
              <div class="compare-row-track">
                <div class="compare-bar" style="left:${pct(m.startYear)}%; width:${pct(m.endYear) - pct(m.startYear)}%"
                  title="${m.name}：${formatYearShort(m.startYear)}–${formatYearShort(m.endYear)}">
                  <span class="compare-bar-text">${formatYearShort(m.startYear)}–${formatYearShort(m.endYear)}</span>
                </div>
              </div>
            </div>`).join('')}
        </div>
      </div>`).join('')}
    </div>
    <div class="compare-hint">点击任意条带切换至该数据集</div>
  `;

  body.querySelectorAll('.compare-row').forEach(row => {
    row.addEventListener('click', () => {
      const id = row.dataset.atlas;
      closeCompareOverlay();
      // 用 hash 触发外部 switch（不直接 import 避免循环依赖）
      window.dispatchEvent(new CustomEvent('compare:select', { detail: id }));
    });
  });
}

function parseFromSubtitle(subtitle = '') {
  // 从 "...（前2100–前771年）" 提取年份
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
}

export function closeCompareOverlay() {
  document.getElementById('compare-overlay').classList.remove('open');
  document.getElementById('compare-overlay').setAttribute('aria-hidden', 'true');
  document.getElementById('compare-overlay-mask').classList.remove('show');
}
