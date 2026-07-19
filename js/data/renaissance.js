/* 文艺复兴与大航海（1400–1600年）· 世界文明 */

import { makeImportance } from './index.js';

const FACTIONS = [
  { id: 'italy', name: '意大利城邦', color: '#2f5d8a', founded: 1400, capital: '佛罗伦萨', capitalFrom: 1400, desc: '文艺复兴发源地。' },
  { id: 'spain', name: '西班牙', color: '#b23a2e', founded: 1492, capital: '马德里', capitalFrom: 1561, desc: '伊莎贝拉与斐迪南统一。' },
  { id: 'portugal', name: '葡萄牙', color: '#2d8a6e', founded: 1139, capital: '里斯本', capitalFrom: 1255, desc: '大航海先驱。' },
  { id: 'germany', name: '德意志', color: '#b8893a', founded: 1400, capital: '维滕贝格', capitalFrom: 1400, desc: '宗教改革发源地。' },
  { id: 'church2', name: '教会', color: '#7b4b94', founded: 1400, capital: '罗马', capitalFrom: 1400, desc: '罗马教廷' },
];

const PLACES = [
  { id: 'florence', name: '佛罗伦萨', modern: '意大利佛罗伦萨', coord: [11.26, 43.77], note: '文艺复兴摇篮' },
  { id: 'rome3', name: '罗马', modern: '意大利罗马', coord: [12.50, 41.90], note: '教廷' },
  { id: 'venice', name: '威尼斯', modern: '意大利威尼斯', coord: [12.34, 45.44], note: '海上商业共和国' },
  { id: 'milan2', name: '米兰', modern: '意大利米兰', coord: [9.19, 45.46], note: '公国' },
  { id: 'madrid', name: '马德里', modern: '西班牙马德里', coord: [-3.70, 40.42], note: '西班牙都' },
  { id: 'lisbon', name: '里斯本', modern: '葡萄牙里斯本', coord: [-9.14, 38.72], note: '葡萄牙都' },
  { id: 'wittenberg', name: '维滕贝格', modern: '德国维滕贝格', coord: [12.65, 51.87], note: '宗教改革地' },
  { id: 'worms', name: '沃尔姆斯', modern: '德国沃尔姆斯', coord: [8.36, 49.64], note: '帝国议会' },
  { id: 'granada', name: '格拉纳达', modern: '西班牙格拉纳达', coord: [-3.60, 37.18], note: '穆斯林末代据点' },
  { id: 'genoa', name: '热那亚', modern: '意大利热那亚', coord: [8.95, 44.41], note: '哥伦布故里' },
  { id: 'americas', name: '新大陆', modern: '美洲', coord: [-70.0, 10.0], note: '哥伦布发现' },
  { id: 'calicut', name: '卡利卡特', modern: '印度科泽科德', coord: [75.78, 11.26], note: '达伽马登陆' },
  { id: 'magellan_st', name: '麦哲伦海峡', modern: '智利麦哲伦海峡', coord: [-70.0, -53.5], note: '环球航行' },
  { id: 'mombasa', name: '蒙巴萨', modern: '肯尼亚蒙巴萨', coord: [39.66, -4.04], note: '东非据点' },
  { id: 'malacca', name: '马六甲', modern: '马来西亚马六甲', coord: [102.25, 2.20], note: '香料贸易要冲' },
  { id: 'azores', name: '亚速尔', modern: '葡萄牙亚速尔', coord: [-25.67, 37.74], note: '大西洋中途' },
  { id: 'mainz', name: '美因茨', modern: '德国美因茨', coord: [8.25, 50.00], note: '古腾堡印刷地' },
  { id: 'geneva', name: '日内瓦', modern: '瑞士日内瓦', coord: [6.14, 46.20], note: '加尔文改革中心' },
  { id: 'london3', name: '伦敦', modern: '英国伦敦', coord: [-0.13, 51.51], note: '环球剧场' },
  { id: 'vinci', name: '芬奇镇', modern: '意大利托斯卡纳芬奇', coord: [10.92, 43.79], note: '达·芬奇出生地' },
  { id: 'amboise', name: '昂布瓦斯', modern: '法国昂布瓦斯', coord: [0.98, 47.41], note: '达·芬奇晚年居地' },
];

