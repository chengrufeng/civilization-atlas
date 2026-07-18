/* 两晋南北朝（265–589年）· 中华文明 */

import { makeImportance } from './index.js';

const FACTIONS = [
  { id: 'xijin', name: '西晋', color: '#2f5d8a', founded: 265, capital: '洛阳', capitalFrom: 265, desc: '司马炎代魏建晋，短暂统一。' },
  { id: 'dongjin', name: '东晋', color: '#3a8ab2', founded: 317, capital: '建康', capitalFrom: 317, desc: '衣冠南渡，偏安江左。' },
  { id: 'qianqin', name: '前秦', color: '#7b4b94', founded: 351, capital: '长安', capitalFrom: 351, desc: '氐族苻氏，短暂统一北方。' },
  { id: 'beiwei', name: '北魏', color: '#b23a2e', founded: 386, capital: '平城', capitalFrom: 386, desc: '拓跋鲜卑，统一北方。' },
  { id: 'liusong', name: '刘宋', color: '#b8893a', founded: 420, capital: '建康', capitalFrom: 420, desc: '南朝第一个政权。' },
  { id: 'nanliang', name: '南梁', color: '#2d8a6e', founded: 502, capital: '建康', capitalFrom: 502, desc: '梁武帝萧衍崇佛。' },
  { id: 'chen', name: '陈', color: '#8a6d3b', founded: 557, capital: '建康', capitalFrom: 557, desc: '南朝最后一朝。' },
];

const PLACES = [
  { id: 'luoyang', name: '洛阳', modern: '河南洛阳', coord: [112.45, 34.62], note: '西晋都城' },
  { id: 'jiankang', name: '建康', modern: '江苏南京', coord: [118.79, 32.06], note: '东晋南朝都城' },
  { id: 'changan', name: '长安', modern: '陕西西安', coord: [108.95, 34.27], note: '前秦都城' },
  { id: 'pingcheng', name: '平城', modern: '山西大同', coord: [113.30, 40.09], note: '北魏早期都城' },
  { id: 'feishui', name: '淝水', modern: '安徽寿县', coord: [116.79, 32.58], note: '淝水之战' },
  { id: 'kuaiji', name: '会稽', modern: '浙江绍兴', coord: [120.58, 30.00], note: '王羲之兰亭' },
  { id: 'liangjun', name: '梁郡', modern: '河南商丘', coord: [115.65, 34.41], note: '北方重镇' },
  { id: 'yedu', name: '邺城', modern: '河北临漳', coord: [114.60, 36.27], note: '后赵东魏北齐重镇' },
  { id: 'qishan', name: '岐山', modern: '陕西岐山', coord: [107.62, 34.44], note: '关中' },
  { id: 'jingkou', name: '京口', modern: '江苏镇江', coord: [119.45, 32.20], note: '刘裕起兵处' },
  { id: 'wuwei', name: '武威', modern: '甘肃武威', coord: [102.64, 37.93], note: '河西走廊' },
  { id: 'longxi', name: '陇西', modern: '甘肃陇西', coord: [104.65, 34.99], note: '苻坚故地' },
  { id: 'chaisan', name: '柴桑', modern: '江西九江', coord: [115.98, 29.71], note: '陶渊明故里' },
];

