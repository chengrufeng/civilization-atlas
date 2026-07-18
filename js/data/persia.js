/* 波斯（前559–1736年）· 世界文明 · 阿契美尼德/帕提亚/萨珊/萨非 */

import { makeImportance } from './index.js';

const FACTIONS = [
  { id: 'achaemenid', name: '阿契美尼德', color: '#b8893a', founded: -559, capital: '波斯波利斯', capitalFrom: -518, desc: '人类第一个世界性帝国。' },
  { id: 'parthia', name: '帕提亚', color: '#2d8a6e', founded: -247, capital: '泰西封', capitalFrom: 58, desc: '与罗马拉锯的安息。' },
  { id: 'sasanian', name: '萨珊', color: '#b23a2e', founded: 224, capital: '泰西封', capitalFrom: 224, desc: '前伊斯兰波斯文明巅峰。' },
  { id: 'safavid', name: '萨非', color: '#2f5d8a', founded: 1501, capital: '伊斯法罕', capitalFrom: 1598, desc: '确立什叶派为国教。' },
  { id: 'afsharid', name: '阿夫沙尔', color: '#7b4b94', founded: 1736, capital: '马什哈德', capitalFrom: 1736, desc: '纳迪尔沙军事帝国。' },
];

const PLACES = [
  { id: 'pasargadae', name: '帕萨尔加德', modern: '伊朗帕萨尔加德', coord: [55.01, 30.19], note: '居鲁士建都' },
  { id: 'persepolis', name: '波斯波利斯', modern: '伊朗波斯波利斯', coord: [52.89, 29.94], note: '阿契美尼德仪典都' },
  { id: 'susa', name: '苏萨', modern: '伊朗苏萨', coord: [48.25, 32.19], note: '阿契美尼德冬都' },
  { id: 'ectabana', name: '埃克巴坦那', modern: '伊朗哈马丹', coord: [48.51, 34.80], note: '阿契美尼德夏都' },
  { id: 'babylon_p', name: '巴比伦', modern: '伊拉克希拉', coord: [44.42, 32.54], note: '居鲁士征服' },
  { id: 'ctesiphon', name: '泰西封', modern: '伊拉克泰西封', coord: [44.58, 33.09], note: '帕提亚/萨珊都' },
  { id: 'isphahan', name: '伊斯法罕', modern: '伊朗伊斯法罕', coord: [51.67, 32.65], note: '萨非都' },
  { id: 'tabriz', name: '大不里士', modern: '伊朗大不里士', coord: [46.29, 38.07], note: '萨非早期都' },
  { id: 'shiraz', name: '设拉子', modern: '伊朗设拉子', coord: [52.58, 29.59], note: '波斯文化城' },
  { id: 'mashhad', name: '马什哈德', modern: '伊朗马什哈德', coord: [59.61, 36.30], note: '阿夫沙尔都' },
  { id: 'gaugamela_p', name: '高加米拉', modern: '伊拉克埃尔比勒', coord: [43.30, 36.35], note: '亚历山大灭波斯' },
  { id: 'qadisiyyah', name: '卡迪西亚', modern: '伊拉克纳杰夫', coord: [44.30, 32.0], note: '卡迪西亚之战' },
  { id: 'chaldiran', name: '查尔迪兰', modern: '土耳其查尔迪兰', coord: [43.66, 39.10], note: '萨非对奥斯曼' },
];

