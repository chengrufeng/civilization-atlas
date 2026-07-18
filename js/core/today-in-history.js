/* =========================================================================
 * F18 历史上的今天
 *
 * 入口：首屏右下角浮卡片，显示当前月日（公历）在所有数据集中
 * 命中的事件，按年代排序，最多 N 条。点条目切到对应 atlas 并定位事件。
 *
 * 数据集 events 多数只精确到"年"，月日稀疏；因此我们退化为
 * "今天在历史上发生过哪些大事"的精神：取所有 events，过滤 desc 中
 * 含当前月日数字（如 "7月18日" / "July 18"）的条目。
 *
 * 命中率低但内容精，避免污染数据 schema。
 * ========================================================================= */

import { ATLAS_MANIFEST } from '../data/index.js';
import { localized } from './i18n.js';

const CACHE_KEY = 'atlas.tih.disabled';
const WIDGET_ID = 'tih-widget';
const MAX_ITEMS = 5;

const otherAtlasCache = new Map();
async function loadAtlas(id) {
  if (otherAtlasCache.has(id)) return otherAtlasCache.get(id);
  const meta = ATLAS_MANIFEST.find(m => m.id === id);
  if (!meta) return null;
  const atlas = await meta.load();
  otherAtlasCache.set(id, atlas);
  return atlas;
}

function todayPatterns() {
  const d = new Date();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  // 中文 + 英文多种写法
  return [
    `${m}月${day}日`,
    `${m}月 ${day}日`,
    ` ${m}/${day} `,
    ` ${m}-${day} `,
    /^en$/.test(navigator.language || '') ? null : null,
  ].filter(Boolean);
}

function matchToday(desc, patterns) {
  if (!desc) return false;
  return patterns.some(p => desc.includes(p));
}

export async function showTodayInHistory() {
  if (isDismissed()) return;
  const patterns = todayPatterns();
  const hits = [];
  for (const meta of ATLAS_MANIFEST) {
    const atlas = await loadAtlas(meta.id);
    if (!atlas?.events) continue;
    for (const e of atlas.events) {
      if (matchToday(e.desc, patterns) || matchToday(e.name, patterns)) {
        hits.push({ meta, event: e });
      }
    }
  }
  if (hits.length === 0) return;
  hits.sort((a, b) => a.event.year - b.event.year);
  renderWidget(hits.slice(0, MAX_ITEMS), hits.length);
}

function renderWidget(items, total) {
  if (document.getElementById(WIDGET_ID)) return;
  const today = new Date();
  const d = today.getDate();
  const m = today.getMonth() + 1;

  const w = document.createElement('div');
  w.id = WIDGET_ID;
  w.className = 'tih-widget';
  w.innerHTML = `
    <div class="tih-header">
      <span class="tih-title">📅 历史上的 ${m}月${d}日</span>
      <button class="tih-close" aria-label="关闭">×</button>
    </div>
    <div class="tih-body">
      ${items.map(it => `
        <button class="tih-item" data-atlas="${it.meta.id}" data-event="${it.event.id}">
          <span class="tih-year">${formatYearShort(it.event.year)}</span>
          <span class="tih-name">${it.event.name}</span>
          <span class="tih-atlas">${localized(it.meta, 'name')}</span>
        </button>
      `).join('')}
      ${total > items.length ? `<div class="tih-more">还有 ${total - items.length} 条…</div>` : ''}
    </div>
  `;
  document.body.appendChild(w);
  w.querySelector('.tih-close').addEventListener('click', () => dismiss());
  w.querySelectorAll('.tih-item').forEach(btn => {
    btn.addEventListener('click', async () => {
      const aid = btn.dataset.atlas;
      const eid = btn.dataset.event;
      window.dispatchEvent(new CustomEvent('tih:select', { detail: { atlasId: aid, eventId: eid } }));
      dismiss();
    });
  });
}

function formatYearShort(y) {
  if (y < 0) return `前${-y}`;
  return `${y}`;
}

function dismiss() {
  const w = document.getElementById(WIDGET_ID);
  if (w) w.remove();
}
function isDismissed() {
  try { return sessionStorage.getItem(CACHE_KEY) === '1'; } catch { return false; }
}