const PERSONS = [
  { id: 'sim_yan', name: '司马炎', courtesy: '安世', alias: ['晋武帝'], faction: 'xijin', birth: 236, death: 290, birthPlace: '洛阳', title: '晋武帝', roles: ['西晋开国之君'], avatar: '炎', bio: '代魏建晋，平吴统一，晚年分封宗室埋下祸根。', events: [ { year: 265, place: '洛阳', desc: '代魏建晋' }, { year: 280, place: '建康', desc: '灭吴统一' } ] },
  { id: 'sim_rui', name: '司马睿', courtesy: '景文', alias: ['晋元帝'], faction: 'dongjin', birth: 276, death: 323, birthPlace: '洛阳', title: '晋元帝', roles: ['东晋开国之君'], avatar: '睿', bio: '永嘉南渡，王导辅佐下建立东晋。', events: [ { year: 317, place: '建康', desc: '建立东晋' } ] },
  { id: 'wang_dao', name: '王导', courtesy: '茂弘', alias: [], faction: 'dongjin', birth: 276, death: 339, birthPlace: '临沂', title: '丞相', roles: ['政治家'], avatar: '王', bio: '王与马共天下，奠定东晋基业。', events: [ { year: 317, place: '建康', desc: '辅佐司马睿建国' } ] },
  { id: 'zu_ti', name: '祖逖', courtesy: '士稚', alias: [], faction: 'dongjin', birth: 266, death: 321, birthPlace: '范阳', title: '镇西将军', roles: ['名将'], avatar: '祖', bio: '闻鸡起舞、中流击楫，立志北伐。', events: [ { year: 313, place: '京口', desc: '中流击楫北伐' } ] },
  { id: 'huan_wen', name: '桓温', courtesy: '元子', alias: [], faction: 'dongjin', birth: 312, death: 373, birthPlace: '谯国', title: '大司马', roles: ['权臣','军事家'], avatar: '桓', bio: '三度北伐，废立皇帝，终未篡位。', events: [ { year: 354, place: '长安', desc: '第一次北伐' } ] },
  { id: 'xie_an', name: '谢安', courtesy: '安石', alias: [], faction: 'dongjin', birth: 320, death: 385, birthPlace: '陈郡', title: '司徒', roles: ['政治家'], avatar: '谢', bio: '淝水之战总指挥，从容却敌。', events: [ { year: 383, place: '建康', desc: '运筹淝水之战' } ] },
  { id: 'xie_xuan', name: '谢玄', courtesy: '幼度', alias: [], faction: 'dongjin', birth: 343, death: 388, birthPlace: '陈郡', title: '冠军将军', roles: ['名将'], avatar: '玄', bio: '北府兵统帅，淝水破敌。', events: [ { year: 383, place: '淝水', desc: '淝水之战大破秦军' } ] },
  { id: 'wang_xizhi', name: '王羲之', courtesy: '逸少', alias: [], faction: 'dongjin', birth: 303, death: 361, birthPlace: '琅琊', title: '右军将军', roles: ['书法家'], avatar: '羲', bio: '书圣，兰亭序天下第一行书。', events: [ { year: 353, place: '会稽', desc: '兰亭雅集，书兰亭序' } ] },
  { id: 'gu_kai_zhi', name: '顾恺之', courtesy: '长康', alias: [], faction: 'dongjin', birth: 348, death: 409, birthPlace: '无锡', title: '画家', roles: ['画家'], avatar: '顾', bio: '才绝画绝痴绝，洛神赋图、女史箴图。', events: [ { year: 380, place: '建康', desc: '作洛神赋图' } ] },
  { id: 'tao_yuan_ming', name: '陶渊明', courtesy: '元亮', alias: ['陶潜'], faction: 'liusong', birth: 365, death: 427, birthPlace: '柴桑', title: '彭泽令', roles: ['诗人'], avatar: '陶', bio: '不为五斗米折腰，归园田居，田园诗之祖。', events: [ { year: 405, place: '柴桑', desc: '辞官归隐，作归去来兮辞' } ] },
  { id: 'fu_jian', name: '苻坚', courtesy: '永固', alias: [], faction: 'qianqin', birth: 338, death: 385, birthPlace: '陇西', title: '前秦天王', roles: ['前秦君主'], avatar: '苻', bio: '任王猛统一北方，淝水一败涂地。', events: [ { year: 376, place: '长安', desc: '统一北方' }, { year: 383, place: '淝水', desc: '淝水之战大败' } ] },
  { id: 'wang_meng', name: '王猛', courtesy: '景略', alias: [], faction: 'qianqin', birth: 325, death: 375, birthPlace: '北海', title: '前秦丞相', roles: ['政治家','军事家'], avatar: '猛', bio: '扪虱而谈，助苻坚统一北方，功比诸葛。', events: [ { year: 370, place: '长安', desc: '任丞相，整顿国政' } ] },
  { id: 'tuo_gui', name: '拓跋珪', courtesy: '涉圭', alias: ['道武帝'], faction: 'beiwei', birth: 371, death: 409, birthPlace: '盛乐', title: '魏道武帝', roles: ['北魏建立者'], avatar: '珪', bio: '复国建魏，参合陂大破后燕。', events: [ { year: 386, place: '平城', desc: '建北魏' } ] },
  { id: 'tuo_tao', name: '拓跋焘', courtesy: '佛狸伐', alias: ['太武帝'], faction: 'beiwei', birth: 408, death: 452, birthPlace: '平城', title: '魏太武帝', roles: ['北魏雄主'], avatar: '焘', bio: '统一北方、击柔然、灭佛。', events: [ { year: 439, place: '平城', desc: '统一北方' } ] },
  { id: 'xiao_wen', name: '孝文帝', courtesy: '', alias: ['元宏','拓跋宏'], faction: 'beiwei', birth: 467, death: 499, birthPlace: '平城', title: '魏孝文帝', roles: ['改革家'], avatar: '宏', bio: '迁都洛阳、推行汉化改革，改姓元氏。', events: [ { year: 494, place: '洛阳', desc: '迁都洛阳' }, { year: 496, place: '洛阳', desc: '全面汉化改革' } ] },
  { id: 'liu_yu', name: '刘裕', courtesy: '德舆', alias: ['宋武帝'], faction: 'liusong', birth: 363, death: 422, birthPlace: '彭城', title: '宋武帝', roles: ['刘宋开国之君'], avatar: '裕', bio: '寒门出身，北伐气吞万里，代晋建宋。', events: [ { year: 420, place: '建康', desc: '代晋建宋' } ] },
  { id: 'xiao_yan', name: '萧衍', courtesy: '叔达', alias: ['梁武帝'], faction: 'nanliang', birth: 464, death: 549, birthPlace: '南兰陵', title: '梁武帝', roles: ['南梁开国之君'], avatar: '衍', bio: '崇佛误国，侯景之乱饿死台城。', events: [ { year: 502, place: '建康', desc: '代齐建梁' }, { year: 548, place: '建康', desc: '侯景之乱' } ] },
  { id: 'chen_baxian', name: '陈霸先', courtesy: '兴国', alias: ['陈武帝'], faction: 'chen', birth: 503, death: 559, birthPlace: '吴兴', title: '陈武帝', roles: ['陈朝开国之君'], avatar: '霸', bio: '平定侯景之乱，代梁建陈。', events: [ { year: 557, place: '建康', desc: '代梁建陈' } ] },
  { id: 'da_mo', name: '达摩', courtesy: '', alias: ['菩提达摩'], faction: 'nanliang', birth: 470, death: 536, birthPlace: '天竺', title: '禅师', roles: ['禅宗始祖'], avatar: '摩', bio: '西来东土，一苇渡江，面壁九年。', events: [ { year: 527, place: '建康', desc: '见梁武帝，话不投机北上' } ] },
  { id: 'fan_zhen', name: '范缜', courtesy: '子真', alias: [], faction: 'nanliang', birth: 450, death: 515, birthPlace: '南乡', title: '尚书左丞', roles: ['思想家'], avatar: '缜', bio: '著《神灭论》，反佛崇无。', events: [ { year: 507, place: '建康', desc: '发表神灭论' } ] },
];

