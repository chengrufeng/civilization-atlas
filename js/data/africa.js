/* 撒哈拉以南非洲（300–1900年）· 世界文明 */

import { makeImportance } from './index.js';

const FACTIONS = [
  { id: 'kush', name: '库施', color: '#b8893a', founded: -1070, capital: '麦罗埃', capitalFrom: -590, desc: '努比亚文明' },
  { id: 'axum', name: '阿克苏姆', color: '#2d8a6e', founded: 100, capital: '阿克苏姆', capitalFrom: 100, desc: '红海贸易强国' },
  { id: 'mali', name: '马里', color: '#b23a2e', founded: 1235, capital: '尼亚尼', capitalFrom: 1235, desc: '西非黄金帝国' },
  { id: 'songhai', name: '桑海', color: '#2f5d8a', founded: 1464, capital: '加奥', capitalFrom: 1464, desc: '西非最后大帝国' },
  { id: 'ethiopia', name: '埃塞俄比亚', color: '#7b4b94', founded: 1137, capital: '拉利贝拉', capitalFrom: 1185, desc: '非洲基督教孤岛' },
  { id: 'zimbabwe', name: '大津巴布韦', color: '#5a6d8a', founded: 1100, capital: '大津巴布韦', capitalFrom: 1100, desc: '南非贸易王国' },
];

const PLACES = [
  { id: 'meroe', name: '麦罗埃', modern: '苏丹麦罗埃', coord: [33.37, 17.04], note: '库施后期都' },
  { id: 'axum_a', name: '阿克苏姆', modern: '埃塞俄比亚阿克苏姆', coord: [38.71, 14.13], note: '阿克苏姆都' },
  { id: 'niani', name: '尼亚尼', modern: '几内亚尼亚尼', coord: [-12.65, 12.05], note: '马里都' },
  { id: 'timbuktu', name: '廷巴克图', modern: '马里廷巴克图', coord: [2.99, 16.77], note: '学术中心' },
  { id: 'gao', name: '加奥', modern: '马里加奥', coord: [0.04, 16.27], note: '桑海都' },
  { id: 'lalibela', name: '拉利贝拉', modern: '埃塞俄比亚拉利贝拉', coord: [39.05, 12.03], note: '岩石教堂' },
  { id: 'great_zimbabwe', name: '大津巴布韦', modern: '津巴布韦大津巴布韦', coord: [30.93, -20.27], note: '南非石城' },
  { id: 'adwa', name: '阿杜瓦', modern: '埃塞俄比亚阿杜瓦', coord: [38.90, 14.16], note: '1896 决战' },
  { id: 'walata', name: '瓦拉塔', modern: '毛里塔尼亚瓦拉塔', coord: [-6.95, 18.45], note: '撒哈拉商路' },
];

