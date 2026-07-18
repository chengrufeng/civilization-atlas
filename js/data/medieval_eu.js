/* 中世纪欧洲（476–1453年）· 世界文明 */

import { makeImportance } from './index.js';

const FACTIONS = [
  { id: 'byz', name: '拜占庭', color: '#2f5d8a', founded: 330, capital: '君士坦丁堡', capitalFrom: 330, desc: '东罗马帝国' },
  { id: 'frank', name: '法兰克', color: '#b23a2e', founded: 481, capital: '亚琛', capitalFrom: 800, desc: '加洛林帝国' },
  { id: 'islam', name: '伊斯兰', color: '#2d8a6e', founded: 622, capital: '麦地那', capitalFrom: 622, desc: '哈里发国家' },
  { id: 'holy_roman', name: '神圣罗马', color: '#b8893a', founded: 800, capital: '亚琛', capitalFrom: 800, desc: '日耳曼神圣罗马帝国' },
  { id: 'church', name: '教会', color: '#7b4b94', founded: 476, capital: '罗马', capitalFrom: 476, desc: '罗马天主教' },
];

const PLACES = [
  { id: 'constantinople', name: '君士坦丁堡', modern: '土耳其伊斯坦布尔', coord: [28.98, 41.01], note: '拜占庭都' },
  { id: 'rome_eu', name: '罗马', modern: '意大利罗马', coord: [12.50, 41.90], note: '教廷所在地' },
  { id: 'aachen', name: '亚琛', modern: '德国亚琛', coord: [6.08, 50.78], note: '查理曼都' },
  { id: 'paris', name: '巴黎', modern: '法国巴黎', coord: [2.35, 48.86], note: '卡佩都' },
  { id: 'london', name: '伦敦', modern: '英国伦敦', coord: [-0.13, 51.51], note: '英格兰都' },
  { id: 'jerusalem2', name: '耶路撒冷', modern: '以色列耶路撒冷', coord: [35.23, 31.78], note: '圣地' },
  { id: 'mecca', name: '麦加', modern: '沙特麦加', coord: [39.86, 21.39], note: '伊斯兰圣地' },
  { id: 'medina', name: '麦地那', modern: '沙特麦地那', coord: [39.61, 24.47], note: '早期哈里发都' },
  { id: 'damascus', name: '大马士革', modern: '叙利亚大马士革', coord: [36.30, 33.51], note: '倭马亚都' },
  { id: 'baghdad', name: '巴格达', modern: '伊拉克巴格达', coord: [44.36, 33.31], note: '阿拔斯都' },
  { id: 'cordoba', name: '科尔多瓦', modern: '西班牙科尔多瓦', coord: [-4.78, 37.89], note: '安达卢斯中心' },
  { id: 'tours', name: '图尔', modern: '法国图尔', coord: [0.68, 47.39], note: '图尔-普瓦蒂埃战役' },
  { id: 'hastings', name: '黑斯廷斯', modern: '英国黑斯廷斯', coord: [0.59, 50.85], note: '诺曼征服' },
  { id: 'canossa', name: '卡诺莎', modern: '意大利卡诺莎', coord: [10.40, 44.40], note: '教权之争' },
  { id: 'clermont', name: '克莱蒙', modern: '法国克莱蒙', coord: [3.08, 45.78], note: '教皇呼吁东征' },
  { id: 'hattin', name: '哈丁', modern: '以色列哈丁角', coord: [35.55, 32.90], note: '哈丁战役' },
  { id: 'agra', name: '阿克里', modern: '以色列阿克里', coord: [35.10, 32.93], note: '十字军港口' },
  { id: 'lisieux', name: '鲁昂', modern: '法国鲁昂', coord: [1.10, 49.44], note: '圣女贞德火刑处' },
  { id: 'orleans', name: '奥尔良', modern: '法国奥尔良', coord: [1.91, 47.90], note: '奥尔良之围' },
  { id: 'ravenna2', name: '拉文纳', modern: '意大利拉文纳', coord: [12.20, 44.42], note: '但丁葬地' },
];

