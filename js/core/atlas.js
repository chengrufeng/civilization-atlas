/* =========================================================================
 * 华夏人物图鉴 · 数据集管理
 *
 * 职责：
 *   1. 持有当前激活的数据集 (currentAtlas)
 *   2. 从数据集派生视图层所需的常量 (FACTION_COLOR / FACTION_NAME / ERA_START / ERA_END)
 *   3. 提供自动传入当前 atlas 的辅助函数包装
 *   4. 提供 switchAtlas() 切换数据集
 *
 * 视图层其余模块只需 import { current, FACTION_COLOR, ... } 即可，
 * 无需感知数据集切换的细节。
 * ========================================================================= */

import {
  ATLAS_MANIFEST,
  getPerson as _getPerson, getFaction as _getFaction, getPlace as _getPlace,
  getRelationsOf as _getRelationsOf,
  getPersonCoord as _getPersonCoord, getEventCoord as _getEventCoord,
  getPersonPositionAtYear as _getPersonPositionAtYear, getPersonImage as _getPersonImage,
  getPersonImportance as _getPersonImportance, getEventImportance as _getEventImportance,
  getBirthplaceModern as _getBirthplaceModern,
} from '../data/index.js';

import { resetFilters, setDomains } from './state.js';

/* ---------- 当前数据集（懒加载） ---------- */
let currentAtlas = null;
const atlasCache = new Map();   // id → 已加载的 atlas 对象

export function current() { return currentAtlas; }
export function manifest() { return ATLAS_MANIFEST; }
/** 当前数据集对应的 manifest 条目（含 nameEn/subtitleEn 等元信息） */
export function currentMeta() {
  if (!currentAtlas) return null;
  return ATLAS_MANIFEST.find(m => m.id === currentAtlas.id) || null;
}

/* ---------- 从数据集派生的常量 ---------- */
export let FACTION_COLOR = {};
export let FACTION_NAME = {};
export let ERA_START = 0;
export let ERA_END = 0;

/** 解析 era 字符串（兼容旧数据 & 公元前），如 '前2070–前256' / '184–280' */
function parseEraPart(str) {
  const s = str.trim();
  const neg = /^前/.test(s) || /BCE|BC/i.test(s);
  const num = parseInt(s.replace(/[^0-9]/g, ''), 10);
  return neg ? -num : num;
}

function refreshConstants() {
  const atlas = currentAtlas;
  FACTION_COLOR = {};
  FACTION_NAME = {};
  atlas.factions.forEach(f => {
    FACTION_COLOR[f.id] = f.color;
    FACTION_NAME[f.id] = f.name;
  });

  // 年代：优先用数值 startYear/endYear（支持公元前负数），回退解析 era 字符串
  if (typeof atlas.startYear === 'number' && typeof atlas.endYear === 'number') {
    ERA_START = atlas.startYear;
    ERA_END = atlas.endYear;
  } else if (typeof atlas.era === 'string') {
    const [s, e] = atlas.era.split(/[–—-]/);
    ERA_START = parseEraPart(s);
    ERA_END = parseEraPart(e);
  }

  // 领域下放到数据集
  setDomains(atlas.domains);
  // 重置与数据集相关的过滤状态（依赖上面刷新后的 DOMAINS）
  resetFilters();
}

/* ---------- 加载 / 初始化 ---------- */
async function loadAtlas(meta) {
  if (atlasCache.has(meta.id)) return atlasCache.get(meta.id);
  const atlas = await meta.load();
  atlasCache.set(meta.id, atlas);
  return atlas;
}

/* F2 预加载：浏览器空闲时预先拉取其他数据集，切换时秒开。
 * - 首次切换到该 atlas 时走动态 import()；
 * - 我们用 requestIdleCallback 串行预拉所有 atlas，失败静默（首屏未触发的失败留给真实切换时报）。
 * - 已缓存的会被跳过，重复调用安全。 */
let preloadStarted = false;
export function preloadAllAtlases() {
  if (preloadStarted) return;
  preloadStarted = true;
  const queue = [...ATLAS_MANIFEST];
  const schedule = () => {
    const rc = window.requestIdleCallback || ((fn) => setTimeout(fn, 200));
    rc(async () => {
      while (queue.length) {
        const meta = queue.shift();
        if (!atlasCache.has(meta.id)) {
          try { await loadAtlas(meta); } catch { /* 静默；真正切换时再暴露错误 */ }
        }
      }
    });
  };
  schedule();
}

/** 首屏初始化：加载指定 id（缺省清单第一个）的数据集 */
export async function initAtlas(preferredId) {
  const meta = ATLAS_MANIFEST.find(a => a.id === preferredId) || ATLAS_MANIFEST[0];
  currentAtlas = await loadAtlas(meta);
  refreshConstants();
  return currentAtlas;
}

