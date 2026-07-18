/* 元（含蒙古崛起，1206–1368年）· 中华文明 */

import { makeImportance } from './index.js';

const FACTIONS = [
  { id: 'menggu', name: '蒙古', color: '#2f5d8a', founded: 1206, capital: '和林', capitalFrom: 1206, desc: '成吉思汗所建蒙古国。' },
  { id: 'yuan', name: '元', color: '#b23a2e', founded: 1271, capital: '大都', capitalFrom: 1271, desc: '忽必烈所建大一统王朝。' },
  { id: 'nansong', name: '南宋', color: '#2d8a6e', founded: 1127, capital: '临安', capitalFrom: 1138, desc: '宋朝南渡政权，至1279亡于崖山。' },
  { id: 'hongjin', name: '红巾军', color: '#7b4b94', founded: 1351, capital: '汴梁', capitalFrom: 1358, desc: '元末农民起义主力。' },
];

const PLACES = [
  { id: 'daidu', name: '大都', modern: '北京', coord: [116.40, 39.90], note: '元都' },
  { id: 'shangdu', name: '上都', modern: '内蒙古正蓝旗', coord: [116.18, 42.36], note: '元夏都' },
  { id: 'helin', name: '和林', modern: '蒙古国哈尔和林', coord: [102.83, 47.20], note: '蒙古国早期都城' },
  { id: 'linan', name: '临安', modern: '浙江杭州', coord: [120.15, 30.28], note: '南宋都' },
  { id: 'yashan', name: '崖山', modern: '广东新会', coord: [112.78, 22.20], note: '崖山海战' },
  { id: 'ezhou', name: '鄂州', modern: '湖北武汉', coord: [114.30, 30.55], note: '长江重镇' },
  { id: 'kaifeng', name: '汴梁', modern: '河南开封', coord: [114.31, 34.80], note: '红巾军都' },
  { id: 'zhongdu', name: '中都', modern: '北京', coord: [116.33, 39.88], note: '金中都' },
  { id: 'samarkand', name: '撒马尔罕', modern: '乌兹别克撒马尔罕', coord: [66.98, 39.66], note: '西征重镇' },
  { id: 'balkh', name: '巴里黑', modern: '阿富汗巴尔赫', coord: [66.90, 36.75], note: '西域要地' },
  { id: 'liupan', name: '六盘山', modern: '宁夏固原', coord: [106.30, 35.60], note: '成吉思汗逝处' },
  { id: 'dingjun', name: '钓鱼城', modern: '重庆合川', coord: [106.32, 29.97], note: '蒙哥战死处' },
  { id: 'jiangzhou', name: '赣州', modern: '江西赣州', coord: [114.93, 25.83], note: '南方重镇' },
  { id: 'shu', name: '蜀', modern: '四川', coord: [104.07, 30.67], note: '四川地区' },
  { id: 'bozhou', name: '亳州', modern: '安徽亳州', coord: [115.78, 33.85], note: '红巾军起' },
  { id: 'songjiang_y', name: '松江', modern: '上海松江', coord: [121.23, 31.03], note: '黄道婆归乡' },
  { id: 'poyang', name: '鄱阳', modern: '江西鄱阳', coord: [116.66, 29.00], note: '鄱阳湖大战' },
];

