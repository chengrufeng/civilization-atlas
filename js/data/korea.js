/* 朝鲜半岛（前2333–1897年）· 世界文明 · 古朝鲜/三国/新罗/高丽/朝鲜王朝 */

import { makeImportance } from './index.js';

const FACTIONS = [
  { id: 'gojoseon', name: '古朝鲜', color: '#5a6d8a', founded: -2333, capital: '王俭城', capitalFrom: -2333, desc: '檀君建国传说' },
  { id: 'goguryeo', name: '高句丽', color: '#b23a2e', founded: -37, capital: '平壤', capitalFrom: 427, desc: '北方强国' },
  { id: 'baekje', name: '百济', color: '#2d8a6e', founded: -18, capital: '扶余', capitalFrom: 538, desc: '西南国家' },
  { id: 'silla', name: '新罗', color: '#b8893a', founded: -57, capital: '庆州', capitalFrom: -57, desc: '东南国家，统一者' },
  { id: 'goryeo', name: '高丽', color: '#2f5d8a', founded: 918, capital: '开京', capitalFrom: 919, desc: '王建所建' },
  { id: 'joseon', name: '朝鲜王朝', color: '#7b4b94', founded: 1392, capital: '汉阳', capitalFrom: 1394, desc: '李成桂所建，500 余年' },
];

const PLACES = [
  { id: 'pyongyang_k', name: '平壤', modern: '朝鲜平壤', coord: [125.74, 39.04], note: '高句丽后期都' },
  { id: 'gyeongju', name: '庆州', modern: '韩庆州', coord: [129.23, 35.86], note: '新罗都' },
  { id: 'gaeseong', name: '开京', modern: '韩开城', coord: [126.55, 37.97], note: '高丽都' },
  { id: 'hanyang', name: '汉阳', modern: '韩首尔', coord: [126.98, 37.57], note: '朝鲜王朝都' },
  { id: 'buyeo', name: '扶余', modern: '韩扶余', coord: [126.92, 36.28], note: '百济后期都' },
  { id: 'gungnae', name: '王俭城', modern: '朝平壤', coord: [125.74, 39.04], note: '古朝鲜都' },
  { id: 'myeongnyang', name: '鸣梁', modern: '韩鸣梁', coord: [126.41, 34.61], note: '鸣梁海战' },
  { id: 'hansan', name: '闲山岛', modern: '韩闲山岛', coord: [126.45, 34.78], note: '闲山岛大捷' },
];

