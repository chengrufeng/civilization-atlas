/* 东南亚（100–1900年）· 世界文明 · 扶南/真腊/吴哥/暹罗/越南/马来 */

import { makeImportance } from './index.js';

const FACTIONS = [
  { id: 'funan', name: '扶南', color: '#5a6d8a', founded: 68, capital: 'Vyadhapura', capitalFrom: 68, desc: '湄公河三角洲早期国家' },
  { id: 'zhenla', name: '真腊', color: '#b8893a', founded: 550, capital: 'Isanapura', capitalFrom: 550, desc: '扶南继承者' },
  { id: 'khmer', name: '高棉/吴哥', color: '#b23a2e', founded: 802, capital: '吴哥', capitalFrom: 802, desc: '阇耶跋摩二世开创' },
  { id: 'sukhothai', name: '素可泰', color: '#2d8a6e', founded: 1238, capital: '素可泰', capitalFrom: 1238, desc: '泰人首国' },
  { id: 'ayutthaya', name: '大城王朝', color: '#2f5d8a', founded: 1351, capital: '阿瑜陀耶', capitalFrom: 1351, desc: '暹罗最强王朝' },
  { id: 'vietnam', name: '越南', color: '#7b4b94', founded: 968, capital: '河内', capitalFrom: 1010, desc: '独立后多次迁都' },
];

const PLACES = [
  { id: 'angkor', name: '吴哥', modern: '柬吴哥', coord: [103.83, 13.41], note: '高棉都' },
  { id: 'sukhothai_s', name: '素可泰', modern: '泰素可泰', coord: [99.82, 17.01], note: '素可泰都' },
  { id: 'ayutthaya_s', name: '阿瑜陀耶', modern: '泰大城', coord: [100.56, 14.37], note: '大城王朝都' },
  { id: 'bangkok', name: '曼谷', modern: '泰曼谷', coord: [100.50, 13.76], note: '却克里都' },
  { id: 'hanoi', name: '河内', modern: '越河内', coord: [105.85, 21.03], note: '越南都' },
  { id: 'hue', name: '顺化', modern: '越顺化', coord: [107.59, 16.46], note: '阮朝都' },
  { id: 'champa', name: '占婆', modern: '越中南部', coord: [108.98, 15.78], note: '占婆王国' },
  { id: 'borobudur', name: '婆罗浮屠', modern: '印尼婆罗浮屠', coord: [110.20, -7.61], note: '夏连特拉佛塔' },
];