const PERSONS = [
  { id: 'tie_mu_zhen', name: '成吉思汗', courtesy: '', alias: ['铁木真'], faction: 'menggu', birth: 1162, death: 1227, birthPlace: '漠北', title: '大汗', roles: ['蒙古帝国建立者'], avatar: '汗', bio: '统一蒙古各部，建立大蒙古国，发动西征。', events: [ { year: 1206, place: '和林', desc: '统一蒙古，称成吉思汗' }, { year: 1219, place: '撒马尔罕', desc: '发动第一次西征' }, { year: 1227, place: '六盘山', desc: '征西夏途中病逝' } ] },
  { id: 'mu_hua_li', name: '木华黎', courtesy: '', alias: [], faction: 'menggu', birth: 1170, death: 1223, birthPlace: '漠北', title: '太师国王', roles: ['名将'], avatar: '木', bio: '四杰之一，经略中原，专征金朝。', events: [ { year: 1217, place: '中都', desc: '封太师国王，经略中原' } ] },
  { id: 'tuo_lei', name: '拖雷', courtesy: '', alias: ['睿宗'], faction: 'menggu', birth: 1193, death: 1232, birthPlace: '漠北', title: '监国', roles: ['皇子'], avatar: '雷', bio: '成吉思汗幼子，灭金主力。', events: [ { year: 1232, place: '汴梁', desc: '三峰山之战大破金军' } ] },
  { id: 'wo_kuo_tai', name: '窝阔台', courtesy: '', alias: ['元太宗'], faction: 'menggu', birth: 1186, death: 1241, birthPlace: '漠北', title: '大汗', roles: ['蒙古第二代大汗'], avatar: '阔', bio: '灭金、二次西征、远征欧洲。', events: [ { year: 1234, place: '汴梁', desc: '联宋灭金' } ] },
  { id: 'gui_you', name: '贵由', courtesy: '', alias: ['元定宗'], faction: 'menggu', birth: 1206, death: 1248, birthPlace: '漠北', title: '大汗', roles: ['第三代大汗'], avatar: '由', bio: '短命之君，西征欧洲后即位两年即逝。', events: [ { year: 1246, place: '和林', desc: '即大汗位' } ] },
  { id: 'meng_ge', name: '蒙哥', courtesy: '', alias: ['元宪宗'], faction: 'menggu', birth: 1209, death: 1259, birthPlace: '漠北', title: '大汗', roles: ['第四代大汗'], avatar: '哥', bio: '三路攻宋，钓鱼城战死，引发汗位之争。', events: [ { year: 1258, place: '蜀', desc: '三路攻宋' }, { year: 1259, place: '钓鱼城', desc: '战死钓鱼城下' } ] },
  { id: 'hu_bilie', name: '忽必烈', courtesy: '', alias: ['元世祖'], faction: 'yuan', birth: 1215, death: 1294, birthPlace: '漠北', title: '元世祖', roles: ['元朝建立者'], avatar: '必', bio: '建元称帝，灭南宋完成统一。', events: [ { year: 1260, place: '上都', desc: '即大汗位' }, { year: 1271, place: '大都', desc: '改国号大元' }, { year: 1279, place: '崖山', desc: '崖山灭宋' } ] },
  { id: 'bo_yan', name: '伯颜', courtesy: '', alias: [], faction: 'yuan', birth: 1236, death: 1295, birthPlace: '漠北', title: '丞相', roles: ['名将'], avatar: '伯', bio: '统军南下灭宋，主持军国大事。', events: [ { year: 1276, place: '临安', desc: '入临安，受宋降' } ] },
  { id: 'wen_tian_xiang', name: '文天祥', courtesy: '宋瑞', alias: ['文山'], faction: 'nansong', birth: 1236, death: 1283, birthPlace: '庐陵', title: '丞相', roles: ['民族英雄','诗人'], avatar: '文', bio: '起兵抗元，被俘不屈，正气歌传世。', events: [ { year: 1278, place: '赣州', desc: '兵败被俘' }, { year: 1283, place: '大都', desc: '就义' } ] },
  { id: 'ye_lu_chu_cai', name: '耶律楚材', courtesy: '晋卿', alias: [], faction: 'menggu', birth: 1190, death: 1244, birthPlace: '中都', title: '中书令', roles: ['政治家'], avatar: '耶', bio: '契丹人，辅佐成吉思汗窝阔台，立法定制。', events: [ { year: 1229, place: '和林', desc: '建议立法定制' } ] },
  { id: 'guo_shou_jing', name: '郭守敬', courtesy: '若思', alias: [], faction: 'yuan', birth: 1231, death: 1316, birthPlace: '邢台', title: '太史令', roles: ['天文学家','水利家'], avatar: '郭', bio: '编授时历、修通惠河，主持天文观测。', events: [ { year: 1280, place: '大都', desc: '授时历颁行' } ] },
  { id: 'guan_han_qing', name: '关汉卿', courtesy: '', alias: [], faction: 'yuan', birth: 1234, death: 1300, birthPlace: '大都', title: '戏曲家', roles: ['元曲四大家之首'], avatar: '关', bio: '作《窦娥冤》等，元杂剧奠基人。', events: [ { year: 1290, place: '大都', desc: '创作杂剧' } ] },
  { id: 'ma_ke', name: '马可波罗', courtesy: '', alias: ['Marco Polo'], faction: 'yuan', birth: 1254, death: 1324, birthPlace: '威尼斯', title: '元朝客臣', roles: ['旅行家'], avatar: '可', bio: '元朝仕宦十七年，口述马可波罗游记。', events: [ { year: 1275, place: '大都', desc: '抵达大都觐见忽必烈' } ] },
  { id: 'huang_dao_po', name: '黄道婆', courtesy: '', alias: [], faction: 'yuan', birth: 1245, death: 1330, birthPlace: '松江', title: '织妇', roles: ['纺织技术革新者'], avatar: '黄', bio: '自崖州学得纺织术归乡，革新棉纺。', events: [ { year: 1295, place: '松江', desc: '回乡革新棉纺技术' } ] },
  { id: 'tuo_tuo', name: '脱脱', courtesy: '大用', alias: [], faction: 'yuan', birth: 1314, death: 1356, birthPlace: '大都', title: '丞相', roles: ['政治家'], avatar: '脱', bio: '主修三史、变钞改治，最终被害。', events: [ { year: 1340, place: '大都', desc: '任丞相主政' }, { year: 1351, place: '汴梁', desc: '统兵镇压红巾军' } ] },
  { id: 'zhu_yuan_zhang', name: '朱元璋', courtesy: '国瑞', alias: ['明太祖'], faction: 'hongjin', birth: 1328, death: 1398, birthPlace: '濠州', title: '吴国公', roles: ['红巾军领袖→明太祖'], avatar: '朱', bio: '出身贫农，加入红巾军，最终建立明朝。', events: [ { year: 1352, place: '亳州', desc: '投奔红巾军郭子兴' }, { year: 1368, place: '大都', desc: '攻克大都，元亡' } ] },
  { id: 'han_lin_er', name: '韩林儿', courtesy: '', alias: ['小明王'], faction: 'hongjin', birth: 1340, death: 1366, birthPlace: '栾城', title: '宋帝', roles: ['红巾军名义领袖'], avatar: '韩', bio: '父韩山童死后被立为小明王，后溺亡。', events: [ { year: 1355, place: '亳州', desc: '建宋政权' } ] },
  { id: 'chen_you_liang', name: '陈友谅', courtesy: '', alias: [], faction: 'hongjin', birth: 1320, death: 1363, birthPlace: '沔阳', title: '汉帝', roles: ['元末群雄'], avatar: '陈', bio: '建大汉政权，与朱元璋争天下。', events: [ { year: 1363, place: '鄱阳', desc: '鄱阳湖大战战死' } ] },
];

