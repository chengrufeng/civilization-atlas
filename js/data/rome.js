/* 古罗马（前753–476年）· 世界文明 */

import { makeImportance } from './index.js';

const FACTIONS = [
  { id: 'kingdom', name: '王政', color: '#b8893a', founded: -753, capital: '罗马', capitalFrom: -753, desc: '七王时代。' },
  { id: 'republic', name: '罗马共和国', color: '#b23a2e', founded: -509, capital: '罗马', capitalFrom: -509, desc: '元老院执政官制。' },
  { id: 'empire', name: '罗马帝国', color: '#2f5d8a', founded: -27, capital: '罗马', capitalFrom: -27, desc: '帝国时代（含后期东西部）' },
  { id: 'christian', name: '基督教', color: '#7b4b94', founded: 30, capital: '罗马', capitalFrom: 30, desc: '早期基督教与文化人物' },
];

const PLACES = [
  { id: 'rome', name: '罗马', modern: '意大利罗马', coord: [12.50, 41.90], note: '永恒之城' },
  { id: 'carthage', name: '迦太基', modern: '突尼斯迦太基', coord: [10.32, 36.85], note: '海上强国' },
  { id: 'cannae', name: '坎尼', modern: '意大利坎尼', coord: [15.13, 41.27], note: '坎尼会战' },
  { id: 'zama', name: '扎马', modern: '突尼斯扎马', coord: [9.36, 35.91], note: '扎马之战' },
  { id: 'actium', name: '亚克兴', modern: '希腊亚克兴', coord: [20.74, 39.0], note: '亚克兴海战' },
  { id: 'pompeii', name: '庞贝', modern: '意大利庞贝', coord: [14.49, 40.75], note: '维苏威火山埋葬' },
  { id: 'byzantium', name: '拜占庭', modern: '土耳其伊斯坦布尔', coord: [28.98, 41.01], note: '君士坦丁堡前身' },
  { id: 'britain', name: '不列颠', modern: '英国', coord: [-1.0, 52.0], note: '罗马行省' },
  { id: 'gaul', name: '高卢', modern: '法国', coord: [2.5, 47.0], note: '凯撒征服' },
  { id: 'jerusalem', name: '耶路撒冷', modern: '以色列耶路撒冷', coord: [35.23, 31.78], note: '犹太战乱' },
  { id: 'milan', name: '米兰', modern: '意大利米兰', coord: [9.19, 45.46], note: '后期都' },
  { id: 'ravenna', name: '拉文纳', modern: '意大利拉文纳', coord: [12.20, 44.42], note: '西罗马末都' },
  { id: '-vesuvius', name: '维苏威', modern: '意大利维苏威', coord: [14.43, 40.82], note: '火山' },
  { id: 'rhine', name: '莱茵河', modern: '莱茵河', coord: [7.0, 50.0], note: '北方边界' },
  { id: 'syracuse_rome', name: '叙拉古', modern: '意大利锡拉库萨', coord: [15.29, 37.07], note: '罗马征服' },
  { id: 'apollonia', name: '阿波罗尼亚', modern: '阿尔巴尼亚发罗拉', coord: [19.45, 40.99], note: '屋大维接信地' },
  { id: 'philippi', name: '腓力比', modern: '希腊腓力比', coord: [24.28, 41.01], note: '腓力比之战' },
  { id: 'nola', name: '诺拉', modern: '意大利诺拉', coord: [14.53, 40.93], note: '屋大维逝地' },
];

