/* =========================================================================
 * 华夏人物图鉴 · 全局状态
 *
 * 整个应用唯一的可变状态对象，所有模块通过 import { state } 读写。
 * ========================================================================= */

/* ---------- 事件领域（可被数据集覆盖） ----------
 * 每个数据集可通过 atlas.domains 提供自己的领域列表：
 *   domains: [{ name: '宗教', color: '#8a6d3b' }, ...]
 * 未提供时回退到下面的默认领域。切换数据集时由 setDomains() 更新。 */
export const DEFAULT_DOMAINS = [
  { name: '军事', color: '#b23a2e' }, { name: '政治', color: '#2f5d8a' },
  { name: '文学', color: '#7b4b94' }, { name: '科技', color: '#2d8a6e' },
  { name: '外交', color: '#b8893a' }, { name: '文化', color: '#8a6d3b' },
];

export let DOMAINS = DEFAULT_DOMAINS.map(d => d.name);
export let DOMAIN_COLOR = Object.fromEntries(DEFAULT_DOMAINS.map(d => [d.name, d.color]));
export let DOMAIN_ORDER = [...DOMAINS];

/** 用数据集的领域列表刷新全局领域常量（切换数据集时调用） */
export function setDomains(list) {
  const arr = (Array.isArray(list) && list.length) ? list : DEFAULT_DOMAINS;
  DOMAINS = arr.map(d => d.name);
  DOMAIN_COLOR = Object.fromEntries(arr.map(d => [d.name, d.color]));
  DOMAIN_ORDER = [...DOMAINS];
}

/* ---------- 年份格式化（支持公元前，用负数表示） ---------- */
/** 紧凑年份：负数→"前259"，正数→"259" */
export function formatYearShort(y) {
  return y < 0 ? `前${-y}` : `${y}`;
}
/** 带"年"后缀：负数→"前259年"，正数→"259年" */
export function formatYear(y) {
  return `${formatYearShort(y)}年`;
}

/* 标签朝向 → tooltip 像素偏移 */
export const LABEL_OFFSET = {
  right: [12, 0], left: [-12, 0], top: [0, -14], bottom: [0, 14],
};

export const state = {
  map: null,
  factionFilter: 'all',
  layers: { persons: true, events: true, capitals: true },
  domainFilter: new Set(DOMAINS),
  collapsedDomains: new Set(),
  expandedEvent: null,
  yearFilter: null,
  selectedPerson: null,
  highlightedPersons: new Set(),
  eventFocus: null,
  playing: false,
  playTimer: null,
  detailClosedByUser: false,
  autoTrack: true,
  // Leaflet 图层组
  layerPersons: null, layerEvents: null, layerCapitals: null,
  layerRelations: null, layerTrajectory: null,
  // 标记索引（personId → marker）
  personMarkers: new Map(),
};

/** 重置与数据集相关的过滤状态（切换数据集时调用） */
export function resetFilters() {
  state.factionFilter = 'all';
  state.domainFilter = new Set(DOMAINS);
  state.collapsedDomains.clear();
  state.expandedEvent = null;
  state.yearFilter = null;
  state.selectedPerson = null;
  state.highlightedPersons.clear();
  state.eventFocus = null;
  state.personMarkers.clear();
}

/** [lng, lat] → [lat, lng] (Leaflet 用 [lat, lng]) */
export function ll(coord) { return [coord[1], coord[0]]; }