const PERSONS = [
  { id: 'petrarch', name: '彼特拉克', courtesy: '', alias: [], faction: 'italy', birth: 1304, death: 1374, birthPlace: '阿雷佐', title: '诗人', roles: ['文艺复兴之父'], avatar: '彼', bio: '人文主义先驱，重新发现古典文化。', events: [ { year: 1341, place: '罗马', desc: '在罗马获桂冠诗人' } ] },
  { id: 'medici', name: '科西莫·美第奇', courtesy: '', alias: [], faction: 'italy', birth: 1389, death: 1464, birthPlace: '佛罗伦萨', title: '僭主', roles: ['艺术赞助人'], avatar: '美', bio: '建立美第奇家族对佛罗伦萨的统治。', events: [ { year: 1434, place: '佛罗伦萨', desc: '成为佛罗伦萨实际统治者' } ] },
  { id: 'lorenzo_medici', name: '豪华者洛伦佐', courtesy: '', alias: [], faction: 'italy', birth: 1449, death: 1492, birthPlace: '佛罗伦萨', title: '僭主', roles: ['文艺复兴黄金时代'], avatar: '洛', bio: '集权、艺术与诗歌赞助的极盛时期。', events: [ { year: 1469, place: '佛罗伦萨', desc: '继任家族领袖' } ] },
  { id: 'leonardo', name: '达·芬奇', courtesy: '', alias: [], faction: 'italy', birth: 1452, death: 1519, birthPlace: '芬奇', title: '画家·发明家', roles: ['全能天才'], avatar: '达', bio: '《蒙娜丽莎》《最后的晚餐》、科学家、工程师。', events: [ { year: 1452, place: '芬奇镇', desc: '生于佛罗伦萨郊外芬奇镇，私生子' }, { year: 1466, place: '佛罗伦萨', desc: '入委罗基奥工坊学画，师从名师' }, { year: 1482, place: '米兰', desc: '仕于米兰公爵，绘制《最后的晚餐》' }, { year: 1502, place: '佛罗伦萨', desc: '为切萨雷·波吉亚任军事工程师' }, { year: 1503, place: '佛罗伦萨', desc: '开始绘制《蒙娜丽莎》' }, { year: 1513, place: '罗马', desc: '赴罗马教廷寻求教皇赞助' }, { year: 1516, place: '昂布瓦斯', desc: '应法王弗朗索瓦一世邀赴法国' }, { year: 1519, place: '昂布瓦斯', desc: '病逝于克鲁庄园，据传在法王怀中离世' } ] },
  { id: 'michelangelo', name: '米开朗基罗', courtesy: '', alias: [], faction: 'italy', birth: 1475, death: 1564, birthPlace: '卡普雷塞', title: '雕塑家·画家', roles: ['文艺复兴艺术巅峰'], avatar: '米', bio: '《大卫》、西斯廷天顶画。', events: [ { year: 1504, place: '佛罗伦萨', desc: '完成大卫像' }, { year: 1512, place: '罗马', desc: '完成西斯廷天顶画' } ] },
  { id: 'raphael', name: '拉斐尔', courtesy: '', alias: [], faction: 'italy', birth: 1483, death: 1520, birthPlace: '乌尔比诺', title: '画家', roles: ['古典美典范'], avatar: '拉', bio: '《雅典学院》和谐之美。', events: [ { year: 1511, place: '罗马', desc: '完成雅典学院' } ] },
  { id: 'galileo', name: '伽利略', courtesy: '', alias: [], faction: 'italy', birth: 1564, death: 1642, birthPlace: '比萨', title: '物理·天文学家', roles: ['近代科学之父'], avatar: '伽', bio: '改进望远镜、倡导日心说。', events: [ { year: 1610, place: '佛罗伦萨', desc: '发现木星卫星' } ] },
  { id: 'columbus', name: '哥伦布', courtesy: '', alias: [], faction: 'spain', birth: 1451, death: 1506, birthPlace: '热那亚', title: '航海家', roles: ['发现新大陆'], avatar: '哥', bio: '1492年抵达美洲，开启大航海。', events: [ { year: 1492, place: '新大陆', desc: '首次航行抵达美洲' } ] },
  { id: 'magellan', name: '麦哲伦', courtesy: '', alias: [], faction: 'spain', birth: 1480, death: 1521, birthPlace: '波尔图', title: '航海家', roles: ['首次环球航行'], avatar: '麦', bio: '人类首次环球航行（其本人死于菲律宾）。', events: [ { year: 1519, place: '麦哲伦海峡', desc: '开始环球航行' } ] },
  { id: 'da_gama', name: '达·伽马', courtesy: '', alias: [], faction: 'portugal', birth: 1469, death: 1524, birthPlace: '锡尼什', title: '航海家', roles: ['开辟东方航线'], avatar: '达', bio: '绕好望角抵达印度卡利卡特。', events: [ { year: 1498, place: '卡利卡特', desc: '抵达印度，开辟东方航线' } ] },
  { id: 'henry_nav', name: '恩里克王子', courtesy: '', alias: ['航海家亨利'], faction: 'portugal', birth: 1394, death: 1460, birthPlace: '波尔图', title: '航海赞助人', roles: ['大航海先驱'], avatar: '恩', bio: '设立航海学校，系统推动非洲西岸探索。', events: [ { year: 1419, place: '亚速尔', desc: '发现马德拉群岛' } ] },
  { id: 'isabella', name: '伊莎贝拉一世', courtesy: '', alias: [], faction: 'spain', birth: 1451, death: 1504, birthPlace: '马德里加尔', title: '卡斯蒂利亚女王', roles: ['统一西班牙'], avatar: '伊', bio: '与斐迪南联姻统一西班牙，资助哥伦布。', events: [ { year: 1492, place: '格拉纳达', desc: '攻陷格拉纳达，完成收复失地运动' } ] },
  { id: 'luther', name: '马丁·路德', courtesy: '', alias: [], faction: 'germany', birth: 1483, death: 1546, birthPlace: '艾斯莱本', title: '神学家', roles: ['宗教改革者'], avatar: '路', bio: '95条论纲开启宗教改革。', events: [ { year: 1517, place: '维滕贝格', desc: '发布九十五条论纲' }, { year: 1521, place: '沃尔姆斯', desc: '沃尔姆斯议会拒绝悔过' } ] },
  { id: 'calvin', name: '加尔文', courtesy: '', alias: [], faction: 'germany', birth: 1509, death: 1564, birthPlace: '努瓦永', title: '神学家', roles: ['改革宗创始人'], avatar: '加', bio: '《基督教要义》，日内瓦改革中心。', events: [ { year: 1536, place: '日内瓦', desc: '基督教要义出版' } ] },
  { id: 'copernicus', name: '哥白尼', courtesy: '', alias: [], faction: 'germany', birth: 1473, death: 1543, birthPlace: '托伦', title: '天文学家', roles: ['日心说创立者'], avatar: '哥', bio: '《天体运行论》开启科学革命。', events: [ { year: 1543, place: '罗马', desc: '临终出版天体运行论' } ] },
  { id: 'gutenberg', name: '古腾堡', courtesy: '', alias: [], faction: 'germany', birth: 1400, death: 1468, birthPlace: '美因茨', title: '发明家', roles: ['活字印刷术'], avatar: '古', bio: '欧洲活字印刷术奠基者，知识普及革命。', events: [ { year: 1455, place: '美因茨', desc: '印刷古腾堡圣经' } ] },
  { id: 'shakespeare', name: '莎士比亚', courtesy: '', alias: [], faction: 'italy', birth: 1564, death: 1616, birthPlace: '斯特拉福德', title: '剧作家', roles: ['英国文学之巅'], avatar: '莎', bio: '《哈姆雷特》《罗密欧与朱丽叶》等。', events: [ { year: 1599, place: '伦敦', desc: '环球剧场建成' } ] },
];