const PERSONS = [
  { id: 'romulus', name: '罗慕路斯', courtesy: '', alias: [], faction: 'kingdom', birth: -770, death: -716, birthPlace: '罗马', title: '罗马建城者', roles: ['传说之王'], avatar: '罗', bio: '传说中罗马城的建立者，第一任国王。', events: [ { year: -753, place: '罗马', desc: '建立罗马城' } ] },
  { id: 'lucius_brutus', name: '布鲁图斯', courtesy: '', alias: ['卢基乌斯·尤尼乌斯·布鲁图斯'], faction: 'republic', birth: -560, death: -509, birthPlace: '罗马', title: '首任执政官', roles: ['共和建立者'], avatar: '布', bio: '驱逐塔克文，建立罗马共和国。', events: [ { year: -509, place: '罗马', desc: '驱逐末代国王，建立共和国' } ] },
  { id: 'scipio', name: '大西庇阿', courtesy: '', alias: [], faction: 'republic', birth: -236, death: -183, birthPlace: '罗马', title: '将军', roles: ['扎马战胜汉尼拔'], avatar: '西', bio: '扎马之战终结汉尼拔，结束第二次布匿战争。', events: [ { year: -202, place: '扎马', desc: '扎马之战大败汉尼拔' } ] },
  { id: 'hannibal', name: '汉尼拔', courtesy: '', alias: [], faction: 'republic', birth: -247, death: -183, birthPlace: '迦太基', title: '迦太基统帅', roles: ['战略之父'], avatar: '汉', bio: '翻越阿尔卑斯、坎尼歼灭罗马军。', events: [ { year: -221, place: '迦太基', desc: '二十六岁继承父职，任迦太基西班牙统帅' }, { year: -218, place: '萨贡托', desc: '攻陷萨贡托，引发第二次布匿战争' }, { year: -218, place: '阿尔卑斯', desc: '率军翻越阿尔卑斯入侵意大利' }, { year: -216, place: '坎尼', desc: '坎尼会战歼灭罗马主力，西方军事史经典' }, { year: -203, place: '迦太基', desc: '被罗马反攻本土，回师救援' }, { year: -202, place: '扎马', desc: '扎马之战败于西庇阿，迦太基战败' }, { year: -183, place: '比提尼亚', desc: '罗马追捕，服毒自尽，年六十四' } ] },
  { id: 'gracchi', name: '提比略·格拉古', courtesy: '', alias: [], faction: 'republic', birth: -169, death: -133, birthPlace: '罗马', title: '保民官', roles: ['改革者'], avatar: '格', bio: '土地改革、被元老院谋杀。', events: [ { year: -133, place: '罗马', desc: '推行土地改革，遇害' } ] },
  { id: 'marius', name: '马略', courtesy: '', alias: [], faction: 'republic', birth: -157, death: -86, birthPlace: '罗马', title: '七任执政官', roles: ['军事改革者'], avatar: '马', bio: '实行志愿兵役制，击败日耳曼入侵。', events: [ { year: -107, place: '罗马', desc: '军事改革' } ] },
  { id: 'sulla', name: '苏拉', courtesy: '', alias: [], faction: 'republic', birth: -138, death: -78, birthPlace: '罗马', title: '独裁官', roles: ['首位终身独裁'], avatar: '苏', bio: '率军入罗马，开创独裁先例。', events: [ { year: -82, place: '罗马', desc: '就任终身独裁官' } ] },
  { id: 'spartacus', name: '斯巴达克斯', courtesy: '', alias: [], faction: 'republic', birth: -109, death: -71, birthPlace: '色雷斯', title: '奴隶起义领袖', roles: ['角斗士'], avatar: '斯', bio: '领导最大规模奴隶起义。', events: [ { year: -73, place: '罗马', desc: '发动奴隶大起义' }, { year: -71, place: '罗马', desc: '起义失败' } ] },
  { id: 'caesar', name: '凯撒', courtesy: '', alias: ['尤利乌斯·凯撒'], faction: 'republic', birth: -100, death: -44, birthPlace: '罗马', title: '终身独裁官', roles: ['军事家','政治家'], avatar: '凯', bio: '《高卢战记》、跨越卢比孔、终身独裁。', events: [ { year: -60, place: '罗马', desc: '与庞培、克拉苏结成"前三头同盟"' }, { year: -58, place: '高卢', desc: '开启高卢战争，八年征服高卢' }, { year: -52, place: '阿莱西亚', desc: '阿莱西亚之围，击败维钦托利' }, { year: -49, place: '罗马', desc: '跨越卢比孔河，"骰子已经掷下"' }, { year: -48, place: '法萨卢斯', desc: '法萨卢斯战役，击败庞培' }, { year: -47, place: '亚历山大', desc: '埃及介入王位之争，与克娄巴特拉七世结合' }, { year: -46, place: '罗马', desc: '凯旋式，被推为终身独裁官' }, { year: -44, place: '罗马', desc: '三月十五日，元老院遇刺身亡' } ] },
  { id: 'cicero', name: '西塞罗', courtesy: '', alias: [], faction: 'republic', birth: -106, death: -43, birthPlace: '阿尔皮努姆', title: '执政官·演说家', roles: ['演说家','思想家'], avatar: '西', bio: '粉碎喀提林阴谋、罗马散文巅峰。', events: [ { year: -63, place: '罗马', desc: '揭发喀提林阴谋' } ] },
  { id: 'augustus', name: '屋大维', courtesy: '', alias: ['奥古斯都'], faction: 'empire', birth: -63, death: 14, birthPlace: '罗马', title: '首任皇帝', roles: ['帝国建立者'], avatar: '奥', bio: '亚克兴海战击败安东尼，开创帝国。', events: [ { year: -63, place: '罗马', desc: '出生于骑士家庭，是凯撒的甥孙与养子' }, { year: -45, place: '阿波罗尼亚', desc: '凯撒遇刺消息传来，他承继凯撒遗产' }, { year: -43, place: '罗马', desc: '与安东尼、雷必达结成"后三头同盟"' }, { year: -42, place: '腓力比', desc: '腓力比之战，击败刺杀凯撒的共和派' }, { year: -31, place: '亚克兴', desc: '亚克兴海战，击败安东尼与埃及艳后' }, { year: -27, place: '罗马', desc: '元老院授予"奥古斯都"称号，开创帝国' }, { year: -18, place: '罗马', desc: '推行道德与婚姻改革，重塑罗马风俗' }, { year: 14, place: '诺拉', desc: '病逝，养子提比略继位，帝国延续' } ] },
  { id: 'nero', name: '尼禄', courtesy: '', alias: [], faction: 'empire', birth: 37, death: 68, birthPlace: '罗马', title: '皇帝', roles: ['暴君'], avatar: '尼', bio: '罗马大火、迫害基督徒。', events: [ { year: 64, place: '罗马', desc: '罗马大火' } ] },
  { id: 'trajan', name: '图拉真', courtesy: '', alias: [], faction: 'empire', birth: 53, death: 117, birthPlace: '西班牙', title: '皇帝', roles: ['五贤帝之一'], avatar: '图', bio: '罗马版图最大的时期。', events: [ { year: 106, place: '罗马', desc: '征服达契亚，版图极盛' } ] },
  { id: 'hadrian', name: '哈德良', courtesy: '', alias: [], faction: 'empire', birth: 76, death: 138, birthPlace: '西班牙', title: '皇帝', roles: ['五贤帝之一'], avatar: '哈', bio: '哈德良长城、万神殿、巡视帝国。', events: [ { year: 122, place: '不列颠', desc: '建哈德良长城' } ] },
  { id: 'marcus_aurelius', name: '马可·奥勒留', courtesy: '', alias: [], faction: 'empire', birth: 121, death: 180, birthPlace: '罗马', title: '皇帝·哲学家', roles: ['哲人王'], avatar: '马', bio: '《沉思录》，斯多葛哲人王。', events: [ { year: 167, place: '莱茵河', desc: '马可曼战争' } ] },
  { id: 'constantine', name: '君士坦丁大帝', courtesy: '', alias: [], faction: 'empire', birth: 272, death: 337, birthPlace: '尼什', title: '皇帝', roles: ['基督教合法化'], avatar: '君', bio: '米兰敕令、迁都拜占庭。', events: [ { year: 313, place: '米兰', desc: '颁布米兰敕令，承认基督教' }, { year: 330, place: '拜占庭', desc: '迁都拜占庭，命名君士坦丁堡' } ] },
  { id: 'theodosius', name: '狄奥多西一世', courtesy: '', alias: [], faction: 'empire', birth: 347, death: 395, birthPlace: '西班牙', title: '皇帝', roles: ['最后统一皇帝'], avatar: '狄', bio: '基督教国教化、死前分帝国为东西。', events: [ { year: 380, place: '罗马', desc: '确立基督教为国教' }, { year: 395, place: '米兰', desc: '临终分帝国为东西两部' } ] },
  { id: 'romulus_augustulus', name: '罗慕路斯·奥古斯都路斯', courtesy: '', alias: [], faction: 'empire', birth: 460, death: 507, birthPlace: '拉文纳', title: '西罗马末代皇帝', roles: ['末帝'], avatar: '罗', bio: '少年傀儡，被奥多亚塞废黜，西罗马亡。', events: [ { year: 476, place: '拉文纳', desc: '被废黜，西罗马帝国灭亡' } ] },
  { id: 'agrippina', name: '小阿格里皮娜', courtesy: '', alias: ['Agrippina the Younger'], faction: 'empire', birth: 15, death: 59, birthPlace: '罗马', title: '皇后·太后', roles: ['女政治家'], avatar: '阿', bio: '克劳狄乌斯之妻、尼禄之母，左右帝国政局，被尼禄派人杀害。', events: [ { year: 49, place: '罗马', desc: '嫁克劳狄乌斯，影响皇位继承' }, { year: 54, place: '罗马', desc: '推动尼禄登基' } ] },
];