const RELATIONS = [
  { source: 'sim_yan', target: 'sim_rui', type: '亲属', label: '宗室', year: 317 },
  { source: 'sim_rui', target: 'wang_dao', type: '君臣', label: '王与马共天下', year: 317 },
  { source: 'xie_an', target: 'xie_xuan', type: '亲属', label: '叔侄', year: 383 },
  { source: 'xie_an', target: 'fu_jian', type: '敌对', label: '淝水之战', year: 383 },
  { source: 'fu_jian', target: 'wang_meng', type: '君臣', label: '托以国政', year: 357 },
  { source: 'tuo_tao', target: 'xiao_wen', type: '亲属', label: '祖孙', year: 470 },
  { source: 'xiao_yan', target: 'da_mo', type: '同代', label: '梁武帝问法', year: 527 },
  { source: 'xiao_yan', target: 'fan_zhen', type: '同僚', label: '崇佛与反佛', year: 507 },
  { source: 'liu_yu', target: 'sim_rui', type: '同朝', label: '东晋将→代晋', year: 420 },
  { source: 'chen_baxian', target: 'xiao_yan', type: '同代', label: '南朝更迭', year: 548 },
];

const EVENTS = [
  { id: 'e1', name: '西晋建立', year: 265, domain: '政治', location: '洛阳', desc: '司马炎代魏建晋。', participants: ['sim_yan'] },
  { id: 'e2', name: '西晋统一', year: 280, domain: '军事', location: '建康', desc: '晋灭吴，结束三国鼎立。', participants: ['sim_yan'] },
  { id: 'e3', name: '八王之乱', year: 291, domain: '军事', location: '洛阳', desc: '宗室诸王互相攻杀，西晋由盛转衰。', participants: ['sim_yan'] },
  { id: 'e4', name: '永嘉之乱', year: 311, domain: '军事', location: '洛阳', desc: '匈奴破洛阳，掳怀帝，西晋名存实亡。', participants: [] },
  { id: 'e5', name: '衣冠南渡', year: 317, domain: '政治', location: '建康', desc: '司马睿在建康称帝，建立东晋。', participants: ['sim_rui', 'wang_dao'] },
  { id: 'e6', name: '祖逖北伐', year: 313, domain: '军事', location: '京口', desc: '中流击楫，立志收复中原。', participants: ['zu_ti'] },
  { id: 'e7', name: '桓温北伐', year: 354, domain: '军事', location: '长安', desc: '东晋一度入关中。', participants: ['huan_wen'] },
  { id: 'e8', name: '兰亭雅集', year: 353, domain: '文化', location: '会稽', desc: '王羲之书兰亭序。', participants: ['wang_xizhi'] },
  { id: 'e9', name: '淝水之战', year: 383, domain: '军事', location: '淝水', desc: '东晋以少胜多，前秦崩溃。', participants: ['xie_an', 'xie_xuan', 'fu_jian'] },
  { id: 'e10', name: '前秦统一北方', year: 376, domain: '政治', location: '长安', desc: '王猛辅佐苻坚统一北方。', participants: ['fu_jian', 'wang_meng'] },
  { id: 'e11', name: '北魏建国', year: 386, domain: '政治', location: '平城', desc: '拓跋珪重建代魏，定国号魏。', participants: ['tuo_gui'] },
  { id: 'e12', name: '北魏统一北方', year: 439, domain: '军事', location: '平城', desc: '太武帝结束十六国混战。', participants: ['tuo_tao'] },
  { id: 'e13', name: '刘裕代晋', year: 420, domain: '政治', location: '建康', desc: '刘裕建宋，南朝开始。', participants: ['liu_yu'] },
  { id: 'e14', name: '陶渊明归隐', year: 405, domain: '文化', location: '梁郡', desc: '不为五斗米折腰，归园田居。', participants: ['tao_yuan_ming'] },
  { id: 'e15', name: '孝文帝改革', year: 494, domain: '政治', location: '洛阳', desc: '迁都洛阳、推行汉化。', participants: ['xiao_wen'] },
  { id: 'e16', name: '达摩东来', year: 527, domain: '宗教', location: '建康', desc: '禅宗始祖抵达南朝。', participants: ['da_mo', 'xiao_yan'] },
  { id: 'e17', name: '神灭论争', year: 507, domain: '宗教', location: '建康', desc: '范缜发表《神灭论》。', participants: ['fan_zhen', 'xiao_yan'] },
  { id: 'e18', name: '侯景之乱', year: 548, domain: '军事', location: '建康', desc: '梁武帝饿死台城，南朝由盛转衰。', participants: ['xiao_yan'] },
  { id: 'e19', name: '陈朝建立', year: 557, domain: '政治', location: '建康', desc: '陈霸先代梁建陈，南朝最后一朝。', participants: ['chen_baxian'] },
];