const PERSONS = [
  { id: 'dangun', name: '檀君', courtesy: '', alias: ['王俭'], faction: 'gojoseon', birth: -2333, death: -2240, birthPlace: '王俭城', title: '古朝鲜建立者', roles: ['传说始祖'], avatar: '檀', bio: '朝鲜半岛始祖传说，公元前 2333 年建国。', events: [ { year: -2333, place: '王俭城', desc: '建立古朝鲜' } ] },
  { id: 'jumong', name: '朱蒙', courtesy: '', alias: ['东明王'], faction: 'goguryeo', birth: -58, death: 19, birthPlace: '卒本', title: '高句丽建立者', roles: ['开国君主'], avatar: '朱', bio: '前 37 年建高句丽。', events: [ { year: -37, place: '平壤', desc: '建立高句丽' } ] },
  { id: 'onjo', name: '温祚王', courtesy: '', alias: [], faction: 'baekje', birth: -30, death: 28, birthPlace: '汉阳', title: '百济建立者', roles: ['开国君主'], avatar: '温', bio: '朱蒙之子，前 18 年建百济。', events: [ { year: -18, place: '扶余', desc: '建立百济' } ] },
  { id: 'muyeol', name: '武烈王', courtesy: '', alias: ['金春秋'], faction: 'silla', birth: 602, death: 661, birthPlace: '庆州', title: '新罗王', roles: ['统一奠基者'], avatar: '武', bio: '联唐灭百济，为统一三国奠基。', events: [ { year: 660, place: '扶余', desc: '联唐灭百济' } ] },
  { id: 'munmu', name: '文武王', courtesy: '', alias: [], faction: 'silla', birth: 626, death: 681, birthPlace: '庆州', title: '新罗王', roles: ['统一三国'], avatar: '文', bio: '668 年灭高句丽，完成三国统一。', events: [ { year: 668, place: '平壤', desc: '灭高句丽，统一三国' } ] },
  { id: 'kim_yu_sin', name: '金庾信', courtesy: '', alias: [], faction: 'silla', birth: 595, death: 673, birthPlace: '庆州', title: '大将军', roles: ['统一名将'], avatar: '金', bio: '新罗名将，三国统一军事统帅。', events: [ { year: 668, place: '平壤', desc: '统军灭高句丽' } ] },
  { id: 'wang_geon', name: '王建', courtesy: '', alias: ['高丽太祖'], faction: 'goryeo', birth: 877, death: 943, birthPlace: '开京', title: '高丽太祖', roles: ['高丽建立者'], avatar: '王', bio: '918 年代弓裔建高丽。', events: [ { year: 918, place: '开京', desc: '建立高丽' }, { year: 936, place: '开京', desc: '统一后三国' } ] },
  { id: 'gang_gam_chan', name: '姜邯赞', courtesy: '', alias: [], faction: 'goryeo', birth: 948, death: 1031, birthPlace: '开京', title: '名将', roles: ['抗辽英雄'], avatar: '姜', bio: '1019 年龟州大捷击退契丹。', events: [ { year: 1019, place: '平壤', desc: '龟州大捷击退契丹' } ] },
  { id: 'yi_seong_gye', name: '李成桂', courtesy: '', alias: ['朝鲜太祖'], faction: 'joseon', birth: 1335, death: 1408, birthPlace: '汉阳', title: '朝鲜太祖', roles: ['朝鲜王朝建立者'], avatar: '李', bio: '1392 年代高丽建朝鲜王朝。', events: [ { year: 1392, place: '汉阳', desc: '建立朝鲜王朝' }, { year: 1394, place: '汉阳', desc: '迁都汉阳' } ] },
  { id: 'sejong', name: '世宗大王', courtesy: '', alias: ['李祹'], faction: 'joseon', birth: 1397, death: 1450, birthPlace: '汉阳', title: '朝鲜国王', roles: ['韩文创制'], avatar: '世', bio: '创制韩文（训民正音），朝鲜文化极盛。', events: [ { year: 1443, place: '汉阳', desc: '创制训民正音（韩文）' }, { year: 1446, place: '汉阳', desc: '颁布训民正音' } ] },
  { id: 'yi_sun_sin', name: '李舜臣', courtesy: '汝谐', alias: ['李忠武公'], faction: 'joseon', birth: 1545, death: 1598, birthPlace: '汉阳', title: '将领', roles: ['鸣梁海战'], avatar: '舜', bio: '壬辰倭乱海军统帅，鸣梁/闲山岛大捷，露梁海战阵亡。', events: [ { year: 1592, place: '闲山岛', desc: '闲山岛大捷' }, { year: 1597, place: '鸣梁', desc: '鸣梁海战以 12 艘击败 133 艘' } ] },
  { id: 'toegye', name: '李滉', courtesy: '景浩', alias: ['李退溪'], faction: 'joseon', birth: 1501, death: 1570, birthPlace: '庆州', title: '学者', roles: ['性理学大家'], avatar: '滉', bio: '朝鲜性理学大师，主理发愤。', events: [ { year: 1550, place: '庆州', desc: '退溪学说形成' } ] },
  { id: 'heo_jun', name: '许浚', courtesy: '', alias: [], faction: 'joseon', birth: 1539, death: 1615, birthPlace: '汉阳', title: '医官', roles: ['东医宝鉴'], avatar: '许', bio: '《东医宝鉴》作者，韩医集大成。', events: [ { year: 1613, place: '汉阳', desc: '刊行东医宝鉴' } ] },
  { id: 'hwang_jini', name: '黄真伊', courtesy: '', alias: [], faction: 'joseon', birth: 1506, death: 1560, birthPlace: '开京', title: '诗人', roles: ['女诗人'], avatar: '真', bio: '朝鲜王朝女诗人，时调名家。', events: [ { year: 1540, place: '开京', desc: '创作时调' } ] },
];

const RELATIONS = [
  { source: 'jumong', target: 'onjo', type: '亲属', label: '父子', year: -18 },
  { source: 'muyeol', target: 'munmu', type: '亲属', label: '父子', year: 661 },
  { source: 'munmu', target: 'kim_yu_sin', type: '同僚', label: '君臣', year: 668 },
  { source: 'muyeol', target: 'kim_yu_sin', type: '同僚', label: '君臣', year: 660 },
  { source: 'toegye', target: 'sejong', type: '同朝', label: '朝鲜文化双星', year: 1450 },
];

