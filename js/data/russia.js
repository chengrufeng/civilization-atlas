/* 俄罗斯（862–1917年）· 世界文明 · 基辅罗斯/莫斯科/沙俄/帝国 */

import { makeImportance } from './index.js';

const FACTIONS = [
  { id: 'kievan', name: '基辅罗斯', color: '#2d8a6e', founded: 862, capital: '基辅', capitalFrom: 882, desc: '东斯拉夫早期国家' },
  { id: 'moscow', name: '莫斯科公国', color: '#b23a2e', founded: 1283, capital: '莫斯科', capitalFrom: 1283, desc: '摆脱蒙古统治' },
  { id: 'tsardom', name: '沙俄', color: '#b8893a', founded: 1547, capital: '莫斯科', capitalFrom: 1547, desc: '伊凡四世加冕沙皇' },
  { id: 'imperial', name: '俄罗斯帝国', color: '#2f5d8a', founded: 1721, capital: '圣彼得堡', capitalFrom: 1712, desc: '彼得大帝称帝' },
];

const PLACES = [
  { id: 'novgorod', name: '诺夫哥罗德', modern: '俄诺夫哥罗德', coord: [31.27, 58.52], note: '早期罗斯重镇' },
  { id: 'kiev', name: '基辅', modern: '乌克兰基辅', coord: [30.52, 50.45], note: '基辅罗斯都' },
  { id: 'moscow', name: '莫斯科', modern: '俄莫斯科', coord: [37.62, 55.75], note: '莫斯科公国/沙俄都' },
  { id: 'stpetersburg', name: '圣彼得堡', modern: '俄圣彼得堡', coord: [30.31, 59.94], note: '帝国都' },
  { id: 'vladimir_r', name: '弗拉基米尔', modern: '俄弗拉基米尔', coord: [40.40, 56.13], note: '罗斯古都' },
  { id: 'kulikovo', name: '库里科沃', modern: '俄图拉州', coord: [38.65, 53.65], note: '库里科沃之战' },
  { id: 'poltava', name: '波尔塔瓦', modern: '乌波尔塔瓦', coord: [34.56, 49.59], note: '北方战争决战' },
  { id: 'borodino', name: '博罗季诺', modern: '俄博罗季诺', coord: [35.81, 55.52], note: '1812 决战' },
  { id: 'astrakhan', name: '阿斯特拉罕', modern: '俄阿斯特拉罕', coord: [48.03, 46.35], note: '里海门户' },
  { id: 'siberia', name: '西伯利亚', modern: '俄西伯利亚', coord: [82.93, 60.0], note: '东方' },
];

