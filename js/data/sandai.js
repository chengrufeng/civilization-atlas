/* =========================================================================
 * 夏商周（约公元前2100–前771年） · 中华文明
 * 演示公元前（负数年份）数据集。史前/上古年代多为约数。
 * ========================================================================= */

import { makeImportance } from './index.js';

const FACTIONS = [
  { id: 'xia', name: '夏', color: '#b8893a', founded: -2070, capital: '阳城', capitalFrom: -2070, desc: '中国史载第一个世袭王朝，禹传子启。' },
  { id: 'shang', name: '商', color: '#7b4b94', founded: -1600, capital: '殷', capitalFrom: -1300, desc: '青铜与甲骨文的时代，汤灭夏而立。' },
  { id: 'zhou', name: '西周', color: '#b23a2e', founded: -1046, capital: '镐京', capitalFrom: -1046, desc: '武王克商，行分封、制礼乐。' },
];

const PLACES = [
  { id: 'yangcheng', name: '阳城', modern: '河南登封', coord: [113.04, 34.46], note: '夏都' },
  { id: 'bo', name: '亳', modern: '河南商丘', coord: [115.65, 34.41], note: '商汤都城' },
  { id: 'yin', name: '殷', modern: '河南安阳', coord: [114.35, 36.10], note: '盘庚迁殷' },
  { id: 'haojing', name: '镐京', modern: '陕西西安', coord: [108.77, 34.23], note: '西周都城' },
  { id: 'qishan', name: '岐山', modern: '陕西宝鸡岐山', coord: [107.62, 34.44], note: '周人发祥地' },
  { id: 'luoyi', name: '洛邑', modern: '河南洛阳', coord: [112.45, 34.62], note: '周公营建的东都' },
  { id: 'zhaoge', name: '朝歌', modern: '河南淇县', coord: [114.20, 35.61], note: '商末都邑' },
  { id: 'muye', name: '牧野', modern: '河南卫辉', coord: [114.06, 35.40], note: '牧野之战' },
  { id: 'mingtiao', name: '鸣条', modern: '山西运城', coord: [111.22, 35.14], note: '鸣条之战' },
  { id: 'kuaiji', name: '会稽', modern: '浙江绍兴', coord: [120.58, 30.00], note: '禹东巡处' },
  { id: 'panxi', name: '磻溪', modern: '陕西宝鸡', coord: [107.14, 34.36], note: '姜太公垂钓处' },
  { id: 'tushan', name: '涂山', modern: '安徽蚌埠', coord: [117.36, 32.94], note: '禹会诸侯' },
];

