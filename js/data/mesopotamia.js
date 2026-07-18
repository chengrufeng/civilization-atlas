/* 两河文明 / 美索不达米亚（约前3500–前539年）· 世界文明 */

import { makeImportance } from './index.js';

const FACTIONS = [
  { id: 'sumer', name: '苏美尔', color: '#b8893a', founded: -3500, capital: '乌鲁克', capitalFrom: -3500, desc: '城市文明发源地。' },
  { id: 'akkad', name: '阿卡德', color: '#b23a2e', founded: -2334, capital: '阿卡德', capitalFrom: -2334, desc: '人类第一个帝国。' },
  { id: 'babylon', name: '巴比伦', color: '#2f5d8a', founded: -1894, capital: '巴比伦', capitalFrom: -1894, desc: '汉谟拉比王朝。' },
  { id: 'asshur', name: '亚述', color: '#7b4b94', founded: -2500, capital: '尼尼微', capitalFrom: -705, desc: '军事帝国。' },
];

const PLACES = [
  { id: 'uruk', name: '乌鲁克', modern: '伊拉克瓦尔卡', coord: [45.62, 31.32], note: '苏美尔圣城' },
  { id: 'ur', name: '乌尔', modern: '伊拉克济加尔', coord: [46.10, 30.96], note: '苏美尔城邦' },
  { id: 'akkad_city', name: '阿卡德', modern: '伊拉克中部', coord: [44.5, 33.0], note: '阿卡德都城' },
  { id: 'babylon_city', name: '巴比伦', modern: '伊拉克希拉', coord: [44.42, 32.54], note: '巴比伦都城' },
  { id: 'nineveh', name: '尼尼微', modern: '伊拉克摩苏尔', coord: [43.13, 36.36], note: '亚述都城' },
  { id: 'asshur_city', name: '亚述', modern: '伊拉克舍尔加特', coord: [43.26, 35.46], note: '亚述旧都' },
  { id: 'lagash', name: '拉加什', modern: '伊拉克泰罗', coord: [46.41, 31.41], note: '苏美尔城邦' },
  { id: 'nippur', name: '尼普尔', modern: '伊拉克努法尔', coord: [45.13, 32.13], note: '苏美尔宗教中心' },
  { id: 'mari', name: '马瑞', modern: '叙利亚特尔哈利利', coord: [40.89, 34.55], note: '城邦王国' },
  { id: 'euphrates', name: '幼发拉底', modern: '幼发拉底河', coord: [44.0, 33.0], note: '两河之一' },
  { id: 'tigris', name: '底格里斯', modern: '底格里斯河', coord: [43.5, 34.0], note: '两河之一' },
  { id: 'persian_gulf', name: '波斯湾', modern: '波斯湾', coord: [50.0, 27.0], note: '海上贸易' },
];

