/* 隋（581–618年）· 中华文明 */

import { makeImportance } from './index.js';

const FACTIONS = [
  { id: 'sui', name: '隋', color: '#b23a2e', founded: 581, capital: '大兴', capitalFrom: 581, desc: '结束三百年分裂，开创科举、开凿运河。' },
  { id: 'chen', name: '陈', color: '#2d8a6e', founded: 557, capital: '建康', capitalFrom: 557, desc: '南朝末代，589 年为隋所灭。' },
  { id: 'rebels', name: '隋末义军', color: '#7b4b94', founded: 611, capital: '—', capitalFrom: 611, desc: '瓦岗、河北、江都等多路义军。' },
];

const PLACES = [
  { id: 'daxing', name: '大兴', modern: '陕西西安', coord: [108.95, 34.27], note: '隋都' },
  { id: 'luoyang_sui', name: '洛阳', modern: '河南洛阳', coord: [112.45, 34.62], note: '东都' },
  { id: 'jiangdu', name: '江都', modern: '江苏扬州', coord: [119.42, 32.39], note: '炀帝南下处' },
  { id: 'jiankang_sui', name: '建康', modern: '江苏南京', coord: [118.79, 32.06], note: '陈都' },
  { id: 'zhuo', name: '涿郡', modern: '北京', coord: [116.40, 39.90], note: '大运河北端' },
  { id: 'yuhang', name: '余杭', modern: '浙江杭州', coord: [120.17, 30.27], note: '大运河南端' },
  { id: 'zhaozhou', name: '赵州', modern: '河北赵县', coord: [114.78, 37.76], note: '赵州桥' },
  { id: 'liaodong', name: '辽东', modern: '辽宁辽阳', coord: [123.17, 41.27], note: '征高句丽前线' },
  { id: 'pyongyang_sui', name: '平壤', modern: '朝鲜平壤', coord: [125.74, 39.04], note: '高句丽' },
  { id: 'wagang', name: '瓦岗', modern: '河南滑县', coord: [114.52, 35.58], note: '瓦岗军' },
  { id: 'le_shou', name: '乐寿', modern: '河北献县', coord: [116.13, 38.19], note: '窦建德都' },
];

