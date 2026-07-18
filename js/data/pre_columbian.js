/* 前哥伦布美洲（前2000–1532年）· 世界文明 · 奥尔梅克/玛雅/阿兹特克/印加 */

import { makeImportance } from './index.js';

const FACTIONS = [
  { id: 'olmec', name: '奥尔梅克', color: '#5a6d8a', founded: -1500, capital: '圣洛伦索', capitalFrom: -1500, desc: '美洲母亲文化' },
  { id: 'maya', name: '玛雅', color: '#2d8a6e', founded: 250, capital: '蒂卡尔', capitalFrom: 250, desc: '城邦文明，历法、文字发达' },
  { id: 'aztec', name: '阿兹特克', color: '#b23a2e', founded: 1325, capital: '特诺奇蒂特兰', capitalFrom: 1325, desc: '墨西哥谷地霸主' },
  { id: 'inca', name: '印加', color: '#b8893a', founded: 1438, capital: '库斯科', capitalFrom: 1438, desc: '安第斯山脉帝国' },
];

const PLACES = [
  { id: 'teotihuacan', name: '特奥蒂瓦坎', modern: '墨西哥特奥蒂瓦坎', coord: [-98.84, 19.69], note: '太阳月亮金字塔' },
  { id: 'san_lorenzo', name: '圣洛伦索', modern: '墨西哥圣洛伦索', coord: [-94.78, 17.75], note: '奥尔梅克早期中心' },
  { id: 'la_venta', name: '拉文塔', modern: '墨西哥拉文塔', coord: [-93.10, 18.10], note: '奥尔梅克后期中心' },
  { id: 'tikal', name: '蒂卡尔', modern: '危地马拉蒂卡尔', coord: [-89.62, 17.22], note: '古典玛雅大城' },
  { id: 'palenque', name: '帕伦克', modern: '墨西哥帕伦克', coord: [-92.05, 17.48], note: '玛雅帕卡尔王' },
  { id: 'calakmul', name: '卡拉克穆尔', modern: '墨西哥卡拉克穆尔', coord: [-89.81, 18.10], note: '玛雅强权' },
  { id: 'chichen', name: '奇琴伊察', modern: '墨西哥奇琴伊察', coord: [-88.57, 20.68], note: '后古典玛雅' },
  { id: 'tenochtitlan', name: '特诺奇蒂特兰', modern: '墨西哥城', coord: [-99.13, 19.43], note: '阿兹特克都' },
  { id: 'tlatelolco', name: '特拉斯卡拉', modern: '墨西哥特拉斯卡拉', coord: [-98.18, 19.31], note: '与西班牙结盟' },
  { id: 'cusco', name: '库斯科', modern: '秘鲁库斯科', coord: [-71.04, -13.52], note: '印加都' },
  { id: 'machu', name: '马丘比丘', modern: '秘鲁马丘比丘', coord: [-72.55, -13.16], note: '印加圣城' },
  { id: 'cajamarca', name: '卡哈马卡', modern: '秘鲁卡哈马卡', coord: [-78.51, -7.16], note: '阿塔瓦尔帕被俘' },
  { id: 'tumbes', name: '通贝斯', modern: '秘鲁通贝斯', coord: [-80.45, -3.57], note: '皮萨罗登陆' },
];

