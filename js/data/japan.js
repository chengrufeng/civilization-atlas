/* 日本文明（前660–1868年）· 世界文明 */

import { makeImportance } from './index.js';

const FACTIONS = [
  { id: 'asuka', name: '飞鸟', color: '#b8893a', founded: 538, capital: '飞鸟', capitalFrom: 538, desc: '佛教传入、大化改新。' },
  { id: 'nara', name: '奈良', color: '#2d8a6e', founded: 710, capital: '奈良', capitalFrom: 710, desc: '唐风文化全盛。' },
  { id: 'heian', name: '平安', color: '#2f5d8a', founded: 794, capital: '京都', capitalFrom: 794, desc: '国风文化、摄关政治。' },
  { id: 'kamakura', name: '镰仓', color: '#b23a2e', founded: 1192, capital: '镰仓', capitalFrom: 1192, desc: '首个武家幕府。' },
  { id: 'muromachi', name: '室町', color: '#7b4b94', founded: 1336, capital: '京都', capitalFrom: 1336, desc: '足利将军，战国乱起。' },
  { id: 'edog', name: '江户', color: '#5a6d8a', founded: 1603, capital: '江户', capitalFrom: 1603, desc: '德川幕府，锁国。' },
];

const PLACES = [
  { id: 'asuka_j', name: '飞鸟', modern: '日本奈良', coord: [135.82, 34.48], note: '飞鸟都' },
  { id: 'nara_j', name: '奈良', modern: '日本奈良', coord: [135.83, 34.69], note: '平城京' },
  { id: 'kyoto', name: '京都', modern: '日本京都', coord: [135.76, 35.03], note: '平安京/室町' },
  { id: 'kamakura_j', name: '镰仓', modern: '日本镰仓', coord: [139.55, 35.32], note: '镰仓幕府' },
  { id: 'edo', name: '江户', modern: '日本东京', coord: [139.69, 35.69], note: '江户幕府' },
  { id: 'gifu', name: '岐阜', modern: '日本岐阜', coord: [136.76, 35.42], note: '信长"天下布武"' },
  { id: 'osaka_j', name: '大阪', modern: '日本大阪', coord: [135.50, 34.69], note: '秀吉根据地' },
  { id: 'sekigahara', name: '关原', modern: '日本岐阜关原', coord: [136.46, 35.37], note: '关原之战' },
  { id: 'uji', name: '宇治', modern: '日本宇治', coord: [135.81, 34.89], note: '源氏物语舞台' },
  { id: 'edo_bay', name: '江户湾', modern: '日本东京湾', coord: [139.78, 35.40], note: '佩里来航' },
  { id: 'hakusukinoe', name: '白村江', modern: '韩国锦江口', coord: [126.74, 36.0], note: '白村江之战' },
  { id: 'dannoura', name: '坛之浦', modern: '日本下关', coord: [130.93, 33.96], note: '源平最后战' },
  { id: 'hakata', name: '博多湾', modern: '日本福冈', coord: [130.40, 33.59], note: '蒙古袭来' },
  { id: 'okehazama', name: '桶狭间', modern: '日本爱知', coord: [137.0, 35.07], note: '桶狭间奇袭' },
  { id: 'odawara', name: '小田原', modern: '日本神奈川', coord: [139.16, 35.25], note: '小田原之战' },
  { id: 'nagasaki', name: '长崎', modern: '日本长崎', coord: [129.87, 32.75], note: '锁国港口' },
  { id: 'oshu', name: '奥州', modern: '日本东北', coord: [141.0, 39.0], note: '奥之细道' },
  { id: 'keijo', name: '汉城', modern: '韩国首尔', coord: [126.98, 37.57], note: '秀吉侵朝' },
];

