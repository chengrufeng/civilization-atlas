/* 印度文明（前1500–1857年）· 世界文明 · 吠陀/孔雀/笈多/莫卧儿 */

import { makeImportance } from './index.js';

const FACTIONS = [
  { id: 'maurya', name: '孔雀', color: '#b8893a', founded: -322, capital: '华氏城', capitalFrom: -300, desc: '印度第一个大一统帝国。' },
  { id: 'kushan', name: '贵霜', color: '#2d8a6e', founded: 30, capital: '白沙瓦', capitalFrom: 78, desc: '丝路上的佛教帝国。' },
  { id: 'gupta', name: '笈多', color: '#b23a2e', founded: 320, capital: '华氏城', capitalFrom: 320, desc: '印度黄金时代。' },
  { id: 'mughal', name: '莫卧儿', color: '#2f5d8a', founded: 1526, capital: '阿格拉', capitalFrom: 1526, desc: '印度最后一个大一统帝国。' },
  { id: 'spiritual', name: '宗教与文化', color: '#7b4b94', founded: -1500, capital: '—', capitalFrom: -1500, desc: '非王朝：佛陀、大雄、学者、诗人。' },
];

const PLACES = [
  { id: 'patna', name: '华氏城', modern: '印度巴特那', coord: [85.14, 25.61], note: '孔雀/笈多都' },
  { id: 'rajgriha', name: '王舍城', modern: '印度拉杰吉尔', coord: [85.42, 25.04], note: '佛陀常驻' },
  { id: 'sarnath', name: '鹿野苑', modern: '印度萨尔纳特', coord: [83.02, 25.38], note: '初转法轮' },
  { id: 'kusinara', name: '拘尸那', modern: '印度库希纳加尔', coord: [83.73, 26.74], note: '佛陀涅槃' },
  { id: 'taxila', name: '塔克西拉', modern: '巴基斯坦塔克西拉', coord: [72.79, 33.74], note: '学术中心' },
  { id: 'nalanda', name: '那烂陀', modern: '印度那烂陀', coord: [85.44, 25.14], note: '佛教大学' },
  { id: 'ujjain', name: '乌贾因', modern: '印度乌贾因', coord: [75.76, 23.17], note: '笈多文化中心' },
  { id: 'peshawar', name: '白沙瓦', modern: '巴基斯坦白沙瓦', coord: [71.67, 34.02], note: '贵霜东都' },
  { id: 'agra', name: '阿格拉', modern: '印度阿格拉', coord: [78.01, 27.18], note: '莫卧儿都' },
  { id: 'delhi', name: '德里', modern: '印度德里', coord: [77.21, 28.61], note: '后期莫卧儿都' },
  { id: 'lahore', name: '拉合尔', modern: '巴基斯坦拉合尔', coord: [74.36, 31.55], note: '莫卧儿重镇' },
  { id: 'panipat', name: '帕尼帕特', modern: '印度帕尼帕特', coord: [76.96, 29.39], note: '决定性会战' },
];

