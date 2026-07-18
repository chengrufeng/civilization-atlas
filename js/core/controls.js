/* =========================================================================
 * 华夏人物图鉴 · 控件事件绑定
 * ========================================================================= */

import { state, DOMAIN_ORDER, DOMAIN_COLOR, formatYear } from './state.js';
import {
  current, FACTION_NAME, ERA_START, ERA_END,
  getPerson, switchAtlas, getGlobalPersonIndex,
} from './atlas.js';
import { syncUrlState } from './url-state.js';
import { render, updateStats } from './render.js';
import {
  buildTimelineEvents, buildTimelineTicks, startPlay, stopPlay,
  showYearToasts, updateEventTrackCurrent,
} from './timeline.js';
import { buildEventList, buildListOverlay } from './event-list.js';
import { openDetail, closeDetail } from './detail.js';
import { flyToDefault } from './map.js';
import { t, localized } from './i18n.js';

/* 搜索关键字高亮：对 kw 出现的位置包 <mark>，kw 为空时返回原文 */
function highlight(text, kw) {
  if (!text || !kw) return text || '';
  const idx = text.indexOf(kw);
  if (idx < 0) return text;
  return text.slice(0, idx)
    + '<mark>' + text.slice(idx, idx + kw.length) + '</mark>'
    + text.slice(idx + kw.length);
}

/* ---------- 通用面板切换 ---------- */
function togglePanel(panelId, btnId) {
  const panel = document.getElementById(panelId);
  const btn = document.getElementById(btnId);
  panel.classList.toggle('hidden');
  btn.classList.toggle('active', !panel.classList.contains('hidden'));
  if (state.map) setTimeout(() => state.map.invalidateSize(), 320);
}

/* ---------- 势力筛选（动态重建后调用） ---------- */
export function buildFactionFilters() {
  const container = document.getElementById('faction-filters');
  if (!container) return;
  const atlas = current();
  let html = `<button class="chip active" data-faction="all">全部</button>`;
  atlas.factions.forEach(f => {
    html += `<button class="chip ${f.id}" data-faction="${f.id}">${f.name}</button>`;
  });
  container.innerHTML = html;
  bindFactionFilters();
}

function bindFactionFilters() {
  document.querySelectorAll('.chip[data-faction]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.chip[data-faction]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.factionFilter = btn.dataset.faction;
      updateStats();
      render();
    });
  });
}

/* ---------- 事件领域筛选（按当前数据集动态重建） ---------- */
export function buildDomainFilters() {
  const container = document.getElementById('domain-filters');
  if (!container) return;
  container.innerHTML = DOMAIN_ORDER.map(name => {
    const checked = state.domainFilter.has(name) ? 'checked' : '';
    const color = DOMAIN_COLOR[name] || '#888';
    return `<label class="toggle domain-toggle"><input type="checkbox" data-domain="${name}" ${checked} /> <span class="domain-tag" style="--dc:${color}">${name}</span></label>`;
  }).join('');
  bindDomainFilters();
}

function bindDomainFilters() {
  document.querySelectorAll('.domain-toggle input[data-domain]').forEach(cb => {
    cb.addEventListener('change', () => {
      const d = cb.dataset.domain;
      if (cb.checked) state.domainFilter.add(d);
      else state.domainFilter.delete(d);
      buildTimelineEvents();
      buildEventList();
      updateStats();
      render();
    });
  });
}