const RELATIONS = [
  { source: 'tie_mu_zhen', target: 'mu_hua_li', type: '君臣', label: '四杰之首', year: 1206 },
  { source: 'tie_mu_zhen', target: 'tuo_lei', type: '亲属', label: '父子', year: 1227 },
  { source: 'wo_kuo_tai', target: 'tuo_lei', type: '亲属', label: '兄弟', year: 1232 },
  { source: 'meng_ge', target: 'hu_bilie', type: '亲属', label: '兄弟', year: 1259 },
  { source: 'hu_bilie', target: 'bo_yan', type: '君臣', label: '委以灭宋', year: 1274 },
  { source: 'hu_bilie', target: 'wen_tian_xiang', type: '敌对', label: '劝降不成', year: 1283 },
  { source: 'ye_lu_chu_cai', target: 'wo_kuo_tai', type: '君臣', label: '立法定制', year: 1229 },
  { source: 'tuo_tuo', target: 'zhu_yuan_zhang', type: '敌对', label: '剿红巾军', year: 1351 },
  { source: 'zhu_yuan_zhang', target: 'chen_you_liang', type: '敌对', label: '鄱阳湖决战', year: 1363 },
  { source: 'zhu_yuan_zhang', target: 'han_lin_er', type: '同阵营', label: '名义君臣', year: 1355 },
];

