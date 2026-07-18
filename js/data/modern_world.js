/* 现代世界（1900–2025年）· 世界文明 · 客观史实陈述 */

import { makeImportance } from './index.js';

const FACTIONS = [
  { id: 'europe', name: '欧洲', color: '#2f5d8a', founded: 1900, capital: '—', capitalFrom: 1900, desc: '欧洲国家' },
  { id: 'america', name: '美洲', color: '#b23a2e', founded: 1900, capital: '—', capitalFrom: 1900, desc: '美洲国家' },
  { id: 'asia', name: '亚洲', color: '#b8893a', founded: 1900, capital: '—', capitalFrom: 1900, desc: '亚洲国家' },
  { id: 'africa', name: '非洲', color: '#2d8a6e', founded: 1900, capital: '—', capitalFrom: 1900, desc: '非洲国家' },
  { id: 'science', name: '科学与文化', color: '#7b4b94', founded: 1900, capital: '—', capitalFrom: 1900, desc: '无国界科学家与文化人物' },
];

const PLACES = [
  { id: 'beijing_mw', name: '北京', modern: '中国北京', coord: [116.40, 39.90], note: '' },
  { id: 'london_mw', name: '伦敦', modern: '英国伦敦', coord: [-0.13, 51.51], note: '' },
  { id: 'washington_mw', name: '华盛顿', modern: '美国华盛顿', coord: [-77.04, 38.91], note: '' },
  { id: 'moscow_mw', name: '莫斯科', modern: '俄莫斯科', coord: [37.62, 55.75], note: '' },
  { id: 'berlin_mw', name: '柏林', modern: '德柏林', coord: [13.41, 52.52], note: '' },
  { id: 'hiroshima', name: '广岛', modern: '日广岛', coord: [132.46, 34.39], note: '核弹' },
  { id: 'sarajevo_mw', name: '萨拉热窝', modern: '波黑萨拉热窝', coord: [18.41, 43.85], note: '一战导火索' },
  { id: 'normandy', name: '诺曼底', modern: '法诺曼底', coord: [-0.37, 49.18], note: 'D-Day' },
  { id: 'stalingrad', name: '斯大林格勒', modern: '俄伏尔加格勒', coord: [44.52, 48.71], note: '二战转折' },
  { id: 'pearlharbor', name: '珍珠港', modern: '美夏威夷', coord: [-157.97, 21.37], note: '太平洋战争' },
  { id: 'moon', name: '月球静海', modern: '月球', coord: [0, 0], note: '登月' },
  { id: 'jerusalem_mw', name: '耶路撒冷', modern: '以色列耶路撒冷', coord: [35.23, 31.78], note: '中东' },
  { id: 'saigon', name: '西贡', modern: '越胡志明市', coord: [106.70, 10.78], note: '越战' },
  { id: 'seoul_mw', name: '首尔', modern: '韩首尔', coord: [126.98, 37.57], note: '朝鲜战争' },
  { id: 'berlin_wall', name: '柏林墙', modern: '德柏林', coord: [13.39, 52.52], note: '冷战' },
  { id: 'newyork_mw', name: '纽约', modern: '美纽约', coord: [-74.0, 40.71], note: '联合国总部' },
  { id: 'delhi', name: '德里', modern: '印度新德里', coord: [77.21, 28.61], note: '印度首都' },
  { id: 'joburg', name: '约翰内斯堡', modern: '南非约翰内斯堡', coord: [28.04, -26.20], note: '南非' },
];

