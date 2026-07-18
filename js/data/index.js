/* =========================================================================
 * 华夏人物图鉴 · 数据层入口
 *
 * 职责：
 *   1. 通过 ATLAS_MANIFEST 声明所有数据集（懒加载）
 *   2. 提供统一的辅助函数，自动按当前 atlas 查询
 *
 * 统一数据模型：
 *   Person:   { id, name, courtesy, alias[], faction, birth, death,
 *               birthPlace, title, roles[], avatar(char), bio,
 *               events: [{ year, place, desc }] }
 *   Relation: { source, target, type, label, year? }
 *   Event:    { id, name, year, domain, location, desc, participants[] }
 *   Faction:  { id, name, color, founded, capital, capitalFrom, desc }
 *   Place:    { id, name, modern, coord:[lng,lat], note }
 *
 * AtlasSet 扩展字段：
 *   startYear/endYear: 数值年份，公元前用负数（如 -2070）。取代旧的 era 字符串
 *   domains:         [{ name, color }] 事件领域（不同文明可不同），缺省用默认领域
 *   mapView:         { center:[lng,lat], zoom, minZoom, maxZoom } 该数据集的地图视角
 *   importance:      { getPersonImportance(id)→1|2|3, getEventImportance(id)→1|2|3 }
 *   birthplaceModern:{ 出生地→现代地名 }
 *   birthplaceCoords:{ 出生地→[lng,lat] }
 *   personImages:    { 人物id→Wikimedia肖像URL }
 *   timelineTicks:   [关键年份...]
 *
 * 扩展方式（支持分组 + 懒加载）：
 *   1. 在 data/ 下新增 xxx.js，导出 atlas 对象（含 startYear/endYear/mapView/domains）
 *   2. 在下面的 ATLAS_MANIFEST 增加一条：
 *      { id, name, subtitle, group, load: () => import('./xxx.js').then(m => m.xxxAtlas) }
 *   数据文件仅在首次切换到该数据集时才通过动态 import 加载，首屏只加载默认数据集。
 * ========================================================================= */

/* ---------- 数据集清单（轻量元数据 + 懒加载入口） ----------
 * group 用于切换器分组显示，例如「中华文明」「世界文明」。 */
export const ATLAS_MANIFEST = [
  { id: 'sandai',    name: '夏商周',     subtitle: '上古三代 · 家国之始（约前2100–前771年）', group: '中华文明', startYear: -2100, endYear: -771,   load: () => import('./sandai.js').then(m => m.sandaiAtlas) },
  { id: 'chunqiu',   name: '春秋战国',   subtitle: '诸侯争霸 · 百家争鸣（前770–前221年）',   group: '中华文明', startYear: -770,  endYear: -221,   load: () => import('./chunqiu.js').then(m => m.chunqiuAtlas) },
  { id: 'qinhan',    name: '秦汉',       subtitle: '大一统之始（前221–220年）',              group: '中华文明', startYear: -221,  endYear: 220,    load: () => import('./qinhan.js').then(m => m.qinhanAtlas) },
  { id: 'sui',        name: '隋',         subtitle: '终结分裂 · 科举运河之始（581–618年）',     group: '中华文明', startYear: 581,   endYear: 618,    load: () => import('./sui.js').then(m => m.suiAtlas) },
  { id: 'sanguo',    name: '三国人物志', subtitle: '东汉末年 · 三国鼎立（184–280年）',         group: '中华文明', startYear: 184,   endYear: 280,    load: () => import('./sanguo.js').then(m => m.sanguoAtlas) },
  { id: 'jinnanbei', name: '两晋南北朝', subtitle: '南北分立 · 胡汉融合（265–589年）',         group: '中华文明', startYear: 265,   endYear: 589,    load: () => import('./jinnanbei.js').then(m => m.jinnanbeiAtlas) },
  { id: 'tangsong',  name: '唐宋人物志', subtitle: '盛唐气象 · 文治天下（618–1279年）',         group: '中华文明', startYear: 618,   endYear: 1279,   load: () => import('./tangsong.js').then(m => m.tangsongAtlas) },
  { id: 'wudai',     name: '五代十国',   subtitle: '乱世烽烟 · 词帝悲歌（907–979年）',         group: '中华文明', startYear: 907,   endYear: 979,    load: () => import('./wudai.js').then(m => m.wudaiAtlas) },
  { id: 'yuan',      name: '元',         subtitle: '草原帝国 · 大一统（1206–1368年）',         group: '中华文明', startYear: 1206,  endYear: 1368,   load: () => import('./yuan.js').then(m => m.yuanAtlas) },
  { id: 'ming',      name: '明',         subtitle: '远洋汉典 · 海禁沧桑（1368–1644年）',       group: '中华文明', startYear: 1368,  endYear: 1644,   load: () => import('./ming.js').then(m => m.mingAtlas) },
  { id: 'qing',      name: '清',         subtitle: '天朝余晖 · 三千年未有之变（1616–1912年）', group: '中华文明', startYear: 1616,  endYear: 1912,   load: () => import('./qing.js').then(m => m.qingAtlas) },
  { id: 'jinxiandai',name: '近现代',     subtitle: '从鸦片战争到新中国（1840–1949年）',         group: '中华文明', startYear: 1840,  endYear: 1949,   load: () => import('./jinxiandai.js').then(m => m.jinxiandaiAtlas) },
  /* ----- 世界文明 ----- */
  { id: 'mesopotamia', name: '两河文明', subtitle: '文明的摇篮（约前3500–前539年）',             group: '世界文明', startYear: -3500, endYear: -539,  load: () => import('./mesopotamia.js').then(m => m.mesopotamiaAtlas) },
  { id: 'egypt',       name: '古埃及',   subtitle: '尼罗河的礼物（约前3100–前30年）',            group: '世界文明', startYear: -3100, endYear: -30,   load: () => import('./egypt.js').then(m => m.egyptAtlas) },
  { id: 'persia',      name: '波斯',     subtitle: '从居鲁士到纳迪尔沙（前559–1736年）',          group: '世界文明', startYear: -559,  endYear: 1736,  load: () => import('./persia.js').then(m => m.persiaAtlas) },
  { id: 'india',       name: '印度文明', subtitle: '佛陀与莫卧儿（前1500–1857年）',              group: '世界文明', startYear: -1500, endYear: 1857,  load: () => import('./india.js').then(m => m.indiaAtlas) },
  { id: 'greece',      name: '古希腊',   subtitle: '城邦·民主·哲学（约前800–前146年）',          group: '世界文明', startYear: -800,  endYear: -146,  load: () => import('./greece.js').then(m => m.greeceAtlas) },
  { id: 'rome',        name: '古罗马',   subtitle: '从七丘到永恒之城（前753–476年）',             group: '世界文明', startYear: -753,  endYear: 476,   load: () => import('./rome.js').then(m => m.romeAtlas) },
  { id: 'medieval_eu', name: '中世纪欧洲',subtitle: '信仰与剑（476–1453年）',                     group: '世界文明', startYear: 476,   endYear: 1453,  load: () => import('./medieval_eu.js').then(m => m.medieval_euAtlas) },
  { id: 'pre_columbian',name:'前哥伦布美洲',subtitle: '玛雅·阿兹特克·印加（前2000–1532年）',     group: '世界文明', startYear: -2000, endYear: 1532,  load: () => import('./pre_columbian.js').then(m => m.pre_columbianAtlas) },
  { id: 'renaissance', name: '文艺复兴与大航海', subtitle: '人文复兴 · 海洋开拓（1400–1600年）', group: '世界文明', startYear: 1400,  endYear: 1600,  load: () => import('./renaissance.js').then(m => m.renaissanceAtlas) },
  { id: 'japan',       name: '日本文明', subtitle: '大和·幕府·浮世（前660–1868年）',             group: '世界文明', startYear: -660,  endYear: 1868,  load: () => import('./japan.js').then(m => m.japanAtlas) },
  { id: 'enlightenment',name:'近代',     subtitle: '启蒙 · 革命 · 工业（1600–1900年）',           group: '世界文明', startYear: 1600,  endYear: 1900,  load: () => import('./enlightenment.js').then(m => m.enlightenmentAtlas) },
];

