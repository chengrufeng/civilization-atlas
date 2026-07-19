/* =========================================================================
 * 清（1616–1912年） · 中华文明
 * 由后金到大清，入关定鼎、康乾盛世，至近代内忧外患而终。
 * ========================================================================= */

import { makeImportance } from './index.js';

const FACTIONS = [
  { id: 'houjin', name: '后金', color: '#3a6ea5', founded: 1616, capital: '赫图阿拉', capitalFrom: 1616, desc: '努尔哈赤统一女真各部，建立后金，为清朝前身。' },
  { id: 'qing', name: '清', color: '#c9a227', founded: 1636, capital: '北京', capitalFrom: 1644, desc: '皇太极改国号为大清，入关后定鼎中原，历十二帝二百余年。' },
  { id: 'nanming', name: '南明', color: '#7b4b94', founded: 1644, capital: '南京', capitalFrom: 1644, desc: '明亡后宗室在南方相继称帝，与清对立，郑氏据台奉明正朔。' },
  { id: 'taiping', name: '太平天国', color: '#b23a2e', founded: 1851, capital: '南京', capitalFrom: 1853, desc: '洪秀全金田起义，建号太平天国，定都天京（南京），与清对峙。' },
  { id: 'geming', name: '革命党', color: '#2d8a6e', founded: 1905, capital: '南京', capitalFrom: 1912, desc: '孙中山领导的资产阶级革命势力，推翻帝制，建立中华民国。' },
];

const PLACES = [
  { id: 'hetuala', name: '赫图阿拉', modern: '辽宁抚顺新宾', coord: [124.79, 41.30], note: '后金建国之都' },
  { id: 'sarhu', name: '萨尔浒', modern: '辽宁抚顺', coord: [124.10, 41.88], note: '萨尔浒之战' },
  { id: 'shengjing', name: '盛京', modern: '辽宁沈阳', coord: [123.43, 41.80], note: '后金/清初都城' },
  { id: 'shanhaiguan', name: '山海关', modern: '河北秦皇岛', coord: [119.75, 40.01], note: '清军入关之关隘' },
  { id: 'beijing', name: '北京', modern: '北京', coord: [116.40, 39.90], note: '清定都之地' },
  { id: 'qinghai', name: '青海', modern: '青海西宁', coord: [101.78, 36.62], note: '罗卜藏丹津叛乱之地' },
  { id: 'tainan', name: '台南', modern: '台湾台南', coord: [120.20, 23.00], note: '郑氏据台、清收台湾' },
  { id: 'yakesa', name: '雅克萨', modern: '俄罗斯阿尔巴津', coord: [124.50, 53.38], note: '雅克萨之战' },
  { id: 'nibuchu', name: '尼布楚', modern: '俄罗斯涅尔琴斯克', coord: [116.58, 51.98], note: '中俄尼布楚条约签订地' },
  { id: 'humen', name: '虎门', modern: '广东东莞', coord: [113.66, 22.82], note: '虎门销烟' },
  { id: 'guangzhou', name: '广州', modern: '广东广州', coord: [113.26, 23.13], note: '鸦片战争前沿' },
  { id: 'jintian', name: '金田', modern: '广西桂平', coord: [110.15, 23.60], note: '太平天国金田起义' },
  { id: 'shanghai', name: '上海', modern: '上海', coord: [121.47, 31.23], note: '洋务运动重镇' },
  { id: 'weihai', name: '威海', modern: '山东威海', coord: [122.12, 37.51], note: '甲午威海卫之战' },
  { id: 'wuchang', name: '武昌', modern: '湖北武汉', coord: [114.31, 30.52], note: '武昌起义' },
  { id: 'nanjing', name: '南京', modern: '江苏南京', coord: [118.79, 32.06], note: '南明/太平天国都城、临时政府所在' },
  { id: 'lvshun', name: '旅顺', modern: '辽宁大连', coord: [121.26, 38.85], note: '北洋水师基地' },
  { id: 'jinjiang', name: '晋江', modern: '福建泉州', coord: [118.58, 24.81], note: '施琅故里' },
  { id: 'fuzhou', name: '福州', modern: '福建福州', coord: [119.30, 26.08], note: '福州船政局' },
  { id: 'changsha', name: '长沙', modern: '湖南长沙', coord: [112.94, 28.23], note: '湘军人物故里' },
  { id: 'hefei', name: '合肥', modern: '安徽合肥', coord: [117.28, 31.86], note: '李鸿章故里' },
];