const PERSONS = [
  { id: 'justinian', name: '查士丁尼一世', courtesy: '', alias: [], faction: 'byz', birth: 482, death: 565, birthPlace: '托莱索', title: '拜占庭皇帝', roles: ['法典编纂者'], avatar: '查', bio: '《查士丁尼法典》、圣索菲亚、再征服西部。', events: [ { year: 528, place: '君士坦丁堡', desc: '编订查士丁尼法典' }, { year: 537, place: '君士坦丁堡', desc: '圣索菲亚大教堂落成' } ] },
  { id: 'theodora', name: '狄奥多拉', courtesy: '', alias: [], faction: 'byz', birth: 500, death: 548, birthPlace: '君士坦丁堡', title: '皇后', roles: ['女政治家'], avatar: '狄', bio: '查士丁尼之妻， actresses 出身，影响帝国政策。', events: [ { year: 532, place: '君士坦丁堡', desc: '尼卡之乱中劝说查士丁尼坚守' } ] },
  { id: 'muhammad', name: '穆罕默德', courtesy: '', alias: [], faction: 'islam', birth: 570, death: 632, birthPlace: '麦加', title: '先知', roles: ['伊斯兰创立者'], avatar: '穆', bio: '创立伊斯兰教，统一阿拉伯半岛。', events: [ { year: 622, place: '麦地那', desc: '从麦加迁至麦地那（徙志年/希吉拉）' }, { year: 630, place: '麦加', desc: '和平光复麦加' } ] },
  { id: 'abu_bakr', name: '阿布·伯克尔', courtesy: '', alias: [], faction: 'islam', birth: 573, death: 634, birthPlace: '麦加', title: '首任哈里发', roles: ['哈里发'], avatar: '阿', bio: '穆罕默德岳父与首任正统哈里发。', events: [ { year: 632, place: '麦地那', desc: '就任首任哈里发' } ] },
  { id: 'umar', name: '欧麦尔一世', courtesy: '', alias: [], faction: 'islam', birth: 586, death: 644, birthPlace: '麦加', title: '第二任哈里发', roles: ['征服者'], avatar: '欧', bio: '征服波斯、叙利亚、埃及，奠定阿拉伯帝国。', events: [ { year: 636, place: '大马士革', desc: '雅尔穆克战役击败拜占庭' } ] },
  { id: 'charles_martel', name: '查理·马特', courtesy: '', alias: [], faction: 'frank', birth: 688, death: 741, birthPlace: '巴黎', title: '宫相', roles: ['宫相·军事家'], avatar: '马', bio: '图尔战役击败阿拉伯，阻止其北上。', events: [ { year: 732, place: '图尔', desc: '图尔-普瓦蒂埃战役' } ] },
  { id: 'charlemagne', name: '查理曼', courtesy: '', alias: ['查理大帝'], faction: 'frank', birth: 742, death: 814, birthPlace: '亚琛', title: '皇帝', roles: ['加洛林文艺复兴'], avatar: '查', bio: '统一西欧，800年由教皇加冕为罗马皇帝。', events: [ { year: 774, place: '罗马', desc: '征服伦巴第' }, { year: 800, place: '罗马', desc: '教皇加冕为罗马皇帝' } ] },
  { id: 'gregory_vii', name: '格里高利七世', courtesy: '', alias: [], faction: 'church', birth: 1015, death: 1085, birthPlace: '罗马', title: '教皇', roles: ['教权捍卫者'], avatar: '格', bio: '卡诺莎之辱，与亨利四世争叙任权。', events: [ { year: 1077, place: '卡诺莎', desc: '亨利四世卡诺莎请罪' } ] },
  { id: 'urban_ii', name: '乌尔班二世', courtesy: '', alias: [], faction: 'church', birth: 1042, death: 1099, birthPlace: '法国', title: '教皇', roles: ['第一次十字军发起者'], avatar: '乌', bio: '克莱蒙宗教会议呼吁十字军东征。', events: [ { year: 1095, place: '克莱蒙', desc: '呼吁发动十字军东征' } ] },
  { id: 'saladin', name: '萨拉丁', courtesy: '', alias: [], faction: 'islam', birth: 1137, death: 1193, birthPlace: '提克里特', title: '阿尤布苏丹', roles: ['收复耶路撒冷'], avatar: '萨', bio: '哈丁战役击败十字军，收复耶路撒冷。', events: [ { year: 1187, place: '哈丁', desc: '哈丁战役' }, { year: 1187, place: '耶路撒冷', desc: '收复耶路撒冷' } ] },
  { id: 'richard_i', name: '理查一世', courtesy: '', alias: ['狮心王'], faction: 'holy_roman', birth: 1157, death: 1199, birthPlace: '牛津', title: '英格兰国王', roles: ['第三次十字军领袖'], avatar: '理', bio: '与萨拉丁既敌对又惺惺相惜。', events: [ { year: 1191, place: '阿克里', desc: '攻占阿克里' } ] },
  { id: 'fred_ii', name: '腓特烈二世', courtesy: '', alias: [], faction: 'holy_roman', birth: 1194, death: 1250, birthPlace: '杰西', title: '皇帝', roles: ['世界奇迹'], avatar: '腓', bio: '多语言学者、科学赞助人，与教廷长期冲突。', events: [ { year: 1220, place: '罗马', desc: '加冕为神圣罗马皇帝' } ] },
  { id: 'aquinas', name: '托马斯·阿奎那', courtesy: '', alias: [], faction: 'church', birth: 1225, death: 1274, birthPlace: '罗卡塞卡', title: '神学家', roles: ['经院哲学集大成者'], avatar: '阿', bio: '《神学大全》调和信仰与理性。', events: [ { year: 1273, place: '罗马', desc: '完成神学大全' } ] },
  { id: 'dante', name: '但丁', courtesy: '', alias: [], faction: 'church', birth: 1265, death: 1321, birthPlace: '佛罗伦萨', title: '诗人', roles: ['意大利文艺复兴先驱'], avatar: '但', bio: '《神曲》意大利文学之父。', events: [ { year: 1320, place: '拉文纳', desc: '完成神曲' } ] },
  { id: 'william_i', name: '征服者威廉', courtesy: '', alias: [], faction: 'holy_roman', birth: 1028, death: 1087, birthPlace: '法莱兹', title: '英格兰国王', roles: ['诺曼征服'], avatar: '威', bio: '黑斯廷斯战役征服英格兰。', events: [ { year: 1066, place: '黑斯廷斯', desc: '黑斯廷斯战役' } ] },
  { id: 'joan', name: '圣女贞德', courtesy: '', alias: [], faction: 'church', birth: 1412, death: 1431, birthPlace: '栋雷米', title: '军事领袖', roles: ['法国民族英雄'], avatar: '贞', bio: '少女率军解奥尔良之围，最终被火刑。', events: [ { year: 1429, place: '奥尔良', desc: '解奥尔良之围' }, { year: 1431, place: '鲁昂', desc: '被处以火刑' } ] },
  { id: 'marco_polo', name: '马可波罗', courtesy: '', alias: ['Marco Polo'], faction: 'church', birth: 1254, death: 1324, birthPlace: '威尼斯', title: '旅行家', roles: ['东西方交流桥梁'], avatar: '马', bio: '1271-1295 年旅居东方，仕元十七年，口述《马可波罗游记》深刻影响欧洲对东方的想象。', events: [ { year: 1271, place: '罗马', desc: '随父叔从威尼斯东行' }, { year: 1295, place: '罗马', desc: '回到威尼斯' } ] },
  { id: 'mehmed_ii', name: '穆罕默德二世', courtesy: '', alias: [], faction: 'islam', birth: 1432, death: 1481, birthPlace: '埃迪尔内', title: '奥斯曼苏丹', roles: ['征服者'], avatar: '穆', bio: '21岁攻陷君士坦丁堡，灭拜占庭。', events: [ { year: 1453, place: '君士坦丁堡', desc: '攻陷君士坦丁堡' } ] },
];