const RELATIONS = [
  { source: 'scipio', target: 'hannibal', type: '敌对', label: '扎马决战', year: -202 },
  { source: 'marius', target: 'sulla', type: '敌对', label: '内战', year: -88 },
  { source: 'sulla', target: 'caesar', type: '同朝', label: '苏拉宽恕少年凯撒', year: -80 },
  { source: 'caesar', target: 'augustus', type: '亲属', label: '养父-养子', year: -44 },
  { source: 'caesar', target: 'cicero', type: '同僚', label: '元老院对手', year: -63 },
  { source: 'trajan', target: 'hadrian', type: '亲属', label: '养父-养子', year: 117 },
  { source: 'hadrian', target: 'marcus_aurelius', type: '同朝', label: '五贤帝', year: 138 },
];

const EVENTS = [
  { id: 'e1', name: '罗马建城', year: -753, domain: '政治', location: '罗马', desc: '罗慕路斯传说建立罗马城。', participants: ['romulus'] },
  { id: 'e2', name: '布鲁图斯革命', year: -509, domain: '政治', location: '罗马', desc: '驱逐塔克文，王政结束。', participants: ['lucius_brutus'] },
  { id: 'e3', name: '十二铜表法', year: -451, domain: '政治', location: '罗马', desc: '罗马最早的成文法。', participants: [] },
  { id: 'e4', name: '布匿战争', year: -264, domain: '军事', location: '迦太基', desc: '罗马与迦太强争夺地中海霸权。', participants: ['hannibal', 'scipio'] },
  { id: 'e5', name: '坎尼会战', year: -216, domain: '军事', location: '坎尼', desc: '汉尼拔歼灭罗马七万大军。', participants: ['hannibal'] },
  { id: 'e6', name: '扎马之战', year: -202, domain: '军事', location: '扎马', desc: '西庇阿击败汉尼拔，迦太基称臣。', participants: ['scipio', 'hannibal'] },
  { id: 'e7', name: '格拉古改革', year: -133, domain: '政治', location: '罗马', desc: '提比略土地改革遇害。', participants: ['gracchi'] },
  { id: 'e8', name: '马略军改', year: -107, domain: '军事', location: '罗马', desc: '志愿兵制取代征兵制。', participants: ['marius'] },
  { id: 'e9', name: '斯巴达克起义', year: -73, domain: '军事', location: '罗马', desc: '最大规模奴隶起义。', participants: ['spartacus'] },
  { id: 'e10', name: '前三头同盟', year: -60, domain: '政治', location: '罗马', desc: '凯撒、庞培、克拉苏秘密结盟。', participants: ['caesar'] },
  { id: 'e11', name: '高卢战争', year: -58, domain: '军事', location: '高卢', desc: '凯撒征服高卢，写《高卢战记》。', participants: ['caesar'] },
  { id: 'e12', name: '跨越卢比孔', year: -49, domain: '军事', location: '罗马', desc: '凯撒率军入意大利，内战爆发。', participants: ['caesar'] },
  { id: 'e13', name: '凯撒遇刺', year: -44, domain: '政治', location: '罗马', desc: '布鲁图斯等元老刺杀凯撒。', participants: ['caesar', 'cicero'] },
  { id: 'e14', name: '亚克兴海战', year: -31, domain: '军事', location: '亚克兴', desc: '屋大维击败安东尼与克利奥帕特拉。', participants: ['augustus'] },
  { id: 'e15', name: '罗马帝国建立', year: -27, domain: '政治', location: '罗马', desc: '元老院授予屋大维奥古斯都称号。', participants: ['augustus'] },
  { id: 'e16', name: '罗马大火', year: 64, domain: '政治', location: '罗马', desc: '尼禄皇帝迫害基督徒。', participants: ['nero'] },
  { id: 'e17', name: '图拉真版图极盛', year: 106, domain: '军事', location: '罗马', desc: '征服达契亚，帝国版图达到顶点。', participants: ['trajan'] },
  { id: 'e18', name: '哈德良长城', year: 122, domain: '军事', location: '不列颠', desc: '北界防御工事。', participants: ['hadrian'] },
  { id: 'e19', name: '米兰敕令', year: 313, domain: '宗教', location: '米兰', desc: '基督教合法化。', participants: ['constantine'] },
  { id: 'e20', name: '迁都君士坦丁堡', year: 330, domain: '政治', location: '拜占庭', desc: '帝国重心东移。', participants: ['constantine'] },
  { id: 'e21', name: '基督教国教化', year: 380, domain: '宗教', location: '罗马', desc: '狄奥多西立基督教为国教。', participants: ['theodosius'] },
  { id: 'e22', name: '帝国分裂', year: 395, domain: '政治', location: '米兰', desc: '狄奥多西临终分帝国为东西。', participants: ['theodosius'] },
  { id: 'e23', name: '西罗马灭亡', year: 476, domain: '政治', location: '拉文纳', desc: '奥多亚塞废罗慕路斯·奥古斯都路斯。', participants: ['romulus_augustulus'] },
];