const PERSONS = [
  { id: 'rurik', name: '留里克', courtesy: '', alias: [], faction: 'kievan', birth: 830, death: 879, birthPlace: '罗斯', title: '诺夫哥罗德王公', roles: ['留里克王朝始祖'], avatar: '留', bio: '半传说人物，862 年应斯拉夫人之邀统治诺夫哥罗德。', events: [ { year: 862, place: '诺夫哥罗德', desc: '建立留里克王朝' } ] },
  { id: 'oleg', name: '奥列格', courtesy: '', alias: ['奥列格先知'], faction: 'kievan', birth: 850, death: 912, birthPlace: '罗斯', title: '基辅大公', roles: ['基辅罗斯奠基者'], avatar: '奥', bio: '882 年迁都基辅，奠定基辅罗斯。', events: [ { year: 882, place: '基辅', desc: '征服基辅，定为都城' }, { year: 907, place: '基辅', desc: '远征君士坦丁堡' } ] },
  { id: 'vladimir_g', name: '弗拉基米尔大公', courtesy: '', alias: ['弗拉基米尔一世','圣弗拉基米尔'], faction: 'kievan', birth: 958, death: 1015, birthPlace: '基辅', title: '大公', roles: ['罗斯受洗'], avatar: '弗', bio: '988 年接受东正教，罗斯基督教化。', events: [ { year: 988, place: '基辅', desc: '罗斯受洗，定东正教为国教' } ] },
  { id: 'yaroslav', name: '雅罗斯拉夫一世', courtesy: '', alias: ['智者雅罗斯拉夫'], faction: 'kievan', birth: 978, death: 1054, birthPlace: '基辅', title: '大公', roles: ['罗斯黄金时代'], avatar: '雅', bio: '颁布《雅罗斯拉夫法典》，与欧洲多国王室联姻。', events: [ { year: 1019, place: '基辅', desc: '即位，颁布罗斯法典' }, { year: 1037, place: '基辅', desc: '兴建圣索菲亚教堂' } ] },
  { id: 'dmitri', name: '德米特里·顿斯科伊', courtesy: '', alias: [], faction: 'moscow', birth: 1350, death: 1389, birthPlace: '莫斯科', title: '莫斯科大公', roles: ['抗击蒙古'], avatar: '德', bio: '库里科沃之战大破马麦汗，莫斯科崛起。', events: [ { year: 1380, place: '库里科沃', desc: '库里科沃之战大败金帐汗国' } ] },
  { id: 'ivan_iii', name: '伊凡三世', courtesy: '', alias: ['伊凡大帝'], faction: 'moscow', birth: 1440, death: 1505, birthPlace: '莫斯科', title: '莫斯科大公', roles: ['统一罗斯','摆脱蒙古'], avatar: '伊', bio: '彻底摆脱蒙古统治，统一罗斯大部分领土。', events: [ { year: 1480, place: '莫斯科', desc: '乌格拉河对峙，终结蒙古统治' } ] },
  { id: 'ivan_iv', name: '伊凡四世', courtesy: '', alias: ['伊凡雷帝'], faction: 'tsardom', birth: 1530, death: 1584, birthPlace: '莫斯科', title: '首任沙皇', roles: ['沙皇制建立者'], avatar: '雷', bio: '1547 年首称沙皇，特辖制恐怖统治，扩张版图。', events: [ { year: 1547, place: '莫斯科', desc: '加冕为沙皇' }, { year: 1552, place: '阿斯特拉罕', desc: '攻占喀山汗国' } ] },
  { id: 'peter', name: '彼得大帝', courtesy: '', alias: ['彼得一世'], faction: 'imperial', birth: 1672, death: 1725, birthPlace: '莫斯科', title: '皇帝', roles: ['改革家','西化推手'], avatar: '彼', bio: '大出访、北方战争胜、迁都圣彼得堡，建立俄罗斯帝国。', events: [ { year: 1697, place: '莫斯科', desc: '大出访西欧' }, { year: 1709, place: '波尔塔瓦', desc: '波尔塔瓦之战击败瑞典' }, { year: 1712, place: '圣彼得堡', desc: '迁都圣彼得堡' }, { year: 1721, place: '圣彼得堡', desc: '称帝，建立俄罗斯帝国' } ] },
  { id: 'catherine', name: '叶卡捷琳娜二世', courtesy: '', alias: ['叶卡捷琳娜大帝'], faction: 'imperial', birth: 1729, death: 1796, birthPlace: '德国', title: '女皇', roles: ['开明专制'], avatar: '叶', bio: '德国出生，政变夺权，扩张帝国、瓜分波兰。', events: [ { year: 1762, place: '圣彼得堡', desc: '政变即位' }, { year: 1783, place: '阿斯特拉罕', desc: '吞并克里米亚' } ] },
  { id: 'alexander_i', name: '亚历山大一世', courtesy: '', alias: [], faction: 'imperial', birth: 1777, death: 1825, birthPlace: '圣彼得堡', title: '皇帝', roles: ['击败拿破仑'], avatar: '亚', bio: '1812 卫国战争击败拿破仑，进军巴黎。', events: [ { year: 1812, place: '博罗季诺', desc: '博罗季诺战役' }, { year: 1814, place: '圣彼得堡', desc: '俄军进入巴黎' } ] },
  { id: 'alexander_ii', name: '亚历山大二世', courtesy: '', alias: ['解放者'], faction: 'imperial', birth: 1818, death: 1881, birthPlace: '莫斯科', title: '皇帝', roles: ['废除农奴制'], avatar: '亚', bio: '1861 废除农奴制，推行改革，被民粹派刺杀。', events: [ { year: 1861, place: '圣彼得堡', desc: '废除农奴制' }, { year: 1881, place: '圣彼得堡', desc: '被刺杀' } ] },
  { id: 'nicholas_ii', name: '尼古拉二世', courtesy: '', alias: [], faction: 'imperial', birth: 1868, death: 1918, birthPlace: '圣彼得堡', title: '末代沙皇', roles: ['末代皇帝'], avatar: '尼', bio: '日俄战争、1905 革命、一战、1917 退位，全家被处决。', events: [ { year: 1905, place: '圣彼得堡', desc: '流血星期日，1905 革命' }, { year: 1917, place: '圣彼得堡', desc: '二月革命退位' } ] },
  { id: 'tolstoy', name: '列夫·托尔斯泰', courtesy: '', alias: [], faction: 'imperial', birth: 1828, death: 1910, birthPlace: '图拉', title: '作家', roles: ['文学巨匠'], avatar: '托', bio: '《战争与和平》《安娜·卡列尼娜》，道德思想家。', events: [ { year: 1869, place: '莫斯科', desc: '出版《战争与和平》' } ] },
];

const RELATIONS = [
  { source: 'rurik', target: 'oleg', type: '同朝', label: '摄政/继任', year: 879 },
  { source: 'oleg', target: 'vladimir_g', type: '同朝', label: '王朝', year: 980 },
  { source: 'vladimir_g', target: 'yaroslav', type: '亲属', label: '父子', year: 1019 },
  { source: 'ivan_iii', target: 'ivan_iv', type: '亲属', label: '祖孙', year: 1533 },
  { source: 'peter', target: 'catherine', type: '同朝', label: '先后两代改革者', year: 1762 },
];