const PERSONS = [
  { id: 'nurhaci', name: '努尔哈赤', courtesy: '', alias: ['清太祖'], faction: 'houjin', birth: 1559, death: 1626, birthPlace: '赫图阿拉', title: '后金大汗', roles: ['后金建立者','军事家'], avatar: '努', bio: '统一女真各部，以七大恨誓师伐明，建立后金，奠定清朝基业。', events: [ { year: 1616, place: '赫图阿拉', desc: '建立后金，称大汗' }, { year: 1619, place: '萨尔浒', desc: '萨尔浒之战大破明军' }, { year: 1625, place: '盛京', desc: '迁都沈阳（盛京）' } ] },
  { id: 'huangtaiji', name: '皇太极', courtesy: '', alias: ['清太宗'], faction: 'qing', birth: 1592, death: 1643, birthPlace: '赫图阿拉', title: '大清皇帝', roles: ['清朝奠基者'], avatar: '皇', bio: '努尔哈赤之子，改女真为满洲，改国号为大清，为入关奠定基础。', events: [ { year: 1636, place: '盛京', desc: '改国号为大清，称帝' }, { year: 1643, place: '盛京', desc: '猝逝于盛京' } ] },
  { id: 'dorgon', name: '多尔衮', courtesy: '', alias: ['睿亲王'], faction: 'qing', birth: 1612, death: 1650, birthPlace: '赫图阿拉', title: '摄政王', roles: ['摄政王','军事统帅'], avatar: '衮', bio: '皇太极之弟，辅佐顺治入关定鼎中原，一度总揽朝政。', events: [ { year: 1644, place: '山海关', desc: '引清军入关，败李自成' }, { year: 1644, place: '北京', desc: '奉顺治定都北京' }, { year: 1650, place: '北京', desc: '摄政期间病逝' } ] },
  { id: 'shunzhi', name: '顺治', courtesy: '', alias: ['清世祖','福临'], faction: 'qing', birth: 1638, death: 1661, birthPlace: '盛京', title: '大清皇帝', roles: ['清入关后首位皇帝'], avatar: '顺', bio: '清入关后的第一位皇帝，年幼即位，赖多尔衮摄政稳定中原。', events: [ { year: 1644, place: '北京', desc: '入主中原，定都北京' }, { year: 1661, place: '北京', desc: '崩于北京' } ] },
  { id: 'kangxi', name: '康熙', courtesy: '', alias: ['清圣祖','玄烨'], faction: 'qing', birth: 1654, death: 1722, birthPlace: '北京', title: '大清皇帝', roles: ['一代英主','康乾盛世开创者'], avatar: '康', bio: '在位六十一年，擒鳌拜、平三藩、收台湾、御沙俄，开创盛世。', events: [ { year: 1669, place: '北京', desc: '智擒鳌拜，亲政' }, { year: 1681, place: '广州', desc: '平定三藩之乱' }, { year: 1683, place: '台南', desc: '统一台湾' }, { year: 1685, place: '雅克萨', desc: '雅克萨之战抗击沙俄' }, { year: 1689, place: '尼布楚', desc: '签订中俄尼布楚条约' } ] },
  { id: 'yongzheng', name: '雍正', courtesy: '', alias: ['清世宗','胤禛'], faction: 'qing', birth: 1678, death: 1735, birthPlace: '北京', title: '大清皇帝', roles: ['改革之君'], avatar: '雍', bio: '推行摊丁入亩、火耗归公、设军机处，勤政治国，承前启后。', events: [ { year: 1722, place: '北京', desc: '康熙驾崩，四十五岁的胤禛即位，年号雍正' }, { year: 1723, place: '北京', desc: '厉行改革，清查亏空、整顿吏治' }, { year: 1723, place: '北京', desc: '废除贱籍，推行摊丁入亩' }, { year: 1729, place: '北京', desc: '设军机处，强化皇权' }, { year: 1729, place: '青海', desc: '派年羹尧平定罗卜藏丹津叛乱' }, { year: 1735, place: '北京', desc: '暴卒于圆明园，传位弘历' } ] },
  { id: 'qianlong', name: '乾隆', courtesy: '', alias: ['清高宗','弘历'], faction: 'qing', birth: 1711, death: 1799, birthPlace: '北京', title: '大清皇帝', roles: ['盛世之君','十全老人'], avatar: '乾', bio: '在位六十年，国力鼎盛，编《四库全书》，晚年渐生积弊。', events: [ { year: 1736, place: '北京', desc: '即位，续开盛世' }, { year: 1799, place: '北京', desc: '崩于养心殿' } ] },
  { id: 'aobai', name: '鳌拜', courtesy: '', alias: [], faction: 'qing', birth: 1610, death: 1669, birthPlace: '盛京', title: '辅政大臣', roles: ['权臣','武将'], avatar: '鳌', bio: '战功赫赫的满洲勇将，康熙初年辅政专权，终被康熙擒治。', events: [ { year: 1661, place: '北京', desc: '受命辅政，日渐专权' }, { year: 1669, place: '北京', desc: '被康熙智擒下狱' } ] },
  { id: 'shilang', name: '施琅', courtesy: '尊侯', alias: [], faction: 'qing', birth: 1621, death: 1696, birthPlace: '晋江', title: '福建水师提督', roles: ['水师名将'], avatar: '施', bio: '由郑氏部将归清，率师澎湖海战，统一台湾。', events: [ { year: 1683, place: '台南', desc: '澎湖海战后收取台湾' } ] },
  { id: 'zhengchenggong', name: '郑成功', courtesy: '明俨', alias: ['国姓爷'], faction: 'nanming', birth: 1624, death: 1662, birthPlace: '台南', title: '延平郡王', roles: ['抗清名将','收复台湾'], avatar: '郑', bio: '奉明正朔抗清，驱逐荷兰殖民者，收复台湾以为基业。', events: [ { year: 1661, place: '台南', desc: '驱逐荷兰，收复台湾' }, { year: 1662, place: '台南', desc: '病逝于台湾' } ] },
  { id: 'linzexu', name: '林则徐', courtesy: '元抚', alias: ['林文忠'], faction: 'qing', birth: 1785, death: 1850, birthPlace: '福州', title: '钦差大臣', roles: ['禁烟功臣','民族英雄'], avatar: '林', bio: '受命赴粤禁烟，虎门销烟，主张开眼看世界。', events: [ { year: 1839, place: '虎门', desc: '主持虎门销烟' }, { year: 1840, place: '广州', desc: '抵御英军，整备海防' } ] },
  { id: 'zengguofan', name: '曾国藩', courtesy: '涤生', alias: ['曾文正'], faction: 'qing', birth: 1811, death: 1872, birthPlace: '长沙', title: '两江总督', roles: ['湘军统帅','洋务先驱'], avatar: '曾', bio: '创建湘军镇压太平天国，倡导洋务，理学名臣。', events: [ { year: 1861, place: '上海', desc: '兴办洋务，创安庆军械所' }, { year: 1864, place: '南京', desc: '湘军攻克天京，平定太平天国' } ] },
  { id: 'lihongzhang', name: '李鸿章', courtesy: '渐甫', alias: ['李文忠'], faction: 'qing', birth: 1823, death: 1901, birthPlace: '合肥', title: '直隶总督·北洋大臣', roles: ['洋务领袖','外交重臣'], avatar: '李', bio: '创建淮军与北洋水师，主持洋务与外交，历经甲午之败。', events: [ { year: 1888, place: '旅顺', desc: '经营北洋水师基地' }, { year: 1894, place: '威海', desc: '甲午战争北洋水师覆灭' }, { year: 1895, place: '北京', desc: '奉命议和' } ] },
  { id: 'zuozongtang', name: '左宗棠', courtesy: '季高', alias: ['左文襄'], faction: 'qing', birth: 1812, death: 1885, birthPlace: '长沙', title: '陕甘总督', roles: ['湘军名将','洋务实干家'], avatar: '左', bio: '平定西北、收复新疆，创办福州船政局，洋务实干代表。', events: [ { year: 1861, place: '上海', desc: '参办洋务，编练楚军' }, { year: 1866, place: '福州', desc: '创办福州船政局' } ] },
  { id: 'cixi', name: '慈禧太后', courtesy: '', alias: ['西太后','那拉氏'], faction: 'qing', birth: 1835, death: 1908, birthPlace: '北京', title: '皇太后', roles: ['实际统治者'], avatar: '慈', bio: '两度垂帘听政，实际掌控清末政局近半世纪。', events: [ { year: 1861, place: '北京', desc: '辛酉政变，垂帘听政' }, { year: 1898, place: '北京', desc: '训政，囚禁光绪' }, { year: 1908, place: '北京', desc: '崩于仪鸾殿' } ] },
  { id: 'kangyouwei', name: '康有为', courtesy: '广厦', alias: ['南海先生'], faction: 'qing', birth: 1858, death: 1927, birthPlace: '广州', title: '维新领袖', roles: ['维新变法领袖'], avatar: '康', bio: '倡导变法维新，公车上书，推动戊戌变法。', events: [ { year: 1895, place: '北京', desc: '发起公车上书' }, { year: 1898, place: '北京', desc: '主导戊戌变法' } ] },
  { id: 'liangqichao', name: '梁启超', courtesy: '卓如', alias: ['任公'], faction: 'qing', birth: 1873, death: 1929, birthPlace: '广州', title: '维新志士', roles: ['思想家','维新派'], avatar: '梁', bio: '康有为弟子，维新变法骨干，近代著名思想家、报人。', events: [ { year: 1898, place: '北京', desc: '参与戊戌变法，办报鼓吹维新' } ] },
  { id: 'guangxu', name: '光绪帝', courtesy: '', alias: ['载湉','清德宗'], faction: 'qing', birth: 1871, death: 1908, birthPlace: '北京', title: '大清皇帝', roles: ['维新之君'], avatar: '光', bio: '支持维新变法图强，变法失败后被慈禧幽禁至死。', events: [ { year: 1898, place: '北京', desc: '颁诏推行新政' }, { year: 1908, place: '北京', desc: '崩于瀛台' } ] },
  { id: 'sunyatsen', name: '孙中山', courtesy: '逸仙', alias: ['中山先生'], faction: 'geming', birth: 1866, death: 1925, birthPlace: '广州', title: '临时大总统', roles: ['革命先行者'], avatar: '孙', bio: '倡导三民主义，创立同盟会，领导辛亥革命推翻帝制。', events: [ { year: 1905, place: '广州', desc: '奔走革命，鼓吹共和' }, { year: 1911, place: '武昌', desc: '辛亥革命爆发' }, { year: 1912, place: '南京', desc: '就任中华民国临时大总统' } ] },
  { id: 'yuanshikai', name: '袁世凯', courtesy: '慰亭', alias: [], faction: 'qing', birth: 1859, death: 1916, birthPlace: '北京', title: '内阁总理大臣', roles: ['北洋首领'], avatar: '袁', bio: '编练北洋新军，清末掌握实权，逼清帝退位后攫取民国大权。', events: [ { year: 1901, place: '北京', desc: '接掌北洋，练新军' }, { year: 1912, place: '北京', desc: '逼清帝退位' } ] },
  { id: 'puyi', name: '溥仪', courtesy: '', alias: ['宣统帝'], faction: 'qing', birth: 1906, death: 1967, birthPlace: '北京', title: '大清末代皇帝', roles: ['清朝末代皇帝'], avatar: '溥', bio: '三岁登基的清朝末代皇帝，辛亥后退位，清亡。', events: [ { year: 1908, place: '北京', desc: '即位，年号宣统' }, { year: 1912, place: '北京', desc: '颁退位诏书，清亡' } ] },
  { id: 'hongxiuquan', name: '洪秀全', courtesy: '', alias: ['天王'], faction: 'taiping', birth: 1814, death: 1864, birthPlace: '广州', title: '太平天王', roles: ['太平天国领袖'], avatar: '洪', bio: '创拜上帝会，金田起义建太平天国，定都天京与清对峙。', events: [ { year: 1851, place: '金田', desc: '金田起义，建号太平天国' }, { year: 1853, place: '南京', desc: '定都天京（南京）' }, { year: 1864, place: '南京', desc: '天京陷落前病逝' } ] },
];