const PERSONS = [
  { id: 'buddha', name: '释迦牟尼', courtesy: '', alias: ['悉达多·乔达摩','佛陀'], faction: 'spiritual', birth: -563, death: -483, birthPlace: '蓝毗尼', title: '佛陀', roles: ['佛教创立者'], avatar: '佛', bio: '迦毗罗卫国太子，悟道成佛，传四谛八正道。', events: [ { year: -528, place: '鹿野苑', desc: '初转法轮' }, { year: -483, place: '拘尸那', desc: '涅槃' } ] },
  { id: 'mahavira', name: '大雄', courtesy: '', alias: ['筏驮摩那'], faction: 'spiritual', birth: -599, death: -527, birthPlace: '吠舍离', title: '耆那教创立者', roles: ['宗教家'], avatar: '雄', bio: '耆那教第二十四祖，实际创立者。', events: [ { year: -527, place: '王舍城', desc: '涅槃' } ] },
  { id: 'bimbisara', name: '频婆娑罗王', courtesy: '', alias: [], faction: 'maurya', birth: -558, death: -492, birthPlace: '王舍城', title: '摩揭陀王', roles: ['佛陀护法'], avatar: '频', bio: '摩揭陀国励精图治，护持佛教。', events: [ { year: -540, place: '王舍城', desc: '即位' } ] },
  { id: 'ashoka', name: '阿育王', courtesy: '', alias: ['Asoka'], faction: 'maurya', birth: -304, death: -232, birthPlace: '华氏城', title: '孔雀皇帝', roles: ['法王'], avatar: '阿', bio: '统一印度后皈依佛教，弘法四海。', events: [ { year: -268, place: '华氏城', desc: '即位' }, { year: -261, place: '卡林伽', desc: '卡林伽战争后皈依佛教' }, { year: -250, place: '华氏城', desc: '召集第三次结集' } ] },
  { id: 'kanishka', name: '迦腻色伽王', courtesy: '', alias: [], faction: 'kushan', birth: 78, death: 144, birthPlace: '白沙瓦', title: '贵霜皇帝', roles: ['佛教赞助者'], avatar: '迦', bio: '贵霜极盛，赞助佛教第四次结集。', events: [ { year: 127, place: '克什米尔', desc: '召集佛教第四次结集' } ] },
  { id: 'chandragupta_i', name: '旃陀罗·笈多一世', courtesy: '', alias: [], faction: 'gupta', birth: 290, death: 335, birthPlace: '华氏城', title: '笈多建立者', roles: ['王朝开创者'], avatar: '旃', bio: '320 年建笈多王朝，开黄金时代。', events: [ { year: 320, place: '华氏城', desc: '建笈多王朝' } ] },
  { id: 'samudragupta', name: '沙摩陀罗·笈多', courtesy: '', alias: [], faction: 'gupta', birth: 335, death: 380, birthPlace: '华氏城', title: '笈多皇帝', roles: ['征服者·音乐家'], avatar: '沙', bio: '笈多极盛，几乎统一印度。', events: [ { year: 360, place: '华氏城', desc: '南征北战，几乎统一印度' } ] },
  { id: 'kumara', name: '鸠摩罗·笈多一世', courtesy: '', alias: [], faction: 'gupta', birth: 380, death: 455, birthPlace: '华氏城', title: '笈多皇帝', roles: ['文化赞助者'], avatar: '鸠', bio: '赞助那烂陀寺，文教鼎盛。', events: [ { year: 425, place: '那烂陀', desc: '扩建那烂陀寺' } ] },
  { id: 'shankara', name: '商羯罗', courtesy: '', alias: ['Adi Shankara'], faction: 'spiritual', birth: 788, death: 820, birthPlace: '喀拉拉', title: '哲学家', roles: ['吠檀多不二论'], avatar: '商', bio: '复兴印度教，建立四大僧院。', events: [ { year: 815, place: '乌贾因', desc: '与各派辩论，复兴印度教' } ] },
  { id: 'kalidasa', name: '迦梨陀娑', courtesy: '', alias: [], faction: 'gupta', birth: 400, death: 470, birthPlace: '乌贾因', title: '诗人', roles: ['梵语文学巅峰'], avatar: '迦', bio: '《沙恭达罗》《云使》，梵语古典文学代表。', events: [ { year: 440, place: '乌贾因', desc: '完成沙恭达罗' } ] },
  { id: 'babur', name: '巴布尔', courtesy: '', alias: [], faction: 'mughal', birth: 1483, death: 1530, birthPlace: '安集延', title: '莫卧儿建立者', roles: ['征服者·作家'], avatar: '巴', bio: '帖木儿后裔，帕尼帕特之战建莫卧儿。', events: [ { year: 1526, place: '帕尼帕特', desc: '帕尼帕特之战，建莫卧儿' } ] },
  { id: 'akbar', name: '阿克巴大帝', courtesy: '', alias: ['Akbar'], faction: 'mughal', birth: 1542, death: 1605, birthPlace: '阿梅尔', title: '莫卧儿皇帝', roles: ['宗教宽容'], avatar: '阿', bio: '莫卧儿极盛，取消异教税，宗教宽容。', events: [ { year: 1556, place: '帕尼帕特', desc: '第二次帕尼帕特之战即位' }, { year: 1562, place: '阿格拉', desc: '取消异教税，推行宗教宽容' } ] },
  { id: 'shah_jahan', name: '沙贾汗', courtesy: '', alias: [], faction: 'mughal', birth: 1592, death: 1666, birthPlace: '拉合尔', title: '莫卧儿皇帝', roles: ['建造者'], avatar: '沙', bio: '修建泰姬陵、红堡、贾玛清真寺。', events: [ { year: 1632, place: '阿格拉', desc: '开始建造泰姬陵' }, { year: 1648, place: '德里', desc: '迁都德里，建红堡' } ] },
  { id: 'aurangzeb', name: '奥朗则布', courtesy: '', alias: [], faction: 'mughal', birth: 1618, death: 1707, birthPlace: '阿格拉', title: '莫卧儿皇帝', roles: ['末代雄主'], avatar: '奥', bio: '疆域最大，但宗教高压，死后帝国衰落。', events: [ { year: 1658, place: '德里', desc: '夺位称帝' }, { year: 1679, place: '德里', desc: '恢复异教税' } ] },
];

const RELATIONS = [
  { source: 'buddha', target: 'bimbisara', type: '同代', label: '佛陀与护法王', year: -528 },
  { source: 'buddha', target: 'mahavira', type: '同代', label: '同时代宗教家', year: -530 },
  { source: 'bimbisara', target: 'ashoka', type: '同朝', label: '孔雀王朝', year: -300 },
  { source: 'chandragupta_i', target: 'samudragupta', type: '亲属', label: '父子', year: 335 },
  { source: 'samudragupta', target: 'kumara', type: '亲属', label: '祖孙', year: 415 },
  { source: 'babur', target: 'akbar', type: '亲属', label: '祖孙', year: 1556 },
  { source: 'akbar', target: 'shah_jahan', type: '亲属', label: '祖孙', year: 1627 },
  { source: 'shah_jahan', target: 'aurangzeb', type: '亲属', label: '父子', year: 1658 },
];