export const jinnanbeiAtlas = {
  id: 'jinnanbei',
  name: '两晋南北朝',
  subtitle: '南北分立 · 胡汉融合（265–589年）',
  startYear: 265,
  endYear: 589,
  mapView: { center: [114, 33], zoom: 5, minZoom: 3, maxZoom: 12, labelZoom: { hideAll: 3, hideEvents: 6 }, importanceZoom: [5, 7], cityZoom: 5, baseLayer: 'terrain' },
  domains: [
    { name: '军事', color: '#b23a2e' },
    { name: '政治', color: '#2f5d8a' },
    { name: '文化', color: '#7b4b94' },
    { name: '科技', color: '#2d8a6e' },
    { name: '外交', color: '#b8893a' },
    { name: '宗教', color: '#8a6d3b' },
  ],
  factions: FACTIONS,
  places: PLACES,
  persons: PERSONS,
  relations: RELATIONS,
  events: EVENTS,
  importance: makeImportance({
    personRank: {
      sim_yan: 1, sim_rui: 1, wang_dao: 1, fu_jian: 1, wang_meng: 1, xiao_wen: 1,
      xie_an: 1, xie_xuan: 1, liu_yu: 1, xiao_yan: 1, wang_xizhi: 1, tuo_tao: 1,
      tuo_gui: 2, tao_yuan_ming: 2, zu_ti: 2, gu_kai_zhi: 2, chen_baxian: 2,
      huan_wen: 2, da_mo: 2, fan_zhen: 2,
    },
    eventRank: { e2: 1, e5: 1, e9: 1, e13: 1, e15: 1 },
    defaultEvent: 2,
  }),
  birthplaceModern: {},
  birthplaceCoords: {
    '临沂': [118.35, 35.05], '范阳': [116.05, 39.50], '谯国': [115.78, 33.85],
    '陈郡': [114.91, 33.73], '琅琊': [119.10, 35.10], '无锡': [120.30, 31.57],
    '柴桑': [115.98, 29.71], '北海': [119.10, 36.71], '盛乐': [111.64, 40.40],
    '彭城': [117.28, 34.26], '南兰陵': [119.95, 31.74], '吴兴': [120.10, 30.87],
    '天竺': [85.0, 25.0], '南乡': [112.50, 33.0],
  },
  personImages: {},
  timelineTicks: [265, 317, 383, 420, 494, 548, 589],
};
