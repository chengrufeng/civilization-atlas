/* =========================================================================
 * 华夏人物图鉴 · 应用入口
 *
 * 职责：
 *   1. 初始化地图、控件、时间轴、事件列表
 *   2. 初始化数据集切换器
 *   3. 注册数据集切换回调，联动刷新所有 UI
 *
 * 所有具体逻辑分散在 core/ 下的各模块中。
 * ========================================================================= */

import { state } from './core/state.js';
import {
  current, manifest, switchAtlas, onSwitch, initAtlas,
  ERA_START, ERA_END,
} from './core/atlas.js';
import { initMap, clearAllLayers, flyToDefault, updateLabelVisibility } from './core/map.js';
import { render, updateStats } from './core/render.js';
import { bindControls, buildFactionFilters, buildDomainFilters } from './core/controls.js';
import {
  buildTimelineTicks, buildTimelineEvents, stopPlay, updateEventTrackCurrent,
} from './core/timeline.js';
import { buildEventList } from './core/event-list.js';
import { openCompareOverlay, closeCompareOverlay } from './core/compare.js';
import { readUrlState, syncUrlState, withUrlSuppressed } from './core/url-state.js';
import { formatYear } from './core/state.js';

/* ---------- 初始化 ---------- */
async function init() {
  // 支持 ?atlas=<id>&year=<y>&person=<id> 分享直达
  const urlState = readUrlState();
  await initAtlas(urlState.atlas);          // 先懒加载数据集
  initAtlasSwitcher();
  applyAtlasToUI();
  initMap();
  bindControls();

  // 小屏默认收起右侧大事记
  if (window.innerWidth <= 768) {
    document.getElementById('event-list-panel').classList.add('hidden');
    document.getElementById('btn-events').classList.remove('active');
  }
  buildTimelineTicks();
  buildTimelineEvents();
  buildEventList();
  updateStats();
  bindTopBarExtras();
  render();

  document.getElementById('loading-overlay').classList.add('hide');

  // 应用 URL 中的年份和人物（若有）
  if (urlState.year !== null) {
    withUrlSuppressed(() => {
      const slider = document.getElementById('year-slider');
      state.yearFilter = urlState.year;
      if (slider) slider.value = urlState.year;
      const yd = document.getElementById('year-display');
      if (yd) {
        yd.textContent = formatYear(urlState.year);
      }
      updateStats();
      render();
      updateEventTrackCurrent?.();
    });
  }
  if (urlState.person) {
    import('./core/detail.js').then(m => {
      withUrlSuppressed(() => m.openDetail(urlState.person));
    });
  }
  // 初始 URL 规范化（如缺失 atlas 等）
  syncUrlState({ atlas: current().id, year: state.yearFilter, person: state.selectedPerson });
}

/* ---------- 数据集切换器（下拉浮层，按 group 分组） ---------- */
function initAtlasSwitcher() {
  const body = document.getElementById('atlas-overlay-body');
  const btn = document.getElementById('atlas-selector-btn');
  const closeBtn = document.getElementById('atlas-close');
  const mask = document.getElementById('atlas-overlay-mask');
  const overlay = document.getElementById('atlas-overlay');
  if (!body || !btn) return;

  const activeId = current().id;

  // 按 group 分组（保持清单顺序）
  const groups = [];
  for (const m of manifest()) {
    let g = groups.find(x => x.name === m.group);
    if (!g) { g = { name: m.group, items: [] }; groups.push(g); }
    g.items.push(m);
  }

  body.innerHTML = groups.map(g => {
    const cards = g.items.map(a => {
      const s = a.stats || {};
      const badges = s.persons ? `
        <div class="atlas-card-stats">
          <span title="人物">👤 ${s.persons}</span>
          <span title="事件">◆ ${s.events}</span>
          <span title="势力">⚑ ${s.factions}</span>
        </div>` : '';
      return `
      <button class="atlas-card ${a.id === activeId ? 'active' : ''}" data-atlas="${a.id}">
        <div class="atlas-card-name">${a.name}</div>
        <div class="atlas-card-sub">${a.subtitle}</div>
        ${badges}
      </button>`;
    }).join('');
    return `<div class="atlas-group">
      <div class="atlas-group-title">${g.name}</div>
      <div class="atlas-group-grid">${cards}</div>
    </div>`;
  }).join('');

  body.querySelectorAll('.atlas-card').forEach(card => {
    card.addEventListener('click', () => {
      closeAtlasOverlay();
      doSwitchAtlas(card.dataset.atlas);
    });
  });

  const openOverlay = () => {
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    mask.classList.add('show');
  };
  const closeAtlasOverlay = () => {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    mask.classList.remove('show');
  };
  btn.addEventListener('click', openOverlay);
  if (closeBtn) closeBtn.addEventListener('click', closeAtlasOverlay);
  if (mask) mask.addEventListener('click', closeAtlasOverlay);

  updateAtlasButtonLabel();
}