const PERSONS = [
  { id: 'ezana', name: '埃扎纳王', courtesy: '', alias: ['Ezana of Axum'], faction: 'axum', birth: 300, death: 360, birthPlace: '阿克苏姆', title: '阿克苏姆王', roles: ['基督教化'], avatar: '埃', bio: '将基督教定为国教，铸币改革。', events: [ { year: 330, place: '阿克苏姆', desc: '定基督教为国教' } ] },
  { id: 'kaleb', name: '卡莱布王', courtesy: '', alias: ['Kaleb of Axum'], faction: 'axum', birth: 470, death: 540, birthPlace: '阿克苏姆', title: '阿克苏姆王', roles: ['干涉也门'], avatar: '卡', bio: '跨红海远征也门保护基督徒。', events: [ { year: 525, place: '阿克苏姆', desc: '远征也门' } ] },
  { id: 'sundiata', name: '松迪亚塔', courtesy: '', alias: ['Sundiata Keita','马里之狮'], faction: 'mali', birth: 1217, death: 1255, birthPlace: '尼亚尼', title: '马里帝国建立者', roles: ['开国者'], avatar: '松', bio: '1235 年击败苏苏，建马里帝国。', events: [ { year: 1235, place: '尼亚尼', desc: '基里纳战役，建马里帝国' } ] },
  { id: 'mansa_musa', name: '曼萨·穆萨', courtesy: '', alias: ['Mansa Musa'], faction: 'mali', birth: 1280, death: 1337, birthPlace: '尼亚尼', title: '马里皇帝', roles: ['最富有的人'], avatar: '穆', bio: '1324 麦加朝觐沿途散金，致埃及通胀。', events: [ { year: 1324, place: '廷巴克图', desc: '麦加朝觐，沿途散金' }, { year: 1325, place: '廷巴克图', desc: '归来途中营建廷巴克图' } ] },
  { id: 'ibn_battuta', name: '伊本·白图泰', courtesy: '', alias: ['Ibn Battuta'], faction: 'mali', birth: 1304, death: 1369, birthPlace: '丹吉尔', title: '旅行家', roles: ['中世纪最大旅行家'], avatar: '伊', bio: '足迹遍及 44 万公里，到访马里、东非、印度。', events: [ { year: 1352, place: '廷巴克图', desc: '游历马里帝国' } ] },
  { id: 'askia', name: '阿斯基亚大帝', courtesy: '', alias: ['Askia the Great','穆罕默德·图雷'], faction: 'songhai', birth: 1443, death: 1538, birthPlace: '加奥', title: '桑海皇帝', roles: ['桑海极盛'], avatar: '阿', bio: '桑海帝国极盛，复兴廷巴克图学术。', events: [ { year: 1493, place: '加奥', desc: '夺位，建阿斯基亚王朝' } ] },
  { id: 'lara_jacob', name: '扎拉·雅各布', courtesy: '', alias: ['Zara Yaqob'], faction: 'ethiopia', birth: 1399, death: 1468, birthPlace: '拉利贝拉', title: '埃塞俄比亚皇帝', roles: ['集权改革'], avatar: '扎', bio: '强人皇帝，集权改革，镇压异端。', events: [ { year: 1449, place: '拉利贝拉', desc: '宗教会议集权' } ] },
  { id: 'lara_kaleb', name: '拉利贝拉王', courtesy: '', alias: ['Lalibela','Gebre Mesqel'], faction: 'ethiopia', birth: 1150, death: 1225, birthPlace: '拉利贝拉', title: '埃塞俄比亚王', roles: ['岩石教堂建造者'], avatar: '拉', bio: '营建 11 座岩石教堂，新耶路撒冷。', events: [ { year: 1200, place: '拉利贝拉', desc: '营建岩石教堂群' } ] },
  { id: 'tewodros', name: '特沃德罗斯二世', courtesy: '', alias: [], faction: 'ethiopia', birth: 1818, death: 1868, birthPlace: '阿杜瓦', title: '埃塞俄比亚皇帝', roles: ['近代统一者'], avatar: '特', bio: '终结王子时代，统一埃塞俄比亚，被英军围困自杀。', events: [ { year: 1855, place: '阿杜瓦', desc: '加冕称帝，统一埃塞' } ] },
  { id: 'menelik', name: '孟尼利克二世', courtesy: '', alias: [], faction: 'ethiopia', birth: 1844, death: 1913, birthPlace: '阿杜瓦', title: '埃塞俄比亚皇帝', roles: ['击败意大利'], avatar: '孟', bio: '1896 阿杜瓦战役击败意大利，保住独立。', events: [ { year: 1896, place: '阿杜瓦', desc: '阿杜瓦战役大败意大利' } ] },
];

const RELATIONS = [
  { source: 'sundiata', target: 'mansa_musa', type: '同朝', label: '马里王朝', year: 1300 },
  { source: 'mansa_musa', target: 'ibn_battuta', type: '同代', label: '同时代', year: 1352 },
  { source: 'askia', target: 'mansa_musa', type: '同地', label: '西非帝国继承', year: 1493 },
  { source: 'lara_kaleb', target: 'lara_jacob', type: '同朝', label: '埃塞扎格维/所罗门', year: 1270 },
  { source: 'tewodros', target: 'menelik', type: '同朝', label: '近代埃塞', year: 1868 },
];

