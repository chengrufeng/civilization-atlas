/* 古埃及（约前3100–前30年）· 世界文明 */

import { makeImportance } from './index.js';

const FACTIONS = [
  { id: 'early', name: '早王朝/古王国', color: '#b8893a', founded: -3100, capital: '孟菲斯', capitalFrom: -3100, desc: '埃及统一与金字塔时代。' },
  { id: 'middle', name: '中王国', color: '#2f5d8a', founded: -2055, capital: '底比斯', capitalFrom: -2055, desc: '重新统一与文学繁荣。' },
  { id: 'new', name: '新王国', color: '#b23a2e', founded: -1550, capital: '底比斯', capitalFrom: -1550, desc: '帝国时代。' },
  { id: 'late', name: '后期/外族', color: '#7b4b94', founded: -664, capital: '塞易斯', capitalFrom: -664, desc: '舍易斯、波斯、托勒密时期。' },
];

const PLACES = [
  { id: 'memphis', name: '孟菲斯', modern: '埃及孟菲斯', coord: [31.26, 29.85], note: '古王国都' },
  { id: 'thebes', name: '底比斯', modern: '埃及卢克索', coord: [32.64, 25.69], note: '中王国/新王国都' },
  { id: 'sais', name: '塞易斯', modern: '埃及塞易斯', coord: [30.65, 30.96], note: '后期都' },
  { id: 'alexandria', name: '亚历山大', modern: '埃及亚历山大', coord: [29.91, 31.20], note: '托勒密都' },
  { id: 'giza', name: '吉萨', modern: '埃及吉萨', coord: [31.13, 29.98], note: '大金字塔' },
  { id: 'amarna', name: '阿玛纳', modern: '埃及阿玛纳', coord: [30.91, 27.66], note: '阿肯那顿新都' },
  { id: 'abidos', name: '阿拜多斯', modern: '埃及阿拜多斯', coord: [32.06, 26.19], note: '宗教圣地' },
  { id: 'karnak', name: '卡纳克', modern: '埃及卡纳克', coord: [32.66, 25.72], note: '神庙群' },
  { id: 'aswan', name: '阿斯旺', modern: '埃及阿斯旺', coord: [32.90, 24.09], note: '南方边界' },
  { id: 'sinaimt', name: '西奈', modern: '西奈半岛', coord: [33.8, 29.5], note: '矿区' },
  { id: 'kadesh', name: '卡叠石', modern: '叙利亚卡叠石', coord: [36.50, 34.94], note: '卡叠石之战' },
  { id: 'nubia', name: '努比亚', modern: '苏丹北部', coord: [32.0, 20.0], note: '南方金矿' },
  { id: 'abydos', name: '阿布辛贝', modern: '埃及阿布辛贝', coord: [31.63, 22.34], note: '拉美西斯二世神庙' },
  { id: 'nile', name: '尼罗河', modern: '尼罗河三角洲', coord: [31.50, 30.50], note: '抵御海上民族' },
  { id: 'actium', name: '阿克提乌姆', modern: '希腊亚克兴', coord: [20.74, 39.00], note: '亚克兴海战' },
];