const PERSONS = [
  { id: 'dayu', name: '大禹', courtesy: '', alias: ['夏禹','帝禹'], faction: 'xia', birth: -2123, death: -2025, birthPlace: '阳城', title: '夏后', roles: ['治水英雄','夏朝奠基者'], avatar: '禹', bio: '治理洪水十三年，三过家门而不入；会诸侯于涂山，奠定夏朝基业。', events: [ { year: -2100, place: '涂山', desc: '涂山会盟，诸侯执玉帛来朝' }, { year: -2070, place: '阳城', desc: '受禅建夏' }, { year: -2025, place: '会稽', desc: '东巡，崩于会稽' } ] },
  { id: 'qi', name: '启', courtesy: '', alias: ['夏启'], faction: 'xia', birth: -2065, death: -2015, birthPlace: '阳城', title: '夏王', roles: ['夏朝第二代君主'], avatar: '启', bio: '禹之子，开家天下之世袭制，讨伐有扈氏以固王权。', events: [ { year: -2070, place: '阳城', desc: '继位，确立世袭' } ] },
  { id: 'jie', name: '桀', courtesy: '', alias: ['夏桀'], faction: 'xia', birth: -1650, death: -1600, birthPlace: '阳城', title: '夏末代王', roles: ['夏朝亡国之君'], avatar: '桀', bio: '暴虐奢靡，宠妹喜，为商汤所灭。', events: [ { year: -1600, place: '鸣条', desc: '鸣条之战败于商汤' } ] },
  { id: 'shangtang', name: '商汤', courtesy: '', alias: ['成汤','天乙'], faction: 'shang', birth: -1670, death: -1587, birthPlace: '亳', title: '商开国之君', roles: ['商朝建立者'], avatar: '汤', bio: '任用伊尹，鸣条灭夏，建立商朝。', events: [ { year: -1600, place: '鸣条', desc: '灭夏' }, { year: -1600, place: '亳', desc: '建立商朝' } ] },
  { id: 'yiyin', name: '伊尹', courtesy: '', alias: ['阿衡'], faction: 'shang', birth: -1649, death: -1550, birthPlace: '亳', title: '商相', roles: ['贤相','政治家'], avatar: '伊', bio: '由庖厨而为相，佐汤灭夏，辅政数代，为商初名臣。', events: [ { year: -1600, place: '亳', desc: '辅佐商汤开国' } ] },
  { id: 'pangeng', name: '盘庚', courtesy: '', alias: [], faction: 'shang', birth: -1330, death: -1275, birthPlace: '亳', title: '商王', roles: ['商朝中兴之主'], avatar: '盘', bio: '迁都于殷，稳定国势，史称盘庚迁殷。', events: [ { year: -1300, place: '殷', desc: '迁都于殷' } ] },
  { id: 'wuding', name: '武丁', courtesy: '', alias: ['高宗'], faction: 'shang', birth: -1300, death: -1192, birthPlace: '殷', title: '商王', roles: ['武丁中兴'], avatar: '丁', bio: '任贤治国，四方征伐，商朝极盛，史称武丁中兴。', events: [ { year: -1250, place: '殷', desc: '武丁中兴' } ] },
  { id: 'fuhao', name: '妇好', courtesy: '', alias: [], faction: 'shang', birth: -1278, death: -1245, birthPlace: '殷', title: '王后·女将', roles: ['女性统帅','祭司'], avatar: '好', bio: '武丁之妻，中国有据可考最早的女性军事统帅，屡领兵征伐。', events: [ { year: -1248, place: '殷', desc: '统兵征伐周边方国' } ] },
  { id: 'zhouwang', name: '纣王', courtesy: '', alias: ['帝辛'], faction: 'shang', birth: -1105, death: -1046, birthPlace: '朝歌', title: '商末代王', roles: ['商朝亡国之君'], avatar: '辛', bio: '才力过人而拒谏饰非，酒池肉林，牧野兵败自焚。', events: [ { year: -1046, place: '牧野', desc: '牧野之战兵败，自焚而亡' } ] },
  { id: 'zhouwenwang', name: '周文王', courtesy: '', alias: ['姬昌','西伯'], faction: 'zhou', birth: -1152, death: -1056, birthPlace: '岐山', title: '周奠基者', roles: ['西周奠基者'], avatar: '昌', bio: '广纳贤才，演《周易》，积德行善以图王业。', events: [ { year: -1070, place: '磻溪', desc: '渭水访得姜尚' }, { year: -1060, place: '岐山', desc: '积蓄国力，三分天下有其二' } ] },
  { id: 'zhouwuwang', name: '周武王', courtesy: '', alias: ['姬发'], faction: 'zhou', birth: -1087, death: -1043, birthPlace: '岐山', title: '西周开国之君', roles: ['西周建立者'], avatar: '发', bio: '继文王之志，牧野一战灭商，建立西周。', events: [ { year: -1046, place: '牧野', desc: '伐纣灭商' }, { year: -1046, place: '镐京', desc: '建立西周' } ] },
  { id: 'jiangziya', name: '姜子牙', courtesy: '子牙', alias: ['吕尚','太公望'], faction: 'zhou', birth: -1156, death: -1017, birthPlace: '磻溪', title: '太师', roles: ['军事家','齐国始祖'], avatar: '尚', bio: '磻溪垂钓遇文王，佐武王灭商，封于齐。', events: [ { year: -1070, place: '磻溪', desc: '遇周文王' }, { year: -1046, place: '牧野', desc: '佐武王灭商' } ] },
  { id: 'zhougongdan', name: '周公旦', courtesy: '', alias: ['周公'], faction: 'zhou', birth: -1100, death: -1033, birthPlace: '岐山', title: '太宰·摄政', roles: ['政治家','礼乐制度奠基者'], avatar: '旦', bio: '武王弟，摄政辅成王，平三监之乱，营洛邑、制礼作乐。', events: [ { year: -1042, place: '洛邑', desc: '营建东都洛邑' }, { year: -1040, place: '镐京', desc: '制礼作乐' } ] },
  { id: 'zhouyouwang', name: '周幽王', courtesy: '', alias: ['姬宫湦'], faction: 'zhou', birth: -795, death: -771, birthPlace: '镐京', title: '西周末代王', roles: ['西周亡国之君'], avatar: '幽', bio: '宠褒姒，烽火戏诸侯，犬戎破镐京，西周亡。', events: [ { year: -771, place: '镐京', desc: '烽火戏诸侯，犬戎破镐京' } ] },
];

const RELATIONS = [
  { source: 'dayu', target: 'qi', type: '亲属', label: '父子·传位', year: -2070 },
  { source: 'shangtang', target: 'yiyin', type: '君臣', label: '任相', year: -1600 },
  { source: 'shangtang', target: 'jie', type: '敌对', label: '灭夏', year: -1600 },
  { source: 'wuding', target: 'fuhao', type: '亲属', label: '夫妻', year: -1250 },
  { source: 'zhouwenwang', target: 'zhouwuwang', type: '亲属', label: '父子', year: -1056 },
  { source: 'zhouwuwang', target: 'zhougongdan', type: '亲属', label: '兄弟', year: -1046 },
  { source: 'zhouwuwang', target: 'jiangziya', type: '君臣', label: '拜为太师', year: -1046 },
  { source: 'zhouwuwang', target: 'zhouwang', type: '敌对', label: '牧野伐纣', year: -1046 },
  { source: 'zhouwenwang', target: 'jiangziya', type: '君臣', label: '渭水访贤', year: -1070 },
];