const EVENTS = [
  { id: 'e1', name: '留里克建国', year: 862, domain: '政治', location: '诺夫哥罗德', desc: '留里克应召统治，开留里克王朝。', participants: ['rurik'] },
  { id: 'e2', name: '定都基辅', year: 882, domain: '政治', location: '基辅', desc: '奥列格征服基辅，基辅罗斯开始。', participants: ['oleg'] },
  { id: 'e3', name: '罗斯受洗', year: 988, domain: '宗教', location: '基辅', desc: '弗拉基米尔定东正教为国教。', participants: ['vladimir_g'] },
  { id: 'e4', name: '罗斯法典', year: 1019, domain: '政治', location: '基辅', desc: '雅罗斯拉夫颁布早期成文法。', participants: ['yaroslav'] },
  { id: 'e5', name: '蒙古入侵', year: 1240, domain: '军事', location: '基辅', desc: '蒙古拔都攻陷基辅，罗斯臣服金帐汗国。', participants: [] },
  { id: 'e6', name: '库里科沃战役', year: 1380, domain: '军事', location: '库里科沃', desc: '德米特里大败马麦汗。', participants: ['dmitri'] },
  { id: 'e7', name: '摆脱蒙古', year: 1480, domain: '政治', location: '莫斯科', desc: '伊凡三世在乌格拉河对峙中终结蒙古统治。', participants: ['ivan_iii'] },
  { id: 'e8', name: '沙皇制建立', year: 1547, domain: '政治', location: '莫斯科', desc: '伊凡四世加冕沙皇。', participants: ['ivan_iv'] },
  { id: 'e9', name: '大出访', year: 1697, domain: '外交', location: '莫斯科', desc: '彼得化名随使团出访西欧。', participants: ['peter'] },
  { id: 'e10', name: '波尔塔瓦战役', year: 1709, domain: '军事', location: '波尔塔瓦', desc: '彼得击败瑞典，确立北欧霸权。', participants: ['peter'] },
  { id: 'e11', name: '迁都圣彼得堡', year: 1712, domain: '政治', location: '圣彼得堡', desc: '彼得迁都"欧洲之窗"。', participants: ['peter'] },
  { id: 'e12', name: '建立俄罗斯帝国', year: 1721, domain: '政治', location: '圣彼得堡', desc: '彼得称皇帝。', participants: ['peter'] },
  { id: 'e13', name: '瓜分波兰', year: 1772, domain: '外交', location: '圣彼得堡', desc: '叶卡捷琳娜主导第一次瓜分波兰。', participants: ['catherine'] },
  { id: 'e14', name: '1812 卫国战争', year: 1812, domain: '军事', location: '博罗季诺', desc: '亚历山大一世击退拿破仑入侵。', participants: ['alexander_i'] },
  { id: 'e15', name: '废除农奴制', year: 1861, domain: '政治', location: '圣彼得堡', desc: '亚历山大二世解放农奴。', participants: ['alexander_ii'] },
  { id: 'e16', name: '二月革命', year: 1917, domain: '政治', location: '圣彼得堡', desc: '尼古拉二世退位，沙皇制度终结。', participants: ['nicholas_ii'] },
];

export const russiaAtlas = {
  id: 'russia', name: '俄罗斯', subtitle: '从基辅罗斯到帝国（862–1917年）', version: '1.0.0',
  startYear: 862, endYear: 1917,
  mapView: { center: [40, 58], zoom: 4, minZoom: 2, maxZoom: 12, labelZoom: { hideAll: 3, hideEvents: 6 }, importanceZoom: [4, 6], cityZoom: 5, baseLayer: 'satellite' },
  domains: [
    { name: '军事', color: '#b23a2e' }, { name: '政治', color: '#2f5d8a' },
    { name: '宗教', color: '#b8893a' }, { name: '外交', color: '#2d8a6e' }, { name: '文化', color: '#7b4b94' },
  ],
  factions: FACTIONS, places: PLACES, persons: PERSONS, relations: RELATIONS, events: EVENTS,
  importance: makeImportance({
    personRank: {
      rurik: 1, vladimir_g: 1, yaroslav: 1, ivan_iii: 1, ivan_iv: 1, peter: 1, catherine: 1,
      alexander_i: 1, alexander_ii: 1, nicholas_ii: 1, tolstoy: 1,
      oleg: 2, dmitri: 2,
    },
    eventRank: { e1: 1, e3: 1, e7: 1, e8: 1, e12: 1, e15: 1, e16: 1 },
    defaultEvent: 2,
  }),
  birthplaceModern: {},
  birthplaceCoords: { '罗斯': [31.0, 58.0], '德国': [10.0, 51.0], '图拉': [37.62, 54.20] },
  personImages: {},
  timelineTicks: [862, 988, 1240, 1480, 1547, 1721, 1861, 1917],
};