const EVENTS = [
  { id: 'e1', name: '佛陀悟道', year: -528, domain: '宗教', location: '鹿野苑', desc: '佛陀初转法轮。', participants: ['buddha'] },
  { id: 'e2', name: '佛陀涅槃', year: -483, domain: '宗教', location: '拘尸那', desc: '佛陀在拘尸那涅槃。', participants: ['buddha'] },
  { id: 'e3', name: '孔雀王朝建立', year: -322, domain: '政治', location: '华氏城', desc: '旃陀罗笈多（孔雀王朝建立者）推翻难陀。', participants: [] },
  { id: 'e4', name: '卡林伽战争', year: -261, domain: '军事', location: '卡林伽', desc: '血流成河，阿育王悔悟皈佛。', participants: ['ashoka'] },
  { id: 'e5', name: '佛教第三次结集', year: -250, domain: '宗教', location: '华氏城', desc: '阿育王召集，向海外弘法。', participants: ['ashoka'] },
  { id: 'e6', name: '贵霜第四次结集', year: 127, domain: '宗教', location: '克什米尔', desc: '迦腻色伽王召集。', participants: ['kanishka'] },
  { id: 'e7', name: '笈多黄金时代', year: 320, domain: '政治', location: '华氏城', desc: '笈多王朝开始，印度古典文化极盛。', participants: ['chandragupta_i'] },
  { id: 'e8', name: '沙恭达罗', year: 440, domain: '文化', location: '乌贾因', desc: '迦梨陀娑完成梵语戏剧代表作。', participants: ['kalidasa'] },
  { id: 'e9', name: '那烂陀扩建', year: 425, domain: '文化', location: '那烂陀', desc: '成为亚洲最大佛教大学。', participants: ['kumara'] },
  { id: 'e10', name: '商羯罗复兴印度教', year: 815, domain: '宗教', location: '乌贾因', desc: '吠檀多不二论体系化。', participants: ['shankara'] },
  { id: 'e11', name: '第一次帕尼帕特之战', year: 1526, domain: '军事', location: '帕尼帕特', desc: '巴布尔以火器大胜洛迪，建莫卧儿。', participants: ['babur'] },
  { id: 'e12', name: '阿克巴宗教宽容', year: 1562, domain: '政治', location: '阿格拉', desc: '取消异教税，融合印度教贵族。', participants: ['akbar'] },
  { id: 'e13', name: '泰姬陵建造', year: 1632, domain: '科技', location: '阿格拉', desc: '沙贾汗为亡妃所建，世界奇迹。', participants: ['shah_jahan'] },
  { id: 'e14', name: '莫卧儿迁都德里', year: 1648, domain: '政治', location: '德里', desc: '迁都沙贾汗纳巴德（今老德里）。', participants: ['shah_jahan'] },
  { id: 'e15', name: '奥朗则布恢复异教税', year: 1679, domain: '政治', location: '德里', desc: '宗教高压引发锡克、马拉塔起义。', participants: ['aurangzeb'] },
];

export const indiaAtlas = {
  id: 'india', name: '印度文明', subtitle: '佛陀与莫卧儿（前1500–1857年）',
  startYear: -1500, endYear: 1857,
  mapView: { center: [78, 22], zoom: 5, minZoom: 3, maxZoom: 12, labelZoom: { hideAll: 3, hideEvents: 6 }, importanceZoom: [5, 7], cityZoom: 5, baseLayer: 'satellite' },
  domains: [
    { name: '军事', color: '#b23a2e' }, { name: '政治', color: '#2f5d8a' },
    { name: '宗教', color: '#b8893a' }, { name: '文化', color: '#7b4b94' }, { name: '科技', color: '#2d8a6e' },
    { name: '哲学', color: '#5a6d8a' },
  ],
  factions: FACTIONS, places: PLACES, persons: PERSONS, relations: RELATIONS, events: EVENTS,
  importance: makeImportance({
    personRank: {
      buddha: 1, mahavira: 1, ashoka: 1, akbar: 1, shah_jahan: 1, aurangzeb: 1, babur: 1,
      kalidasa: 1, shankara: 1, kanishka: 1,
      bimbisara: 2, chandragupta_i: 2, samudragupta: 2, kumara: 2,
    },
    eventRank: { e1: 1, e4: 1, e7: 1, e11: 1, e13: 1, e14: 1 },
    defaultEvent: 2,
  }),
  birthplaceModern: {},
  birthplaceCoords: {
    '蓝毗尼': [83.28, 27.47], '吠舍离': [85.10, 25.99], '喀拉拉': [76.27, 10.85],
    '安集延': [72.05, 40.78], '阿梅尔': [75.83, 26.98], '卡林伽': [85.83, 20.2], '克什米尔': [74.5, 34.0],
  },
  personImages: {},
  timelineTicks: [-1500, -528, -261, 320, 127, 1526, 1707],
};
