/* =========================================================================
 * URL 状态同步：把当前 atlas / year / person 写入地址栏，支持分享直达。
 *   ?atlas=rome&year=-50&person=caesar
 * E7 扩展参数（v7）：
 *   ?journey=caesar        打开即播人生回放
 *   ?search=政治            填入搜索框并触发检索
 *   ?compare=a,b,c          预选 2-3 人物并打开并排对比
 * 读取：readUrlState()  写入：syncUrlState({...})
 * ========================================================================= */

import { ATLAS_MANIFEST } from '../data/index.js';

export function readUrlState() {
  const p = new URLSearchParams(location.search);
  const atlas = p.get('atlas');
  const yearStr = p.get('year');
  const person = p.get('person');
  const journey = p.get('journey');
  const search = p.get('search');
  const compareRaw = p.get('compare');
  const year = yearStr !== null ? parseInt(yearStr, 10) : null;
  const validAtlas = atlas && ATLAS_MANIFEST.some(m => m.id === atlas) ? atlas : null;
  const compare = compareRaw
    ? compareRaw.split(',').map(s => s.trim()).filter(Boolean).slice(0, 3)
    : [];
  return {
    atlas: validAtlas,
    year: Number.isFinite(year) ? year : null,
    person: person || null,
    journey: journey || null,
    search: search || null,
    compare,
  };
}

let suppress = false;
/** 写入 URL；传入的字段才会被保留，其余从当前 URL 继承。
 *  传 null/undefined 表示清除该字段。 */
export function syncUrlState({ atlas, year, person, journey, search, compare } = {}) {
  if (suppress) return;
  const cur = new URLSearchParams(location.search);
  const set = (key, val) => {
    if (val === null || val === undefined || val === '') cur.delete(key);
    else cur.set(key, val);
  };
  if (atlas !== undefined) set('atlas', atlas);
  if (year !== undefined) set('year', Number.isFinite(year) ? String(year) : '');
  if (person !== undefined) set('person', person);
  if (journey !== undefined) set('journey', journey);
  if (search !== undefined) set('search', search);
  if (compare !== undefined) set('compare', Array.isArray(compare) ? compare.join(',') : '');
  const qs = cur.toString();
  const newUrl = (qs ? '?' + qs : '') + location.hash;
  if (newUrl !== (location.search + location.hash)) {
    history.replaceState(null, '', newUrl);
  }
}

/** 临时挂起同步（避免在初始化时反复写 URL） */
export function withUrlSuppressed(fn) {
  const prev = suppress;
  suppress = true;
  try { return fn(); }
  finally { suppress = prev; }
}