const EVENTS = [
  { id: 'e1', name: '檀君建国', year: -2333, domain: '政治', location: '王俭城', desc: '檀君建立古朝鲜（传说）。', participants: ['dangun'] },
  { id: 'e2', name: '高句丽建国', year: -37, domain: '政治', location: '平壤', desc: '朱蒙建立高句丽。', participants: ['jumong'] },
  { id: 'e3', name: '百济建国', year: -18, domain: '政治', location: '扶余', desc: '温祚王建立百济。', participants: ['onjo'] },
  { id: 'e4', name: '新罗统一三国', year: 668, domain: '政治', location: '平壤', desc: '文武王联合唐朝灭高句丽，统一半岛。', participants: ['munmu', 'muyeol', 'kim_yu_sin'] },
  { id: 'e5', name: '高丽建国', year: 918, domain: '政治', location: '开京', desc: '王建建立高丽。', participants: ['wang_geon'] },
  { id: 'e6', name: '蒙古入侵高丽', year: 1231, domain: '军事', location: '开京', desc: '蒙古七次入侵，高丽成为附庸。', participants: [] },
  { id: 'e7', name: '朝鲜王朝建立', year: 1392, domain: '政治', location: '汉阳', desc: '李成桂代高丽建国。', participants: ['yi_seong_gye'] },
  { id: 'e8', name: '训民正音', year: 1446, domain: '文化', location: '汉阳', desc: '世宗大王颁布韩文。', participants: ['sejong'] },
  { id: 'e9', name: '壬辰倭乱', year: 1592, domain: '军事', location: '汉阳', desc: '丰臣秀吉入侵朝鲜，明军援朝。', participants: ['yi_sun_sin'] },
  { id: 'e10', name: '闲山岛大捷', year: 1592, domain: '军事', location: '闲山岛', desc: '李舜臣击败日军海军。', participants: ['yi_sun_sin'] },
  { id: 'e11', name: '鸣梁海战', year: 1597, domain: '军事', location: '鸣梁', desc: '李舜臣以 12 艘击败 133 艘日舰。', participants: ['yi_sun_sin'] },
  { id: 'e12', name: '东医宝鉴', year: 1613, domain: '科技', location: '汉阳', desc: '许浚刊行韩医经典。', participants: ['heo_jun'] },
  { id: 'e13', name: '丙子胡乱', year: 1637, domain: '军事', location: '汉阳', desc: '清军入侵，朝鲜成为清朝附庸。', participants: [] },
];

export const koreaAtlas = {
  id: 'korea', name: '朝鲜半岛', subtitle: '檀君·三国·朝鲜王朝（前2333–1897年）', version: '1.0.0',
  startYear: -2333, endYear: 1897,
  mapView: { center: [127, 37], zoom: 6, minZoom: 3, maxZoom: 12, labelZoom: { hideAll: 4, hideEvents: 7 }, importanceZoom: [5, 7], cityZoom: 6, baseLayer: 'satellite' },
  domains: [
    { name: '军事', color: '#b23a2e' }, { name: '政治', color: '#2f5d8a' },
    { name: '文化', color: '#7b4b94' }, { name: '科技', color: '#2d8a6e' }, { name: '外交', color: '#b8893a' },
  ],
  factions: FACTIONS, places: PLACES, persons: PERSONS, relations: RELATIONS, events: EVENTS,
  importance: makeImportance({
    personRank: {
      dangun: 1, jumong: 1, munmu: 1, kim_yu_sin: 1, wang_geon: 1, yi_seong_gye: 1,
      sejong: 1, yi_sun_sin: 1, toegye: 1, heo_jun: 1,
      onjo: 2, muyeol: 2, gang_gam_chan: 2, hwang_jini: 2,
    },
    eventRank: { e4: 1, e5: 1, e7: 1, e8: 1, e9: 1, e11: 1 },
    defaultEvent: 2,
  }),
  birthplaceModern: {},
  birthplaceCoords: { '卒本': [124.4, 41.0] },
  personImages: {},
  timelineTicks: [-2333, -37, 668, 918, 1392, 1446, 1592, 1897],
};