const PERSONS = [
  { id: 'narmer', name: '纳尔迈', courtesy: '', alias: ['美尼斯'], faction: 'early', birth: -3200, death: -3100, birthPlace: '孟菲斯', title: '法老', roles: ['统一上下埃及'], avatar: '纳', bio: '统一上下埃及，开创第一王朝。', events: [ { year: -3100, place: '孟菲斯', desc: '统一上下埃及' } ] },
  { id: 'djoser', name: '左塞尔', courtesy: '', alias: [], faction: 'early', birth: -2700, death: -2640, birthPlace: '孟菲斯', title: '第三王朝法老', roles: ['阶梯金字塔建造者'], avatar: '左', bio: '伊姆霍特普辅佐下建阶梯金字塔。', events: [ { year: -2670, place: '孟菲斯', desc: '修建萨卡拉阶梯金字塔' } ] },
  { id: 'imhotep', name: '伊姆霍特普', courtesy: '', alias: [], faction: 'early', birth: -2700, death: -2610, birthPlace: '孟菲斯', title: '宰相·建筑师', roles: ['最早的建筑师'], avatar: '伊', bio: '左塞尔宰相，设计首座金字塔，后被神化。', events: [ { year: -2670, place: '孟菲斯', desc: '设计阶梯金字塔' } ] },
  { id: 'khufu', name: '胡夫', courtesy: '', alias: ['奇阿普斯'], faction: 'early', birth: -2600, death: -2566, birthPlace: '孟菲斯', title: '第四王朝法老', roles: ['大金字塔建造者'], avatar: '胡', bio: '吉萨大金字塔的建造者。', events: [ { year: -2560, place: '吉萨', desc: '修建大金字塔' } ] },
  { id: 'mentuhotep', name: '门图霍特普二世', courtesy: '', alias: [], faction: 'middle', birth: -2100, death: -2000, birthPlace: '底比斯', title: '中王国开创者', roles: ['重新统一埃及'], avatar: '门', bio: '结束第一中间期，重新统一埃及。', events: [ { year: -2055, place: '底比斯', desc: '重新统一埃及' } ] },
  { id: 'hatshepsut', name: '哈特谢普苏特', courtesy: '', alias: [], faction: 'new', birth: -1508, death: -1458, birthPlace: '底比斯', title: '女法老', roles: ['女性统治者'], avatar: '哈', bio: '女扮男装称王，开太平盛事。', events: [ { year: -1479, place: '底比斯', desc: '即位' }, { year: -1460, place: '底比斯', desc: '营建哈特谢普苏特神庙' } ] },
  { id: 'thutmose', name: '图特摩斯三世', courtesy: '', alias: [], faction: 'new', birth: -1481, death: -1425, birthPlace: '底比斯', title: '法老·军事家', roles: ['埃及的拿破仑'], avatar: '图', bio: '十七次远征西亚，建立埃及帝国。', events: [ { year: -1457, place: '卡叠石', desc: '米吉多之战' } ] },
  { id: 'akhenaten', name: '阿肯那顿', courtesy: '', alias: [], faction: 'new', birth: -1380, death: -1334, birthPlace: '底比斯', title: '法老', roles: ['一神教改革者'], avatar: '阿', bio: '推行阿顿崇拜，迁都阿玛纳。', events: [ { year: -1346, place: '阿玛纳', desc: '迁都阿玛纳，推行阿顿崇拜' } ] },
  { id: 'tutankhamun', name: '图坦卡蒙', courtesy: '', alias: [], faction: 'new', birth: -1341, death: -1323, birthPlace: '阿玛纳', title: '法老', roles: ['少年法老'], avatar: '图', bio: '九岁即位，早逝；其陵墓保存完好震惊现代。', events: [ { year: -1333, place: '底比斯', desc: '即位' } ] },
  { id: 'ramses_ii', name: '拉美西斯二世', courtesy: '', alias: ['拉美西斯大帝'], faction: 'new', birth: -1303, death: -1213, birthPlace: '孟菲斯', title: '法老', roles: ['伟大的建造者'], avatar: '拉', bio: '在位66年，与赫梯打最大战车会战。', events: [ { year: -1274, place: '卡叠石', desc: '卡叠石之战' }, { year: -1258, place: '卡叠石', desc: '与赫梯签订史上最早国际和约' }, { year: -1265, place: '阿布辛贝', desc: '营建阿布辛贝神庙' } ] },
  { id: 'ramses_iii', name: '拉美西斯三世', courtesy: '', alias: [], faction: 'new', birth: -1217, death: -1155, birthPlace: '底比斯', title: '法老', roles: ['海上民族抵御者'], avatar: '拉', bio: '抵御海上民族入侵，新王国最后的辉煌。', events: [ { year: -1175, place: '尼罗河', desc: '抵御海上民族入侵' } ] },
  { id: 'piye', name: '皮耶', courtesy: '', alias: [], faction: 'late', birth: -800, death: -752, birthPlace: '努比亚', title: '努比亚法老', roles: ['第二十五王朝建立者'], avatar: '皮', bio: '由努比亚北上征服埃及，建立第二十五王朝。', events: [ { year: -727, place: '底比斯', desc: '征服上下埃及' } ] },
  { id: 'ashurbanipal_egypt', name: '普萨美提克一世', courtesy: '', alias: [], faction: 'late', birth: -700, death: -610, birthPlace: '塞易斯', title: '法老', roles: ['舍易斯复兴'], avatar: '普', bio: '驱逐亚述驻军，建立舍易斯王朝复兴。', events: [ { year: -664, place: '塞易斯', desc: '建立第二十六王朝' } ] },
  { id: 'cleopatra', name: '克利奥帕特拉七世', courtesy: '', alias: ['埃及艳后'], faction: 'late', birth: -69, death: -30, birthPlace: '亚历山大', title: '托勒密女王', roles: ['末代法老'], avatar: '克', bio: '与凯撒安东尼结盟，最后亡于屋大维。', events: [ { year: -48, place: '亚历山大', desc: '与凯撒结盟' }, { year: -31, place: '阿克提乌姆', desc: '亚克兴海战败北' }, { year: -30, place: '亚历山大', desc: '自杀，埃及并入罗马' } ] },
];

const RELATIONS = [
  { source: 'djoser', target: 'imhotep', type: '君臣', label: '宰相', year: -2670 },
  { source: 'hatshepsut', target: 'thutmose', type: '亲属', label: '继母-子', year: -1479 },
  { source: 'akhenaten', target: 'tutankhamun', type: '亲属', label: '父子', year: -1334 },
  { source: 'ramses_ii', target: 'ramses_iii', type: '同名', label: '新王国两代雄主', year: -1217 },
  { source: 'cleopatra', target: 'thutmose', type: '同朝', label: '法老', year: -48 },
];