/* ---------- 全部控件绑定 ---------- */
export function bindControls() {
  // 搜索
  bindSearch();

  // 势力筛选（初始 HTML 中的按钮）
  bindFactionFilters();

  // 事件领域筛选（按当前数据集动态生成）
  buildDomainFilters();

  // 图层切换
  document.querySelectorAll('.toggle input[data-layer]').forEach(cb => {
    cb.addEventListener('change', () => {
      state.layers[cb.dataset.layer] = cb.checked;
      render();
    });
  });

  // 名册
  document.getElementById('btn-list').addEventListener('click', () => {
    document.getElementById('list-overlay').classList.add('open');
    buildListOverlay();
  });
  document.getElementById('list-close').addEventListener('click', () => {
    document.getElementById('list-overlay').classList.remove('open');
  });

  // 面板切换
  document.getElementById('btn-events').addEventListener('click', () => {
    togglePanel('event-list-panel', 'btn-events');
  });
  document.getElementById('btn-left-panel').addEventListener('click', () => {
    togglePanel('left-panel', 'btn-left-panel');
  });
  document.getElementById('btn-timeline').addEventListener('click', () => {
    togglePanel('timeline-bar', 'btn-timeline');
    document.body.classList.toggle('no-timeline', document.getElementById('timeline-bar').classList.contains('hidden'));
  });

  // 全屏按钮
  document.getElementById('btn-fullscreen').addEventListener('click', () => {
    const panels = [
      ['left-panel', 'btn-left-panel'],
      ['event-list-panel', 'btn-events'],
      ['timeline-bar', 'btn-timeline'],
    ];
    const allHidden = panels.every(([pid]) => document.getElementById(pid).classList.contains('hidden'));
    panels.forEach(([pid, bid]) => {
      const el = document.getElementById(pid);
      const btn = document.getElementById(bid);
      if (allHidden) {
        el.classList.remove('hidden');
        btn.classList.add('active');
      } else {
        el.classList.add('hidden');
        btn.classList.remove('active');
      }
    });
    document.getElementById('btn-fullscreen').textContent = allHidden ? '⤢' : '⤡';
    document.body.classList.toggle('no-timeline', document.getElementById('timeline-bar').classList.contains('hidden'));
  });

  // 时间轴滑块
  bindSlider();

  // 重置
  document.getElementById('reset-btn').addEventListener('click', () => {
    state.yearFilter = null;
    state.eventFocus = null;
    state.expandedEvent = null;
    state.highlightedPersons.clear();
    document.getElementById('year-slider').value = ERA_START;
    document.getElementById('year-display').textContent = '全部年份';
    stopPlay();
    flyToDefault();
    updateStats();
    render();
    buildEventList();
    updateEventTrackCurrent();
  });

  // 播放/暂停
  document.getElementById('play-btn').addEventListener('click', () => {
    if (state.playing) stopPlay();
    else startPlay();
  });

  // 自动追踪开关
  document.getElementById('track-btn').addEventListener('click', () => {
    state.autoTrack = !state.autoTrack;
    document.getElementById('track-btn').classList.toggle('active', state.autoTrack);
    if (!state.autoTrack) {
      state.eventFocus = null;
      state.highlightedPersons.clear();
      render();
    }
  });

  // 详情关闭
  document.getElementById('detail-close').addEventListener('click', () => closeDetail(true));
  document.getElementById('detail-mask').addEventListener('click', () => closeDetail(true));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (document.getElementById('detail-panel').classList.contains('open')) closeDetail(true);
      document.getElementById('list-overlay').classList.remove('open');
      document.getElementById('atlas-overlay')?.classList.remove('open');
      document.getElementById('atlas-overlay-mask')?.classList.remove('show');
      document.getElementById('compare-overlay')?.classList.remove('open');
      document.getElementById('compare-overlay-mask')?.classList.remove('show');
      closeShortcutsHelp();
      return;
    }
    handleShortcut(e);
  });
  bindShortcutsHelp();
}