/* ---------- C6 本地数据集导入（运行时注入 manifest） ----------
 * 用户在前端拖入符合 schema 的 JSON 对象，运行时注册一条 manifest 项。
 *   registerLocalAtlas({id, name, ...}) → 返回注入的 manifest entry。
 * 同 id 已存在会抛错。注入后立即可被 switchAtlas / 全局搜索使用。 */
export function registerLocalAtlas(atlasObj, meta = {}) {
  if (!atlasObj || !atlasObj.id) throw new Error('atlas.id 缺失');
  if (ATLAS_MANIFEST.some(m => m.id === atlasObj.id)) {
    throw new Error(`数据集 id "${atlasObj.id}" 已存在`);
  }
  const entry = {
    id: atlasObj.id,
    name: meta.name || atlasObj.name || atlasObj.id,
    nameEn: meta.nameEn || atlasObj.name || atlasObj.id,
    subtitle: meta.subtitle || atlasObj.subtitle || '本地导入数据集',
    subtitleEn: meta.subtitleEn || meta.subtitle || atlasObj.subtitle || 'Locally imported atlas',
    group: meta.group || '本地数据集',
    groupEn: meta.groupEn || 'Local',
    startYear: atlasObj.startYear,
    endYear: atlasObj.endYear,
    load: () => Promise.resolve(atlasObj),
    stats: {
      persons: (atlasObj.persons || []).length,
      events: (atlasObj.events || []).length,
      factions: (atlasObj.factions || []).length,
      places: (atlasObj.places || []).length,
    },
    _local: true,
  };
  ATLAS_MANIFEST.push(entry);
  atlasCache.set(entry.id, atlasObj);
  return entry;
}

/* ---------- 辅助函数包装：自动传入当前 atlas ---------- */
export function getPerson(id)             { return _getPerson(id, currentAtlas); }
export function getFaction(id)            { return _getFaction(id, currentAtlas); }
export function getPlace(id)              { return _getPlace(id, currentAtlas); }
export function getRelationsOf(id)        { return _getRelationsOf(id, currentAtlas); }
export function getPersonCoord(p)         { return _getPersonCoord(p, currentAtlas); }
export function getEventCoord(e)          { return _getEventCoord(e, currentAtlas); }
export function getPersonPositionAtYear(p, y) { return _getPersonPositionAtYear(p, y, currentAtlas); }
export function getPersonImage(id)        { return _getPersonImage(id, currentAtlas); }
export function getPersonImportance(id)   { return _getPersonImportance(id, currentAtlas); }
export function getEventImportance(id)    { return _getEventImportance(id, currentAtlas); }
export function getBirthplaceModern(bp)   { return _getBirthplaceModern(bp, currentAtlas); }

/* ---------- 切换数据集 ---------- */

/** 切换回调列表 —— app.js 会注册 UI 刷新回调 */
const switchCallbacks = [];
export function onSwitch(fn) { switchCallbacks.push(fn); }

/** 切换数据集：懒加载目标数据集、刷新常量、通知回调 */
export async function switchAtlas(atlasId) {
  const meta = ATLAS_MANIFEST.find(a => a.id === atlasId);
  if (!meta || (currentAtlas && meta.id === currentAtlas.id)) return;

  currentAtlas = await loadAtlas(meta);
  refreshConstants();

  for (const fn of switchCallbacks) fn(currentAtlas);
}

/* ---------- 全局人物索引（跨数据集搜索用） ----------
 * 首次调用时遍历 manifest 加载所有数据集并构建扁平索引，后续走缓存。
 * 返回 [{ atlasId, atlasName, personId, name, courtesy, alias, factionName, birth, death }] */
let globalPersonIndex = null;
let globalIndexPromise = null;
export async function getGlobalPersonIndex() {
  if (globalPersonIndex) return globalPersonIndex;
  if (globalIndexPromise) return globalIndexPromise;
  globalIndexPromise = (async () => {
    const idx = [];
    for (const meta of ATLAS_MANIFEST) {
      const atlas = await loadAtlas(meta);
      const factionName = id => (atlas.factions.find(f => f.id === id) || {}).name || '';
      for (const p of atlas.persons) {
        // 收集该人物参与的事件领域（用于 F13 domain: 搜索）
        const domainsSet = new Set();
        for (const ev of atlas.events || []) {
          if (ev.participants && ev.participants.includes(p.id) && ev.domain) {
            domainsSet.add(ev.domain);
          }
        }
        idx.push({
          atlasId: atlas.id, atlasName: atlas.name, atlasNameEn: meta.nameEn || atlas.name,
          group: meta.group, groupEn: meta.groupEn || meta.group,
          personId: p.id, name: p.name,
          courtesy: p.courtesy || '', alias: p.alias || [],
          factionName: factionName(p.faction),
          domains: [...domainsSet],
          birth: p.birth, death: p.death,
        });
      }
    }
    globalPersonIndex = idx;
    return idx;
  })();
  return globalIndexPromise;
}
