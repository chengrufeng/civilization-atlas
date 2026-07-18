/* =========================================================================
 * C6 本地数据集导入（Local Atlas Import / UGC）
 *
 * 用户拖入或选择符合 schema 的 JSON → 浏览器内解析 + 校验 → 注册到
 * ATLAS_MANIFEST → 提示是否切换。数据完全在客户端处理，不上传任何服务器。
 *
 * 校验逻辑与 tools/validate.mjs 同步：保证导入体验与 CI 校验一致。
 * ========================================================================= */

import { registerLocalAtlas, switchAtlas } from './atlas.js';
import { t, tf } from './i18n.js';

const DEFAULT_DOMAINS = ['军事', '政治', '文学', '科技', '外交', '文化'];

/** 浏览器内最小校验：复用 validate.mjs 的关键规则。
 *  返回 { errors: string[], warns: string[] }。 */
export function validateLocalAtlas(atlas) {
  const errors = [];
  const warns = [];
  if (!atlas || typeof atlas !== 'object') {
    errors.push('根对象不是合法 JSON 对象');
    return { errors, warns };
  }
  if (!atlas.id) errors.push('缺少 id');
  if (!atlas.name) errors.push('缺少 name');
  if (typeof atlas.startYear !== 'number' || typeof atlas.endYear !== 'number') {
    errors.push('需要数值型 startYear / endYear');
  } else if (atlas.startYear >= atlas.endYear) {
    errors.push(`startYear(${atlas.startYear}) 必须小于 endYear(${atlas.endYear})`);
  }

  const factions = Array.isArray(atlas.factions) ? atlas.factions : [];
  const persons = Array.isArray(atlas.persons) ? atlas.persons : [];
  const places = Array.isArray(atlas.places) ? atlas.places : [];
  const events = Array.isArray(atlas.events) ? atlas.events : [];
  const relations = Array.isArray(atlas.relations) ? atlas.relations : [];

  const factionIds = new Set(factions.map(f => f.id));
  const personIds = new Set(persons.map(p => p.id));
  const placeNames = new Set(places.map(p => p.name));
  const domainNames = Array.isArray(atlas.domains) && atlas.domains.length
    ? atlas.domains.map(d => d.name)
    : DEFAULT_DOMAINS;
  const domainSet = new Set(domainNames);

  if (factionIds.size !== factions.length) errors.push('faction id 有重复');
  if (personIds.size !== persons.length) errors.push('person id 有重复');

  const placeByName = name => places.find(p => p.name === name);
  for (const p of persons) {
    if (!factionIds.has(p.faction)) errors.push(`人物「${p.name}」faction「${p.faction}」不存在`);
    if (typeof p.birth === 'number' && typeof p.death === 'number' && p.birth > p.death) {
      errors.push(`人物「${p.name}」birth > death`);
    }
  }
  for (const e of events) {
    if (!domainSet.has(e.domain)) errors.push(`事件「${e.name}」domain「${e.domain}」不在领域列表中`);
    if (e.location && !placeByName(e.location)) warns.push(`事件「${e.name}」location 不在 places 中`);
    for (const pid of (e.participants || [])) {
      if (!personIds.has(pid)) errors.push(`事件「${e.name}」参与者「${pid}」不存在`);
    }
  }
  for (const r of relations) {
    if (!personIds.has(r.source)) errors.push(`关系 source「${r.source}」不存在`);
    if (!personIds.has(r.target)) errors.push(`关系 target「${r.target}」不存在`);
  }
  return { errors, warns };
}

/** 解析单个 File → atlas 对象 */
async function parseFile(file) {
  const text = await file.text();
  return JSON.parse(text);
}

/** 补齐 atlas 缺省字段（importance / mapView 等），让现有视图层能直接用 */
function normalizeAtlas(input) {
  const atlas = { ...input };
  if (!atlas.domains || !atlas.domains.length) {
    atlas.domains = DEFAULT_DOMAINS.map(name => ({ name, color: '#888' }));
  }
  if (!atlas.importance) {
    atlas.importance = {
      getPersonImportance: () => 2,
      getEventImportance: () => 2,
    };
  }
  if (!atlas.mapView) {
    // 取人物事件的平均坐标兜底
    const coords = (atlas.places || []).map(p => p.coord).filter(Boolean);
    let center = [110, 35];
    if (coords.length) {
      center = [
        coords.reduce((s, c) => s + c[0], 0) / coords.length,
        coords.reduce((s, c) => s + c[1], 0) / coords.length,
      ];
    }
    atlas.mapView = { center, zoom: 5, minZoom: 2, maxZoom: 12, baseLayer: 'satellite' };
  }
  atlas.birthplaceModern = atlas.birthplaceModern || {};
  atlas.birthplaceCoords = atlas.birthplaceCoords || {};
  atlas.personImages = atlas.personImages || {};
  return atlas;
}