const PERSONS = [
  { id: 'fan_shiman', name: '范师曼', courtesy: '', alias: ['Fan Shih-man'], faction: 'funan', birth: 130, death: 230, birthPlace: '吴哥', title: '扶南王', roles: ['扩张者'], avatar: '范', bio: '扶南极盛，扩张至马来半岛。', events: [ { year: 200, place: '吴哥', desc: '扶南扩张至马来半岛' } ] },
  { id: 'jayavarman_ii', name: '阇耶跋摩二世', courtesy: '', alias: ['Jayavarman II'], faction: 'khmer', birth: 770, death: 835, birthPlace: '吴哥', title: '吴哥王朝开创者', roles: ['吴哥建立者'], avatar: '阇', bio: '802 年建吴哥王朝，自称转轮王。', events: [ { year: 802, place: '吴哥', desc: '建立吴哥王朝' } ] },
  { id: 'suryavarman_ii', name: '苏利耶跋摩二世', courtesy: '', alias: ['Suryavarman II'], faction: 'khmer', birth: 1094, death: 1150, birthPlace: '吴哥', title: '高棉皇帝', roles: ['吴哥窟建造者'], avatar: '苏', bio: '营建吴哥窟。', events: [ { year: 1113, place: '吴哥', desc: '即位，开始营建吴哥窟' } ] },
  { id: 'jayavarman_vii', name: '阇耶跋摩七世', courtesy: '', alias: ['Jayavarman VII'], faction: 'khmer', birth: 1125, death: 1218, birthPlace: '吴哥', title: '高棉皇帝', roles: ['巴戎寺','大乘佛教'], avatar: '跋', bio: '改宗大乘佛教，建巴戎寺、通王城。', events: [ { year: 1181, place: '吴哥', desc: '即位，改宗大乘佛教' }, { year: 1190, place: '吴哥', desc: '营建巴戎寺' } ] },
  { id: 'ramkhamhaeng', name: '兰甘亨', courtesy: '', alias: ['Ramkhamhaeng the Great'], faction: 'sukhothai', birth: 1239, death: 1298, birthPlace: '素可泰', title: '素可泰国王', roles: ['泰文创制'], avatar: '兰', bio: '泰文字创制者，素可泰极盛。', events: [ { year: 1283, place: '素可泰', desc: '创制泰文字' } ] },
  { id: 'rama_thibodi', name: '拉玛铁菩提一世', courtesy: '', alias: ['Uthong'], faction: 'ayutthaya', birth: 1314, death: 1369, birthPlace: '阿瑜陀耶', title: '大城王朝建立者', roles: ['开国者'], avatar: '拉', bio: '1351 年建大城王朝。', events: [ { year: 1351, place: '阿瑜陀耶', desc: '建立大城王朝' } ] },
  { id: 'naresuan', name: '纳瑞萱王', courtesy: '', alias: ['Naresuan the Great'], faction: 'ayutthaya', birth: 1555, death: 1605, birthPlace: '阿瑜陀耶', title: '大城国王', roles: ['象战英雄'], avatar: '纳', bio: '1593 年象战击杀缅甸王储，复暹罗独立。', events: [ { year: 1593, place: '阿瑜陀耶', desc: '象战击败缅甸' } ] },
  { id: 'le_loi', name: '黎利', courtesy: '', alias: ['Le Loi','黎太祖'], faction: 'vietnam', birth: 1385, death: 1433, birthPlace: '河内', title: '后黎朝太祖', roles: ['抗明英雄'], avatar: '黎', bio: '十年抗明，1428 年建后黎朝。', events: [ { year: 1427, place: '河内', desc: '击败明军' }, { year: 1428, place: '河内', desc: '建立后黎朝' } ] },
  { id: 'quang_trung', name: '阮惠', courtesy: '', alias: ['Quang Trung','光中皇帝'], faction: 'vietnam', birth: 1753, death: 1792, birthPlace: '顺化', title: '西山朝皇帝', roles: ['击退清军'], avatar: '阮', bio: '1789 年春节大破清军。', events: [ { year: 1789, place: '河内', desc: '玉洄战役大破清军' } ] },
  { id: 'taksin', name: '郑信', courtesy: '', alias: ['Taksin the Great','达信'], faction: 'ayutthaya', birth: 1734, death: 1782, birthPlace: '阿瑜陀耶', title: '吞武里王', roles: ['复国英雄'], avatar: '郑', bio: '1767 缅甸破大城后，七个月复国。', events: [ { year: 1767, place: '阿瑜陀耶', desc: '收复阿瑜陀耶' }, { year: 1768, place: '曼谷', desc: '建吞武里王朝' } ] },
  { id: 'rama_i', name: '拉玛一世', courtesy: '', alias: ['Rama I','Phutthayotfa'], faction: 'ayutthaya', birth: 1737, death: 1809, birthPlace: '阿瑜陀耶', title: '却克里王朝建立者', roles: ['曼谷王朝开创'], avatar: '罗', bio: '1782 年建却克里王朝（现任泰王所属），迁都曼谷。', events: [ { year: 1782, place: '曼谷', desc: '建却克里王朝' } ] },
];

const RELATIONS = [
  { source: 'jayavarman_ii', target: 'suryavarman_ii', type: '同朝', label: '吴哥王朝', year: 1113 },
  { source: 'suryavarman_ii', target: 'jayavarman_vii', type: '同朝', label: '吴哥两雄主', year: 1181 },
  { source: 'taksin', target: 'rama_i', type: '同朝', label: '复国→曼谷王朝', year: 1782 },
];