const PERSONS = [
  { id: 'einstein', name: '爱因斯坦', courtesy: '', alias: ['Albert Einstein'], faction: 'science', birth: 1879, death: 1955, birthPlace: '乌尔姆', title: '物理学家', roles: ['相对论'], avatar: '爱', bio: '相对论创立者，1921 诺贝尔物理学奖。', events: [ { year: 1905, place: '柏林', desc: '发表狭义相对论' }, { year: 1915, place: '柏林', desc: '发表广义相对论' } ] },
  { id: 'marie_curie', name: '居里夫人', courtesy: '', alias: ['Marie Curie'], faction: 'science', birth: 1867, death: 1934, birthPlace: '华沙', title: '化学家·物理学家', roles: ['两次诺奖'], avatar: '居', bio: '钋和镭的发现者，两次诺贝尔奖得主。', events: [ { year: 1903, place: '巴黎', desc: '获诺贝尔物理学奖' }, { year: 1911, place: '巴黎', desc: '获诺贝尔化学奖' } ] },
  { id: 'wright', name: '莱特兄弟', courtesy: '', alias: ['Wright Brothers'], faction: 'america', birth: 1871, death: 1948, birthPlace: '代顿', title: '航空先驱', roles: ['首飞'], avatar: '莱', bio: '1903 年首次有动力载人飞行。', events: [ { year: 1903, place: '华盛顿', desc: '小鹰号首飞' } ] },
  { id: 'lenin_mw', name: '列宁', courtesy: '', alias: ['Vladimir Lenin'], faction: 'europe', birth: 1870, death: 1924, birthPlace: '辛比尔斯克', title: '革命领袖', roles: ['十月革命'], avatar: '列', bio: '领导十月革命，建立苏维埃政权。', events: [ { year: 1917, place: '莫斯科', desc: '领导十月革命' } ] },
  { id: 'fdr', name: '罗斯福', courtesy: '', alias: ['Franklin D. Roosevelt'], faction: 'america', birth: 1882, death: 1945, birthPlace: '海德公园', title: '美国总统', roles: ['新政','二战领袖'], avatar: '罗', bio: '推行新政应对大萧条，二战同盟国领袖之一。', events: [ { year: 1933, place: '华盛顿', desc: '就任总统，推行新政' }, { year: 1941, place: '华盛顿', desc: '对日德宣战' } ] },
  { id: 'churchill', name: '丘吉尔', courtesy: '', alias: ['Winston Churchill'], faction: 'europe', birth: 1874, death: 1965, birthPlace: '牛津', title: '英国首相', roles: ['二战领袖'], avatar: '丘', bio: '二战英国首相，反法西斯领袖之一。', events: [ { year: 1940, place: '伦敦', desc: '出任首相，领导不列颠空战' } ] },
  { id: 'gandhi', name: '甘地', courtesy: '', alias: ['Mahatma Gandhi'], faction: 'asia', birth: 1869, death: 1948, birthPlace: '波尔班达', title: '印度国父', roles: ['非暴力抗争'], avatar: '甘', bio: '非暴力不合作运动，领导印度独立。', events: [ { year: 1930, place: '德里', desc: '盐税长征' }, { year: 1947, place: '德里', desc: '印度独立' } ] },
  { id: 'oppenheimer', name: '奥本海默', courtesy: '', alias: ['J. Robert Oppenheimer'], faction: 'america', birth: 1904, death: 1967, birthPlace: '纽约', title: '物理学家', roles: ['原子弹之父'], avatar: '奥', bio: '曼哈顿计划科学主管。', events: [ { year: 1945, place: '华盛顿', desc: '三位一体核试验' } ] },
  { id: 'mandela', name: '曼德拉', courtesy: '', alias: ['Nelson Mandela'], faction: 'africa', birth: 1918, death: 2013, birthPlace: '姆韦佐', title: '南非总统', roles: ['反种族隔离'], avatar: '曼', bio: '27 年牢狱后当选南非首任民选总统。', events: [ { year: 1994, place: '约翰内斯堡', desc: '当选南非首任民选总统' } ] },
  { id: 'mlk', name: '马丁·路德·金', courtesy: '', alias: ['Martin Luther King Jr.'], faction: 'america', birth: 1929, death: 1968, birthPlace: '亚特兰大', title: '民权领袖', roles: ['非暴力抗争'], avatar: '金', bio: '美国民权运动领袖，1964 诺贝尔和平奖。', events: [ { year: 1963, place: '华盛顿', desc: '我有一个梦想演讲' } ] },
  { id: 'turing', name: '图灵', courtesy: '', alias: ['Alan Turing'], faction: 'europe', birth: 1912, death: 1954, birthPlace: '伦敦', title: '计算机之父', roles: ['密码破译','计算机'], avatar: '图', bio: '二战破译德军 Enigma，奠基计算机科学。', events: [ { year: 1936, place: '伦敦', desc: '提出图灵机模型' } ] },
  { id: 'fleming', name: '弗莱明', courtesy: '', alias: ['Alexander Fleming'], faction: 'europe', birth: 1881, death: 1955, birthPlace: '洛克菲尔德', title: '细菌学家', roles: ['青霉素'], avatar: '弗', bio: '青霉素发现者，1945 诺奖。', events: [ { year: 1928, place: '伦敦', desc: '发现青霉素' } ] },
  { id: 'armstrong', name: '阿姆斯特朗', courtesy: '', alias: ['Neil Armstrong'], faction: 'america', birth: 1930, death: 2012, birthPlace: '沃帕科内塔', title: '宇航员', roles: ['登月第一人'], avatar: '阿', bio: '1969 年阿波罗 11 号成为登月第一人。', events: [ { year: 1969, place: '月球静海', desc: '阿波罗 11 号登月' } ] },
  { id: 'gorbachev', name: '戈尔巴乔夫', courtesy: '', alias: ['Mikhail Gorbachev'], faction: 'europe', birth: 1931, death: 2022, birthPlace: '普里沃利诺耶', title: '苏联总统', roles: ['改革开放'], avatar: '戈', bio: '推行"公开化""改革"，1990 诺贝尔和平奖，苏联解体。', events: [ { year: 1985, place: '莫斯科', desc: '出任苏共总书记' }, { year: 1991, place: '莫斯科', desc: '苏联解体' } ] },
];