/** 导入一个文件：解析 + 校验 + 注册。返回 { ok, atlas, errors, warns }。 */
export async function importLocalAtlasFile(file) {
  let raw;
  try {
    raw = await parseFile(file);
  } catch (e) {
    return { ok: false, errors: [`JSON 解析失败：${e.message}`], warns: [] };
  }
  const atlas = normalizeAtlas(raw);
  const { errors, warns } = validateLocalAtlas(atlas);
  if (errors.length) return { ok: false, errors, warns, atlas };
  try {
    registerLocalAtlas(atlas);
  } catch (e) {
    return { ok: false, errors: [e.message], warns, atlas };
  }
  return { ok: true, errors, warns, atlas };
}

/* ---------- UI 浮层 ---------- */

export function openLocalAtlasOverlay() {
  ensureOverlay();
  const overlay = document.getElementById('local-atlas-overlay');
  const mask = document.getElementById('local-atlas-mask');
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  mask.classList.add('show');
}

export function closeLocalAtlasOverlay() {
  document.getElementById('local-atlas-overlay')?.classList.remove('open');
  document.getElementById('local-atlas-mask')?.classList.remove('show');
}

function ensureOverlay() {
  if (document.getElementById('local-atlas-overlay')) return;
  const html = `
    <div class="la-mask" id="local-atlas-mask"></div>
    <div class="la-overlay" id="local-atlas-overlay" aria-hidden="true">
      <div class="la-header">
        <h3>${t('local_atlas.title')}</h3>
        <button class="la-close" id="local-atlas-close" aria-label="${t('common.close')}">×</button>
      </div>
      <div class="la-body">
        <p class="la-hint">${t('local_atlas.hint')}</p>
        <label class="la-dropzone" id="local-atlas-dropzone" tabindex="0">
          <input type="file" id="local-atlas-file" accept="application/json,.json" hidden multiple />
          <div class="la-dropzone-text">${t('local_atlas.drop_hint')}</div>
        </label>
        <div class="la-result" id="local-atlas-result"></div>
        <a class="la-schema-link" href="js/data/_template.js" target="_blank">${t('local_atlas.schema_link')}</a>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
  document.getElementById('local-atlas-mask').addEventListener('click', closeLocalAtlasOverlay);
  document.getElementById('local-atlas-close').addEventListener('click', closeLocalAtlasOverlay);

  const dz = document.getElementById('local-atlas-dropzone');
  const input = document.getElementById('local-atlas-file');
  const result = document.getElementById('local-atlas-result');

  const handleFiles = async (files) => {
    if (!files || !files.length) return;
    result.innerHTML = `<div class="la-status">${t('local_atlas.parsing')}</div>`;
    for (const file of files) {
      const r = await importLocalAtlasFile(file);
      if (r.ok) {
        result.innerHTML = `<div class="la-success">${tf('local_atlas.loaded', {
          name: r.atlas.name,
          persons: (r.atlas.persons || []).length,
          events: (r.atlas.events || []).length,
        })}</div>
        <button class="la-switch-btn" data-id="${r.atlas.id}">${t('local_atlas.switch_now')}</button>`;
        result.querySelector('.la-switch-btn')?.addEventListener('click', async () => {
          closeLocalAtlasOverlay();
          await switchAtlas(r.atlas.id);
        });
      } else {
        result.innerHTML = `<div class="la-error">${tf('local_atlas.load_failed', { msg: r.errors[0] || 'unknown' })}</div>
        <ul class="la-error-list">${r.errors.map(e => `<li>${e}</li>`).join('')}</ul>`;
      }
    }
  };

  input.addEventListener('change', () => handleFiles(input.files));
  dz.addEventListener('click', () => input.click());
  dz.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); }
  });
  ['dragenter', 'dragover'].forEach(ev =>
    dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.add('drag'); }));
  ['dragleave', 'drop'].forEach(ev =>
    dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.remove('drag'); }));
  dz.addEventListener('drop', (e) => {
    handleFiles(e.dataTransfer?.files);
  });
}
