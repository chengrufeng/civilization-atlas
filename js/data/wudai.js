/* 五代十国（907–979年）· 中华文明 */

import { makeImportance } from './index.js';

const FACTIONS = [
  { id: 'houliang', name: '后梁', color: '#b23a2e', founded: 907, capital: '开封', capitalFrom: 907, desc: '朱温代唐建梁。' },
  { id: 'houtang', name: '后唐', color: '#2f5d8a', founded: 923, capital: '洛阳', capitalFrom: 923, desc: '沙陀李氏灭梁。' },
  { id: 'houjin', name: '后晋', color: '#b8893a', founded: 936, capital: '开封', capitalFrom: 937, desc: '石敬瑭割燕云十六国换帝位。' },
  { id: 'houhan', name: '后汉', color: '#7b4b94', founded: 947, capital: '开封', capitalFrom: 947, desc: '沙陀刘氏短命王朝。' },
  { id: 'houzhou', name: '后周', color: '#2d8a6e', founded: 951, capital: '开封', capitalFrom: 951, desc: '郭威建国，柴荣改革为北宋奠基。' },
  { id: 'nantang', name: '南唐', color: '#5a6d8a', founded: 937, capital: '金陵', capitalFrom: 937, desc: '十国文化之盛，李煜词帝。' },
  { id: 'wuyue', name: '吴越', color: '#8a6d3b', founded: 907, capital: '杭州', capitalFrom: 907, desc: '钱镠建国，保境安民。' },
];

const PLACES = [
  { id: 'kaifeng', name: '开封', modern: '河南开封', coord: [114.31, 34.80], note: '五代都' },
  { id: 'luoyang5', name: '洛阳', modern: '河南洛阳', coord: [112.45, 34.62], note: '后唐都' },
  { id: 'jinling', name: '金陵', modern: '江苏南京', coord: [118.79, 32.06], note: '南唐都' },
  { id: 'hangzhou', name: '杭州', modern: '浙江杭州', coord: [120.16, 30.27], note: '吴越都' },
  { id: 'jinyang', name: '晋阳', modern: '山西太原', coord: [112.55, 37.87], note: '沙陀根据地' },
  { id: 'ye_cheng', name: '邺城', modern: '河北临漳', coord: [114.60, 36.27], note: '河北重镇' },
  { id: 'yanyun', name: '幽州', modern: '北京', coord: [116.40, 39.90], note: '燕云十六州' },
  { id: 'chengdu5', name: '成都', modern: '四川成都', coord: [104.07, 30.67], note: '前后蜀' },
  { id: 'guangzhou5', name: '广州', modern: '广东广州', coord: [113.26, 23.13], note: '南汉都' },
];