/* ---------- 通用辅助函数 ---------- */

/* 重要性工厂：新数据集只需提供 id→等级(1/2/3) 映射，无需手写函数。
 *   importance: makeImportance({
 *     personRank: { liubei: 1, guanyu: 2 },   // 未列出者用 defaultPerson
 *     eventRank:  { e1: 1 },
 *   })
 * 等级含义：1=核心（低缩放即显示），2=重要，3=一般（高缩放才显示）。 */
export function makeImportance({ personRank = {}, eventRank = {}, defaultPerson = 3, defaultEvent = 3 } = {}) {
  return {
    getPersonImportance: id => personRank[id] || defaultPerson,
    getEventImportance: id => eventRank[id] || defaultEvent,
  };
}

export function getPerson(id, atlas) {
  return atlas.persons.find(p => p.id === id);
}

export function getFaction(id, atlas) {
  return atlas.factions.find(f => f.id === id);
}

export function getPlace(id, atlas) {
  return atlas.places.find(p => p.id === id);
}

export function getRelationsOf(id, atlas) {
  return atlas.relations.filter(r => r.source === id || r.target === id);
}

/* ---------- 重要性分级（委托给数据集自带函数） ---------- */
export function getPersonImportance(personId, atlas) {
  return atlas.importance.getPersonImportance(personId);
}

export function getEventImportance(eventId, atlas) {
  return atlas.importance.getEventImportance(eventId);
}

/* ---------- 人物地理坐标查找 ---------- */
export function getBirthplaceModern(birthPlace, atlas) {
  return (atlas.birthplaceModern || {})[birthPlace] || '';
}

export function getPersonImage(personId, atlas) {
  return (atlas.personImages || {})[personId] || null;
}

export function getPersonCoord(person, atlas) {
  if (person.coord) return person.coord;
  const bpTable = atlas.birthplaceCoords || {};
  if (bpTable[person.birthPlace]) return bpTable[person.birthPlace];
  const place = atlas.places.find(p => p.name === person.birthPlace);
  if (place) return place.coord;
  if (person.events && person.events.length > 0) {
    const evPlace = atlas.places.find(p => p.name === person.events[0].place);
    if (evPlace) return evPlace.coord;
  }
  return null;
}

export function getEventCoord(event, atlas) {
  const place = atlas.places.find(p => p.name === event.location);
  return place ? place.coord : null;
}

/* 获取人物在特定年份的地图位置：
 *   - 无年份(null)：返回出生地
 *   - 有年份：返回该年最近一次事件发生的地点
 *   - 无事件：返回出生地
 */
export function getPersonPositionAtYear(person, year, atlas) {
  if (year === null || year === undefined) return getPersonCoord(person, atlas);
  const events = (person.events || [])
    .filter(e => e.year <= year)
    .sort((a, b) => b.year - a.year);
  if (events.length === 0) return getPersonCoord(person, atlas);
  const place = atlas.places.find(p => p.name === events[0].place);
  return place ? place.coord : getPersonCoord(person, atlas);
}
