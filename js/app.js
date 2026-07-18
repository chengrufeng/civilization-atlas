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
  current, currentMeta, manifest, switchAtlas, onSwitch, initAtlas,
  preloadAllAtlases,
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
import { openDomainBrowser, closeDomainBrowser } from './core/domain-browser.js';
import { showPersonDetail } from './core/detail.js';
import { setLang, applyToDOM, currentLang, onLangChange, t, tf, localized } from './core/i18n.js';
import { readUrlState, syncUrlState, withUrlSuppressed } from './core/url-state.js';
import { formatYear } from './core/state.js';
import { getPerson } from './core/atlas.js';

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
  applyToDOM();  // 应用 i18n 到 DOM（首次渲染）

  document.getElementById('loading-overlay').classList.add('hide');

  // F2 浏览器空闲时预加载其他数据集，切换时秒开（受设置开关控制）
  import('./core/settings.js').then(({ isPreloadEnabled }) => {
    if (isPreloadEnabled()) preloadAllAtlases();
  });

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
  // E7 深度 URL：search / journey / compare
  if (urlState.search) {
    const input = document.getElementById('search');
    if (input) {
      input.value = urlState.search;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
  if (urlState.compare && urlState.compare.length >= 2) {
    import('./core/compare-figures.js').then(m => {
      m.clearSelection();
      urlState.compare.forEach(id => { m.toggleSelect(id); });
      m.openCompareOverlay();
    });
  }
  if (urlState.journey) {
    import('./core/life-journey.js').then(m => {
      // 等其他初始化完后再启动，避免被 onSwitch / render 抢风头
      setTimeout(() => m.startLifeJourney(urlState.journey), 400);
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
    const groupMeta = { group: g.name, groupEn: g.items[0]?.groupEn || g.name };
    const cards = g.items.map(a => {
      const s = a.stats || {};
      const badges = s.persons ? `
        <div class="atlas-card-stats">
          <span title="${t('panel.stat_persons')}">👤 ${s.persons}</span>
          <span title="${t('panel.stat_events')}">◆ ${s.events}</span>
          <span title="${t('atlas.stat_factions')}">⚑ ${s.factions}</span>
        </div>` : '';
      return `
      <button class="atlas-card ${a.id === activeId ? 'active' : ''}" data-atlas="${a.id}">
        <div class="atlas-card-name">${localized(a, 'name')}</div>
        <div class="atlas-card-sub">${localized(a, 'subtitle')}</div>
        ${badges}
      </button>`;
    }).join('');
    return `<div class="atlas-group">
      <div class="atlas-group-title">${localized(groupMeta, 'group')}</div>
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
    refreshQuickRow();
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

/** F8 填充切换器顶部的收藏/最近 chip 行 */
function refreshQuickRow() {
  const favBox = document.getElementById('quick-favorites');
  const recBox = document.getElementById('quick-recent');
  if (!favBox || !recBox) return;
  const renderChips = (box, items) => {
    if (!items.length) {
      box.innerHTML = `<span class="aq-empty">${t('quick.empty')}</span>`;
      return;
    }
    box.innerHTML = items.map(it => {
      const meta = manifest().find(m => m.id === it.atlas);
      const atlasName = meta ? localized(meta, 'name') : it.atlas;
      return `<button class="aq-chip" data-atlas="${it.atlas}" data-id="${it.id}" title="${atlasName}">
        <span class="aq-name">${it.name}</span>
        <span class="aq-atlas">${atlasName}</span>
      </button>`;
    }).join('');
    box.querySelectorAll('.aq-chip').forEach(chip => {
      chip.addEventListener('click', async () => {
        const aid = chip.dataset.atlas;
        const pid = chip.dataset.id;
        if (aid !== current().id) await doSwitchAtlas(aid);
        document.getElementById('atlas-overlay')?.classList.remove('open');
        document.getElementById('atlas-overlay-mask')?.classList.remove('show');
        import('./core/detail.js').then(m => m.openDetail(pid));
      });
    });
  };
  import('./core/favorites.js').then(({ getFavorites, getRecent }) => {
    renderChips(favBox, getFavorites().slice(0, 12));
    renderChips(recBox, getRecent().slice(0, 8));
  });
}

/** 更新顶栏按钮显示的当前数据集名 */
function updateAtlasButtonLabel() {
  const el = document.getElementById('atlas-current-name');
  if (el) el.textContent = localized(currentMeta() || current(), 'name');
}

/** 语言切换后，原地刷新切换器浮层里的 atlas 名称/subtitle/分组标题 */
function rebuildAtlasSwitcherLabels() {
  const body = document.getElementById('atlas-overlay-body');
  if (!body) return;
  const cards = body.querySelectorAll('.atlas-card');
  cards.forEach(card => {
    const id = card.dataset.atlas;
    const meta = manifest().find(m => m.id === id);
    if (!meta) return;
    const nameEl = card.querySelector('.atlas-card-name');
    const subEl = card.querySelector('.atlas-card-sub');
    if (nameEl) nameEl.textContent = localized(meta, 'name');
    if (subEl) subEl.textContent = localized(meta, 'subtitle');
  });
  body.querySelectorAll('.atlas-group').forEach((groupEl, idx) => {
    const titleEl = groupEl.querySelector('.atlas-group-title');
    if (!titleEl) return;
    const firstCard = groupEl.querySelector('.atlas-card');
    const meta = firstCard ? manifest().find(m => m.id === firstCard.dataset.atlas) : null;
    if (meta) titleEl.textContent = localized(meta, 'group');
  });
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

  // B2 跨数据集领域浏览
  const btnDomain = document.getElementById('btn-domain-browser');
  if (btnDomain) btnDomain.addEventListener('click', () => openDomainBrowser());
  window.addEventListener('domainbrowser:select', async (e) => {
    const { atlasId, eventId } = e.detail || {};
    if (!atlasId || !eventId) return;
    if (atlasId !== current().id) await doSwitchAtlas(atlasId);
    import('./core/detail.js').then(m => m.showEventInfo(eventId));
  });

  // E3 语言切换
  const btnLang = document.getElementById('btn-lang');
  if (btnLang) {
    btnLang.addEventListener('click', () => {
      setLang(currentLang() === 'zh' ? 'en' : 'zh');
    });
    btnLang.textContent = '中/EN';
  }

  // F9 设置浮层
  const btnSettings = document.getElementById('btn-settings');
  if (btnSettings) {
    btnSettings.addEventListener('click', async () => {
      const m = await import('./core/settings.js');
      m.openSettingsOverlay();
    });
  }

  // F17 打印 / 导出 PDF
  const btnPrint = document.getElementById('btn-print');
  if (btnPrint) {
    btnPrint.addEventListener('click', () => {
      const meta = currentMeta();
      const atlas = current();
      const stats = atlas.persons.length;
      const events = atlas.events.length;
      const factions = atlas.factions.length;
      const yearText = state.yearFilter === null ? t('common.all_years') : formatYear(state.yearFilter);
      const banner = document.getElementById('print-banner');
      if (banner) {
        banner.querySelector('.pb-title').textContent = tf('print.title', { atlas: meta ? localized(meta, 'name') : '' });
        banner.querySelector('.pb-year').textContent = tf('print.year', { year: yearText });
        banner.querySelector('.pb-stats').textContent = tf('print.stats', { persons: stats, events, factions });
      }
      document.body.classList.add('printing');
      window.print();
      setTimeout(() => document.body.classList.remove('printing'), 500);
    });
  }

  // C6 本地数据集导入
  const btnLocalAtlas = document.getElementById('btn-local-atlas');
  if (btnLocalAtlas) {
    btnLocalAtlas.addEventListener('click', async () => {
      const m = await import('./core/local-atlas.js');
      m.openLocalAtlasOverlay();
    });
  }
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
      <h3>${t('loading.atlas_error.title')}</h3>
      <p>${err.message}</p>
      <p>${t('loading.atlas_error.hint')}</p>
    </div>`;
  }
}

/** 将当前数据集的元信息同步到 DOM */
function applyAtlasToUI() {
  const meta = currentMeta() || current();
  const h1 = document.querySelector('.brand-text h1');
  const sub = document.querySelector('.brand-text .brand-sub');
  if (h1) h1.textContent = localized(meta, 'name');
  if (sub) sub.textContent = localized(meta, 'subtitle');
  const slider = document.getElementById('year-slider');
  if (slider) {
    slider.min = ERA_START;
    slider.max = ERA_END;
    slider.value = ERA_START;
  }
  const yd = document.getElementById('year-display');
  if (yd) yd.textContent = t('common.all_years');
}

/* ---------- 数据集切换回调 ---------- */
onSwitch(() => {
  stopPlay();
  // 切数据集时停止人生回放（除非是 life journey 自己触发的切换）
  import('./core/life-journey.js').then(m => {
    if (!m.isSwitchingAtlas()) m.stopLifeJourney();
  });
  // 切数据集时停止解说播放
  import('./core/narration.js').then(m => m.stopNarration());

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
    // 语言切换时重建动态 DOM（i18n 覆盖动态生成的浮层/面板）
    onLangChange(() => {
      // 静态 data-i18n 已在 setLang() 内部刷新
      applyAtlasToUI();
      updateAtlasButtonLabel();
      rebuildAtlasSwitcherLabels();
      buildEventList();
      // 重建快捷键浮层（如果存在）— 下次打开会重新注入
      const sc = document.getElementById('shortcuts-overlay');
      if (sc) sc.remove();
      const sm = document.getElementById('shortcuts-mask');
      if (sm) sm.remove();
      // 关系线 tooltip 走 relationLabel，需要重绘地图
      render();
      // 若详情面板打开，重新渲染当前人物（不改变地图状态）
      if (state.selectedPerson) {
        const p = getPerson(state.selectedPerson);
        if (p) showPersonDetail(state.selectedPerson);
      }
    });
  } catch (err) {
    console.error('初始化失败：', err);
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.innerHTML = `<div class="loading-error">
        <h3>${t('loading.error.title')}</h3>
        <p>${err.message}</p>
        <p>${t('loading.error.hint')}</p>
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

// F10 注册 Service Worker（生产环境 / https / localhost）
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      // 注册失败不影响主功能
    });
  });
}

// F18 历史上的今天：首屏后空闲时拉
window.addEventListener('load', () => {
  import('./core/today-in-history.js').then(m => m.showTodayInHistory());
  window.addEventListener('tih:select', async (e) => {
    const { atlasId, eventId } = e.detail || {};
    if (!atlasId || !eventId) return;
    if (atlasId !== current().id) await doSwitchAtlas(atlasId);
    import('./core/detail.js').then(m => m.showEventInfo(eventId));
  });
});
