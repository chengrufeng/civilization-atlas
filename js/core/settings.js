/* =========================================================================
 * F9 设置面板
 *
 * 把分散的偏好集中到一个浮层：
 *   - 播放速度（自动 / 1× 慢 / 2× 中 / 3× 快）
 *   - 默认图层（persons / events / capitals / heat）开机默认值
 *   - 数据集预加载开关（节省流量）
 *   - 重置（清空 localStorage 的偏好、收藏、最近）
 *
 * 偏好持久化在 localStorage.atlas.prefs（单一对象）。
 * ========================================================================= */

import { state } from './state.js';
import { t } from './i18n.js';

const PREFS_KEY = 'atlas.prefs.v1';

const DEFAULT_PREFS = {
  playSpeed: 'auto',          // 'auto' | 'slow' | 'normal' | 'fast'
  defaultLayers: { persons: true, events: true, capitals: true, heat: false },
  preloadAtlases: true,
};

let prefs = loadPrefs();

function loadPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return { ...DEFAULT_PREFS };
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch { return { ...DEFAULT_PREFS }; }
}

function savePrefs() {
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch {}
}

export function getPrefs() { return prefs; }
export function setPref(key, value) {
  prefs[key] = value;
  savePrefs();
}

export function getPlaySpeed() { return prefs.playSpeed; }
/** 速度系数：1× / 1.5× / 0.7× / null=自动 */
export function playSpeedMultiplier() {
  switch (prefs.playSpeed) {
    case 'slow':   return 1.5;   // 间隔 ×1.5 → 更慢
    case 'fast':   return 0.6;
    case 'normal': return 1.0;
    default:       return null;  // auto
  }
}

export function getDefaultLayers() { return { ...prefs.defaultLayers }; }

export function isPreloadEnabled() { return prefs.preloadAtlases !== false; }

export function resetAll() {
  prefs = { ...DEFAULT_PREFS };
  savePrefs();
  // 清空关联存储
  try {
    localStorage.removeItem('atlas.recent.v1');
    localStorage.removeItem('atlas.favorites.v1');
  } catch {}
}

export function openSettingsOverlay() {
  ensureOverlay();
  const overlay = document.getElementById('settings-overlay');
  const mask = document.getElementById('settings-mask');
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  mask.classList.add('show');
  renderSettings();
}

export function closeSettingsOverlay() {
  document.getElementById('settings-overlay')?.classList.remove('open');
  document.getElementById('settings-mask')?.classList.remove('show');
}

function ensureOverlay() {
  if (document.getElementById('settings-overlay')) return;
  const html = `
    <div class="st-mask" id="settings-mask"></div>
    <div class="st-overlay" id="settings-overlay" aria-hidden="true">
      <div class="st-header">
        <h3>${t('settings.title')}</h3>
        <button class="st-close" id="settings-close" aria-label="${t('common.close')}">×</button>
      </div>
      <div class="st-body" id="settings-body"></div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
  document.getElementById('settings-mask').addEventListener('click', closeSettingsOverlay);
  document.getElementById('settings-close').addEventListener('click', closeSettingsOverlay);
}

function renderSettings() {
  const body = document.getElementById('settings-body');
  if (!body) return;
  const speed = prefs.playSpeed;
  const layers = prefs.defaultLayers;
  body.innerHTML = `
    <section class="st-section">
      <h4>${t('settings.play_speed')}</h4>
      <div class="st-radio-group">
        ${[
          ['auto', t('settings.speed_auto')],
          ['slow', t('settings.speed_slow')],
          ['normal', t('settings.speed_normal')],
          ['fast', t('settings.speed_fast')],
        ].map(([k, label]) => `
          <label class="st-radio">
            <input type="radio" name="playSpeed" value="${k}" ${speed === k ? 'checked' : ''} />
            <span>${label}</span>
          </label>
        `).join('')}
      </div>
    </section>

    <section class="st-section">
      <h4>${t('settings.default_layers')}</h4>
      <div class="st-checkbox-group">
        ${[
          ['persons', t('panel.persons')],
          ['events', t('panel.events_layer')],
          ['capitals', t('panel.capitals')],
          ['heat', t('panel.heat')],
        ].map(([k, label]) => `
          <label class="st-checkbox">
            <input type="checkbox" name="layer" value="${k}" ${layers[k] ? 'checked' : ''} />
            <span>${label}</span>
          </label>
        `).join('')}
      </div>
    </section>

    <section class="st-section">
      <h4>${t('settings.data')}</h4>
      <label class="st-checkbox">
        <input type="checkbox" id="st-preload" ${prefs.preloadAtlases ? 'checked' : ''} />
        <span>${t('settings.preload')}</span>
      </label>
    </section>

    <section class="st-section st-danger">
      <h4>${t('settings.danger_zone')}</h4>
      <button class="st-reset-btn" id="st-reset">${t('settings.reset')}</button>
    </section>
  `;

  body.querySelectorAll('input[name="playSpeed"]').forEach(r => {
    r.addEventListener('change', () => setPref('playSpeed', r.value));
  });
  body.querySelectorAll('input[name="layer"]').forEach(cb => {
    cb.addEventListener('change', () => {
      const next = { ...prefs.defaultLayers, [cb.value]: cb.checked };
      setPref('defaultLayers', next);
    });
  });
  const preload = body.querySelector('#st-preload');
  if (preload) preload.addEventListener('change', () => setPref('preloadAtlases', preload.checked));
  const reset = body.querySelector('#st-reset');
  if (reset) reset.addEventListener('click', () => {
    if (confirm(t('settings.reset_confirm'))) {
      resetAll();
      renderSettings();
    }
  });
}