const PERSONS = [
  { id: 'zhu_wen', name: '朱温', courtesy: '全忠', alias: ['朱晃'], faction: 'houliang', birth: 852, death: 912, birthPlace: '宋州', title: '后梁太祖', roles: ['代唐建梁'], avatar: '朱', bio: '黄巢降将，最终代唐建后梁，开启五代。', events: [ { year: 907, place: '开封', desc: '代唐建后梁' } ] },
  { id: 'li_ke_yong', name: '李克用', courtesy: '', alias: [], faction: 'houtang', birth: 856, death: 908, birthPlace: '晋阳', title: '晋王', roles: ['沙陀首领'], avatar: '李', bio: '与朱温争天下终生，其子建后唐。', events: [ { year: 907, place: '晋阳', desc: '朱温篡唐后仍奉唐正朔' } ] },
  { id: 'li_cun_xu', name: '李存勖', courtesy: '', alias: ['后唐庄宗'], faction: 'houtang', birth: 885, death: 926, birthPlace: '晋阳', title: '后唐庄宗', roles: ['灭梁建唐'], avatar: '勖', bio: '骁勇善战，灭燕梁建后唐，晚年兵变被杀。', events: [ { year: 923, place: '开封', desc: '灭后梁称帝' } ] },
  { id: 'shi_jing_tang', name: '石敬瑭', courtesy: '', alias: [], faction: 'houjin', birth: 892, death: 942, birthPlace: '太原', title: '后晋高祖', roles: ['割燕云十六州'], avatar: '石', bio: '借契丹之力称帝，割让燕云十六州。', events: [ { year: 936, place: '晋阳', desc: '借契丹兵叛后唐' }, { year: 937, place: '开封', desc: '建后晋，定都开封' }, { year: 938, place: '幽州', desc: '割燕云十六州予契丹' } ] },
  { id: 'liu_zhi_yuan', name: '刘知远', courtesy: '', alias: [], faction: 'houhan', birth: 895, death: 948, birthPlace: '太原', title: '后汉高祖', roles: ['建后汉'], avatar: '刘', bio: '契丹灭晋后在太原称帝，建立后汉。', events: [ { year: 947, place: '晋阳', desc: '建后汉' } ] },
  { id: 'guo_wei', name: '郭威', courtesy: '', alias: [], faction: 'houzhou', birth: 904, death: 954, birthPlace: '邢州', title: '后周太祖', roles: ['建后周'], avatar: '郭', bio: '后汉大将，黄旗披身兵变建后周。', events: [ { year: 951, place: '开封', desc: '建后周' } ] },
  { id: 'chai_rong', name: '柴荣', courtesy: '', alias: ['后周世宗'], faction: 'houzhou', birth: 921, death: 959, birthPlace: '邢州', title: '后周世宗', roles: ['雄主·改革者'], avatar: '柴', bio: '励精图治、南征北战，为北宋统一奠基。', events: [ { year: 954, place: '开封', desc: '即位，高平之战大败北汉' }, { year: 955, place: '开封', desc: '开始全面改革' }, { year: 959, place: '幽州', desc: '北伐辽，病逝军中' } ] },
  { id: 'qian_liu', name: '钱镠', courtesy: '具美', alias: [], faction: 'wuyue', birth: 852, death: 932, birthPlace: '杭州', title: '吴越王', roles: ['保境安民'], avatar: '钱', bio: '保境安民、修海塘，开启东南百年繁荣。', events: [ { year: 907, place: '杭州', desc: '受封吴越王' } ] },
  { id: 'li_yu', name: '李煜', courtesy: '重光', alias: ['南唐后主'], faction: 'nantang', birth: 937, death: 978, birthPlace: '金陵', title: '南唐国主', roles: ['词帝'], avatar: '煜', bio: '不善治国而工词，亡国后写"故国不堪回首"。', events: [ { year: 961, place: '金陵', desc: '继位南唐国主' }, { year: 975, place: '金陵', desc: '宋军破金陵，南唐亡' }, { year: 978, place: '开封', desc: '被宋太宗赐死' } ] },
  { id: 'yang_xing_mi', name: '杨行密', courtesy: '', alias: [], faction: 'nantang', birth: 852, death: 905, birthPlace: '合肥', title: '吴王', roles: ['杨吴奠基者'], avatar: '杨', bio: '江淮割据奠基，其国后由李昪代之为南唐。', events: [ { year: 902, place: '金陵', desc: '受封吴王' } ] },
  { id: 'li_bian', name: '李昪', courtesy: '', alias: ['徐知诰'], faction: 'nantang', birth: 888, death: 943, birthPlace: '徐州', title: '南唐烈祖', roles: ['南唐建立者'], avatar: '昪', bio: '代杨吴建齐国，后改国号唐，是为南唐。', events: [ { year: 937, place: '金陵', desc: '代吴建齐，次年改唐' } ] },
];

const RELATIONS = [
  { source: 'zhu_wen', target: 'li_ke_yong', type: '敌对', label: '梁晋争雄', year: 907 },
  { source: 'li_ke_yong', target: 'li_cun_xu', type: '亲属', label: '父子', year: 908 },
  { source: 'li_cun_xu', target: 'zhu_wen', type: '敌对', label: '灭梁', year: 923 },
  { source: 'shi_jing_tang', target: 'li_cun_xu', type: '同朝', label: '后唐将', year: 923 },
  { source: 'guo_wei', target: 'chai_rong', type: '亲属', label: '姑侄·养子', year: 954 },
  { source: 'qian_liu', target: 'zhu_wen', type: '同朝', label: '受梁册封', year: 907 },
  { source: 'li_bian', target: 'yang_xing_mi', type: '同朝', label: '代杨吴', year: 937 },
  { source: 'li_bian', target: 'li_yu', type: '亲属', label: '祖孙', year: 961 },
];