const PERSONS = [
  { id: 'gilgamesh', name: '吉尔伽美什', courtesy: '', alias: [], faction: 'sumer', birth: -2800, death: -2700, birthPlace: '乌鲁克', title: '乌鲁克王', roles: ['传说之王'], avatar: '吉', bio: '《吉尔伽美什史诗》主人公，半神半人。', events: [ { year: -2750, place: '乌鲁克', desc: '修筑乌鲁克城墙' } ] },
  { id: 'sargon', name: '萨尔贡', courtesy: '', alias: ['阿卡德的萨尔贡'], faction: 'akkad', birth: -2334, death: -2279, birthPlace: '阿卡德', title: '阿卡德王', roles: ['帝国建立者'], avatar: '萨', bio: '建立人类第一个帝国——阿卡德帝国。', events: [ { year: -2334, place: '阿卡德', desc: '建立阿卡德帝国' } ] },
  { id: 'naram_sin', name: '纳拉姆辛', courtesy: '', alias: [], faction: 'akkad', birth: -2291, death: -2255, birthPlace: '阿卡德', title: '阿卡德王', roles: ['自封为神'], avatar: '纳', bio: '萨尔贡之孙，自称"四方之王"。', events: [ { year: -2260, place: '尼尼微', desc: '远征北方' } ] },
  { id: 'gudea', name: '古地亚', courtesy: '', alias: [], faction: 'sumer', birth: -2150, death: -2100, birthPlace: '拉加什', title: '拉加什王', roles: ['贤王'], avatar: '古', bio: '苏美尔文艺复兴的代表，雕像是经典。', events: [ { year: -2120, place: '拉加什', desc: '营建宁吉尔苏神庙' } ] },
  { id: 'ur_nammu', name: '乌尔纳姆', courtesy: '', alias: [], faction: 'sumer', birth: -2112, death: -2095, birthPlace: '乌尔', title: '乌尔第三王朝创建者', roles: ['立法者'], avatar: '乌', bio: '颁布世界最早的成文法典之一《乌尔纳姆法典》。', events: [ { year: -2112, place: '乌尔', desc: '建立乌尔第三王朝' }, { year: -2100, place: '乌尔', desc: '修建乌尔金字形神塔' } ] },
  { id: 'hammurabi', name: '汉谟拉比', courtesy: '', alias: [], faction: 'babylon', birth: -1810, death: -1750, birthPlace: '巴比伦', title: '巴比伦王', roles: ['立法者','征服者'], avatar: '汉', bio: '统一两河流域，颁布《汉谟拉比法典》。', events: [ { year: -1792, place: '巴比伦', desc: '即位' }, { year: -1758, place: '巴比伦', desc: '统一两河流域' }, { year: -1754, place: '巴比伦', desc: '颁布汉谟拉比法典' } ] },
  { id: 'shamshi_adad', name: '沙姆希-阿达德一世', courtesy: '', alias: [], faction: 'asshur', birth: -1850, death: -1776, birthPlace: '亚述', title: '亚述王', roles: ['军事家'], avatar: '沙', bio: '古亚述霸权代表。', events: [ { year: -1808, place: '亚述', desc: '统一上美索不达米亚' } ] },
  { id: 'tukulti_ninurta', name: '图库尔蒂-尼努尔塔一世', courtesy: '', alias: [], faction: 'asshur', birth: -1400, death: -1344, birthPlace: '亚述', title: '亚述王', roles: ['征服者'], avatar: '图', bio: '中亚述极盛，攻掠巴比伦。', events: [ { year: -1365, place: '巴比伦', desc: '征服巴比伦' } ] },
  { id: 'tiglath_pileser', name: '提格拉特帕拉沙尔一世', courtesy: '', alias: [], faction: 'asshur', birth: -1150, death: -1074, birthPlace: '亚述', title: '亚述王', roles: ['远征者'], avatar: '提', bio: '远征黎巴嫩、抵达地中海。', events: [ { year: -1115, place: '幼发拉底', desc: '远征地中海' } ] },
  { id: 'ashurbanipal', name: '亚述巴尼拔', courtesy: '', alias: [], faction: 'asshur', birth: -685, death: -627, birthPlace: '尼尼微', title: '亚述王', roles: ['学者型君主'], avatar: '亚', bio: '建立尼尼微图书馆，藏大量泥板文献。', events: [ { year: -668, place: '尼尼微', desc: '即位' }, { year: -648, place: '巴比伦', desc: '平定巴比伦叛乱' } ] },
  { id: 'nebuchadnezzar', name: '尼布甲尼撒二世', courtesy: '', alias: [], faction: 'babylon', birth: -634, death: -562, birthPlace: '巴比伦', title: '新巴比伦王', roles: ['征服者','建造者'], avatar: '尼', bio: '空中花园、攻陷耶路撒冷、犹大之囚。', events: [ { year: -605, place: '幼发拉底', desc: '卡尔基米什之战' }, { year: -586, place: '巴比伦', desc: '攻陷耶路撒冷，犹大之囚' }, { year: -580, place: '巴比伦', desc: '营建空中花园' } ] },
  { id: 'nabonidus', name: '那波尼德', courtesy: '', alias: [], faction: 'babylon', birth: -660, death: -539, birthPlace: '哈兰', title: '新巴比伦末代王', roles: ['末代君主'], avatar: '那', bio: '崇月神、长居泰马，最终为波斯所灭。', events: [ { year: -556, place: '巴比伦', desc: '即位' }, { year: -539, place: '巴比伦', desc: '居鲁士入主巴比伦' } ] },
  { id: 'enheduanna', name: '恩赫杜安娜', courtesy: '', alias: [], faction: 'akkad', birth: -2285, death: -2250, birthPlace: '乌尔', title: '月神女祭司', roles: ['世界第一位署名作家'], avatar: '恩', bio: '萨尔贡之女，最早有署名的诗人。', events: [ { year: -2270, place: '乌尔', desc: '任月神女祭司，作苏美尔庙宇赞歌' } ] },
  { id: 'sennacherib', name: '辛那赫里布', courtesy: '', alias: [], faction: 'asshur', birth: -745, death: -681, birthPlace: '尼尼微', title: '亚述王', roles: ['征服者'], avatar: '辛', bio: '攻陷以色列、围攻耶路撒冷。', events: [ { year: -701, place: '尼尼微', desc: '围攻耶路撒冷' } ] },
];

const RELATIONS = [
  { source: 'sargon', target: 'naram_sin', type: '亲属', label: '祖孙', year: -2291 },
  { source: 'sargon', target: 'enheduanna', type: '亲属', label: '父女', year: -2285 },
  { source: 'hammurabi', target: 'shamshi_adad', type: '敌对', label: '同时代对手', year: -1780 },
  { source: 'sennacherib', target: 'ashurbanipal', type: '亲属', label: '祖孙', year: -685 },
  { source: 'nebuchadnezzar', target: 'nabonidus', type: '同朝', label: '新巴比伦诸王', year: -556 },
];

