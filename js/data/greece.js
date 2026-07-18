/* 古希腊（约前800–前146年）· 世界文明 */

import { makeImportance } from './index.js';

const FACTIONS = [
  { id: 'athens', name: '雅典', color: '#2f5d8a', founded: -800, capital: '雅典', capitalFrom: -800, desc: '民主政治中心。' },
  { id: 'sparta', name: '斯巴达', color: '#b23a2e', founded: -900, capital: '斯巴达', capitalFrom: -900, desc: '军事化城邦。' },
  { id: 'macedon', name: '马其顿', color: '#b8893a', founded: -700, capital: '佩拉', capitalFrom: -400, desc: '北方王国，统一希腊。' },
  { id: 'ionia', name: '爱奥尼亚', color: '#7b4b94', founded: -1000, capital: '米利都', capitalFrom: -800, desc: '小亚希腊殖民城邦。' },
  { id: 'sicily', name: '大希腊/西西里', color: '#2d8a6e', founded: -734, capital: '叙拉古', capitalFrom: -734, desc: '西部希腊殖民城邦。' },
];

const PLACES = [
  { id: 'athens', name: '雅典', modern: '希腊雅典', coord: [23.73, 37.98], note: '民主摇篮' },
  { id: 'sparta', name: '斯巴达', modern: '希腊斯巴达', coord: [22.43, 37.08], note: '军国主义城邦' },
  { id: 'pella', name: '佩拉', modern: '希腊佩拉', coord: [22.52, 40.76], note: '马其顿都' },
  { id: 'miletus', name: '米利都', modern: '土耳其米利都', coord: [27.28, 37.53], note: '哲学发源地' },
  { id: 'olympia', name: '奥林匹亚', modern: '希腊奥林匹亚', coord: [21.63, 37.64], note: '奥运会圣地' },
  { id: 'delphi', name: '德尔斐', modern: '希腊德尔斐', coord: [22.50, 38.48], note: '神谕中心' },
  { id: 'marathon', name: '马拉松', modern: '希腊马拉松', coord: [23.97, 38.15], note: '马拉松之战' },
  { id: 'thermopylae', name: '温泉关', modern: '希腊温泉关', coord: [22.56, 38.80], note: '温泉关之战' },
  { id: 'salamis', name: '萨拉米斯', modern: '希腊萨拉米斯', coord: [23.49, 37.95], note: '萨拉米海战' },
  { id: 'syracuse', name: '叙拉古', modern: '意大利锡拉库萨', coord: [15.29, 37.07], note: '大希腊重镇' },
  { id: 'thebes', name: '底比斯', modern: '希腊底比斯', coord: [23.32, 38.33], note: '中部城邦' },
  { id: 'corinth', name: '科林斯', modern: '希腊科林斯', coord: [22.93, 37.94], note: '商业城邦' },
  { id: 'troy', name: '特洛伊', modern: '土耳其希萨利克', coord: [26.24, 39.96], note: '荷马史诗' },
  { id: 'gaugamela', name: '高加米拉', modern: '伊拉克埃尔比勒', coord: [43.30, 36.35], note: '伊苏斯/高加米拉之战' },
  { id: 'pergamum', name: '帕加马', modern: '土耳其贝尔加马', coord: [27.18, 39.13], note: '希腊化王国' },
  { id: 'babylon_g', name: '巴比伦', modern: '伊拉克希拉', coord: [44.42, 32.54], note: '亚历山大逝处' },
];