const EVENTS = [
  { id: 'e1', name: '涂山会盟', year: -2100, domain: '政治', location: '涂山', desc: '禹会诸侯于涂山，执玉帛者万国。', participants: ['dayu'] },
  { id: 'e2', name: '大禹治水', year: -2098, domain: '科技', location: '阳城', desc: '疏川导滞、以疏代堵，治理洪水十三年。', participants: ['dayu'] },
  { id: 'e3', name: '夏朝建立', year: -2070, domain: '政治', location: '阳城', desc: '禹传子启，开世袭王朝之始。', participants: ['dayu', 'qi'] },
  { id: 'e4', name: '鸣条之战', year: -1600, domain: '军事', location: '鸣条', desc: '商汤伐桀，夏亡商兴。', participants: ['shangtang', 'jie', 'yiyin'] },
  { id: 'e5', name: '商朝建立', year: -1600, domain: '政治', location: '亳', desc: '汤建商，任伊尹为相。', participants: ['shangtang', 'yiyin'] },
  { id: 'e6', name: '盘庚迁殷', year: -1300, domain: '政治', location: '殷', desc: '迁都于殷，商朝转趋稳定。', participants: ['pangeng'] },
  { id: 'e7', name: '武丁中兴', year: -1250, domain: '政治', location: '殷', desc: '任贤征伐，商朝达于极盛。', participants: ['wuding', 'fuhao'] },
  { id: 'e8', name: '妇好征伐', year: -1248, domain: '军事', location: '殷', desc: '妇好统兵征讨土方、羌方等。', participants: ['fuhao'] },
  { id: 'e9', name: '牧野之战', year: -1046, domain: '军事', location: '牧野', desc: '武王联军大破商军，纣王自焚。', participants: ['zhouwuwang', 'zhouwang', 'jiangziya'] },
  { id: 'e10', name: '西周建立', year: -1046, domain: '政治', location: '镐京', desc: '克商建周，行分封制。', participants: ['zhouwuwang', 'zhougongdan'] },
  { id: 'e11', name: '营建洛邑', year: -1042, domain: '科技', location: '洛邑', desc: '周公营建东都，控御东方。', participants: ['zhougongdan'] },
  { id: 'e12', name: '制礼作乐', year: -1040, domain: '文化', location: '镐京', desc: '周公制礼作乐，奠定宗法礼制。', participants: ['zhougongdan'] },
  { id: 'e13', name: '渭水访贤', year: -1070, domain: '政治', location: '磻溪', desc: '文王渭水访得姜尚，如获至宝。', participants: ['jiangziya', 'zhouwenwang'] },
  { id: 'e14', name: '烽火戏诸侯', year: -771, domain: '军事', location: '镐京', desc: '幽王失信于诸侯，犬戎破镐京，西周亡。', participants: ['zhouyouwang'] },
];

export const sandaiAtlas = {
  id: 'sandai',
  name: '夏商周',
  subtitle: '上古三代 · 家国之始（约前2100–前771年）',
  startYear: -2100,
  endYear: -771,
  mapView: {
    center: [113, 35], zoom: 5, minZoom: 3, maxZoom: 12,
    labelZoom: { hideAll: 3, hideEvents: 6 },
    importanceZoom: [5, 7],
    cityZoom: 5,
    baseLayer: 'terrain',
  },
  domains: [
    { name: '军事', color: '#b23a2e' },
    { name: '政治', color: '#2f5d8a' },
    { name: '文化', color: '#7b4b94' },
    { name: '科技', color: '#2d8a6e' },
  ],
  factions: FACTIONS,
  places: PLACES,
  persons: PERSONS,
  relations: RELATIONS,
  events: EVENTS,
  importance: makeImportance({
    personRank: {
      dayu: 1, shangtang: 1, zhouwuwang: 1, zhouwenwang: 1, jiangziya: 1, zhougongdan: 1, zhouwang: 1,
      qi: 2, jie: 2, yiyin: 2, pangeng: 2, wuding: 2, fuhao: 2, zhouyouwang: 2,
    },
    eventRank: { e3: 1, e4: 1, e5: 1, e9: 1, e10: 1 },
    defaultEvent: 2,
  }),
  birthplaceModern: {},
  birthplaceCoords: {},
  personImages: {},
  timelineTicks: [-2100, -1600, -1300, -1046, -771],
};