const EVENTS = [
  { id: 'e1', name: '乌鲁克兴起', year: -3500, domain: '政治', location: '乌鲁克', desc: '两河最早的城市文明兴起。', participants: [] },
  { id: 'e2', name: '楔形文字诞生', year: -3200, domain: '科技', location: '乌鲁克', desc: '世界最早的成熟文字系统。', participants: [] },
  { id: 'e3', name: '阿卡德帝国', year: -2334, domain: '政治', location: '阿卡德', desc: '萨尔贡建立人类第一个帝国。', participants: ['sargon'] },
  { id: 'e4', name: '乌尔第三王朝', year: -2112, domain: '政治', location: '乌尔', desc: '苏美尔复兴。', participants: ['ur_nammu'] },
  { id: 'e5', name: '乌尔纳姆法典', year: -2100, domain: '政治', location: '乌尔', desc: '现存最早的成文法典。', participants: ['ur_nammu'] },
  { id: 'e6', name: '古地亚复兴', year: -2120, domain: '文化', location: '拉加什', desc: '苏美尔文艺复兴。', participants: ['gudea'] },
  { id: 'e7', name: '汉谟拉比即位', year: -1792, domain: '政治', location: '巴比伦', desc: '巴比伦第一王朝开始强盛。', participants: ['hammurabi'] },
  { id: 'e8', name: '汉谟拉比法典', year: -1754, domain: '政治', location: '巴比伦', desc: '以眼还眼、以牙还牙。', participants: ['hammurabi'] },
  { id: 'e9', name: '亚述远征地中海', year: -1115, domain: '军事', location: '幼发拉底', desc: '提格拉特帕拉沙尔一世远征至地中海。', participants: ['tiglath_pileser'] },
  { id: 'e10', name: '尼尼微图书馆', year: -668, domain: '文化', location: '尼尼微', desc: '亚述巴尼拔建立最早系统图书馆。', participants: ['ashurbanipal'] },
  { id: 'e11', name: '围攻耶路撒冷', year: -701, domain: '军事', location: '尼尼微', desc: '辛那赫里布攻犹大。', participants: ['sennacherib'] },
  { id: 'e12', name: '尼尼微陷落', year: -612, domain: '军事', location: '尼尼微', desc: '米底与巴比伦联军摧毁亚述都城。', participants: [] },
  { id: 'e13', name: '空中花园', year: -580, domain: '科技', location: '巴比伦', desc: '世界七大奇迹之一。', participants: ['nebuchadnezzar'] },
  { id: 'e14', name: '巴比伦之囚', year: -586, domain: '政治', location: '巴比伦', desc: '犹大国贵族被迁往巴比伦。', participants: ['nebuchadnezzar'] },
  { id: 'e15', name: '波斯征服巴比伦', year: -539, domain: '军事', location: '巴比伦', desc: '居鲁士入城，新巴比伦亡。', participants: ['nabonidus'] },
];

export const mesopotamiaAtlas = {
  id: 'mesopotamia',
  name: '两河文明',
  subtitle: '文明的摇篮（约前3500–前539年）',
  startYear: -3500,
  endYear: -539,
  mapView: { center: [44, 33], zoom: 6, minZoom: 3, maxZoom: 12, labelZoom: { hideAll: 4, hideEvents: 7 }, importanceZoom: [5, 7], cityZoom: 6, baseLayer: 'satellite' },
  domains: [
    { name: '军事', color: '#b23a2e' },
    { name: '政治', color: '#2f5d8a' },
    { name: '文化', color: '#7b4b94' },
    { name: '科技', color: '#2d8a6e' },
    { name: '宗教', color: '#b8893a' },
  ],
  factions: FACTIONS,
  places: PLACES,
  persons: PERSONS,
  relations: RELATIONS,
  events: EVENTS,
  importance: makeImportance({
    personRank: {
      gilgamesh: 1, sargon: 1, hammurabi: 1, nebuchadnezzar: 1, ashurbanipal: 1,
      ur_nammu: 1, naram_sin: 2, enheduanna: 2, sennacherib: 2, gudea: 2,
      tukulti_ninurta: 2, tiglath_pileser: 2, shamshi_adad: 2, nabonidus: 2,
    },
    eventRank: { e2: 1, e3: 1, e5: 1, e8: 1, e13: 1, e15: 1 },
    defaultEvent: 2,
  }),
  birthplaceModern: {},
  birthplaceCoords: { '哈兰': [39.0, 36.9] },
  personImages: {},
  timelineTicks: [-3500, -3000, -2334, -2100, -1792, -668, -539],
};