const PERSONS = [
  { id: 'homer', name: '荷马', courtesy: '', alias: [], faction: 'ionia', birth: -800, death: -700, birthPlace: '米利都', title: '游吟诗人', roles: ['史诗诗人'], avatar: '荷', bio: '《伊利亚特》《奥德赛》的传说作者。', events: [ { year: -750, place: '米利都', desc: '编纂伊利亚特、奥德赛' } ] },
  { id: 'hesiod', name: '赫西俄德', courtesy: '', alias: [], faction: 'ionia', birth: -750, death: -650, birthPlace: '阿斯克拉', title: '诗人', roles: ['教诲诗'], avatar: '赫', bio: '《神谱》《工作与时日》。', events: [ { year: -700, place: '奥林匹亚', desc: '著神谱' } ] },
  { id: 'thales', name: '泰勒斯', courtesy: '', alias: [], faction: 'ionia', birth: -624, death: -546, birthPlace: '米利都', title: '哲学家', roles: ['西方哲学之父'], avatar: '泰', bio: '米利都学派鼻祖，预言日食。', events: [ { year: -585, place: '米利都', desc: '预言日食' } ] },
  { id: 'pythagoras', name: '毕达哥拉斯', courtesy: '', alias: [], faction: 'ionia', birth: -570, death: -495, birthPlace: '萨摩斯', title: '哲学家·数学家', roles: ['数学家'], avatar: '毕', bio: '毕达哥拉斯定理、数本原说。', events: [ { year: -530, place: '科林斯', desc: '在意大利创立学派' } ] },
  { id: 'solon', name: '梭伦', courtesy: '', alias: [], faction: 'athens', birth: -638, death: -558, birthPlace: '雅典', title: '执政官', roles: ['改革家'], avatar: '梭', bio: '废除债务奴隶制，奠定民主基础。', events: [ { year: -594, place: '雅典', desc: '出任执政官，推行改革' } ] },
  { id: 'cleisthenes', name: '克里斯提尼', courtesy: '', alias: [], faction: 'athens', birth: -570, death: -508, birthPlace: '雅典', title: '执政官', roles: ['民主建立者'], avatar: '克', bio: '确立雅典民主制。', events: [ { year: -508, place: '雅典', desc: '建立民主制度' } ] },
  { id: 'themistocles', name: '地米斯托克利', courtesy: '', alias: [], faction: 'athens', birth: -524, death: -459, birthPlace: '雅典', title: '将军', roles: ['海军之父'], avatar: '地', bio: '建雅典海军、萨拉米海战主谋。', events: [ { year: -480, place: '萨拉米斯', desc: '萨拉米海战' } ] },
  { id: 'leonidas', name: '列奥尼达', courtesy: '', alias: [], faction: 'sparta', birth: -540, death: -480, birthPlace: '斯巴达', title: '斯巴达王', roles: ['英雄'], avatar: '列', bio: '温泉关三百勇士。', events: [ { year: -480, place: '温泉关', desc: '温泉关血战至最后一人' } ] },
  { id: 'pericles', name: '伯里克利', courtesy: '', alias: [], faction: 'athens', birth: -495, death: -429, birthPlace: '雅典', title: '首席将军', roles: ['黄金时代领袖'], avatar: '伯', bio: '雅典民主极盛、卫城建设。', events: [ { year: -447, place: '雅典', desc: '开始营建帕台农神庙' } ] },
  { id: 'socrates', name: '苏格拉底', courtesy: '', alias: [], faction: 'athens', birth: -470, death: -399, birthPlace: '雅典', title: '哲学家', roles: ['西方哲学奠基者'], avatar: '苏', bio: '产婆术、精神助产士，被判处饮鸩。', events: [ { year: -399, place: '雅典', desc: '被判处饮鸩而死' } ] },
  { id: 'plato', name: '柏拉图', courtesy: '', alias: [], faction: 'athens', birth: -428, death: -348, birthPlace: '雅典', title: '哲学家', roles: ['学园创立者'], avatar: '柏', bio: '《理想国》，建立学园。', events: [ { year: -387, place: '雅典', desc: '建立雅典学园' } ] },
  { id: 'aristotle', name: '亚里士多德', courtesy: '', alias: [], faction: 'macedon', birth: -384, death: -322, birthPlace: '斯塔吉拉', title: '哲学家', roles: ['百科全书式学者'], avatar: '亚', bio: '亚历山大之师，集希腊学术之大成。', events: [ { year: -335, place: '雅典', desc: '建立吕克昂学园' } ] },
  { id: 'alexander', name: '亚历山大大帝', courtesy: '', alias: [], faction: 'macedon', birth: -356, death: -323, birthPlace: '佩拉', title: '马其顿国王', roles: ['征服者'], avatar: '历', bio: '横扫欧亚非，建立亚历山大帝国。', events: [ { year: -334, place: '特洛伊', desc: '东征开始' }, { year: -331, place: '高加米拉', desc: '高加米拉之战灭波斯' }, { year: -323, place: '巴比伦', desc: '病逝于巴比伦' } ] },
  { id: 'archimedes', name: '阿基米德', courtesy: '', alias: [], faction: 'sicily', birth: -287, death: -212, birthPlace: '叙拉古', title: '数学家·工程师', roles: ['古代科学家'], avatar: '阿', bio: '浮力定律、防御罗马围攻叙拉古。', events: [ { year: -212, place: '叙拉古', desc: '城破被罗马士兵所杀' } ] },
  { id: 'hippocrates', name: '希波克拉底', courtesy: '', alias: [], faction: 'ionia', birth: -460, death: -370, birthPlace: '科斯', title: '医生', roles: ['医学之父'], avatar: '希', bio: '希波克拉底誓言。', events: [ { year: -420, place: '科林斯', desc: '创立医学学派' } ] },
];