/* ---------- 搜索 ---------- */
function bindSearch() {
  const searchInput = document.getElementById('search');
  const suggestBox = document.createElement('div');
  suggestBox.className = 'search-suggest';
  document.body.appendChild(suggestBox);

  let globalReady = false;
  let globalFailed = false;
  // 首次聚焦时启动全局索引预加载
  searchInput.addEventListener('focus', () => {
    if (globalReady || globalFailed) return;
    getGlobalPersonIndex().then(() => { globalReady = true; })
      .catch(() => { globalFailed = true; });
  });

  const hideSuggest = () => suggestBox.classList.remove('show');

  // 选择人物：若不在当前数据集，先切换数据集再打开详情
  const selectPerson = async (atlasId, pid) => {
    hideSuggest();
    if (atlasId !== current().id) {
      await switchAtlas(atlasId);
    }
    const person = getPerson(pid);
    if (!person) return;
    searchInput.value = person.name;
    openDetail(pid);
  };

  let searchDebounce = null;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(async () => {
      const raw = searchInput.value.trim();
      if (!raw) { hideSuggest(); return; }

      // F13 解析 domain:军事 刘 这种语法；非人物部分作为关键字
      let kw = raw;
      let domainFilter = null;
      const m = raw.match(/^domain:([^:\s]+)\s*(.*)$/i) || raw.match(/^([^:\s]+):domain\s+(.*)$/i);
      if (m) {
        if (m.length === 3 && /^domain:/i.test(raw)) {
          domainFilter = m[1];
          kw = m[2].trim();
        } else if (m.length === 3) {
          domainFilter = m[1];
          kw = m[2].trim();
        }
      }
      if (!kw) {
        // 只输入 domain:军事 时给提示
        if (domainFilter) {
          showSuggest();
          const rect = searchInput.getBoundingClientRect();
          suggestBox.style.left = `${rect.left}px`;
          suggestBox.style.top = `${rect.bottom + 6}px`;
          suggestBox.style.minWidth = `${rect.width}px`;
          suggestBox.innerHTML = `<div class="ss-empty">${t('search.domain_hint', { domain: domainFilter })}</div>`;
        }
        return;
      }
      const rect = searchInput.getBoundingClientRect();
      suggestBox.style.left = `${rect.left}px`;
      suggestBox.style.top = `${rect.bottom + 6}px`;
      suggestBox.style.minWidth = `${rect.width}px`;

      // 全局模式：跨数据集检索
      if (globalReady) {
        const idx = await getGlobalPersonIndex();
        // 评分：完全匹配 0 > 名字命中 1 > 字号 2 > 别名 3
        const scored = [];
        for (const p of idx) {
          // F13 领域过滤：只保留 domains 包含 domainFilter 的人物
          if (domainFilter && !(p.domains || []).some(d => d === domainFilter || d.includes(domainFilter))) continue;
          let score = -1;
          if (p.name === kw) score = 0;
          else if (p.name.includes(kw)) score = 1;
          else if (p.courtesy && p.courtesy.includes(kw)) score = 2;
          else if (p.alias.some(a => a === kw)) score = 2;
          else if (p.alias.some(a => a.includes(kw))) score = 3;
          if (score >= 0) scored.push({ p, score });
        }
        scored.sort((a, b) => a.score - b.score);
        const matches = scored.slice(0, 20).map(x => x.p);

        if (matches.length === 0) {
          suggestBox.innerHTML = `<div class="ss-empty">${t('toast.not_found')}</div>`;
        } else {
          // 按 atlasId 分组（保持相关度排序）
          const groups = [];
          for (const m of matches) {
            let g = groups.find(x => x.atlasId === m.atlasId);
            if (!g) { g = { atlasId: m.atlasId, atlasName: m.atlasName, atlasNameEn: m.atlasNameEn, items: [] }; groups.push(g); }
            g.items.push(m);
          }
          suggestBox.innerHTML = groups.map(g => `
            <div class="ss-group">
              <div class="ss-group-title">${localized({ name: g.atlasName, nameEn: g.atlasNameEn }, 'name')}</div>
              ${g.items.map(p => {
                const nameHl = highlight(p.name, kw);
                const cyHl = p.courtesy ? highlight(p.courtesy, kw) : '';
                return `
                <div class="ss-item" data-atlas="${p.atlasId}" data-id="${p.personId}">
                  <b>${nameHl}</b><span class="ss-sub">${cyHl ? t('detail.courtesy_label') + ' ' + cyHl + ' · ' : ''}${p.factionName}</span>
                </div>`;
              }).join('')}
            </div>`).join('');
          suggestBox.querySelectorAll('.ss-item').forEach(el => {
            el.addEventListener('click', () => selectPerson(el.dataset.atlas, el.dataset.id));
          });
        }
      } else {
        // 回退：仅当前数据集
        const atlas = current();
        const matches = atlas.persons.filter(p =>
          p.name.includes(kw) ||
          (p.courtesy && p.courtesy.includes(kw)) ||
          (p.alias || []).some(a => a.includes(kw))
        ).slice(0, 8);
        if (matches.length === 0) {
          suggestBox.innerHTML = '<div class="ss-empty">未找到匹配人物</div>';
        } else {
          suggestBox.innerHTML = matches.map(p => `
            <div class="ss-item" data-atlas="${atlas.id}" data-id="${p.id}">
              <b>${p.name}</b><span class="ss-sub">${p.courtesy ? '字 ' + p.courtesy + ' · ' : ''}${FACTION_NAME[p.faction]}</span>
            </div>`).join('');
          suggestBox.querySelectorAll('.ss-item').forEach(el => {
            el.addEventListener('click', () => selectPerson(el.dataset.atlas, el.dataset.id));
          });
        }
      }
      suggestBox.classList.add('show');
    }, 300);
  });
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const first = suggestBox.querySelector('.ss-item');
      if (first) selectPerson(first.dataset.atlas, first.dataset.id);
    } else if (e.key === 'Escape') {
      hideSuggest();
    }
  });
  document.addEventListener('click', (e) => {
    if (e.target !== searchInput && !suggestBox.contains(e.target)) hideSuggest();
  });
}