const RELATIONS = [
  { source: 'justinian', target: 'theodora', type: '亲属', label: '夫妻共治', year: 527 },
  { source: 'muhammad', target: 'abu_bakr', type: '同阵营', label: '岳父-继任', year: 632 },
  { source: 'muhammad', target: 'umar', type: '同阵营', label: '顾问-继任', year: 634 },
  { source: 'charles_martel', target: 'charlemagne', type: '亲属', label: '祖孙', year: 742 },
  { source: 'urban_ii', target: 'saladin', type: '敌对', label: '十字军与穆斯林', year: 1095 },
  { source: 'saladin', target: 'richard_i', type: '敌对', label: '第三次十字军', year: 1191 },
  { source: 'muhammad', target: 'mehmed_ii', type: '同阵营', label: '伊斯兰世界', year: 1453 },
];

const EVENTS = [
  { id: 'e1', name: '查士丁尼法典', year: 528, domain: '政治', location: '君士坦丁堡', desc: '系统编纂罗马法。', participants: ['justinian'] },
  { id: 'e2', name: '圣索菲亚落成', year: 537, domain: '科技', location: '君士坦丁堡', desc: '拜占庭建筑巅峰。', participants: ['justinian', 'theodora'] },
  { id: 'e3', name: '尼卡之乱', year: 532, domain: '政治', location: '君士坦丁堡', desc: '狄奥多拉劝说查士丁尼不退。', participants: ['justinian', 'theodora'] },
  { id: 'e4', name: '徙志', year: 622, domain: '宗教', location: '麦地那', desc: '穆罕默德迁居麦地那，伊斯兰历元年。', participants: ['muhammad'] },
  { id: 'e5', name: '光复麦加', year: 630, domain: '军事', location: '麦加', desc: '穆罕默德和平入城。', participants: ['muhammad'] },
  { id: 'e6', name: '阿拉伯大征服', year: 636, domain: '军事', location: '大马士革', desc: '欧麦尔击败拜占庭与波斯。', participants: ['umar'] },
  { id: 'e7', name: '图尔战役', year: 732, domain: '军事', location: '图尔', desc: '查理·马特阻止阿拉伯北上。', participants: ['charles_martel'] },
  { id: 'e8', name: '查理曼加冕', year: 800, domain: '政治', location: '罗马', desc: '教皇加冕查理曼为罗马皇帝。', participants: ['charlemagne'] },
  { id: 'e9', name: '诺曼征服', year: 1066, domain: '军事', location: '黑斯廷斯', desc: '诺曼底公爵威廉征服英格兰。', participants: ['william_i'] },
  { id: 'e10', name: '卡诺莎之辱', year: 1077, domain: '宗教', location: '卡诺莎', desc: '亨利四世雪地请罪。', participants: ['gregory_vii'] },
  { id: 'e11', name: '第一次十字军', year: 1095, domain: '宗教', location: '克莱蒙', desc: '教皇乌尔班二世呼吁东征。', participants: ['urban_ii'] },
  { id: 'e12', name: '哈丁战役', year: 1187, domain: '军事', location: '哈丁', desc: '萨拉丁大败十字军。', participants: ['saladin'] },
  { id: 'e13', name: '收复耶路撒冷', year: 1187, domain: '宗教', location: '耶路撒冷', desc: '萨拉丁收复圣城。', participants: ['saladin'] },
  { id: 'e14', name: '第三次十字军', year: 1191, domain: '军事', location: '阿克里', desc: '狮心王理查与萨拉丁对决。', participants: ['richard_i', 'saladin'] },
  { id: 'e15', name: '神学大全', year: 1273, domain: '宗教', location: '罗马', desc: '经院哲学集大成。', participants: ['aquinas'] },
  { id: 'e16', name: '神曲完成', year: 1320, domain: '文化', location: '拉文纳', desc: '但丁完成《神曲》。', participants: ['dante'] },
  { id: 'e17', name: '奥尔良之围', year: 1429, domain: '军事', location: '奥尔良', desc: '圣女贞德解围。', participants: ['joan'] },
  { id: 'e18', name: '君士坦丁堡陷落', year: 1453, domain: '军事', location: '君士坦丁堡', desc: '奥斯曼灭拜占庭，中世纪结束。', participants: ['mehmed_ii'] },
];