const PERSONS = [
  { id: 'shotoku', name: '圣德太子', courtesy: '', alias: [], faction: 'asuka', birth: 574, death: 622, birthPlace: '飞鸟', title: '摄政', roles: ['改革家'], avatar: '德', bio: '推行冠位十二阶、宪法十七条，崇佛。', events: [ { year: 604, place: '飞鸟', desc: '制定宪法十七条' } ] },
  { id: 'tenchi', name: '天智天皇', courtesy: '', alias: ['中大兄皇子'], faction: 'asuka', birth: 626, death: 671, birthPlace: '飞鸟', title: '天皇', roles: ['大化改新'], avatar: '智', bio: '主导大化改新，白村江败于唐。', events: [ { year: 645, place: '飞鸟', desc: '发动乙巳之变，开始大化改新' }, { year: 663, place: '白村江', desc: '白村江之战败于唐新罗联军' } ] },
  { id: 'kanmu', name: '桓武天皇', courtesy: '', alias: [], faction: 'heian', birth: 737, death: 806, birthPlace: '京都', title: '天皇', roles: ['迁都平安京'], avatar: '桓', bio: '迁都长冈后再迁平安京，开启平安时代。', events: [ { year: 794, place: '京都', desc: '迁都平安京' } ] },
  { id: 'murasaki', name: '紫式部', courtesy: '', alias: [], faction: 'heian', birth: 973, death: 1014, birthPlace: '京都', title: '女房', roles: ['源氏物语作者'], avatar: '紫', bio: '世界最早长篇小说《源氏物语》。', events: [ { year: 1008, place: '京都', desc: '完成源氏物语' } ] },
  { id: 'yoritomo', name: '源赖朝', courtesy: '', alias: [], faction: 'kamakura', birth: 1147, death: 1199, birthPlace: '京都', title: '征夷大将军', roles: ['镰仓幕府建立者'], avatar: '源', bio: '源平合战胜出，建首个武家幕府。', events: [ { year: 1185, place: '坛之浦', desc: '坛之浦之战灭平氏' }, { year: 1192, place: '镰仓', desc: '任征夷大将军，建镰仓幕府' } ] },
  { id: 'yoshitsune', name: '源义经', courtesy: '', alias: [], faction: 'kamakura', birth: 1159, death: 1189, birthPlace: '京都', title: '名将', roles: ['悲剧英雄'], avatar: '义', bio: '天才战术家，灭平氏后为兄长所迫自杀。', events: [ { year: 1185, place: '坛之浦', desc: '指挥坛之浦之战' } ] },
  { id: 'hojo_tokimune', name: '北条时宗', courtesy: '', alias: [], faction: 'kamakura', birth: 1251, death: 1284, birthPlace: '镰仓', title: '执权', roles: ['抗击蒙古'], avatar: '北', bio: '两度击退元朝入侵，神风传说起源。', events: [ { year: 1274, place: '博多湾', desc: '文永之役击退元军' }, { year: 1281, place: '博多湾', desc: '弘安之役再退元军' } ] },
  { id: 'takauji', name: '足利尊氏', courtesy: '', alias: [], faction: 'muromachi', birth: 1305, death: 1358, birthPlace: '京都', title: '征夷大将军', roles: ['室町幕府建立者'], avatar: '足', bio: '背弃后醍醐天皇，建室町幕府，南北朝开始。', events: [ { year: 1336, place: '京都', desc: '建室町幕府' } ] },
  { id: 'yoshimitsu', name: '足利义满', courtesy: '', alias: [], faction: 'muromachi', birth: 1358, death: 1408, birthPlace: '京都', title: '将军', roles: ['北山文化'], avatar: '满', bio: '结束南北朝，建金阁，与明朝勘合贸易。', events: [ { year: 1397, place: '京都', desc: '营建金阁寺' } ] },
  { id: 'nobunaga', name: '织田信长', courtesy: '', alias: [], faction: 'muromachi', birth: 1534, death: 1582, birthPlace: '名古屋', title: '大名', roles: ['天下布武'], avatar: '织', bio: '桶狭间破今川，几乎统一，本能寺身亡。', events: [ { year: 1560, place: '桶狭间', desc: '桶狭间奇袭破今川义元' }, { year: 1568, place: '京都', desc: '上洛，扶持将军' }, { year: 1582, place: '京都', desc: '本能寺之变，自杀' } ] },
  { id: 'hideyoshi', name: '丰臣秀吉', courtesy: '', alias: [], faction: 'muromachi', birth: 1537, death: 1598, birthPlace: '名古屋', title: '关白·太阁', roles: ['完成统一'], avatar: '丰', bio: '信长家臣，完成统一，侵朝失败病逝。', events: [ { year: 1590, place: '小田原', desc: '灭北条，完成统一' }, { year: 1592, place: '汉城', desc: '发动文禄之役侵朝' } ] },
  { id: 'ieyasu', name: '德川家康', courtesy: '', alias: [], faction: 'edog', birth: 1543, death: 1616, birthPlace: '冈崎', title: '征夷大将军', roles: ['江户幕府建立者'], avatar: '德', bio: '关原胜出，建江户幕府，开 265 年太平。', events: [ { year: 1600, place: '关原', desc: '关原之战击败石田三成' }, { year: 1603, place: '江户', desc: '任征夷大将军，建江户幕府' } ] },
  { id: 'iemitsu', name: '德川家光', courtesy: '', alias: [], faction: 'edog', birth: 1604, death: 1651, birthPlace: '江户', title: '将军', roles: ['锁国确立'], avatar: '家', bio: '彻底锁国，参勤交代制度化。', events: [ { year: 1639, place: '长崎', desc: '颁布最后一次锁国令' } ] },
  { id: 'michimo', name: '宫本武藏', courtesy: '', alias: [], faction: 'edog', birth: 1584, death: 1645, birthPlace: '冈山', title: '剑客', roles: ['二天一流'], avatar: '武', bio: '《五轮书》，未尝败绩的剑圣。', events: [ { year: 1612, place: '下关', desc: '岩流岛决斗' } ] },
  { id: 'basho', name: '松尾芭蕉', courtesy: '', alias: [], faction: 'edog', birth: 1644, death: 1694, birthPlace: '伊贺', title: '俳谐师', roles: ['俳圣'], avatar: '芭', bio: '《奥之细道》，俳句艺术化。', events: [ { year: 1689, place: '奥州', desc: '完成奥之细道之旅' } ] },
  { id: 'hokusai', name: '葛饰北斋', courtesy: '', alias: [], faction: 'edog', birth: 1760, death: 1849, birthPlace: '江户', title: '浮世绘师', roles: ['浮世绘大师'], avatar: '北', bio: '《富岳三十六景》之《神奈川冲浪里》。', events: [ { year: 1831, place: '江户', desc: '出版富岳三十六景' } ] },
  { id: 'hojo_masako', name: '北条政子', courtesy: '', alias: ['尼将军'], faction: 'kamakura', birth: 1156, death: 1225, birthPlace: '伊豆', title: '尼将军', roles: ['女政治家'], avatar: '政', bio: '源赖朝正妻，赖朝死后出家为尼仍掌握幕府实权，称"尼将军"。', events: [ { year: 1199, place: '镰仓', desc: '赖朝死后掌权' }, { year: 1219, place: '镰仓', desc: '镇压承久之乱' } ] },
  { id: 'perry', name: '佩里', courtesy: '', alias: ['Matthew C. Perry'], faction: 'edog', birth: 1794, death: 1858, birthPlace: '美国', title: '海军准将', roles: ['打开日本国门'], avatar: '佩', bio: '1853 年率黑船抵浦贺，迫使日本开国。', events: [ { year: 1853, place: '江户湾', desc: '黑船来航' } ] },
];