const PERSONS = [
  { id: 'yang_jian', name: '杨坚', courtesy: '', alias: ['隋文帝'], faction: 'sui', birth: 541, death: 604, birthPlace: '冯翊', title: '隋文帝', roles: ['隋朝建立者'], avatar: '坚', bio: '代北周建隋，灭陈统一，开皇之治。', events: [ { year: 581, place: '大兴', desc: '代周建隋' }, { year: 589, place: '建康', desc: '灭陈统一' }, { year: 604, place: '大兴', desc: '驾崩' } ] },
  { id: 'dugu', name: '独孤皇后', courtesy: '伽罗', alias: [], faction: 'sui', birth: 544, death: 602, birthPlace: '大兴', title: '文献皇后', roles: ['政治家'], avatar: '独', bio: '与文帝并称"二圣"，深度参与朝政。', events: [ { year: 581, place: '大兴', desc: '立为皇后' } ] },
  { id: 'yang_guang', name: '杨广', courtesy: '', alias: ['隋炀帝'], faction: 'sui', birth: 569, death: 618, birthPlace: '大兴', title: '隋炀帝', roles: ['争议之君'], avatar: '广', bio: '开运河、修东都、三征高句丽，劳民过度引发崩溃。', events: [ { year: 605, place: '洛阳', desc: '营建东都，开凿大运河' }, { year: 612, place: '辽东', desc: '一征高句丽' }, { year: 614, place: '辽东', desc: '三征高句丽' }, { year: 618, place: '江都', desc: '宇文化及兵变中被杀' } ] },
  { id: 'gao_jiong', name: '高颎', courtesy: '昭玄', alias: [], faction: 'sui', birth: 541, death: 607, birthPlace: '渤海', title: '宰相', roles: ['开皇名臣'], avatar: '高', bio: '佐文帝平陈、定制度，后为炀帝所杀。', events: [ { year: 589, place: '建康', desc: '统军灭陈' } ] },
  { id: 'su_wei', name: '苏威', courtesy: '无畏', alias: [], faction: 'sui', birth: 542, death: 623, birthPlace: '京兆', title: '宰相', roles: ['开皇名臣'], avatar: '苏', bio: '与高颎同参朝政，制定隋律。', events: [ { year: 585, place: '大兴', desc: '参与制定隋律' } ] },
  { id: 'han_qin_hu', name: '韩擒虎', courtesy: '子通', alias: [], faction: 'sui', birth: 538, death: 592, birthPlace: '河南', title: '大将', roles: ['灭陈先锋'], avatar: '韩', bio: '589 年首入建康俘陈后主。', events: [ { year: 589, place: '建康', desc: '攻入建康，俘陈后主' } ] },
  { id: 'he_ruo_bi', name: '贺若弼', courtesy: '辅伯', alias: [], faction: 'sui', birth: 544, death: 607, birthPlace: '河南', title: '大将', roles: ['灭陈名将'], avatar: '贺', bio: '灭陈功臣，因功自夸被炀帝所杀。', events: [ { year: 589, place: '建康', desc: '灭陈功第一' } ] },
  { id: 'shi_wan_sui', name: '史万岁', courtesy: '', alias: [], faction: 'sui', birth: 549, death: 600, birthPlace: '京兆', title: '大将', roles: ['名将'], avatar: '史', bio: '北却突厥、南平夷獠，为文帝冤杀。', events: [ { year: 583, place: '大同', desc: '北击突厥' } ] },
  { id: 'yuwen_kai', name: '宇文恺', courtesy: '安乐', alias: [], faction: 'sui', birth: 555, death: 612, birthPlace: '代北', title: '将作大匠', roles: ['建筑家'], avatar: '宇', bio: '规划大兴城、洛阳、运河工程。', events: [ { year: 582, place: '大兴', desc: '主持营建大兴城' } ] },
  { id: 'li_chun', name: '李春', courtesy: '', alias: [], faction: 'sui', birth: 555, death: 635, birthPlace: '赵州', title: '匠人', roles: ['赵州桥设计者'], avatar: '春', bio: '设计建造安济桥（赵州桥），世界最早敞肩拱桥。', events: [ { year: 605, place: '赵州', desc: '建赵州桥' } ] },
  { id: 'liang_yan', name: '梁彦', courtesy: '', alias: [], faction: 'rebels', birth: 580, death: 621, birthPlace: '安定', title: '大将', roles: ['隋将→唐臣'], avatar: '梁', bio: '由隋入唐的过渡将领。', events: [ { year: 617, place: '大兴', desc: '降唐' } ] },
  { id: 'li_mi', name: '李密', courtesy: '玄邃', alias: [], faction: 'rebels', birth: 582, death: 619, birthPlace: '京兆', title: '瓦岗军首领', roles: ['义军领袖'], avatar: '密', bio: '瓦岗军主帅，败王世充后归唐复叛被杀。', events: [ { year: 617, place: '瓦岗', desc: '率瓦岗军大败隋军' } ] },
  { id: 'dou_jian_de', name: '窦建德', courtesy: '', alias: [], faction: 'rebels', birth: 573, death: 621, birthPlace: '河北', title: '夏王', roles: ['义军领袖'], avatar: '窦', bio: '河北义军首领，建立大夏，为李世民所擒。', events: [ { year: 618, place: '乐寿', desc: '建立大夏政权' } ] },
  { id: 'wang_shi_chong', name: '王世充', courtesy: '', alias: [], faction: 'rebels', birth: 567, death: 621, birthPlace: '西域', title: '郑帝', roles: ['隋将→割据者'], avatar: '王', bio: '隋将，炀帝死后在洛阳称帝建郑，为窦建德唐军联军所灭。', events: [ { year: 619, place: '洛阳', desc: '称帝建郑' } ] },
];

const RELATIONS = [
  { source: 'yang_jian', target: 'dugu', type: '亲属', label: '夫妻共治', year: 581 },
  { source: 'yang_jian', target: 'yang_guang', type: '亲属', label: '父子', year: 604 },
  { source: 'yang_jian', target: 'gao_jiong', type: '君臣', label: '倚为腹心', year: 581 },
  { source: 'yang_jian', target: 'su_wei', type: '君臣', label: '参掌朝政', year: 581 },
  { source: 'yang_guang', target: 'yuwen_kai', type: '君臣', label: '营建东都', year: 605 },
  { source: 'yang_guang', target: 'gao_jiong', type: '敌对', label: '赐死', year: 607 },
  { source: 'han_qin_hu', target: 'he_ruo_bi', type: '同僚', label: '灭陈双壁', year: 589 },
  { source: 'li_mi', target: 'dou_jian_de', type: '同阵营', label: '隋末义军', year: 617 },
];

