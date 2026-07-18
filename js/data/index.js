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
  { id: 'sandai',    name: '夏商周',     nameEn: 'Three Dynasties', subtitle: '上古三代 · 家国之始（约前2100–前771年）', subtitleEn: 'The Three Dynasties (c.2100–771 BCE)', group: '中华文明', groupEn: 'Chinese Civilization', startYear: -2100, endYear: -771,   load: () => import('./sandai.js').then(m => m.sandaiAtlas), stats: { persons: 14, events: 14, factions: 3, places: 12 } },
  { id: 'chunqiu',   name: '春秋战国',   nameEn: 'Spring & Autumn · Warring States', subtitle: '诸侯争霸 · 百家争鸣（前770–前221年）', subtitleEn: 'Hegemony & Hundred Schools (770–221 BCE)', group: '中华文明', groupEn: 'Chinese Civilization', startYear: -770,  endYear: -221,   load: () => import('./chunqiu.js').then(m => m.chunqiuAtlas), stats: { persons: 21, events: 17, factions: 9, places: 22 } },
  { id: 'qinhan',    name: '秦汉',       nameEn: 'Qin & Han', subtitle: '大一统之始（前221–220年）', subtitleEn: 'First Unified Empire (221 BCE – 220 CE)', group: '中华文明', groupEn: 'Chinese Civilization', startYear: -221,  endYear: 220,    load: () => import('./qinhan.js').then(m => m.qinhanAtlas), stats: { persons: 21, events: 20, factions: 5, places: 16 } },
  { id: 'sui',        name: '隋',         nameEn: 'Sui', subtitle: '终结分裂 · 科举运河之始（581–618年）', subtitleEn: 'Reunification, Canal & Exams (581–618)', group: '中华文明', groupEn: 'Chinese Civilization', startYear: 581,   endYear: 618,    load: () => import('./sui.js').then(m => m.suiAtlas), stats: { persons: 14, events: 12, factions: 3, places: 11 } },
  { id: 'sanguo',    name: '三国人物志', nameEn: 'Three Kingdoms', subtitle: '东汉末年 · 三国鼎立（184–280年）', subtitleEn: 'Three Kingdoms (184–280)', group: '中华文明', groupEn: 'Chinese Civilization', startYear: 184,   endYear: 280,    load: () => import('./sanguo.js').then(m => m.sanguoAtlas), stats: { persons: 44, events: 39, factions: 4, places: 54 } },
  { id: 'jinnanbei', name: '两晋南北朝', nameEn: 'Jin & N/S Dynasties', subtitle: '南北分立 · 胡汉融合（265–589年）', subtitleEn: 'Division & Fusion (265–589)', group: '中华文明', groupEn: 'Chinese Civilization', startYear: 265,   endYear: 589,    load: () => import('./jinnanbei.js').then(m => m.jinnanbeiAtlas), stats: { persons: 20, events: 19, factions: 7, places: 13 } },
  { id: 'tangsong',  name: '唐宋人物志', nameEn: 'Tang & Song', subtitle: '盛唐气象 · 文治天下（618–1279年）', subtitleEn: 'Golden Age of Culture (618–1279)', group: '中华文明', groupEn: 'Chinese Civilization', startYear: 618,   endYear: 1279,   load: () => import('./tangsong.js').then(m => m.tangsongAtlas), stats: { persons: 47, events: 45, factions: 4, places: 95 } },
  { id: 'wudai',     name: '五代十国',   nameEn: 'Five Dynasties', subtitle: '乱世烽烟 · 词帝悲歌（907–979年）', subtitleEn: 'Fragmentation (907–979)', group: '中华文明', groupEn: 'Chinese Civilization', startYear: 907,   endYear: 979,    load: () => import('./wudai.js').then(m => m.wudaiAtlas), stats: { persons: 11, events: 13, factions: 7, places: 9 } },
  { id: 'yuan',      name: '元',         nameEn: 'Yuan', subtitle: '草原帝国 · 大一统（1206–1368年）', subtitleEn: 'Mongol Empire (1206–1368)', group: '中华文明', groupEn: 'Chinese Civilization', startYear: 1206,  endYear: 1368,   load: () => import('./yuan.js').then(m => m.yuanAtlas), stats: { persons: 18, events: 20, factions: 4, places: 17 } },
  { id: 'ming',      name: '明',         nameEn: 'Ming', subtitle: '远洋汉典 · 海禁沧桑（1368–1644年）', subtitleEn: 'Voyages & Isolation (1368–1644)', group: '中华文明', groupEn: 'Chinese Civilization', startYear: 1368,  endYear: 1644,   load: () => import('./ming.js').then(m => m.mingAtlas), stats: { persons: 21, events: 21, factions: 4, places: 23 } },
  { id: 'qing',      name: '清',         nameEn: 'Qing', subtitle: '天朝余晖 · 三千年未有之变（1616–1912年）', subtitleEn: 'Last Empire (1616–1912)', group: '中华文明', groupEn: 'Chinese Civilization', startYear: 1616,  endYear: 1912,   load: () => import('./qing.js').then(m => m.qingAtlas), stats: { persons: 22, events: 20, factions: 5, places: 20 } },
  { id: 'jinxiandai',name: '近现代',     nameEn: 'Modern China', subtitle: '从鸦片战争到新中国（1840–1949年）', subtitleEn: 'Opium War to PRC (1840–1949)', group: '中华文明', groupEn: 'Chinese Civilization', startYear: 1840,  endYear: 1949,   load: () => import('./jinxiandai.js').then(m => m.jinxiandaiAtlas), stats: { persons: 18, events: 20, factions: 5, places: 19 } },
  /* ----- 世界文明 ----- */
  { id: 'mesopotamia', name: '两河文明', nameEn: 'Mesopotamia', subtitle: '文明的摇篮（约前3500–前539年）', subtitleEn: 'Cradle of Civilization (c.3500–539 BCE)', group: '世界文明', groupEn: 'World Civilizations', startYear: -3500, endYear: -539,  load: () => import('./mesopotamia.js').then(m => m.mesopotamiaAtlas), stats: { persons: 14, events: 15, factions: 4, places: 12 } },
  { id: 'egypt',       name: '古埃及',   nameEn: 'Ancient Egypt', subtitle: '尼罗河的礼物（约前3100–前30年）', subtitleEn: 'Gift of the Nile (c.3100–30 BCE)', group: '世界文明', groupEn: 'World Civilizations', startYear: -3100, endYear: -30,   load: () => import('./egypt.js').then(m => m.egyptAtlas), stats: { persons: 14, events: 15, factions: 4, places: 15 } },
  { id: 'persia',      name: '波斯',     nameEn: 'Persia', subtitle: '从居鲁士到纳迪尔沙（前559–1736年）', subtitleEn: 'Cyrus to Nader Shah (559 BCE – 1736 CE)', group: '世界文明', groupEn: 'World Civilizations', startYear: -559,  endYear: 1736,  load: () => import('./persia.js').then(m => m.persiaAtlas), stats: { persons: 15, events: 15, factions: 5, places: 13 } },
  { id: 'india',       name: '印度文明', nameEn: 'India', subtitle: '佛陀与莫卧儿（前1500–1857年）', subtitleEn: 'Buddha to Mughals (1500 BCE – 1857 CE)', group: '世界文明', groupEn: 'World Civilizations', startYear: -1500, endYear: 1857,  load: () => import('./india.js').then(m => m.indiaAtlas), stats: { persons: 14, events: 15, factions: 5, places: 12 } },
  { id: 'greece',      name: '古希腊',   nameEn: 'Ancient Greece', subtitle: '城邦·民主·哲学（约前800–前146年）', subtitleEn: 'Polis · Democracy · Philosophy (c.800–146 BCE)', group: '世界文明', groupEn: 'World Civilizations', startYear: -800,  endYear: -146,  load: () => import('./greece.js').then(m => m.greeceAtlas), stats: { persons: 16, events: 14, factions: 5, places: 16 } },
  { id: 'rome',        name: '古罗马',   nameEn: 'Ancient Rome', subtitle: '从七丘到永恒之城（前753–476年）', subtitleEn: 'Seven Hills to Eternal City (753 BCE – 476 CE)', group: '世界文明', groupEn: 'World Civilizations', startYear: -753,  endYear: 476,   load: () => import('./rome.js').then(m => m.romeAtlas), stats: { persons: 19, events: 23, factions: 4, places: 15 } },
  { id: 'medieval_eu', name: '中世纪欧洲',nameEn: 'Medieval Europe', subtitle: '信仰与剑（476–1453年）', subtitleEn: 'Faith & Sword (476–1453)', group: '世界文明', groupEn: 'World Civilizations', startYear: 476,   endYear: 1453,  load: () => import('./medieval_eu.js').then(m => m.medieval_euAtlas), stats: { persons: 18, events: 18, factions: 5, places: 20 } },
  { id: 'pre_columbian',name:'前哥伦布美洲',nameEn:'Pre-Columbian Americas', subtitle: '玛雅·阿兹特克·印加（前2000–1532年）', subtitleEn: 'Maya · Aztec · Inca (2000 BCE – 1532 CE)', group: '世界文明', groupEn: 'World Civilizations', startYear: -2000, endYear: 1532,  load: () => import('./pre_columbian.js').then(m => m.pre_columbianAtlas), stats: { persons: 14, events: 15, factions: 4, places: 13 } },
  { id: 'renaissance', name: '文艺复兴与大航海', nameEn: 'Renaissance & Exploration', subtitle: '人文复兴 · 海洋开拓（1400–1600年）', subtitleEn: 'Humanism & New Worlds (1400–1600)', group: '世界文明', groupEn: 'World Civilizations', startYear: 1400,  endYear: 1600,  load: () => import('./renaissance.js').then(m => m.renaissanceAtlas), stats: { persons: 17, events: 18, factions: 5, places: 19 } },
  { id: 'japan',       name: '日本文明', nameEn: 'Japan', subtitle: '大和·幕府·浮世（前660–1868年）', subtitleEn: 'Yamato · Shogun · Ukiyo (660 BCE – 1868 CE)', group: '世界文明', groupEn: 'World Civilizations', startYear: -660,  endYear: 1868,  load: () => import('./japan.js').then(m => m.japanAtlas), stats: { persons: 18, events: 19, factions: 6, places: 18 } },
  { id: 'enlightenment',name:'近代',     nameEn: 'Modern Era', subtitle: '启蒙 · 革命 · 工业（1600–1900年）', subtitleEn: 'Enlightenment · Revolution · Industry (1600–1900)', group: '世界文明', groupEn: 'World Civilizations', startYear: 1600,  endYear: 1900,  load: () => import('./enlightenment.js').then(m => m.enlightenmentAtlas), stats: { persons: 19, events: 21, factions: 5, places: 20 } },
  { id: 'russia',         name:'俄罗斯',    nameEn: 'Russia', subtitle: '从基辅罗斯到帝国（862–1917年）', subtitleEn: 'Kievan Rus to Empire (862–1917)', group: '世界文明', groupEn: 'World Civilizations', startYear: 862,   endYear: 1917,  load: () => import('./russia.js').then(m => m.russiaAtlas), stats: { persons: 13, events: 16, factions: 4, places: 10 } },
  { id: 'korea',          name:'朝鲜半岛',  nameEn: 'Korea', subtitle: '檀君·三国·朝鲜王朝（前2333–1897年）', subtitleEn: 'Dangun · Three Kingdoms · Joseon (2333 BCE – 1897 CE)', group: '世界文明', groupEn: 'World Civilizations', startYear: -2333, endYear: 1897, load: () => import('./korea.js').then(m => m.koreaAtlas), stats: { persons: 14, events: 13, factions: 6, places: 8 } },
  { id: 'southeast_asia', name:'东南亚',    nameEn: 'Southeast Asia', subtitle: '吴哥·暹罗·越南（100–1900年）', subtitleEn: 'Khmer · Siam · Vietnam (100–1900)', group: '世界文明', groupEn: 'World Civilizations', startYear: 100,   endYear: 1900,  load: () => import('./southeast_asia.js').then(m => m.southeast_asiaAtlas), stats: { persons: 11, events: 13, factions: 6, places: 8 } },
  { id: 'africa',         name:'非洲文明',  nameEn: 'Africa', subtitle: '库施·马里·桑海·埃塞俄比亚（300–1900年）', subtitleEn: 'Kush · Mali · Songhai · Ethiopia (300–1900)', group: '世界文明', groupEn: 'World Civilizations', startYear: 300,   endYear: 1900,  load: () => import('./africa.js').then(m => m.africaAtlas), stats: { persons: 10, events: 12, factions: 6, places: 9 } },
  { id: 'modern_world',   name:'现代世界',  nameEn: 'Modern World', subtitle: '20 世纪至当代（1900–2025年）', subtitleEn: '20th Century to Present (1900–2025)', group: '世界文明', groupEn: 'World Civilizations', startYear: 1900,  endYear: 2025,  load: () => import('./modern_world.js').then(m => m.modern_worldAtlas), stats: { persons: 14, events: 22, factions: 5, places: 19 } },
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