const RELATIONS = [
  { source: 'nurhaci', target: 'huangtaiji', type: '亲属', label: '父子·传位', year: 1626 },
  { source: 'huangtaiji', target: 'dorgon', type: '亲属', label: '兄弟', year: 1636 },
  { source: 'dorgon', target: 'shunzhi', type: '君臣', label: '摄政辅幼主', year: 1644 },
  { source: 'kangxi', target: 'aobai', type: '敌对', label: '智擒权臣', year: 1669 },
  { source: 'kangxi', target: 'shilang', type: '君臣', label: '命其收台', year: 1683 },
  { source: 'shilang', target: 'zhengchenggong', type: '敌对', label: '攻取郑氏台湾', year: 1683 },
  { source: 'yongzheng', target: 'kangxi', type: '亲属', label: '父子', year: 1722 },
  { source: 'qianlong', target: 'yongzheng', type: '亲属', label: '父子', year: 1735 },
  { source: 'hongxiuquan', target: 'zengguofan', type: '敌对', label: '太平军与湘军', year: 1864 },
  { source: 'cixi', target: 'lihongzhang', type: '君臣', label: '倚重北洋', year: 1894 },
  { source: 'cixi', target: 'guangxu', type: '亲属', label: '训政·幽禁', year: 1898 },
  { source: 'guangxu', target: 'kangyouwei', type: '君臣', label: '倚为变法', year: 1898 },
  { source: 'kangyouwei', target: 'liangqichao', type: '师生', label: '师徒', year: 1898 },
  { source: 'sunyatsen', target: 'yuanshikai', type: '敌对', label: '南北相争·让位', year: 1912 },
  { source: 'yuanshikai', target: 'puyi', type: '敌对', label: '逼宫退位', year: 1912 },
];