const RELATIONS = [
  { source: 'einstein', target: 'oppenheimer', type: '同代', label: '同时代物理学家', year: 1945 },
  { source: 'fdr', target: 'churchill', type: '同僚', label: '二战同盟国领袖', year: 1941 },
  { source: 'gandhi', target: 'mlk', type: '师承', label: '非暴力思想影响', year: 1955 },
  { source: 'wright', target: 'armstrong', type: '同代', label: '从首飞到登月', year: 1969 },
];

const EVENTS = [
  { id: 'e1', name: '莱特兄弟首飞', year: 1903, domain: '科技', location: '华盛顿', desc: '人类首次有动力载人飞行。', participants: ['wright'] },
  { id: 'e2', name: '相对论', year: 1905, domain: '科技', location: '柏林', desc: '爱因斯坦发表狭义相对论。', participants: ['einstein'] },
  { id: 'e3', name: '萨拉热窝事件', year: 1914, domain: '军事', location: '萨拉热窝', desc: '普林西普刺杀斐迪南，一战导火索。', participants: [] },
  { id: 'e4', name: '一战', year: 1914, domain: '军事', location: '萨拉热窝', desc: '第一次世界大战爆发。', participants: [] },
  { id: 'e5', name: '俄国十月革命', year: 1917, domain: '政治', location: '莫斯科', desc: '列宁领导布尔什维克夺权。', participants: ['lenin_mw'] },
  { id: 'e6', name: '大萧条', year: 1929, domain: '政治', location: '纽约', desc: '华尔街股灾引发全球经济危机。', participants: [] },
  { id: 'e7', name: '青霉素', year: 1928, domain: '科技', location: '伦敦', desc: '弗莱明发现青霉素。', participants: ['fleming'] },
  { id: 'e8', name: '图灵机', year: 1936, domain: '科技', location: '伦敦', desc: '图灵提出计算机理论模型。', participants: ['turing'] },
  { id: 'e9', name: '二战爆发', year: 1939, domain: '军事', location: '柏林', desc: '德国入侵波兰。', participants: [] },
  { id: 'e10', name: '珍珠港', year: 1941, domain: '军事', location: '珍珠港', desc: '日本偷袭珍珠港，太平洋战争爆发。', participants: ['fdr'] },
  { id: 'e11', name: '斯大林格勒', year: 1942, domain: '军事', location: '斯大林格勒', desc: '苏德战场转折点。', participants: [] },
  { id: 'e12', name: '诺曼底登陆', year: 1944, domain: '军事', location: '诺曼底', desc: '盟军开辟欧洲第二战场。', participants: [] },
  { id: 'e13', name: '三位一体核试', year: 1945, domain: '科技', location: '华盛顿', desc: '人类首次核试验。', participants: ['oppenheimer'] },
  { id: 'e14', name: '广岛核弹', year: 1945, domain: '军事', location: '广岛', desc: '美国在日本投下原子弹。', participants: [] },
  { id: 'e15', name: '联合国成立', year: 1945, domain: '外交', location: '纽约', desc: '战后国际秩序建立。', participants: [] },
  { id: 'e16', name: '印度独立', year: 1947, domain: '政治', location: '德里', desc: '甘地领导的非暴力运动结果。', participants: ['gandhi'] },
  { id: 'e17', name: '以色列建国', year: 1948, domain: '政治', location: '耶路撒冷', desc: '引发后续中东战争。', participants: [] },
  { id: 'e18', name: '我有一个梦想', year: 1963, domain: '文化', location: '华盛顿', desc: '马丁·路德·金林肯纪念堂演讲。', participants: ['mlk'] },
  { id: 'e19', name: '阿波罗 11 号登月', year: 1969, domain: '科技', location: '月球静海', desc: '人类首次登月。', participants: ['armstrong'] },
  { id: 'e20', name: '柏林墙倒', year: 1989, domain: '政治', location: '柏林墙', desc: '冷战秩序开始瓦解。', participants: [] },
  { id: 'e21', name: '苏联解体', year: 1991, domain: '政治', location: '莫斯科', desc: '冷战结束。', participants: ['gorbachev'] },
  { id: 'e22', name: '曼德拉就职', year: 1994, domain: '政治', location: '约翰内斯堡', desc: '南非结束种族隔离。', participants: ['mandela'] },
];