/* ---------- 时间轴滑块 ---------- */
function bindSlider() {
  const slider = document.getElementById('year-slider');
  let toastDebounce = null;
  slider.addEventListener('input', () => {
    const year = parseInt(slider.value);
    stopPlay();
    state.yearFilter = year;
    state.eventFocus = null;
    if (state.expandedEvent !== null) {
      state.expandedEvent = null;
      buildEventList();
    }
    document.getElementById('year-display').textContent = formatYear(year);
    updateStats();
    render();
    updateEventTrackCurrent();
    clearTimeout(toastDebounce);
    toastDebounce = setTimeout(() => showYearToasts(year), 250);
    syncUrlState({ atlas: current().id, year, person: state.selectedPerson });
  });

  // F4 hover 预览：鼠标在 slider 上滑动时，显示对应年份的小气泡
  const hint = document.createElement('div');
  hint.className = 'slider-hover-hint';
  hint.style.display = 'none';
  document.body.appendChild(hint);
  const min = () => parseInt(slider.min) || 0;
  const max = () => parseInt(slider.max) || 1;
  const eventsCountAt = (y) => (current().events || []).filter(e => e.year === y).length;
  slider.addEventListener('mousemove', (ev) => {
    const rect = slider.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
    const year = Math.round(min() + ratio * (max() - min()));
    const n = eventsCountAt(year);
    const evLabel = n > 0 ? ` · ${n} ${t('event_list.count_suffix').trim() || '件'}` : '';
    hint.textContent = `${formatYear(year)}${evLabel}`;
    hint.style.display = 'block';
    hint.style.left = `${ev.clientX - hint.offsetWidth / 2}px`;
    hint.style.top = `${rect.top - hint.offsetHeight - 6}px`;
  });
  slider.addEventListener('mouseleave', () => { hint.style.display = 'none'; });
}