const PERSONS = [
  { id: 'pacal', name: '帕卡尔大帝', courtesy: '', alias: ['Kinich Janaab Pakal'], faction: 'maya', birth: 603, death: 683, birthPlace: '帕伦克', title: '帕伦克王', roles: ['玛雅名王'], avatar: '帕', bio: '帕伦克极盛，其陵墓石棺为玛雅艺术瑰宝。', events: [ { year: 615, place: '帕伦克', desc: '即位' }, { year: 683, place: '帕伦克', desc: '葬于铭文神庙' } ] },
  { id: 'yax_nuun_ayiin', name: '雅什·库克穆', courtesy: '', alias: ['Yax Nuun Ayiin'], faction: 'maya', birth: 350, death: 420, birthPlace: '蒂卡尔', title: '蒂卡尔王', roles: ['蒂卡尔建立者'], avatar: '雅', bio: '与特奥蒂瓦坎联姻，开蒂卡尔强权。', events: [ { year: 379, place: '蒂卡尔', desc: '即位' } ] },
  { id: 'yuk_noom', name: '烟豹王', courtesy: '', alias: ['Yuknoom Yichak K’ahk’'], faction: 'maya', birth: 600, death: 700, birthPlace: '卡拉克穆尔', title: '卡拉克穆尔王', roles: ['玛雅霸主'], avatar: '烟', bio: '648 大败帕伦克，称霸低地。', events: [ { year: 636, place: '卡拉克穆尔', desc: '即位' }, { year: 657, place: '蒂卡尔', desc: '击败蒂卡尔' } ] },
  { id: 'itzcoatl', name: '伊扎科特尔', courtesy: '', alias: [], faction: 'aztec', birth: 1380, death: 1440, birthPlace: '特诺奇蒂特兰', title: '阿兹特克王', roles: ['建国者'], avatar: '伊', bio: '建立三国同盟，开阿兹特克霸业。', events: [ { year: 1428, place: '特诺奇蒂特兰', desc: '击败阿兹卡波察尔科，建三国同盟' } ] },
  { id: 'moctezuma_i', name: '蒙特祖马一世', courtesy: '', alias: [], faction: 'aztec', birth: 1398, death: 1469, birthPlace: '特诺奇蒂特兰', title: '阿兹特克王', roles: ['扩张者'], avatar: '蒙', bio: '大规模扩张、整顿贡赋系统。', events: [ { year: 1440, place: '特诺奇蒂特兰', desc: '即位' } ] },
  { id: 'axayacatl', name: '阿维索特尔', courtesy: '', alias: [], faction: 'aztec', birth: 1449, death: 1502, birthPlace: '特诺奇蒂特兰', title: '阿兹特克王', roles: ['极盛扩张'], avatar: '维', bio: '帝国版图扩张到最大，但遭遇瘟疫。', events: [ { year: 1486, place: '特诺奇蒂特兰', desc: '即位' } ] },
  { id: 'moctezuma_ii', name: '蒙特祖马二世', courtesy: '', alias: [], faction: 'aztec', birth: 1466, death: 1520, birthPlace: '特诺奇蒂特兰', title: '阿兹特克皇帝', roles: ['末代雄主'], avatar: '蒙', bio: '面对西班牙入侵，犹豫失策，为臣民所杀。', events: [ { year: 1502, place: '特诺奇蒂特兰', desc: '即位' }, { year: 1519, place: '特诺奇蒂特兰', desc: '迎科尔特斯入城后被软禁' }, { year: 1520, place: '特诺奇蒂特兰', desc: '在动乱中身亡' } ] },
  { id: 'cuauhtemoc', name: '夸乌特莫克', courtesy: '', alias: [], faction: 'aztec', birth: 1496, death: 1525, birthPlace: '特诺奇蒂特兰', title: '末代皇帝', roles: ['抗西英雄'], avatar: '夸', bio: '率军守城 80 天，被俘后酷刑殉国。', events: [ { year: 1520, place: '特诺奇蒂特兰', desc: '即位' }, { year: 1521, place: '特诺奇蒂特兰', desc: '城破被俘' } ] },
  { id: 'viracocha', name: '维拉科查', courtesy: '', alias: [], faction: 'inca', birth: 1380, death: 1448, birthPlace: '库斯科', title: '印加王', roles: ['扩张先驱'], avatar: '维', bio: '击退昌卡人，开启印加扩张。', events: [ { year: 1438, place: '库斯科', desc: '击退昌卡入侵' } ] },
  { id: 'pachacuti', name: '帕查库蒂', courtesy: '', alias: ['Pachakutiq'], faction: 'inca', birth: 1418, death: 1471, birthPlace: '库斯科', title: '印加皇帝', roles: ['帝国建立者'], avatar: '帕', bio: '从王城变为帝国，营建马丘比丘。', events: [ { year: 1438, place: '库斯科', desc: '即位，建立印加帝国' }, { year: 1450, place: '马丘比丘', desc: '营建马丘比丘' } ] },
  { id: 'tupa_yupanqui', name: '图帕克·尤潘基', courtesy: '', alias: [], faction: 'inca', birth: 1441, death: 1493, birthPlace: '库斯科', title: '印加皇帝', roles: ['远征者'], avatar: '图', bio: '北征至厄瓜多尔，扩张极盛。', events: [ { year: 1471, place: '库斯科', desc: '即位' }, { year: 1480, place: '基多', desc: '征服基多王国' } ] },
  { id: 'huayna_capac', name: '瓦伊纳·卡帕克', courtesy: '', alias: [], faction: 'inca', birth: 1467, death: 1527, birthPlace: '库斯科', title: '印加皇帝', roles: ['极盛之君'], avatar: '瓦', bio: '帝国版图最大，染天花崩，留下分裂隐患。', events: [ { year: 1493, place: '库斯科', desc: '即位' }, { year: 1527, place: '基多', desc: '天花病逝' } ] },
  { id: 'atawalpa', name: '阿塔瓦尔帕', courtesy: '', alias: [], faction: 'inca', birth: 1502, death: 1533, birthPlace: '基多', title: '印加皇帝', roles: ['末代君主'], avatar: '阿', bio: '刚胜兄弟内战即被皮萨罗俘杀，印加亡。', events: [ { year: 1532, place: '卡哈马卡', desc: '被皮萨罗设伏俘虏' }, { year: 1533, place: '卡哈马卡', desc: '被处死' } ] },
  { id: 'manco_inca', name: '曼科·印卡', courtesy: '', alias: [], faction: 'inca', birth: 1516, death: 1544, birthPlace: '库斯科', title: '傀儡→反抗者', roles: ['抗西领袖'], avatar: '曼', bio: '皮萨罗立的傀儡，后起兵反抗，退守维尔卡班巴。', events: [ { year: 1536, place: '库斯科', desc: '起兵围攻库斯科' } ] },
];