const RELATIONS = [
  { source: 'medici', target: 'lorenzo_medici', type: '亲属', label: '祖孙', year: 1469 },
  { source: 'lorenzo_medici', target: 'leonardo', type: '同朝', label: '赞助', year: 1469 },
  { source: 'leonardo', target: 'michelangelo', type: '同代', label: '文艺复兴双杰', year: 1500 },
  { source: 'isabella', target: 'columbus', type: '同朝', label: '赞助航海', year: 1492 },
  { source: 'luther', target: 'calvin', type: '同代', label: '新教改革', year: 1536 },
  { source: 'copernicus', target: 'galileo', type: '师承', label: '日心说传承', year: 1610 },
];

const EVENTS = [
  { id: 'e1', name: '文艺复兴兴起', year: 1400, domain: '文化', location: '佛罗伦萨', desc: '人文主义思潮兴起。', participants: ['medici'] },
  { id: 'e2', name: '美第奇僭主', year: 1434, domain: '政治', location: '佛罗伦萨', desc: '科西莫掌权，开启家族赞助时代。', participants: ['medici'] },
  { id: 'e3', name: '古腾堡圣经', year: 1455, domain: '科技', location: '美因茨', desc: '欧洲活字印刷首部重要书籍。', participants: ['gutenberg'] },
  { id: 'e4', name: '君士坦丁堡陷落', year: 1453, domain: '军事', location: '罗马', desc: '东罗马学者西迁，加速文艺复兴。', participants: [] },
  { id: 'e5', name: '大卫像完成', year: 1504, domain: '文化', location: '佛罗伦萨', desc: '米开朗基罗的雕塑巅峰。', participants: ['michelangelo'] },
  { id: 'e6', name: '蒙娜丽莎', year: 1503, domain: '文化', location: '佛罗伦萨', desc: '达·芬奇开始绘制。', participants: ['leonardo'] },
  { id: 'e7', name: '雅典学院', year: 1511, domain: '文化', location: '罗马', desc: '拉斐尔梵蒂冈壁画完成。', participants: ['raphael'] },
  { id: 'e8', name: '西斯廷天顶画', year: 1512, domain: '文化', location: '罗马', desc: '米开朗基罗四年心血。', participants: ['michelangelo'] },
  { id: 'e9', name: '九十五条论纲', year: 1517, domain: '宗教', location: '维滕贝格', desc: '马丁·路德开启宗教改革。', participants: ['luther'] },
  { id: 'e10', name: '沃尔姆斯议会', year: 1521, domain: '宗教', location: '沃尔姆斯', desc: '路德当庭拒绝悔过。', participants: ['luther'] },
  { id: 'e11', name: '麦哲伦环球航行', year: 1519, domain: '外交', location: '麦哲伦海峡', desc: '首次环球航行开始。', participants: ['magellan'] },
  { id: 'e12', name: '天体运行论', year: 1543, domain: '科技', location: '罗马', desc: '哥白尼日心说问世。', participants: ['copernicus'] },
  { id: 'e13', name: '收复格拉纳达', year: 1492, domain: '军事', location: '格拉纳达', desc: '完成收复失地运动。', participants: ['isabella'] },
  { id: 'e14', name: '哥伦布发现美洲', year: 1492, domain: '外交', location: '新大陆', desc: '欧洲人首次到达美洲（维京除外）。', participants: ['columbus', 'isabella'] },
  { id: 'e15', name: '达·伽马抵印度', year: 1498, domain: '外交', location: '卡利卡特', desc: '开辟东方航线。', participants: ['da_gama'] },
  { id: 'e16', name: '基督教要义', year: 1536, domain: '宗教', location: '日内瓦', desc: '加尔文改革宗基础。', participants: ['calvin'] },
  { id: 'e17', name: '伽利略发现木星卫星', year: 1610, domain: '科技', location: '佛罗伦萨', desc: '支持日心说的证据。', participants: ['galileo'] },
  { id: 'e18', name: '环球剧场建成', year: 1599, domain: '文化', location: '伦敦', desc: '莎士比亚剧作常演之地。', participants: ['shakespeare'] },
];