const EVENTS = [
  { id: 'e1', name: '后金建立', year: 1616, domain: '政治', location: '赫图阿拉', desc: '努尔哈赤统一女真，建立后金，称大汗。', participants: ['nurhaci'] },
  { id: 'e2', name: '萨尔浒之战', year: 1619, domain: '军事', location: '萨尔浒', desc: '后金以少胜多，大破明军四路，攻守之势逆转。', participants: ['nurhaci'] },
  { id: 'e3', name: '皇太极改国号清', year: 1636, domain: '政治', location: '盛京', desc: '皇太极改女真为满洲，改国号为大清，称帝。', participants: ['huangtaiji'] },
  { id: 'e4', name: '清军入关', year: 1644, domain: '军事', location: '山海关', desc: '吴三桂引清军入关，多尔衮败李自成于一片石。', participants: ['dorgon', 'shunzhi'] },
  { id: 'e5', name: '定都北京', year: 1644, domain: '政治', location: '北京', desc: '顺治帝入主中原，迁都北京，清一统渐成。', participants: ['shunzhi', 'dorgon'] },
  { id: 'e6', name: '郑成功收复台湾', year: 1661, domain: '军事', location: '台南', desc: '郑成功驱逐荷兰殖民者，收复台湾。', participants: ['zhengchenggong'] },
  { id: 'e7', name: '康熙擒鳌拜', year: 1669, domain: '政治', location: '北京', desc: '少年康熙智擒权臣鳌拜，亲掌大权。', participants: ['kangxi', 'aobai'] },
  { id: 'e8', name: '平定三藩', year: 1681, domain: '军事', location: '广州', desc: '康熙平定吴三桂等三藩之乱，巩固一统。', participants: ['kangxi'] },
  { id: 'e9', name: '清收复台湾', year: 1683, domain: '军事', location: '台南', desc: '施琅澎湖海战大胜，郑克塽降，台湾归清。', participants: ['shilang', 'kangxi'] },
  { id: 'e10', name: '雅克萨之战', year: 1685, domain: '军事', location: '雅克萨', desc: '清军反击沙俄入侵，收复雅克萨。', participants: ['kangxi'] },
  { id: 'e11', name: '尼布楚条约', year: 1689, domain: '外交', location: '尼布楚', desc: '中俄签订尼布楚条约，划定东段边界。', participants: ['kangxi'] },
  { id: 'e12', name: '康乾盛世', year: 1736, domain: '文化', location: '北京', desc: '康雍乾三朝百余年，国力鼎盛、文治昌明。', participants: ['kangxi', 'yongzheng', 'qianlong'] },
  { id: 'e13', name: '虎门销烟', year: 1839, domain: '外交', location: '虎门', desc: '林则徐虎门销烟，抵制鸦片贸易。', participants: ['linzexu'] },
  { id: 'e14', name: '鸦片战争', year: 1840, domain: '军事', location: '广州', desc: '英国发动鸦片战争，清战败签《南京条约》。', participants: ['linzexu'] },
  { id: 'e15', name: '太平天国起义', year: 1851, domain: '军事', location: '金田', desc: '洪秀全金田起义，建号太平天国。', participants: ['hongxiuquan'] },
  { id: 'e16', name: '洋务运动', year: 1861, domain: '科技', location: '上海', desc: '曾国藩、李鸿章、左宗棠等兴办近代军工与实业。', participants: ['zengguofan', 'lihongzhang', 'zuozongtang'] },
  { id: 'e17', name: '甲午战争', year: 1894, domain: '军事', location: '威海', desc: '中日甲午战争，北洋水师覆灭，签《马关条约》。', participants: ['lihongzhang'] },
  { id: 'e18', name: '戊戌变法', year: 1898, domain: '政治', location: '北京', desc: '康有为、梁启超辅光绪推行新政，百日而败。', participants: ['kangyouwei', 'liangqichao', 'guangxu'] },
  { id: 'e19', name: '辛亥革命', year: 1911, domain: '政治', location: '武昌', desc: '武昌起义爆发，各省响应，帝制动摇。', participants: ['sunyatsen'] },
  { id: 'e20', name: '清帝退位', year: 1912, domain: '政治', location: '北京', desc: '宣统帝溥仪退位，袁世凯攫权，清朝灭亡。', participants: ['puyi', 'yuanshikai'] },
];