const RELATIONS = [
  { source: 'socrates', target: 'plato', type: '师承', label: '师徒', year: -408 },
  { source: 'plato', target: 'aristotle', type: '师承', label: '师徒', year: -367 },
  { source: 'aristotle', target: 'alexander', type: '师承', label: '太傅', year: -343 },
  { source: 'themistocles', target: 'leonidas', type: '同代', label: '希波战争两雄', year: -480 },
  { source: 'pericles', target: 'socrates', type: '同代', label: '黄金时代', year: -440 },
];

const EVENTS = [
  { id: 'e1', name: '荷马史诗成书', year: -750, domain: '文化', location: '米利都', desc: '伊利亚特、奥德赛编订。', participants: ['homer'] },
  { id: 'e2', name: '第一届奥运会', year: -776, domain: '文化', location: '奥林匹亚', desc: '古代奥林匹克运动会创办。', participants: [] },
  { id: 'e3', name: '梭伦改革', year: -594, domain: '政治', location: '雅典', desc: '废除债务奴隶制，建立民主雏形。', participants: ['solon'] },
  { id: 'e4', name: '克里斯提尼民主', year: -508, domain: '政治', location: '雅典', desc: '雅典民主制确立。', participants: ['cleisthenes'] },
  { id: 'e5', name: '马拉松之战', year: -490, domain: '军事', location: '马拉松', desc: '雅典击败波斯入侵。', participants: [] },
  { id: 'e6', name: '温泉关之战', year: -480, domain: '军事', location: '温泉关', desc: '列奥尼达与三百勇士血战至死。', participants: ['leonidas'] },
  { id: 'e7', name: '萨拉米海战', year: -480, domain: '军事', location: '萨拉米斯', desc: '希腊击败波斯海军。', participants: ['themistocles'] },
  { id: 'e8', name: '帕台农神庙', year: -447, domain: '文化', location: '雅典', desc: '伯里克利主政、菲狄亚斯主创。', participants: ['pericles'] },
  { id: 'e9', name: '苏格拉底之死', year: -399, domain: '文化', location: '雅典', desc: '被判饮鸩。', participants: ['socrates'] },
  { id: 'e10', name: '柏拉图学园', year: -387, domain: '文化', location: '雅典', desc: '西方第一所高等学府。', participants: ['plato'] },
  { id: 'e11', name: '亚历山大东征', year: -334, domain: '军事', location: '特洛伊', desc: '跨海征服波斯、埃及、直达印度。', participants: ['alexander', 'aristotle'] },
  { id: 'e12', name: '高加米拉之战', year: -331, domain: '军事', location: '高加米拉', desc: '亚历山大彻底击败大流士三世。', participants: ['alexander'] },
  { id: 'e13', name: '叙拉古围城', year: -212, domain: '军事', location: '叙拉古', desc: '罗马破城，阿基米德被杀。', participants: ['archimedes'] },
  { id: 'e14', name: '希腊并入罗马', year: -146, domain: '政治', location: '科林斯', desc: '罗马攻陷科林斯，希腊独立史终结。', participants: [] },
];

export const greeceAtlas = {
  id: 'greece',
  name: '古希腊',
  subtitle: '城邦·民主·哲学（约前800–前146年）',
  startYear: -800,
  endYear: -146,
  mapView: { center: [23, 38], zoom: 6, minZoom: 3, maxZoom: 12, labelZoom: { hideAll: 4, hideEvents: 7 }, importanceZoom: [5, 7], cityZoom: 6, baseLayer: 'satellite' },
  domains: [
    { name: '军事', color: '#b23a2e' },
    { name: '政治', color: '#2f5d8a' },
    { name: '文化', color: '#7b4b94' },
    { name: '科技', color: '#2d8a6e' },
    { name: '哲学', color: '#b8893a' },
  ],
  factions: FACTIONS,
  places: PLACES,
  persons: PERSONS,
  relations: RELATIONS,
  events: EVENTS,
  importance: makeImportance({
    personRank: {
      homer: 1, socrates: 1, plato: 1, aristotle: 1, alexander: 1, pericles: 1,
      solon: 1, pythagoras: 1, thales: 1, archimedes: 1,
      leonidas: 2, themistocles: 2, cleisthenes: 2, hippocrates: 2, hesiod: 2,
    },
    eventRank: { e2: 1, e3: 1, e5: 1, e6: 1, e11: 1, e12: 1 },
    defaultEvent: 2,
  }),
  birthplaceModern: {},
  birthplaceCoords: {
    '阿斯克拉': [23.10, 38.20], '萨摩斯': [26.84, 37.79], '斯塔吉拉': [23.74, 40.52],
    '科斯': [27.29, 36.89], '巴比伦': [44.42, 32.54],
  },
  personImages: {},
  timelineTicks: [-800, -594, -480, -399, -331, -146],
};