/** 更新顶栏按钮显示的当前数据集名 */
function updateAtlasButtonLabel() {
  const el = document.getElementById('atlas-current-name');
  if (el) el.textContent = current().name;
}

/* ---------- 顶栏附加按钮（时代对照等） ---------- */
function bindTopBarExtras() {
  const btnCompare = document.getElementById('btn-timeline-compare');
  const btnClose = document.getElementById('compare-close');
  const mask = document.getElementById('compare-overlay-mask');
  if (btnCompare) btnCompare.addEventListener('click', openCompareOverlay);
  if (btnClose) btnClose.addEventListener('click', closeCompareOverlay);
  if (mask) mask.addEventListener('click', closeCompareOverlay);
  // compare 面板里点条带 → 切换数据集
  window.addEventListener('compare:select', (e) => {
    if (e.detail && e.detail !== current().id) doSwitchAtlas(e.detail);
  });
  // 同时代面板里点人物 → 切 + 打开详情
  window.addEventListener('compare:selectPerson', async (e) => {
    const { atlasId, personId } = e.detail || {};
    if (!atlasId || !personId) return;
    if (atlasId !== current().id) await doSwitchAtlas(atlasId);
    import('./core/detail.js').then(m => m.openDetail(personId));
  });
}

/** 带加载态的数据集切换：懒加载期间显示遮罩，失败时提示 */
async function doSwitchAtlas(atlasId) {
  if (atlasId === current().id) return;
  const overlay = document.getElementById('loading-overlay');
  overlay.classList.remove('hide');
  try {
    await switchAtlas(atlasId);
    overlay.classList.add('hide');
  } catch (err) {
    console.error('切换数据集失败：', err);
    overlay.innerHTML = `<div class="loading-error">
      <h3>数据集加载失败</h3>
      <p>${err.message}</p>
      <p>请检查网络或数据文件后重试。</p>
    </div>`;
  }
}

/** 将当前数据集的元信息同步到 DOM */
function applyAtlasToUI() {
  const atlas = current();
  const h1 = document.querySelector('.brand-text h1');
  const sub = document.querySelector('.brand-text .brand-sub');
  if (h1) h1.textContent = atlas.name;
  if (sub) sub.textContent = atlas.subtitle;
  const slider = document.getElementById('year-slider');
  if (slider) {
    slider.min = ERA_START;
    slider.max = ERA_END;
    slider.value = ERA_START;
  }
  const yd = document.getElementById('year-display');
  if (yd) yd.textContent = '全部年份';
}

/* ---------- 数据集切换回调 ---------- */
onSwitch(() => {
  stopPlay();

  // 关闭详情面板
  document.getElementById('detail-panel').classList.remove('open');
  document.getElementById('detail-panel').setAttribute('aria-hidden', 'true');
  document.getElementById('detail-mask').classList.remove('show');

  // 刷新 UI
  applyAtlasToUI();
  buildFactionFilters();
  buildDomainFilters();
  buildTimelineTicks();
  buildTimelineEvents();
  buildEventList();
  updateStats();

  // 清空图层并重置地图（飞到该数据集的默认视角）
  clearAllLayers();
  flyToDefault();
  updateLabelVisibility();

  // 同步切换浮层卡片高亮 + 顶栏按钮文字
  document.querySelectorAll('.atlas-card').forEach(card => {
    card.classList.toggle('active', card.dataset.atlas === current().id);
  });
  updateAtlasButtonLabel();

  // URL 状态：切换数据集时清空 year/person（避免引用错位）
  syncUrlState({ atlas: current().id, year: null, person: null });

  render();
});

/* ---------- 启动 ---------- */
async function boot() {
  try {
    await init();
  } catch (err) {
    console.error('初始化失败：', err);
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.innerHTML = `<div class="loading-error">
        <h3>页面初始化失败</h3>
        <p>${err.message}</p>
        <p>请打开浏览器控制台（F12）查看详细错误。</p>
      </div>`;
    }
    throw err;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  // 模块脚本延迟执行，DOMContentLoaded 可能已触发
  boot();
}