const RELATIONS = [
  { source: 'yoritomo', target: 'yoshitsune', type: '亲属', label: '异母兄弟', year: 1180 },
  { source: 'takauji', target: 'yoshimitsu', type: '亲属', label: '祖孙', year: 1368 },
  { source: 'nobunaga', target: 'hideyoshi', type: '君臣', label: '信长家臣', year: 1568 },
  { source: 'hideyoshi', target: 'ieyasu', type: '同朝', label: '五大老之首', year: 1598 },
  { source: 'ieyasu', target: 'iemitsu', type: '亲属', label: '祖孙', year: 1623 },
];

const EVENTS = [
  { id: 'e1', name: '大化改新', year: 645, domain: '政治', location: '飞鸟', desc: '学习唐制，建立中央集权国家。', participants: ['tenchi'] },
  { id: 'e2', name: '白村江之战', year: 663, domain: '军事', location: '白村江', desc: '日本败于唐新罗，撤出朝鲜半岛。', participants: ['tenchi'] },
  { id: 'e3', name: '平安迁都', year: 794, domain: '政治', location: '京都', desc: '桓武天皇迁都平安京。', participants: ['kanmu'] },
  { id: 'e4', name: '源氏物语', year: 1008, domain: '文化', location: '京都', desc: '世界最早长篇小说。', participants: ['murasaki'] },
  { id: 'e5', name: '坛之浦之战', year: 1185, domain: '军事', location: '下关', desc: '源氏灭平氏。', participants: ['yoritomo', 'yoshitsune'] },
  { id: 'e6', name: '镰仓幕府', year: 1192, domain: '政治', location: '镰仓', desc: '日本首个武家政权。', participants: ['yoritomo'] },
  { id: 'e7', name: '文永之役', year: 1274, domain: '军事', location: '博多湾', desc: '蒙古第一次侵日，遇风暴撤退。', participants: ['hojo_tokimune'] },
  { id: 'e8', name: '弘安之役', year: 1281, domain: '军事', location: '博多湾', desc: '蒙古第二次侵日，再遇"神风"。', participants: ['hojo_tokimune'] },
  { id: 'e9', name: '室町幕府', year: 1336, domain: '政治', location: '京都', desc: '足利尊氏建室町幕府，南北朝开始。', participants: ['takauji'] },
  { id: 'e10', name: '金阁寺', year: 1397, domain: '文化', location: '京都', desc: '足利义满营建北山文化代表。', participants: ['yoshimitsu'] },
  { id: 'e11', name: '桶狭间奇袭', year: 1560, domain: '军事', location: '桶狭间', desc: '信长以寡击众杀今川义元。', participants: ['nobunaga'] },
  { id: 'e12', name: '本能寺之变', year: 1582, domain: '军事', location: '京都', desc: '明智光秀反叛，信长自焚。', participants: ['nobunaga'] },
  { id: 'e13', name: '关原之战', year: 1600, domain: '军事', location: '关原', desc: '德川家康奠定天下。', participants: ['ieyasu'] },
  { id: 'e14', name: '江户幕府', year: 1603, domain: '政治', location: '江户', desc: '德川家康就任征夷大将军。', participants: ['ieyasu'] },
  { id: 'e15', name: '锁国令', year: 1639, domain: '政治', location: '长崎', desc: '德川家光完成锁国体制。', participants: ['iemitsu'] },
  { id: 'e16', name: '奥之细道', year: 1689, domain: '文化', location: '奥州', desc: '松尾芭蕉完成纪行文学巅峰。', participants: ['basho'] },
  { id: 'e17', name: '富岳三十六景', year: 1831, domain: '文化', location: '江户', desc: '葛饰北斋出版浮世绘代表作。', participants: ['hokusai'] },
  { id: 'e18', name: '黑船来航', year: 1853, domain: '外交', location: '江户湾', desc: '佩里率黑船迫使日本开国。', participants: ['perry'] },
  { id: 'e19', name: '大政奉还', year: 1867, domain: '政治', location: '京都', desc: '德川庆喜还政天皇，江户幕府终。', participants: [] },
];