const EVENTS = [
  { id: 'e1', name: '朱温代唐', year: 907, domain: '政治', location: '开封', desc: '唐亡，五代十国开始。', participants: ['zhu_wen'] },
  { id: 'e2', name: '梁晋争雄', year: 908, domain: '军事', location: '晋阳', desc: '李克用与朱温长期对抗。', participants: ['li_ke_yong', 'zhu_wen'] },
  { id: 'e3', name: '后唐灭梁', year: 923, domain: '军事', location: '开封', desc: '李存勖称帝灭后梁。', participants: ['li_cun_xu'] },
  { id: 'e4', name: '石敬瑭割燕云', year: 938, domain: '外交', location: '幽州', desc: '割燕云十六州予契丹，遗患四百年。', participants: ['shi_jing_tang'] },
  { id: 'e5', name: '后晋建立', year: 937, domain: '政治', location: '开封', desc: '石敬瑭建后晋。', participants: ['shi_jing_tang'] },
  { id: 'e6', name: '契丹灭晋', year: 947, domain: '军事', location: '开封', desc: '辽太宗入汴，后晋亡。', participants: [] },
  { id: 'e7', name: '后汉建立', year: 947, domain: '政治', location: '晋阳', desc: '刘知远建后汉。', participants: ['liu_zhi_yuan'] },
  { id: 'e8', name: '后周建立', year: 951, domain: '政治', location: '开封', desc: '郭威兵变建后周。', participants: ['guo_wei'] },
  { id: 'e9', name: '高平之战', year: 954, domain: '军事', location: '邺城', desc: '柴荣即位首战大败北汉。', participants: ['chai_rong'] },
  { id: 'e10', name: '柴荣改革', year: 955, domain: '政治', location: '开封', desc: '整顿军政、均定田赋、禁佛。', participants: ['chai_rong'] },
  { id: 'e11', name: '吴越建国', year: 907, domain: '政治', location: '杭州', desc: '钱镠受封吴越王。', participants: ['qian_liu'] },
  { id: 'e12', name: '南唐建立', year: 937, domain: '政治', location: '金陵', desc: '李昪代吴建唐。', participants: ['li_bian', 'yang_xing_mi'] },
  { id: 'e13', name: '南唐灭亡', year: 975, domain: '军事', location: '金陵', desc: '宋军攻破金陵，李煜降。', participants: ['li_yu'] },
];

export const wudaiAtlas = {
  id: 'wudai', name: '五代十国', subtitle: '乱世烽烟 · 词帝悲歌（907–979年）',
  startYear: 907, endYear: 979,
  mapView: { center: [114, 33], zoom: 5, minZoom: 3, maxZoom: 12, labelZoom: { hideAll: 3, hideEvents: 6 }, importanceZoom: [5, 7], cityZoom: 5, baseLayer: 'terrain' },
  domains: [
    { name: '军事', color: '#b23a2e' }, { name: '政治', color: '#2f5d8a' },
    { name: '文化', color: '#7b4b94' }, { name: '外交', color: '#b8893a' },
  ],
  factions: FACTIONS, places: PLACES, persons: PERSONS, relations: RELATIONS, events: EVENTS,
  importance: makeImportance({
    personRank: {
      zhu_wen: 1, li_ke_yong: 1, li_cun_xu: 1, shi_jing_tang: 1, chai_rong: 1, qian_liu: 1, li_yu: 1,
      guo_wei: 2, liu_zhi_yuan: 2, li_bian: 2, yang_xing_mi: 2,
    },
    eventRank: { e1: 1, e4: 1, e9: 1, e10: 1, e13: 1 },
    defaultEvent: 2,
  }),
  birthplaceModern: {},
  birthplaceCoords: { '宋州': [115.65, 34.41], '徐州': [117.18, 34.26], '邢州': [114.50, 37.07], '合肥': [117.23, 31.82], '太原': [112.55, 37.87] },
  personImages: {},
  timelineTicks: [907, 923, 938, 955, 975, 979],
};