export const renaissanceAtlas = {
  id: 'renaissance',
  name: '文艺复兴与大航海',
  subtitle: '人文复兴 · 海洋开拓（1400–1600年）',
  startYear: 1400,
  endYear: 1600,
  mapView: { center: [10, 42], zoom: 3, minZoom: 2, maxZoom: 12, labelZoom: { hideAll: 3, hideEvents: 5 }, importanceZoom: [4, 6], cityZoom: 5, baseLayer: 'satellite' },
  domains: [
    { name: '文化', color: '#7b4b94' },
    { name: '军事', color: '#b23a2e' },
    { name: '政治', color: '#2f5d8a' },
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
      leonardo: 1, michelangelo: 1, raphael: 1, columbus: 1, magellan: 1,
      luther: 1, isabella: 1, copernicus: 1, galileo: 1, gutenberg: 1, medici: 1,
      shakespeare: 1, lorenzo_medici: 2, da_gama: 2, henry_nav: 2,
      petrarch: 2, calvin: 2,
    },
    eventRank: { e3: 1, e9: 1, e11: 1, e12: 1, e14: 1, e15: 1 },
    defaultEvent: 2,
  }),
  birthplaceModern: {},
  birthplaceCoords: {
    '阿雷佐': [11.88, 43.47], '芬奇': [10.92, 43.79], '卡普雷塞': [11.96, 43.65],
    '乌尔比诺': [12.64, 43.73], '比萨': [10.40, 43.72], '热那亚': [8.95, 44.41],
    '波尔图': [-8.61, 41.15], '锡尼什': [-8.79, 37.96], '马德里加尔': [-4.91, 41.10],
    '艾斯莱本': [11.30, 51.53], '努瓦永': [2.99, 49.58], '托伦': [18.60, 53.03],
    '美因茨': [8.25, 50.00], '斯特拉福德': [-1.71, 52.19], '日内瓦': [6.14, 46.20], '伦敦': [-0.13, 51.51],
  },
  personImages: {},
  timelineTicks: [1400, 1455, 1492, 1517, 1519, 1543, 1600],
};