const EVENTS = [
  { id: 'e1', name: '蒙古建国', year: 1206, domain: '政治', location: '和林', desc: '斡难河源大会，铁木真称成吉思汗。', participants: ['tie_mu_zhen', 'mu_hua_li'] },
  { id: 'e2', name: '成吉思汗西征', year: 1219, domain: '军事', location: '撒马尔罕', desc: '花剌子模杀使，蒙古大举西征。', participants: ['tie_mu_zhen', 'ye_lu_chu_cai'] },
  { id: 'e3', name: '蒙古灭金', year: 1234, domain: '军事', location: '汴梁', desc: '联宋灭金，金亡。', participants: ['wo_kuo_tai', 'tuo_lei'] },
  { id: 'e4', name: '第二次西征', year: 1236, domain: '军事', location: '巴里黑', desc: '拔都率军远征欧洲。', participants: ['wo_kuo_tai'] },
  { id: 'e5', name: '蒙哥攻宋', year: 1258, domain: '军事', location: '蜀', desc: '三路大举攻宋。', participants: ['meng_ge', 'hu_bilie'] },
  { id: 'e6', name: '钓鱼城之战', year: 1259, domain: '军事', location: '钓鱼城', desc: '蒙哥战死，改变世界格局。', participants: ['meng_ge'] },
  { id: 'e7', name: '忽必烈称汗', year: 1260, domain: '政治', location: '上都', desc: '忽必烈在上都即位，引发汗位之争。', participants: ['hu_bilie'] },
  { id: 'e8', name: '建立大元', year: 1271, domain: '政治', location: '大都', desc: '取《易经》"大哉乾元"，改国号元。', participants: ['hu_bilie'] },
  { id: 'e9', name: '伯颜南下', year: 1274, domain: '军事', location: '鄂州', desc: '伯颜统军大举伐宋。', participants: ['hu_bilie', 'bo_yan'] },
  { id: 'e10', name: '临安献城', year: 1276, domain: '政治', location: '临安', desc: '伯颜入临安，宋帝北迁。', participants: ['bo_yan', 'wen_tian_xiang'] },
  { id: 'e11', name: '崖山海战', year: 1279, domain: '军事', location: '崖山', desc: '十万军民殉国，南宋亡。', participants: ['hu_bilie', 'bo_yan', 'wen_tian_xiang'] },
  { id: 'e12', name: '文天祥就义', year: 1283, domain: '文化', location: '大都', desc: '被俘四载不屈，从容就义。', participants: ['wen_tian_xiang', 'hu_bilie'] },
  { id: 'e13', name: '马可波罗东游', year: 1275, domain: '外交', location: '大都', desc: '抵达大都，仕元十七年。', participants: ['ma_ke', 'hu_bilie'] },
  { id: 'e14', name: '授时历颁行', year: 1280, domain: '科技', location: '大都', desc: '郭守敬编订，精度领先三百年。', participants: ['guo_shou_jing', 'hu_bilie'] },
  { id: 'e15', name: '关汉卿作杂剧', year: 1290, domain: '文化', location: '大都', desc: '元杂剧达到鼎盛。', participants: ['guan_han_qing'] },
  { id: 'e16', name: '黄道婆革新棉纺', year: 1295, domain: '科技', location: '临安', desc: '自崖州归乡，传播棉纺技术。', participants: ['huang_dao_po'] },
  { id: 'e17', name: '脱脱更化', year: 1340, domain: '政治', location: '大都', desc: '脱脱主政，修三史、变更钞法。', participants: ['tuo_tuo'] },
  { id: 'e18', name: '红巾军起义', year: 1351, domain: '军事', location: '亳州', desc: '刘福通韩山童起兵，元朝崩溃开始。', participants: ['tuo_tuo', 'han_lin_er', 'zhu_yuan_zhang'] },
  { id: 'e19', name: '鄱阳湖大战', year: 1363, domain: '军事', location: '赣州', desc: '朱元璋击败陈友谅，奠定天下。', participants: ['zhu_yuan_zhang', 'chen_you_liang'] },
  { id: 'e20', name: '明军入大都', year: 1368, domain: '政治', location: '大都', desc: '徐达北伐克大都，元朝北退。', participants: ['zhu_yuan_zhang'] },
];

export const yuanAtlas = {
  id: 'yuan',
  name: '元',
  subtitle: '草原帝国 · 大一统（1206–1368年）',
  startYear: 1206,
  endYear: 1368,
  mapView: { center: [116, 40], zoom: 4, minZoom: 2, maxZoom: 12, labelZoom: { hideAll: 3, hideEvents: 6 }, importanceZoom: [4, 6], cityZoom: 5, baseLayer: 'satellite' },
  domains: [
    { name: '军事', color: '#b23a2e' },
    { name: '政治', color: '#2f5d8a' },
    { name: '文化', color: '#7b4b94' },
    { name: '科技', color: '#2d8a6e' },
    { name: '外交', color: '#b8893a' },
  ],
  factions: FACTIONS,
  places: PLACES,
  persons: PERSONS,
  relations: RELATIONS,
  events: EVENTS,
  importance: makeImportance({
    personRank: {
      tie_mu_zhen: 1, hu_bilie: 1, wen_tian_xiang: 1, guo_shou_jing: 1, zhu_yuan_zhang: 1,
      meng_ge: 1, tuo_lei: 1, wo_kuo_tai: 1, bo_yan: 1, ye_lu_chu_cai: 1, mu_hua_li: 1,
      guan_han_qing: 2, ma_ke: 2, tuo_tuo: 2, huang_dao_po: 2, chen_you_liang: 2,
      han_lin_er: 2, gui_you: 2,
    },
    eventRank: { e1: 1, e3: 1, e6: 1, e8: 1, e11: 1, e18: 1, e20: 1 },
    defaultEvent: 2,
  }),
  birthplaceModern: {},
  birthplaceCoords: {
    '漠北': [106.0, 47.0], '庐陵': [114.95, 27.10], '邢台': [114.50, 37.07],
    '威尼斯': [12.34, 45.44], '松江': [121.23, 31.03], '濠州': [117.56, 32.86],
    '栾城': [114.65, 37.90], '沔阳': [113.45, 30.40], '鄱阳': [116.66, 29.00], '赣': [114.93, 25.83],
  },
  personImages: {},
  timelineTicks: [1206, 1227, 1260, 1271, 1279, 1351, 1368],
};