/* ---------- 键盘快捷键 ---------- */
function handleShortcut(e) {
  // 在输入框中不触发
  const t = e.target;
  if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
  // 浮层打开时除 Esc 外不触发
  const overlayOpen = document.querySelector('.atlas-overlay.open, .compare-overlay.open, .list-overlay.open, #detail-panel.open');
  if (overlayOpen) return;

  const slider = document.getElementById('year-slider');
  switch (e.key) {
    case ' ':
      e.preventDefault();
      if (state.playing) stopPlay();
      else startPlay();
      break;
    case 'ArrowLeft':
      e.preventDefault();
      nudgeYear(e.shiftKey ? -10 : -1);
      break;
    case 'ArrowRight':
      e.preventDefault();
      nudgeYear(e.shiftKey ? 10 : 1);
      break;
    case 'Home': {
      e.preventDefault();
      const y = ERA_START;
      applyYear(y);
      break;
    }
    case 'End': {
      e.preventDefault();
      const y = ERA_END;
      applyYear(y);
      break;
    }
    case '/':
      e.preventDefault();
      document.getElementById('search').focus();
      break;
    case 'l': case 'L':
      document.getElementById('atlas-selector-btn')?.click();
      break;
    case 'c': case 'C':
      document.getElementById('btn-timeline-compare')?.click();
      break;
    case '?':
      openShortcutsHelp();
      break;
  }
}

function nudgeYear(delta) {
  const slider = document.getElementById('year-slider');
  let y = state.yearFilter !== null ? state.yearFilter : ERA_START;
  y = Math.max(ERA_START, Math.min(ERA_END, y + delta));
  applyYear(y);
}

function applyYear(year) {
  const slider = document.getElementById('year-slider');
  state.yearFilter = year;
  state.eventFocus = null;
  if (state.expandedEvent !== null) { state.expandedEvent = null; buildEventList(); }
  slider.value = year;
  document.getElementById('year-display').textContent = formatYear(year);
  stopPlay();
  updateStats();
  render();
  updateEventTrackCurrent();
  showYearToasts(year);
  syncUrlState({ atlas: current().id, year, person: state.selectedPerson });
}

/* ---------- 快捷键帮助浮层 ---------- */
function bindShortcutsHelp() {
  // 动态注入帮助浮层（一次性）
  if (document.getElementById('shortcuts-overlay')) return;
  const html = `
    <div class="shortcuts-mask" id="shortcuts-mask"></div>
    <div class="shortcuts-overlay" id="shortcuts-overlay" aria-hidden="true">
      <div class="shortcuts-header">
        <h3>${t('shortcuts.title')}</h3>
        <button class="shortcuts-close" id="shortcuts-close" aria-label="${t('common.close')}">×</button>
      </div>
      <div class="shortcuts-body">
        <div class="sc-row"><kbd>Space</kbd><span>${t('shortcuts.space')}</span></div>
        <div class="sc-row"><kbd>←</kbd> / <kbd>→</kbd><span>${t('shortcuts.arrows')}</span></div>
        <div class="sc-row"><kbd>Shift</kbd> + <kbd>←/→</kbd><span>${t('shortcuts.shift_arrows')}</span></div>
        <div class="sc-row"><kbd>Home</kbd> / <kbd>End</kbd><span>${t('shortcuts.home_end')}</span></div>
        <div class="sc-row"><kbd>/</kbd><span>${t('shortcuts.slash')}</span></div>
        <div class="sc-row"><kbd>L</kbd><span>${t('shortcuts.l')}</span></div>
        <div class="sc-row"><kbd>C</kbd><span>${t('shortcuts.c')}</span></div>
        <div class="sc-row"><kbd>?</kbd><span>${t('shortcuts.question')}</span></div>
        <div class="sc-row"><kbd>Esc</kbd><span>${t('shortcuts.esc')}</span></div>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
  document.getElementById('shortcuts-mask').addEventListener('click', closeShortcutsHelp);
  document.getElementById('shortcuts-close').addEventListener('click', closeShortcutsHelp);
}

function openShortcutsHelp() {
  document.getElementById('shortcuts-overlay').classList.add('open');
  document.getElementById('shortcuts-mask').classList.add('show');
}
function closeShortcutsHelp() {
  const o = document.getElementById('shortcuts-overlay');
  const m = document.getElementById('shortcuts-mask');
  if (o) o.classList.remove('open');
  if (m) m.classList.remove('show');
}
