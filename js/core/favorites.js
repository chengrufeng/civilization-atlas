/* =========================================================================
 * F8 最近浏览 / 收藏（localStorage 持久化）
 *
 *   - 最近浏览：打开人物详情自动入栈，最多 8 条，去重，LRU
 *   - 收藏：详情面板 ☆ 按钮手动切换，无上限
 *
 *  数据形态：{ atlas, id, name, ts } —— 不存整 person 对象，避免数据集
 *  变动后残留旧字段；展示时按 atlas/id 实时取最新数据。
 * ========================================================================= */

const RECENT_KEY = 'atlas.recent.v1';
const FAV_KEY = 'atlas.favorites.v1';
const RECENT_MAX = 8;

function read(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

function write(key, list) {
  try { localStorage.setItem(key, JSON.stringify(list)); } catch {}
  notify(key);
}

const listeners = new Set();
function notify(key) { listeners.forEach(fn => fn(key)); }

/* ---------- 最近浏览 ---------- */

export function getRecent() { return read(RECENT_KEY); }

export function pushRecent(person) {
  if (!person?.id || !person?.atlas) return;
  const list = read(RECENT_KEY).filter(x => !(x.atlas === person.atlas && x.id === person.id));
  list.unshift({ atlas: person.atlas, id: person.id, name: person.name, ts: Date.now() });
  write(RECENT_KEY, list.slice(0, RECENT_MAX));
}

export function clearRecent() { write(RECENT_KEY, []); }

/* ---------- 收藏 ---------- */

export function getFavorites() { return read(FAV_KEY); }

export function isFavorite(atlas, id) {
  return read(FAV_KEY).some(x => x.atlas === atlas && x.id === id);
}

export function toggleFavorite(person) {
  if (!person?.id || !person?.atlas) return false;
  const list = read(FAV_KEY);
  const idx = list.findIndex(x => x.atlas === person.atlas && x.id === person.id);
  let nowFav;
  if (idx >= 0) { list.splice(idx, 1); nowFav = false; }
  else { list.unshift({ atlas: person.atlas, id: person.id, name: person.name, ts: Date.now() }); nowFav = true; }
  write(FAV_KEY, list);
  return nowFav;
}

export function removeFavorite(atlas, id) {
  const list = read(FAV_KEY).filter(x => !(x.atlas === atlas && x.id === id));
  write(FAV_KEY, list);
}

/* ---------- 订阅 ---------- */

export function onChange(fn) { listeners.add(fn); }