const PERSONS = [
  { id: 'cyrus', name: '居鲁士大帝', courtesy: '', alias: ['Cyrus II'], faction: 'achaemenid', birth: -600, death: -530, birthPlace: '安善', title: '阿契美尼德建立者', roles: ['征服者'], avatar: '居', bio: '建阿契美尼德，征服米底、吕底亚、巴比伦。', events: [ { year: -559, place: '帕萨尔加德', desc: '建阿契美尼德王朝' }, { year: -539, place: '巴比伦', desc: '和平征服巴比伦，释放犹太囚徒' }, { year: -530, place: '锡尔河', desc: '东征马萨格泰时战死' } ] },
  { id: 'cambyses', name: '冈比西斯二世', courtesy: '', alias: [], faction: 'achaemenid', birth: -558, death: -522, birthPlace: '埃克巴坦那', title: '皇帝', roles: ['征服埃及'], avatar: '冈', bio: '居鲁士之子，征服埃及，归途暴卒。', events: [ { year: -525, place: '孟菲斯', desc: '征服埃及' } ] },
  { id: 'darius_i', name: '大流士一世', courtesy: '', alias: [], faction: 'achaemenid', birth: -550, death: -486, birthPlace: '波斯波利斯', title: '皇帝', roles: ['改革者','扩张者'], avatar: '大', bio: '重新统一帝国、行政改革、修建波斯波利斯。', events: [ { year: -522, place: '波斯波利斯', desc: '夺位称王' }, { year: -518, place: '波斯波利斯', desc: '开始营建都城' }, { year: -490, place: '马拉松', desc: '马拉松之战败于希腊' } ] },
  { id: 'xerxes', name: '薛西斯一世', courtesy: '', alias: [], faction: 'achaemenid', birth: -518, death: -465, birthPlace: '波斯波利斯', title: '皇帝', roles: ['远征希腊'], avatar: '薛', bio: '温泉关、萨拉米败北，被禁卫刺杀。', events: [ { year: -480, place: '雅典', desc: '焚毁雅典卫城' }, { year: -480, place: '萨拉米', desc: '萨拉米海战败北' } ] },
  { id: 'mithridates_i', name: '米特里达梯一世', courtesy: '', alias: [], faction: 'parthia', birth: -195, death: -132, birthPlace: '泰西封', title: '帕提亚王', roles: ['帕提亚极盛'], avatar: '米', bio: '把帕提亚从王国扩为帝国，东抵印度。', events: [ { year: -141, place: '泰西封', desc: '征服美索不达米亚' } ] },
  { id: 'ardashir_i', name: '阿尔达希尔一世', courtesy: '', alias: [], faction: 'sasanian', birth: 180, death: 242, birthPlace: '法尔斯', title: '萨珊建立者', roles: ['复兴波斯'], avatar: '阿', bio: '推翻帕提亚，建立萨珊波斯。', events: [ { year: 224, place: '泰西封', desc: '击败帕提亚末王，建萨珊' } ] },
  { id: 'shapur_i', name: '沙普尔一世', courtesy: '', alias: [], faction: 'sasanian', birth: 215, death: 272, birthPlace: '泰西封', title: '皇帝', roles: ['俘虏罗马皇帝'], avatar: '沙', bio: '埃德萨之战俘罗马皇帝瓦勒良。', events: [ { year: 260, place: '埃德萨', desc: '俘获罗马皇帝瓦勒良' } ] },
  { id: 'khosrow_i', name: '霍斯劳一世', courtesy: '', alias: ['阿努希尔万'], faction: 'sasanian', birth: 501, death: 579, birthPlace: '泰西封', title: '皇帝', roles: ['改革者'], avatar: '霍', bio: '萨珊中兴，改革行政、税制、军制。', events: [ { year: 540, place: '安条克', desc: '攻占安条克' } ] },
  { id: 'khosrow_ii', name: '霍斯劳二世', courtesy: '', alias: [], faction: 'sasanian', birth: 570, death: 628, birthPlace: '泰西封', title: '末代雄主', roles: ['征服者'], avatar: '霍', bio: '攻至君士坦丁堡城下，败于希拉克略，王朝衰亡。', events: [ { year: 614, place: '耶路撒冷', desc: '攻占耶路撒冷，夺真十字架' }, { year: 627, place: '尼尼微', desc: '尼尼微之战败于拜占庭' } ] },
  { id: 'abbas_i', name: '阿拔斯大帝', courtesy: '', alias: ['Abbas I'], faction: 'safavid', birth: 1571, death: 1629, birthPlace: '大不里士', title: '萨非皇帝', roles: ['萨非中兴'], avatar: '阿', bio: '迁都伊斯法罕、改革军政、对奥斯莫卧尔三方平衡。', events: [ { year: 1598, place: '伊斯法罕', desc: '迁都伊斯法罕' }, { year: 1603, place: '大不里士', desc: '从奥斯曼手中收复大不里士' } ] },
  { id: 'nader_shah', name: '纳迪尔沙', courtesy: '', alias: [], faction: 'afsharid', birth: 1688, death: 1747, birthPlace: '呼罗珊', title: '阿夫沙尔建立者', roles: ['军事天才'], avatar: '纳', bio: '推翻萨非，远征印度掠走孔雀王座。', events: [ { year: 1736, place: '马什哈德', desc: '废萨非末主，建阿夫沙尔' }, { year: 1739, place: '德里', desc: '攻陷德里，掠孔雀王座' } ] },
  { id: 'zoroaster', name: '扎拉图斯特拉', courtesy: '', alias: ['琐罗亚斯德'], faction: 'achaemenid', birth: -1000, death: -900, birthPlace: '伊朗', title: '先知', roles: ['琐罗亚斯德教创立者'], avatar: '扎', bio: '创立善恶二元论，影响后世多种宗教。', events: [ { year: -1000, place: '巴尔赫', desc: '传教' } ] },
  { id: 'saadi', name: '萨迪', courtesy: '', alias: [], faction: 'safavid', birth: 1210, death: 1291, birthPlace: '设拉子', title: '诗人', roles: ['诗人'], avatar: '萨', bio: '《果园》《玫瑰园》，波斯文学经典。', events: [ { year: 1258, place: '设拉子', desc: '完成玫瑰园' } ] },
  { id: 'hafez', name: '哈菲兹', courtesy: '', alias: [], faction: 'safavid', birth: 1315, death: 1390, birthPlace: '设拉子', title: '诗人', roles: ['抒情诗大师'], avatar: '哈', bio: '波斯抒情诗巅峰，歌德极力推崇。', events: [ { year: 1368, place: '设拉子', desc: '创作抒情诗集' } ] },
  { id: 'atossws', name: '阿托莎', courtesy: '', alias: ['Atossa'], faction: 'achaemenid', birth: -550, death: -475, birthPlace: '波斯波利斯', title: '皇后', roles: ['王后·女政治家'], avatar: '托', bio: '居鲁士之女、大流士之妻、薛西斯之母，影响王位继承。', events: [ { year: -522, place: '波斯波利斯', desc: '嫁大流士，巩固王权' } ] },
];