export const modern_worldAtlas = {
  id: 'modern_world', name: '现代世界', subtitle: '20 世纪至当代（1900–2025年）', version: '1.0.0',
  startYear: 1900, endYear: 2025,
  mapView: { center: [10, 25], zoom: 2, minZoom: 2, maxZoom: 12, labelZoom: { hideAll: 2, hideEvents: 4 }, importanceZoom: [3, 5], cityZoom: 4, baseLayer: 'satellite' },
  domains: [
    { name: '政治', color: '#2f5d8a' }, { name: '军事', color: '#b23a2e' },
    { name: '科技', color: '#2d8a6e' }, { name: '文化', color: '#7b4b94' }, { name: '外交', color: '#b8893a' },
  ],
  factions: FACTIONS, places: PLACES, persons: PERSONS, relations: RELATIONS, events: EVENTS,
  importance: makeImportance({
    personRank: {
      einstein: 1, lenin_mw: 1, fdr: 1, churchill: 1, gandhi: 1, oppenheimer: 1, mandela: 1,
      marie_curie: 1, turing: 1, gorbachev: 1, mlk: 1, armstrong: 1,
      wright: 2, fleming: 2,
    },
    eventRank: { e5: 1, e9: 1, e14: 1, e19: 1, e20: 1, e21: 1 },
    defaultEvent: 2,
  }),
  birthplaceModern: {},
  birthplaceCoords: {
    '乌尔姆': [9.99, 48.40], '华沙': [21.01, 52.23], '代顿': [-84.19, 39.76], '辛比尔斯克': [48.40, 54.32],
    '海德公园': [-73.94, 41.79], '牛津': [-1.26, 51.75], '波尔班达': [69.66, 21.64], '纽约': [-74.0, 40.71],
    '姆韦佐': [27.6, -32.0], '亚特兰大': [-84.39, 33.75], '洛克菲尔德': [-3.55, 55.91],
    '沃帕科内塔': [-84.27, 40.74], '普里沃利诺耶': [39.30, 54.15], '柏林': [13.41, 52.52],
    '巴黎': [2.35, 48.86], '德里': [77.21, 28.61], '约翰内斯堡': [28.04, -26.20],
  },
  personImages: {},
  timelineTicks: [1900, 1914, 1917, 1939, 1945, 1969, 1989, 1991, 2025],
};