const EVENTS = [
  { id: 'e1', name: '库施文明', year: 800, domain: '文化', location: '麦罗埃', desc: '麦罗埃成为非洲炼铁中心。', participants: [] },
  { id: 'e2', name: '阿克苏姆铸币', year: 270, domain: '科技', location: '阿克苏姆', desc: '非洲唯一自铸货币古国。', participants: [] },
  { id: 'e3', name: '阿克苏姆基督教化', year: 330, domain: '宗教', location: '阿克苏姆', desc: '埃扎纳王定基督教为国教。', participants: ['ezana'] },
  { id: 'e4', name: '马里帝国建立', year: 1235, domain: '政治', location: '尼亚尼', desc: '松迪亚塔基里纳战役。', participants: ['sundiata'] },
  { id: 'e5', name: '曼萨·穆萨朝觐', year: 1324, domain: '外交', location: '廷巴克图', desc: '沿途散金致埃及 12 年通胀。', participants: ['mansa_musa'] },
  { id: 'e6', name: '伊本·白图泰游马里', year: 1352, domain: '文化', location: '廷巴克图', desc: '记录下马里社会风貌。', participants: ['ibn_battuta'] },
  { id: 'e7', name: '桑海帝国', year: 1464, domain: '政治', location: '加奥', desc: '桑尼·阿里建桑海帝国。', participants: [] },
  { id: 'e8', name: '阿斯基亚王朝', year: 1493, domain: '政治', location: '加奥', desc: '阿斯基亚大帝夺位。', participants: ['askia'] },
  { id: 'e9', name: '岩石教堂', year: 1200, domain: '科技', location: '拉利贝拉', desc: '拉利贝拉王营建 11 座岩石教堂。', participants: ['lara_kaleb'] },
  { id: 'e10', name: '大津巴布韦鼎盛', year: 1300, domain: '文化', location: '大津巴布韦', desc: '南非贸易王国极盛。', participants: [] },
  { id: 'e11', name: '特沃德罗斯统一', year: 1855, domain: '政治', location: '阿杜瓦', desc: '终结王子时代。', participants: ['tewodros'] },
  { id: 'e12', name: '阿杜瓦战役', year: 1896, domain: '军事', location: '阿杜瓦', desc: '埃塞击败意大利，保住独立。', participants: ['menelik'] },
];

export const africaAtlas = {
  id: 'africa', name: '非洲文明', subtitle: '库施·马里·桑海·埃塞俄比亚（300–1900年）', version: '1.0.0',
  startYear: 300, endYear: 1900,
  mapView: { center: [20, 5], zoom: 3, minZoom: 2, maxZoom: 12, labelZoom: { hideAll: 3, hideEvents: 5 }, importanceZoom: [4, 6], cityZoom: 5, baseLayer: 'satellite' },
  domains: [
    { name: '军事', color: '#b23a2e' }, { name: '政治', color: '#2f5d8a' },
    { name: '文化', color: '#7b4b94' }, { name: '宗教', color: '#b8893a' },
    { name: '外交', color: '#2d8a6e' }, { name: '商贸', color: '#5a6d8a' },
    { name: '科技', color: '#4a7c59' },
  ],
  factions: FACTIONS, places: PLACES, persons: PERSONS, relations: RELATIONS, events: EVENTS,
  importance: makeImportance({
    personRank: {
      ezana: 1, sundiata: 1, mansa_musa: 1, ibn_battuta: 1, askia: 1, lara_kaleb: 1,
      lara_jacob: 1, tewodros: 1, menelik: 1,
      kaleb: 2,
    },
    eventRank: { e3: 1, e4: 1, e5: 1, e9: 1, e12: 1 },
    defaultEvent: 2,
  }),
  birthplaceModern: {},
  birthplaceCoords: { '丹吉尔': [5.81, 35.76] },
  personImages: {},
  timelineTicks: [300, 800, 1235, 1324, 1493, 1896],
};