const RELATIONS = [
  { source: 'cyrus', target: 'cambyses', type: '亲属', label: '父子', year: -530 },
  { source: 'cambyses', target: 'darius_i', type: '同朝', label: '王族远亲继位', year: -522 },
  { source: 'darius_i', target: 'xerxes', type: '亲属', label: '父子', year: -486 },
  { source: 'ardashir_i', target: 'shapur_i', type: '亲属', label: '父子', year: 240 },
  { source: 'abbas_i', target: 'nader_shah', type: '同朝', label: '萨非名将', year: 1722 },
  { source: 'saadi', target: 'hafez', type: '同地', label: '设拉子双星', year: 1320 },
];

const EVENTS = [
  { id: 'e1', name: '阿契美尼德建国', year: -559, domain: '政治', location: '帕萨尔加德', desc: '居鲁士开始建立帝国。', participants: ['cyrus'] },
  { id: 'e2', name: '居鲁士征服巴比伦', year: -539, domain: '军事', location: '巴比伦', desc: '和平入城，释放犹太囚徒。', participants: ['cyrus'] },
  { id: 'e3', name: '波斯波利斯兴建', year: -518, domain: '科技', location: '波斯波利斯', desc: '大流士一世开始营建都城。', participants: ['darius_i'] },
  { id: 'e4', name: '马拉松之战', year: -490, domain: '军事', location: '马拉松', desc: '大流士远征希腊失败。', participants: ['darius_i'] },
  { id: 'e5', name: '萨拉米海战', year: -480, domain: '军事', location: '萨拉米', desc: '薛西斯海军惨败。', participants: ['xerxes'] },
  { id: 'e6', name: '亚历山大灭波斯', year: -330, domain: '军事', location: '高加米拉', desc: '高加米拉之战，大流士三世败死。', participants: [] },
  { id: 'e7', name: '帕提亚建国', year: -247, domain: '政治', location: '泰西封', desc: '阿尔沙克一世摆脱塞琉古独立。', participants: [] },
  { id: 'e8', name: '萨珊建国', year: 224, domain: '政治', location: '泰西封', desc: '阿尔达希尔推翻帕提亚。', participants: ['ardashir_i'] },
  { id: 'e9', name: '埃德萨之战', year: 260, domain: '军事', location: '埃德萨', desc: '沙普尔俘罗马皇帝瓦勒良。', participants: ['shapur_i'] },
  { id: 'e10', name: '卡迪西亚之战', year: 636, domain: '军事', location: '卡迪西亚', desc: '阿拉伯击败萨珊，波斯亡。', participants: [] },
  { id: 'e11', name: '萨非建国', year: 1501, domain: '政治', location: '大不里士', desc: '伊斯玛仪一世建萨非，立什叶派。', participants: [] },
  { id: 'e12', name: '迁都伊斯法罕', year: 1598, domain: '政治', location: '伊斯法罕', desc: '阿拔斯大帝营建"半天下"。', participants: ['abbas_i'] },
  { id: 'e13', name: '查尔迪兰之战', year: 1514, domain: '军事', location: '查尔迪兰', desc: '萨非败于奥斯曼，火枪失利。', participants: [] },
  { id: 'e14', name: '纳迪尔沙攻陷德里', year: 1739, domain: '军事', location: '德里', desc: '掠走孔雀王座与光山之钻。', participants: ['nader_shah'] },
  { id: 'e15', name: '阿夫沙尔建立', year: 1736, domain: '政治', location: '马什哈德', desc: '纳迪尔沙废萨非末主自立。', participants: ['nader_shah'] },
];