const RELATIONS = [
  { source: 'itzcoatl', target: 'moctezuma_i', type: '亲属', label: '叔侄', year: 1440 },
  { source: 'moctezuma_i', target: 'axayacatl', type: '亲属', label: '祖孙', year: 1469 },
  { source: 'axayacatl', target: 'moctezuma_ii', type: '亲属', label: '祖孙', year: 1502 },
  { source: 'moctezuma_ii', target: 'cuauhtemoc', type: '亲属', label: '侄辈', year: 1520 },
  { source: 'viracocha', target: 'pachacuti', type: '亲属', label: '父子', year: 1438 },
  { source: 'pachacuti', target: 'tupa_yupanqui', type: '亲属', label: '父子', year: 1471 },
  { source: 'tupa_yupanqui', target: 'huayna_capac', type: '亲属', label: '父子', year: 1493 },
  { source: 'huayna_capac', target: 'atawalpa', type: '亲属', label: '父子', year: 1527 },
];

const EVENTS = [
  { id: 'e1', name: '奥尔梅克兴盛', year: -1200, domain: '文化', location: '圣洛伦索', desc: '美洲"母亲文化"崛起。', participants: [] },
  { id: 'e2', name: '玛雅古典期开始', year: 250, domain: '文化', location: '蒂卡尔', desc: '玛雅低地城邦群起。', participants: ['yax_nuun_ayiin'] },
  { id: 'e3', name: '特奥蒂瓦坎鼎盛', year: 400, domain: '科技', location: '特奥蒂瓦坎', desc: '太阳金字塔时代，人口近 20 万。', participants: [] },
  { id: 'e4', name: '烟豹称霸', year: 657, domain: '军事', location: '蒂卡尔', desc: '卡拉克穆尔击败蒂卡尔。', participants: ['yuk_noom'] },
  { id: 'e5', name: '帕伦克帕卡尔即位', year: 615, domain: '政治', location: '帕伦克', desc: '玛雅艺术极盛期开始。', participants: ['pacal'] },
  { id: 'e6', name: '玛雅古典期崩溃', year: 900, domain: '政治', location: '蒂卡尔', desc: '南部低地城邦废弃。', participants: [] },
  { id: 'e7', name: '阿兹特克建国', year: 1325, domain: '政治', location: '特诺奇蒂特兰', desc: '墨西加人在湖中建城。', participants: [] },
  { id: 'e8', name: '三国同盟', year: 1428, domain: '政治', location: '特诺奇蒂特兰', desc: '阿兹特克与特斯科科、特拉科潘结盟。', participants: ['itzcoatl'] },
  { id: 'e9', name: '印加建国', year: 1438, domain: '政治', location: '库斯科', desc: '帕查库蒂即位，开始远征。', participants: ['viracocha', 'pachacuti'] },
  { id: 'e10', name: '马丘比丘营建', year: 1450, domain: '科技', location: '马丘比丘', desc: '帕查库蒂的山中离宫。', participants: ['pachacuti'] },
  { id: 'e11', name: '天花传入美洲', year: 1520, domain: '军事', location: '特诺奇蒂特兰', desc: '由西班牙人传入，人口锐减。', participants: ['moctezuma_ii'] },
  { id: 'e12', name: '特诺奇蒂特兰陷落', year: 1521, domain: '军事', location: '特诺奇蒂特兰', desc: '科尔特斯联合原住民攻陷阿兹特克都城。', participants: ['cuauhtemoc', 'moctezuma_ii'] },
  { id: 'e13', name: '皮萨罗登陆', year: 1532, domain: '军事', location: '通贝斯', desc: '皮萨罗带 168 人登陆秘鲁。', participants: [] },
  { id: 'e14', name: '卡哈马卡设伏', year: 1532, domain: '军事', location: '卡哈马卡', desc: '伏击印加皇帝阿塔瓦尔帕。', participants: ['atawalpa'] },
  { id: 'e15', name: '曼科·印卡起义', year: 1536, domain: '军事', location: '库斯科', desc: '围攻库斯科失败，退守维尔卡班巴。', participants: ['manco_inca'] },
];