const EVENTS = [
  { id: 'e1', name: '埃及统一', year: -3100, domain: '政治', location: '孟菲斯', desc: '纳尔迈统一上下埃及。', participants: ['narmer'] },
  { id: 'e2', name: '萨卡拉金字塔', year: -2670, domain: '科技', location: '孟菲斯', desc: '首座金字塔（阶梯式）建成。', participants: ['djoser', 'imhotep'] },
  { id: 'e3', name: '吉萨大金字塔', year: -2560, domain: '科技', location: '吉萨', desc: '胡夫金字塔，世界七大奇迹之一。', participants: ['khufu'] },
  { id: 'e4', name: '中王国再统一', year: -2055, domain: '政治', location: '底比斯', desc: '门图霍特普二世结束第一中间期。', participants: ['mentuhotep'] },
  { id: 'e5', name: '哈特谢普苏特即位', year: -1479, domain: '政治', location: '底比斯', desc: '女法老登基。', participants: ['hatshepsut'] },
  { id: 'e6', name: '米吉多之战', year: -1457, domain: '军事', location: '卡叠石', desc: '图特摩斯三世亚洲霸权奠基。', participants: ['thutmose'] },
  { id: 'e7', name: '阿玛纳改革', year: -1346, domain: '宗教', location: '阿玛纳', desc: '阿肯那顿推行阿顿一神教。', participants: ['akhenaten'] },
  { id: 'e8', name: '卡叠石之战', year: -1274, domain: '军事', location: '卡叠石', desc: '史上最大战车会战，拉美西斯二世对赫梯。', participants: ['ramses_ii'] },
  { id: 'e9', name: '史上最早国际和约', year: -1258, domain: '外交', location: '卡叠石', desc: '埃及与赫梯签订和约。', participants: ['ramses_ii'] },
  { id: 'e10', name: '阿布辛贝神庙', year: -1265, domain: '文化', location: '阿布辛贝', desc: '拉美西斯二世巨像神庙。', participants: ['ramses_ii'] },
  { id: 'e11', name: '抵御海上民族', year: -1175, domain: '军事', location: '尼罗河', desc: '拉美西斯三世守住新王国。', participants: ['ramses_iii'] },
  { id: 'e12', name: '努比亚第二十五王朝', year: -727, domain: '政治', location: '底比斯', desc: '皮耶征服埃及。', participants: ['piye'] },
  { id: 'e13', name: '舍易斯复兴', year: -664, domain: '政治', location: '塞易斯', desc: '普萨美提克重建独立。', participants: ['ashurbanipal_egypt'] },
  { id: 'e14', name: '亚克兴海战', year: -31, domain: '军事', location: '阿克提乌姆', desc: '屋大维击败安东尼与克利奥帕特拉。', participants: ['cleopatra'] },
  { id: 'e15', name: '埃及并入罗马', year: -30, domain: '政治', location: '亚历山大', desc: '克利奥帕特拉自杀，托勒密王朝终结。', participants: ['cleopatra'] },
];

export const egyptAtlas = {
  id: 'egypt',
  name: '古埃及',
  subtitle: '尼罗河的礼物（约前3100–前30年）',
  startYear: -3100,
  endYear: -30,
  mapView: { center: [31, 27], zoom: 6, minZoom: 3, maxZoom: 12, labelZoom: { hideAll: 4, hideEvents: 7 }, importanceZoom: [5, 7], cityZoom: 6, baseLayer: 'satellite' },
  domains: [
    { name: '军事', color: '#b23a2e' },
    { name: '政治', color: '#2f5d8a' },
    { name: '文化', color: '#7b4b94' },
    { name: '科技', color: '#2d8a6e' },
    { name: '宗教', color: '#b8893a' },
    { name: '外交', color: '#8a6d3b' },
  ],
  factions: FACTIONS,
  places: PLACES,
  persons: PERSONS,
  relations: RELATIONS,
  events: EVENTS,
  importance: makeImportance({
    personRank: {
      narmer: 1, khufu: 1, hatshepsut: 1, thutmose: 1, akhenaten: 1, ramses_ii: 1,
      cleopatra: 1, tutankhamun: 1, imhotep: 1, mentuhotep: 2, djoser: 2,
      ramses_iii: 2, piye: 2, ashurbanipal_egypt: 2,
    },
    eventRank: { e1: 1, e3: 1, e6: 1, e8: 1, e10: 1, e15: 1 },
    defaultEvent: 2,
  }),
  birthplaceModern: {},
  birthplaceCoords: { '尼罗河': [32.0, 24.0], '阿克提乌姆': [20.74, 39.0] },
  personImages: {},
  timelineTicks: [-3100, -2670, -2560, -2055, -1274, -664, -30],
};
