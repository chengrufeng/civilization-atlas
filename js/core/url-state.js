/* =========================================================================
 * URL 状态同步：把当前 atlas / year / person 写入地址栏，支持分享直达。
 *   ?atlas=rome&year=-50&person=caesar
 * 读取：readUrlState()  写入：syncUrlState({...})
 * ========================================================================= */

import { ATLAS_MANIFEST } from '../data/index.js';

export function readUrlState() {
  const p = new URLSearchParams(location.search);
  const atlas = p.get('atlas');
  const yearStr = p.get('year');
  const person = p.get('person');
  const year = yearStr !== null ? parseInt(yearStr, 10) : null;
  const validAtlas = atlas && ATLAS_MANIFEST.some(m => m.id === atlas) ? atlas : null;
  return {
    atlas: validAtlas,
    year: Number.isFinite(year) ? year : null,
    person: person || null,
  };
}

let suppress = false;
export function syncUrlState({ atlas, year, person } = {}) {
  if (suppress) return;
  const p = new URLSearchParams();
  if (atlas) p.set('atlas', atlas);
  if (year !== null && year !== undefined && Number.isFinite(year)) p.set('year', String(year));
  if (person) p.set('person', person);
  const qs = p.toString();
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