export const persiaAtlas = {
  id: 'persia', name: '波斯', subtitle: '从居鲁士到纳迪尔沙（前559–1736年）',
  startYear: -559, endYear: 1736,
  mapView: { center: [53, 32], zoom: 5, minZoom: 3, maxZoom: 12, labelZoom: { hideAll: 3, hideEvents: 6 }, importanceZoom: [5, 7], cityZoom: 5, baseLayer: 'satellite' },
  domains: [
    { name: '军事', color: '#b23a2e' }, { name: '政治', color: '#2f5d8a' },
    { name: '文化', color: '#7b4b94' }, { name: '宗教', color: '#b8893a' }, { name: '科技', color: '#2d8a6e' },
  ],
  factions: FACTIONS, places: PLACES, persons: PERSONS, relations: RELATIONS, events: EVENTS,
  importance: makeImportance({
    personRank: {
      cyrus: 1, darius_i: 1, xerxes: 1, ardashir_i: 1, shapur_i: 1, khosrow_i: 1, abbas_i: 1, nader_shah: 1,
      zoroaster: 1, hafez: 1, saadi: 1,
      cambyses: 2, mithridates_i: 2, khosrow_ii: 2,
    },
    eventRank: { e1: 1, e6: 1, e8: 1, e10: 1, e11: 1, e14: 1 },
    defaultEvent: 2,
  }),
  birthplaceModern: {},
  birthplaceCoords: { '安善': [52.4, 30.0], '法尔斯': [52.0, 29.5], '伊朗': [53.0, 32.0], '呼罗珊': [59.6, 35.0], '锡尔河': [60.0, 44.0], '巴尔赫': [66.9, 36.7] },
  personImages: {},
  timelineTicks: [-559, -490, 224, 636, 1501, 1736],
};