export const romeAtlas = {
  id: 'rome',
  name: '古罗马',
  subtitle: '从七丘到永恒之城（前753–476年）',
  startYear: -753,
  endYear: 476,
  mapView: { center: [12, 42], zoom: 5, minZoom: 2, maxZoom: 12, labelZoom: { hideAll: 3, hideEvents: 6 }, importanceZoom: [5, 7], cityZoom: 6, baseLayer: 'satellite' },
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
      caesar: 1, augustus: 1, constantine: 1, hannibal: 1, scipio: 1, cicero: 1,
      marcus_aurelius: 1, trajan: 1, hadrian: 1, nero: 1, gracchi: 1, romulus: 1,
      lucius_brutus: 2, marius: 2, sulla: 2, spartacus: 2, theodosius: 2, romulus_augustulus: 2,
    },
    eventRank: { e1: 1, e5: 1, e6: 1, e12: 1, e15: 1, e19: 1, e23: 1 },
    defaultEvent: 2,
  }),
  birthplaceModern: {},
  birthplaceCoords: {
    '色雷斯': [25.0, 42.0], '阿尔皮努姆': [13.84, 41.58], '西班牙': [-3.7, 40.4],
    '尼什': [21.90, 43.32],
  },
  personImages: {},
  timelineTicks: [-753, -509, -264, -44, 14, 313, 476],
};