export const japanAtlas = {
  id: 'japan', name: '日本文明', subtitle: '大和·幕府·浮世（前660–1868年）',
  startYear: -660, endYear: 1868,
  mapView: { center: [138, 36], zoom: 5, minZoom: 3, maxZoom: 12, labelZoom: { hideAll: 3, hideEvents: 6 }, importanceZoom: [5, 7], cityZoom: 5, baseLayer: 'satellite' },
  domains: [
    { name: '军事', color: '#b23a2e' }, { name: '政治', color: '#2f5d8a' },
    { name: '文化', color: '#7b4b94' }, { name: '宗教', color: '#b8893a' }, { name: '外交', color: '#2d8a6e' },
  ],
  factions: FACTIONS, places: PLACES, persons: PERSONS, relations: RELATIONS, events: EVENTS,
  importance: makeImportance({
    personRank: {
      shotoku: 1, tenchi: 1, kanmu: 1, murasaki: 1, yoritomo: 1, nobunaga: 1, hideyoshi: 1, ieyasu: 1, hokusai: 1,
      yoshitsune: 2, hojo_tokimune: 2, takauji: 2, yoshimitsu: 2, iemitsu: 2, basho: 2, perry: 2, michimo: 2,
    },
    eventRank: { e1: 1, e6: 1, e12: 1, e13: 1, e14: 1, e15: 1, e18: 1 },
    defaultEvent: 2,
  }),
  birthplaceModern: {},
  birthplaceCoords: {
    '名古屋': [136.91, 35.18], '冈崎': [137.16, 34.95], '冈山': [133.91, 34.66], '伊贺': [136.13, 34.77],
    '美国': [-77.0, 38.9], '桶狭间': [137.0, 35.07], '下关': [130.93, 33.96], '博多湾': [130.40, 33.59],
    '小田原': [139.16, 35.25], '汉城': [126.98, 37.57], '奥州': [141.0, 39.0], '长崎': [129.87, 32.75], '白村江': [127.7, 36.0],
  },
  personImages: {},
  timelineTicks: [-660, 645, 794, 1192, 1336, 1603, 1868],
};