export const qingAtlas = {
  id: 'qing',
  name: '清',
  subtitle: '由后金到大清 · 盛世与危局（1616–1912年）',
  startYear: 1616,
  endYear: 1912,
  mapView: {
    center: [116, 40], zoom: 4, minZoom: 3, maxZoom: 12,
    labelZoom: { hideAll: 3, hideEvents: 6 },
    importanceZoom: [4, 6],
    cityZoom: 5,
    baseLayer: 'satellite',
  },
  domains: [
    { name: '军事', color: '#b23a2e' },
    { name: '政治', color: '#2f5d8a' },
    { name: '文化', color: '#7b4b94' },
    { name: '科技', color: '#2d8a6e' },
    { name: '外交', color: '#c9862a' },
  ],
  factions: FACTIONS,
  places: PLACES,
  persons: PERSONS,
  relations: RELATIONS,
  events: EVENTS,
  importance: makeImportance({
    personRank: {
      nurhaci: 1, huangtaiji: 1, dorgon: 1, kangxi: 1, qianlong: 1, cixi: 1, linzexu: 1, lihongzhang: 1, sunyatsen: 1,
      shunzhi: 2, yongzheng: 2, aobai: 2, shilang: 2, zhengchenggong: 2, zengguofan: 2, zuozongtang: 2,
      kangyouwei: 2, liangqichao: 2, guangxu: 2, yuanshikai: 2, puyi: 2, hongxiuquan: 2,
    },
    eventRank: { e1: 1, e4: 1, e14: 1, e19: 1, e20: 1 },
    defaultEvent: 2,
  }),
  birthplaceModern: {},
  birthplaceCoords: {},
  personImages: {},
  timelineTicks: [1616, 1644, 1683, 1736, 1840, 1894, 1911],
};