export const pre_columbianAtlas = {
  id: 'pre_columbian', name: '前哥伦布美洲', subtitle: '玛雅·阿兹特克·印加（前2000–1532年）',
  startYear: -2000, endYear: 1532,
  mapView: { center: [-85, 5], zoom: 3, minZoom: 2, maxZoom: 12, labelZoom: { hideAll: 3, hideEvents: 5 }, importanceZoom: [4, 6], cityZoom: 5, baseLayer: 'satellite' },
  domains: [
    { name: '军事', color: '#b23a2e' }, { name: '政治', color: '#2f5d8a' },
    { name: '文化', color: '#7b4b94' }, { name: '宗教', color: '#b8893a' }, { name: '科技', color: '#2d8a6e' },
  ],
  factions: FACTIONS, places: PLACES, persons: PERSONS, relations: RELATIONS, events: EVENTS,
  importance: makeImportance({
    personRank: {
      pacal: 1, pachacuti: 1, moctezuma_ii: 1, atawalpa: 1, cuauhtemoc: 1,
      itzcoatl: 2, moctezuma_i: 2, axayacatl: 2, viracocha: 2, tupa_yupanqui: 2,
      huayna_capac: 2, manco_inca: 2, yax_nuun_ayiin: 2, yuk_noom: 2,
    },
    eventRank: { e2: 1, e8: 1, e9: 1, e11: 1, e12: 1, e14: 1 },
    defaultEvent: 2,
  }),
  birthplaceModern: {},
  birthplaceCoords: { '基多': [-78.47, -0.18] },
  personImages: {},
  timelineTicks: [-2000, 250, 900, 1325, 1438, 1521, 1532],
};