const EVENTS = [
  { id: 'e1', name: '扶南兴起', year: 100, domain: '政治', location: '吴哥', desc: '湄公河三角洲早期国家。', participants: [] },
  { id: 'e2', name: '印度化', year: 200, domain: '文化', location: '占婆', desc: '印度教/佛教传入，文字梵化。', participants: ['fan_shiman'] },
  { id: 'e3', name: '吴哥王朝', year: 802, domain: '政治', location: '吴哥', desc: '阇耶跋摩二世开创。', participants: ['jayavarman_ii'] },
  { id: 'e4', name: '吴哥窟', year: 1113, domain: '科技', location: '吴哥', desc: '苏利耶跋摩二世开始营建。', participants: ['suryavarman_ii'] },
  { id: 'e5', name: '巴戎寺', year: 1190, domain: '文化', location: '吴哥', desc: '阇耶跋摩七世改宗大乘佛教。', participants: ['jayavarman_vii'] },
  { id: 'e6', name: '素可泰王朝', year: 1238, domain: '政治', location: '素可泰', desc: '泰人首国。', participants: [] },
  { id: 'e7', name: '泰文创制', year: 1283, domain: '文化', location: '素可泰', desc: '兰甘亨铭文，最早的泰文。', participants: ['ramkhamhaeng'] },
  { id: 'e8', name: '大城王朝', year: 1351, domain: '政治', location: '阿瑜陀耶', desc: '暹罗最强王朝开始。', participants: ['rama_thibodi'] },
  { id: 'e9', name: '后黎朝', year: 1428, domain: '政治', location: '河内', desc: '黎利击败明军建后黎朝。', participants: ['le_loi'] },
  { id: 'e10', name: '纳瑞萱象战', year: 1593, domain: '军事', location: '阿瑜陀耶', desc: '暹罗复国。', participants: ['naresuan'] },
  { id: 'e11', name: '郑信复国', year: 1767, domain: '军事', location: '阿瑜陀耶', desc: '大城破后郑信七个月复国。', participants: ['taksin'] },
  { id: 'e12', name: '玉洄战役', year: 1789, domain: '军事', location: '河内', desc: '阮惠春节大破清军。', participants: ['quang_trung'] },
  { id: 'e13', name: '曼谷王朝', year: 1782, domain: '政治', location: '曼谷', desc: '拉玛一世建却克里王朝。', participants: ['rama_i'] },
];

export const southeast_asiaAtlas = {
  id: 'southeast_asia', name: '东南亚', subtitle: '吴哥·暹罗·越南（100–1900年）', version: '1.0.0',
  startYear: 100, endYear: 1900,
  mapView: { center: [105, 12], zoom: 4, minZoom: 2, maxZoom: 12, labelZoom: { hideAll: 3, hideEvents: 5 }, importanceZoom: [4, 6], cityZoom: 5, baseLayer: 'satellite' },
  domains: [
    { name: '军事', color: '#b23a2e' }, { name: '政治', color: '#2f5d8a' },
    { name: '文化', color: '#7b4b94' }, { name: '宗教', color: '#b8893a' },
    { name: '外交', color: '#2d8a6e' }, { name: '科技', color: '#4a7c59' },
  ],
  factions: FACTIONS, places: PLACES, persons: PERSONS, relations: RELATIONS, events: EVENTS,
  importance: makeImportance({
    personRank: {
      jayavarman_ii: 1, suryavarman_ii: 1, jayavarman_vii: 1, ramkhamhaeng: 1,
      rama_thibodi: 1, naresuan: 1, le_loi: 1, taksin: 1, rama_i: 1, quang_trung: 1,
      fan_shiman: 2,
    },
    eventRank: { e3: 1, e4: 1, e6: 1, e9: 1, e11: 1, e13: 1 },
    defaultEvent: 2,
  }),
  birthplaceModern: {},
  birthplaceCoords: {},
  personImages: {},
  timelineTicks: [100, 802, 1113, 1238, 1351, 1782, 1900],
};