const EVENTS = [
  { id: 'e1', name: '隋建国', year: 581, domain: '政治', location: '大兴', desc: '杨坚代北周建隋。', participants: ['yang_jian', 'dugu'] },
  { id: 'e2', name: '灭陈统一', year: 589, domain: '军事', location: '建康', desc: '韩擒虎、贺若弼南下，结束近三百年分裂。', participants: ['yang_jian', 'gao_jiong', 'han_qin_hu', 'he_ruo_bi'] },
  { id: 'e3', name: '开皇律颁布', year: 583, domain: '政治', location: '大兴', desc: '苏威等参与制定隋律。', participants: ['su_wei'] },
  { id: 'e4', name: '营建大兴城', year: 582, domain: '科技', location: '大兴', desc: '宇文恺主持规划。', participants: ['yuwen_kai', 'yang_jian'] },
  { id: 'e5', name: '开皇之治', year: 590, domain: '政治', location: '大兴', desc: '国势鼎盛、府库充盈。', participants: ['yang_jian', 'gao_jiong', 'su_wei'] },
  { id: 'e6', name: '营建东都+大运河', year: 605, domain: '科技', location: '洛阳', desc: '炀帝下令开通济渠，连接黄河与淮河。', participants: ['yang_guang', 'yuwen_kai'] },
  { id: 'e7', name: '赵州桥建成', year: 605, domain: '科技', location: '赵州', desc: '李春设计，世界最早敞肩石拱桥。', participants: ['li_chun'] },
  { id: 'e8', name: '一征高句丽', year: 612, domain: '军事', location: '辽东', desc: '百万大军败于辽东。', participants: ['yang_guang'] },
  { id: 'e9', name: '三征高句丽', year: 614, domain: '军事', location: '辽东', desc: '耗尽国力，引发大起义。', participants: ['yang_guang'] },
  { id: 'e10', name: '隋末农民起义', year: 611, domain: '军事', location: '瓦岗', desc: '瓦岗军、窦建德、杜伏威等纷纷起事。', participants: ['li_mi', 'dou_jian_de'] },
  { id: 'e11', name: '炀帝被弑', year: 618, domain: '政治', location: '江都', desc: '宇文化及兵变，炀帝被缢杀。', participants: ['yang_guang'] },
  { id: 'e12', name: '王世充称帝', year: 619, domain: '政治', location: '洛阳', desc: '炀帝死后，王世充在洛阳建郑。', participants: ['wang_shi_chong'] },
];

export const suiAtlas = {
  id: 'sui', name: '隋', subtitle: '终结分裂 · 科举运河之始（581–618年）',
  startYear: 581, endYear: 618,
  mapView: { center: [112, 34], zoom: 5, minZoom: 3, maxZoom: 12, labelZoom: { hideAll: 3, hideEvents: 6 }, importanceZoom: [5, 7], cityZoom: 5, baseLayer: 'terrain' },
  domains: [
    { name: '军事', color: '#b23a2e' }, { name: '政治', color: '#2f5d8a' },
    { name: '文化', color: '#7b4b94' }, { name: '科技', color: '#2d8a6e' },
    { name: '外交', color: '#b8893a' },
  ],
  factions: FACTIONS, places: PLACES, persons: PERSONS, relations: RELATIONS, events: EVENTS,
  importance: makeImportance({
    personRank: {
      yang_jian: 1, yang_guang: 1, gao_jiong: 1, yuwen_kai: 1, li_chun: 1, li_mi: 1,
      dou_jian_de: 2, wang_shi_chong: 2, han_qin_hu: 2, he_ruo_bi: 2, su_wei: 2, shi_wan_sui: 2, dugu: 2, liang_yan: 2,
    },
    eventRank: { e1: 1, e2: 1, e6: 1, e7: 1, e11: 1 },
    defaultEvent: 2,
  }),
  birthplaceModern: {},
  birthplaceCoords: { '冯翊': [109.5, 34.5], '渤海': [117.5, 38.0], '京兆': [108.95, 34.27], '河南': [113.6, 34.7], '代北': [113.3, 40.1], '安定': [107.3, 35.4], '河北': [114.5, 38.0], '西域': [85.0, 41.0], '大同': [113.30, 40.09] },
  personImages: {},
  timelineTicks: [581, 589, 605, 612, 618],
};