export const medieval_euAtlas = {
  id: 'medieval_eu',
  name: '中世纪欧洲',
  subtitle: '信仰与剑（476–1453年）',
  startYear: 476,
  endYear: 1453,
  mapView: { center: [15, 42], zoom: 4, minZoom: 2, maxZoom: 12, labelZoom: { hideAll: 3, hideEvents: 6 }, importanceZoom: [4, 6], cityZoom: 5, baseLayer: 'satellite' },
  domains: [
    { name: '军事', color: '#b23a2e' },
    { name: '政治', color: '#2f5d8a' },
    { name: '宗教', color: '#b8893a' },
    { name: '文化', color: '#7b4b94' },
    { name: '科技', color: '#2d8a6e' },
    { name: '外交', color: '#8a6d3b' },
  ],
  factions: FACTIONS,
  places: PLACES,
  persons: PERSONS,
  relations: RELATIONS,
  events: EVENTS,
  importance: makeImportance({
    personRank: {
      justinian: 1, muhammad: 1, charlemagne: 1, saladin: 1, dante: 1,
      gregory_vii: 1, urban_ii: 1, mehmed_ii: 1, joan: 1, charles_martel: 1,
      theodora: 2, umar: 2, abu_bakr: 2, william_i: 2, fred_ii: 2, aquinas: 2, richard_i: 2,
    },
    eventRank: { e1: 1, e4: 1, e8: 1, e10: 1, e18: 1, e11: 1 },
    defaultEvent: 2,
  }),
  birthplaceModern: {},
  birthplaceCoords: {
    '托莱索': [23.0, 41.6], '法国': [2.3, 47.0], '提克里特': [43.69, 34.60],
    '牛津': [-1.26, 51.75], '杰西': [19.0, 40.4], '罗卡塞卡': [13.84, 41.49],
    '佛罗伦萨': [11.26, 43.77], '法莱兹': [-0.06, 48.85], '栋雷米': [5.30, 48.46], '埃迪尔内': [26.56, 41.68],
  },
  personImages: {},
  timelineTicks: [476, 622, 800, 1066, 1187, 1453],
};
