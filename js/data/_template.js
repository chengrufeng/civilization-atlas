/* =========================================================================
 * 数据集模板（参考用，不注册到 ATLAS_MANIFEST）
 *
 * 复制本文件为 js/data/<id>.js，改名并填充数据即可新增一个数据集。
 * 然后在 js/data/index.js 的 ATLAS_MANIFEST 追加：
 *   { id, name, subtitle, group, load: () => import('./<id>.js').then(m => m.<id>Atlas) }
 *
 * 约定：
 *   - 坐标一律 [经度, 纬度] = [lng, lat]
 *   - 年份为整数，公元前用负数（如 -221 表示公元前221年）
 *   - domains 可自定义（不同文明领域不同），缺省用系统默认六领域
 *   - 校验：node tools/validate.mjs <id>   冒烟：node tools/smoke.mjs <id>
 * ========================================================================= */

import { makeImportance } from './index.js';

/* ---------- 势力 / 朝代 / 文明单元 ---------- */
const FACTIONS = [
  { id: 'a', name: '示例国', color: '#4a7c59', founded: -400, capital: '示例都', capitalFrom: -400, desc: '示例势力说明' },
  { id: 'b', name: '对手国', color: '#b23a2e', founded: -390, capital: '对手都', capitalFrom: -390, desc: '示例势力说明' },
];

/* ---------- 地点（坐标载体） ---------- */
const PLACES = [
  { id: 'p1', name: '示例都', modern: '现代地名', coord: [114.0, 34.0], note: '' },
  { id: 'p2', name: '对手都', modern: '现代地名', coord: [117.0, 36.0], note: '' },
  { id: 'p3', name: '战场', modern: '现代地名', coord: [115.5, 35.0], note: '' },
];

/* ---------- 人物 ---------- */
const PERSONS = [
  {
    id: 'hero', name: '示例君', courtesy: '子示', alias: [], faction: 'a',
    birth: -380, death: -320, birthPlace: '示例都', title: '国君', roles: ['君主'],
    avatar: '示', bio: '示例人物生平。',
    events: [
      { year: -360, place: '示例都', desc: '即位' },
      { year: -340, place: '战场', desc: '大胜对手国' },
    ],
  },
  {
    id: 'rival', name: '对手君', courtesy: '子对', alias: [], faction: 'b',
    birth: -375, death: -330, birthPlace: '对手都', title: '国君', roles: ['君主'],
    avatar: '对', bio: '示例对手生平。',
    events: [
      { year: -340, place: '战场', desc: '战败' },
    ],
  },
];

/* ---------- 关系 ---------- */
const RELATIONS = [
  { source: 'hero', target: 'rival', type: '敌对', label: '争霸', year: -345 },
];

/* ---------- 事件 ---------- */
const EVENTS = [
  { id: 'e1', name: '示例之战', year: -340, domain: '军事', location: '战场',
    desc: '示例事件说明。', participants: ['hero', 'rival'] },
  { id: 'e2', name: '示例变法', year: -355, domain: '政治', location: '示例都',
    desc: '示例事件说明。', participants: ['hero'] },
];

/* ---------- 组装数据集 ---------- */
export const templateAtlas = {
  id: 'template',
  name: '示例数据集',
  subtitle: '模板演示（公元前400–前300年）',
  startYear: -400,
  endYear: -300,
  // 地图视角：center 用 [lng,lat]；世界数据集常需较低 zoom 与卫星底图
  mapView: {
    center: [115, 35], zoom: 6, minZoom: 3, maxZoom: 12,
    labelZoom: { hideAll: 4, hideEvents: 8 },
    importanceZoom: [6, 8],
    cityZoom: 6,
    baseLayer: 'satellite',
  },
  // 领域可自定义；此处沿用默认之一部分作演示
  domains: [
    { name: '军事', color: '#b23a2e' },
    { name: '政治', color: '#2f5d8a' },
  ],
  factions: FACTIONS,
  places: PLACES,
  persons: PERSONS,
  relations: RELATIONS,
  events: EVENTS,
  importance: makeImportance({
    personRank: { hero: 1, rival: 1 },
    eventRank: { e1: 1, e2: 2 },
  }),
  birthplaceModern: {},
  birthplaceCoords: {},
  personImages: {},
  timelineTicks: [-400, -360, -340, -300],
};
