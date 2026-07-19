/* =========================================================================
 * 华夏人物图鉴 · 三国人物志 数据集
 *
 * 涵盖东汉末年至三国鼎立时期（184–280年）。
 * 统一数据模型见 data/index.js 的类型定义。
 * ========================================================================= */

/* ---------- 势力 ---------- */
const FACTIONS = [
  { id: 'shu', name: '蜀汉', color: '#4a7c59', founded: 221, capital: '成都', capitalFrom: 214, desc: '刘备建立的政权，以汉室正统自居，据西南益州。仁德立国，人才称盛而国力偏弱。' },
  { id: 'wei', name: '曹魏', color: '#2f5d8a', founded: 220, capital: '洛阳', capitalFrom: 184, desc: '曹操奠基、曹丕代汉而立，占据中原北方，国力最强、人才最盛。' },
  { id: 'wu', name: '东吴', color: '#b23a2e', founded: 229, capital: '建业', capitalFrom: 211, desc: '孙氏经营江东三代而立国，倚长江天险，水军雄劲，江南经济赖以开发。' },
  { id: 'other', name: '汉末群雄', color: '#8a6d3b', founded: 184, capital: '—', capitalFrom: 184, desc: '东汉末年皇权倾颓，诸侯并起：董卓、袁绍、吕布、刘表等轮番登场。' },
];

/* ---------- 地点 ---------- */
const PLACES = [
  { id: 'luoyang', name: '洛阳', modern: '河南洛阳', coord: [112.45, 34.62], note: '东汉都城，董卓焚毁后残破，曹魏复都于此。' },
  { id: 'changan', name: '长安', modern: '陕西西安', coord: [108.95, 34.27], note: '西汉旧都，董卓挟献帝西迁之所。' },
  { id: 'xuchang', name: '许昌', modern: '河南许昌', coord: [113.85, 34.04], note: '曹操迎献帝后定都之地，"挟天子以令诸侯"的政治中心。' },
  { id: 'yecheng', name: '邺城', modern: '河北临漳', coord: [114.61, 36.33], note: '袁绍、曹操先后经营的重镇，曹氏霸业基业。' },
  { id: 'chengdu', name: '成都', modern: '四川成都', coord: [104.07, 30.67], note: '蜀汉都城，益州治所。' },
  { id: 'jianye', name: '建业', modern: '江苏南京', coord: [118.78, 32.06], note: '东吴都城，孙权筑石头城而定鼎江东。' },
  { id: 'jingzhou', name: '荆州', modern: '湖北荆州', coord: [112.24, 30.33], note: '兵家必争之地，赤壁后三分荆州。' },
  { id: 'chibi', name: '赤壁', modern: '湖北赤壁', coord: [113.91, 29.72], note: '208年孙刘联军火攻曹军之地，三国鼎立之役。' },
  { id: 'hanzhong', name: '汉中', modern: '陕西汉中', coord: [107.03, 33.07], note: '入蜀门户，刘备取汉中而进位汉中王。' },
  { id: 'yiling', name: '夷陵', modern: '湖北宜昌', coord: [111.29, 30.70], note: '猇亭之战发生地，陆逊火烧连营破刘备。' },
  { id: 'guandu', name: '官渡', modern: '河南中牟', coord: [113.97, 34.72], note: '200年曹操以少胜多击溃袁绍之地。' },
  { id: 'xiangyang', name: '襄阳', modern: '湖北襄阳', coord: [112.14, 32.04], note: '荆州北门户，关羽围樊襄、威震华夏之地。' },
  { id: 'zhuojun', name: '涿郡', modern: '河北涿州', coord: [115.98, 39.49], note: '刘备故里，桃园结义传说发生地。' },
  { id: 'longzhong', name: '隆中', modern: '湖北襄阳西', coord: [112.20, 32.01], note: '诸葛亮隐居躬耕之地，三顾茅庐发生处。' },
  { id: 'jiangxia', name: '江夏', modern: '湖北武汉', coord: [114.31, 30.59], note: '荆州江夏郡，孙刘联盟酝酿之地。' },
  { id: 'jiangling', name: '江陵', modern: '湖北荆州', coord: [112.20, 30.33], note: '荆州南郡治所，赤壁后刘备借荆州、据南部四郡的核心。' },
  { id: 'chaisang', name: '柴桑', modern: '江西九江', coord: [115.97, 29.71], note: '孙权屯兵筹谋赤壁之地。' },
  { id: 'shouchun', name: '寿春', modern: '安徽寿县', coord: [116.47, 32.57], note: '淮南要冲，袁术称帝之地。' },
  { id: 'baidicheng', name: '白帝城', modern: '重庆奉节', coord: [109.46, 31.05], note: '刘备兵败夷陵后驻跸托孤之地。' },
  { id: 'dingjunshan', name: '定军山', modern: '陕西勉县', coord: [106.67, 33.17], note: '汉中之役黄忠斩夏侯渊之地。' },
  { id: 'qishan', name: '祁山', modern: '甘肃礼县', coord: [105.18, 34.19], note: '诸葛亮北伐出兵要道。' },
  { id: 'wuzhangyuan', name: '五丈原', modern: '陕西岐山', coord: [107.54, 34.20], note: '诸葛亮最后一次北伐屯兵、星陨之地。' },
  { id: 'changsha', name: '长沙', modern: '湖南长沙', coord: [112.94, 28.23], note: '张仲景曾任长沙太守，著《伤寒杂病论》。' },
  { id: 'nanzhong', name: '南中', modern: '云南昆明', coord: [102.83, 25.04], note: '诸葛亮南征、七擒孟获之地。' },
  { id: 'xuzhou', name: '徐州', modern: '江苏徐州', coord: [117.28, 34.21], note: '笮融建浮屠寺，佛教民间传播之始。' },
  { id: 'shanyang', name: '山阳', modern: '山东金乡', coord: [116.31, 35.07], note: '竹林七贤游处之地。' },
  { id: 'yinping', name: '阴平', modern: '甘肃文县', coord: [104.69, 32.94], note: '邓艾偷渡阴平小道，直逼成都灭蜀。' },
  /* 人物轨迹补充地点 */
  { id: 'huarong', name: '华容', modern: '湖北监利', coord: [113.07, 29.82], note: '华容道，赤壁后关羽义释曹操之地。' },
  { id: 'maicheng', name: '麦城', modern: '湖北当阳', coord: [111.79, 30.82], note: '关羽败走之地。' },
  { id: 'changban', name: '长坂', modern: '湖北当阳', coord: [111.79, 30.82], note: '长坂坡，赵云救主、张飞断桥之地。' },
  { id: 'jiangzhou', name: '江州', modern: '重庆', coord: [106.55, 29.56], note: '巴郡治所，张飞义释严颜之地。' },
  { id: 'dangqu', name: '宕渠', modern: '四川渠县', coord: [106.95, 30.84], note: '张飞大破张郃之地。' },
  { id: 'langzhong', name: '阆中', modern: '四川阆中', coord: [105.98, 31.56], note: '张飞镇守并遇害之地。' },
  { id: 'tongguan', name: '潼关', modern: '陕西潼关', coord: [110.23, 34.54], note: '关中东大门，马超反曹之战。' },
  { id: 'luocheng', name: '雒城', modern: '四川广汉', coord: [104.25, 30.98], note: '庞统攻城身亡之地。' },
  { id: 'tianshui', name: '天水', modern: '甘肃天水', coord: [105.72, 34.58], note: '姜维故地，归降诸葛亮之处。' },
  { id: 'nangu', name: '南谷', modern: '陕西汉中', coord: [107.20, 33.20], note: '魏延与杨仪争权之地。' },
  { id: 'chenliu', name: '陈留', modern: '河南开封', coord: [114.31, 34.79], note: '曹操起兵讨董之地。' },
  { id: 'liaodong', name: '辽东', modern: '辽宁辽阳', coord: [123.17, 41.27], note: '司马懿平定公孙渊之地。' },
  { id: 'puyang', name: '濮阳', modern: '河南濮阳', coord: [115.03, 35.76], note: '夏侯惇拔矢啖睛之地。' },
  { id: 'hefei', name: '合肥', modern: '安徽合肥', coord: [117.23, 31.82], note: '张辽逍遥津破孙权之地。' },
  { id: 'yanzhou', name: '兖州', modern: '山东兖州', coord: [116.78, 35.55], note: '荀彧坚守三城之地。' },
  { id: 'liucheng', name: '柳城', modern: '辽宁朝阳', coord: [120.42, 41.57], note: '郭嘉征乌桓途中病逝之地。' },
  { id: 'mianzhu', name: '绵竹', modern: '四川绵竹', coord: [104.21, 31.33], note: '邓艾灭蜀后遇害之地。' },
  { id: 'jiangdong', name: '江东', modern: '江苏南京', coord: [118.78, 32.06], note: '孙氏基业所在，泛指长江以南。' },
  { id: 'baqiu', name: '巴丘', modern: '湖南岳阳', coord: [113.13, 29.37], note: '周瑜病逝之地。' },
  { id: 'wuji', name: '吴郡', modern: '江苏苏州', coord: [120.62, 31.32], note: '东吴核心区域。' },
  { id: 'wancheng', name: '皖城', modern: '安徽潜山', coord: [116.58, 30.63], note: '庐江郡治所，孙策攻皖，周瑜娶小乔之处。' },
  { id: 'yiyang', name: '益阳', modern: '湖南益阳', coord: [112.36, 28.55], note: '鲁肃单刀赴会之地。' },
  { id: 'gongan', name: '公安', modern: '湖北公安', coord: [112.23, 30.06], note: '吕蒙袭荆州后驻所。' },
  { id: 'shiting', name: '石亭', modern: '安徽潜山', coord: [116.53, 30.63], note: '陆逊大破曹休之地。' },
  { id: 'shenting', name: '神亭', modern: '江苏丹阳', coord: [119.57, 32.00], note: '太史慈与孙策酣斗之地。' },
  { id: 'xiapi', name: '下邳', modern: '江苏邳州', coord: [117.96, 34.31], note: '吕布被擒杀之地。' },
  { id: 'suanzao', name: '酸枣', modern: '河南延津', coord: [114.18, 35.15], note: '诸侯讨董联军驻所。' },
  { id: 'julu', name: '巨鹿', modern: '河北巨鹿', coord: [115.04, 37.22], note: '黄巾起义爆发地，张角故里。' },
  { id: 'chenxian', name: '陈县', modern: '河南淮阳', coord: [114.88, 33.73], note: '曹植封陈王、郁郁而终之地。' },
];

/* ---------- 人物 ---------- */
const PERSONS = [
  /* ===== 蜀汉 ===== */
  { id: 'liubei', name: '刘备', courtesy: '玄德', alias: ['先主','昭烈帝'], faction: 'shu', birth: 161, death: 223, birthPlace: '涿郡', title: '汉昭烈帝', roles: ['蜀汉开国皇帝'], avatar: '备',
    bio: '中山靖王之后，早年织席贩履。以仁德聚人心，转战半生，得诸葛亮辅佐后取荆州、益州、汉中，221年称帝建国。夷陵兵败后病逝白帝城，托孤诸葛亮。',
    events: [
      { year: 184, place: '涿郡', desc: '起兵讨黄巾' },
      { year: 194, place: '徐州', desc: '陶谦让徐州，刘备领徐州牧' },
      { year: 196, place: '许昌', desc: '吕布袭徐州，刘备投奔曹操' },
      { year: 199, place: '徐州', desc: '借机脱身，占据下邳，反曹' },
      { year: 200, place: '邺城', desc: '兵败投奔袁绍，关羽被俘降曹' },
      { year: 201, place: '襄阳', desc: '离开袁绍，南投刘表，驻新野' },
      { year: 207, place: '隆中', desc: '三顾茅庐，得诸葛亮' },
      { year: 208, place: '江夏', desc: '长坂坡败走，联孙抗曹' },
      { year: 208, place: '江夏', desc: '赤壁之战，大破曹军' },
      { year: 209, place: '江陵', desc: '借荆州，据南部四郡' },
      { year: 214, place: '成都', desc: '取益州' },
      { year: 219, place: '汉中', desc: '汉中之战，进位汉中王' },
      { year: 221, place: '成都', desc: '称帝，国号汉' },
      { year: 222, place: '夷陵', desc: '夷陵之战大败' },
      { year: 223, place: '白帝城', desc: '托孤诸葛亮，病逝' },
    ]
  },
  { id: 'guanyu', name: '关羽', courtesy: '云长', alias: ['美髯公','关公'], faction: 'shu', birth: 160, death: 220, birthPlace: '河东解县', title: '前将军', roles: ['蜀汉名将'], avatar: '羽',
    bio: '与刘备、张飞桃园结义，万人敌之将。斩颜良、过五关、单刀赴会。镇守荆州，水淹七军、擒于禁、斩庞德，威震华夏。终因轻敌背腹受敌，败走麦城为吴所杀。',
    events: [
      { year: 184, place: '涿郡', desc: '桃园结义，随刘备起兵' },
      { year: 200, place: '许昌', desc: '降曹，斩颜良报恩后归刘' },
      { year: 208, place: '华容', desc: '赤壁后义释曹操' },
      { year: 214, place: '荆州', desc: '董督荆州事' },
      { year: 219, place: '襄阳', desc: '围樊城，水淹七军' },
      { year: 220, place: '麦城', desc: '败走麦城，遇害' },
    ]
  },
  { id: 'zhangfei', name: '张飞', courtesy: '翼德', alias: [], faction: 'shu', birth: 168, death: 221, birthPlace: '涿郡', title: '车骑将军', roles: ['蜀汉名将'], avatar: '飞',
    bio: '桃园结义之三弟，万人敌。长坂桥独退曹军，义释严颜，巴西破张郃。性暴而敬君子，终为部下所害。',
    events: [
      { year: 208, place: '长坂', desc: '据水断桥，喝退曹军' },
      { year: 214, place: '江州', desc: '义释严颜，平定巴郡' },
      { year: 215, place: '宕渠', desc: '大破张郃' },
      { year: 221, place: '阆中', desc: '为部下范强、张达所害' },
    ]
  },
  { id: 'zhugeliang', name: '诸葛亮', courtesy: '孔明', alias: ['卧龙','丞相'], faction: 'shu', birth: 181, death: 234, birthPlace: '琅琊阳都', title: '丞相', roles: ['蜀汉丞相','政治家','军事家'], avatar: '亮',
    bio: '隐居隆中，作《隆中对》定三分之计。辅佐刘备建国，刘备托孤后尽心蜀汉，南平蛮夷，六出祁山北伐中原。星陨五丈原，鞠躬尽瘁，死而后已。',
    events: [
      { year: 207, place: '隆中', desc: '三顾茅庐，献隆中对' },
      { year: 208, place: '柴桑', desc: '出使东吴，促成孙刘联盟' },
      { year: 214, place: '成都', desc: '佐刘备取益州' },
      { year: 225, place: '南中', desc: '南征，七擒孟获' },
      { year: 228, place: '祁山', desc: '第一次北伐，失街亭' },
      { year: 234, place: '五丈原', desc: '最后一次北伐，病逝军中' },
    ]
  },
  { id: 'zhaoyun', name: '赵云', courtesy: '子龙', alias: [], faction: 'shu', birth: 168, death: 229, birthPlace: '常山真定', title: '镇军将军', roles: ['蜀汉名将'], avatar: '云',
    bio: '先从公孙瓒，后归刘备。长坂坡单骑救主，截江夺阿斗。一身是胆，汉中空营退曹军。沉稳有识，常直言谏谏。',
    events: [
      { year: 208, place: '长坂', desc: '单骑救阿斗' },
      { year: 211, place: '江州', desc: '截江夺后主' },
      { year: 219, place: '汉中', desc: '空营计，一身是胆' },
    ]
  },
  { id: 'machao', name: '马超', courtesy: '孟起', alias: ['锦马超'], faction: 'shu', birth: 176, death: 222, birthPlace: '扶风茂陵', title: '骠骑将军', roles: ['蜀汉名将'], avatar: '超',
    bio: '西凉马腾之子，骁勇善战。起兵反曹，渭水之战杀得曹操割须弃袍。后投张鲁、归刘备，助取成都。蜀汉五虎之一。',
    events: [
      { year: 211, place: '潼关', desc: '起兵反曹，渭水之战' },
      { year: 214, place: '成都', desc: '归刘备，迫降刘璋' },
    ]
  },
  { id: 'huangzhong', name: '黄忠', courtesy: '汉升', alias: [], faction: 'shu', birth: 148, death: 220, birthPlace: '南阳', title: '后将军', roles: ['蜀汉名将'], avatar: '忠',
    bio: '本刘表部将，后归刘备。老当益壮，定军山阵斩夏侯渊，一举成名。蜀汉五虎之一。',
    events: [
      { year: 219, place: '定军山', desc: '阵斩夏侯渊' },
    ]
  },
  { id: 'pangtong', name: '庞统', courtesy: '士元', alias: ['凤雏'], faction: 'shu', birth: 179, death: 214, birthPlace: '襄阳', title: '军师中郎将', roles: ['谋士'], avatar: '统',
    bio: '与诸葛亮并称"卧龙凤雏"，得一人可安天下。佐刘备取益州，进围雒城时中流矢而亡。',
    events: [
      { year: 214, place: '雒城', desc: '攻城身亡' },
    ]
  },
  { id: 'jiangwei', name: '姜维', courtesy: '伯约', alias: [], faction: 'shu', birth: 202, death: 264, birthPlace: '天水冀县', title: '大将军', roles: ['蜀汉后期统帅'], avatar: '维',
    bio: '本魏将，诸葛亮收为传人。诸葛亮身后九伐中原，力撑蜀汉。蜀亡后诈降钟会图复国，事败而死。',
    events: [
      { year: 228, place: '天水', desc: '归降诸葛亮' },
      { year: 253, place: '祁山', desc: '总督蜀汉军事，屡次北伐' },
      { year: 263, place: '成都', desc: '守剑阁拒钟会，邓艾偷渡阴平，蜀亡' },
      { year: 264, place: '成都', desc: '钟会之乱中遇害' },
    ]
  },
  { id: 'weiyang', name: '魏延', courtesy: '文长', alias: [], faction: 'shu', birth: 169, death: 234, birthPlace: '义阳', title: '征西大将军', roles: ['蜀汉名将'], avatar: '延',
    bio: '刘备拔擢的宿将，镇守汉中十年。勇猛过人，常请兵子午谷奇袭长安。诸葛亮死后与杨仪争权，被诬谋反遇害。',
    events: [
      { year: 219, place: '汉中', desc: '镇守汉中' },
      { year: 234, place: '南谷', desc: '与杨仪争权，遇害' },
    ]
  },

  /* ===== 曹魏 ===== */
  { id: 'caocao', name: '曹操', courtesy: '孟德', alias: ['阿瞒','魏武帝'], faction: 'wei', birth: 155, death: 220, birthPlace: '沛国谯县', title: '魏王', roles: ['政治家','军事家','诗人'], avatar: '操',
    bio: '挟天子以令诸侯，统一北方。唯才是举，兴屯田，抑兼并。官渡败袁绍，赤壁受挫，终成三分天下有其二。建安文学开创者，"老骥伏枥，志在千里"。',
    events: [
      { year: 189, place: '陈留', desc: '起兵讨董卓' },
      { year: 196, place: '许昌', desc: '迎献帝都许' },
      { year: 200, place: '官渡', desc: '以少胜多败袁绍' },
      { year: 207, place: '邺城', desc: '北征乌桓，郭嘉病逝' },
      { year: 208, place: '赤壁', desc: '赤壁之战大败' },
      { year: 209, place: '邺城', desc: '退还邺城，经营北方' },
      { year: 213, place: '邺城', desc: '封魏公，加九锡' },
      { year: 216, place: '邺城', desc: '进魏王' },
      { year: 220, place: '洛阳', desc: '病逝' },
    ]
  },
  { id: 'caopi', name: '曹丕', courtesy: '子桓', alias: ['魏文帝'], faction: 'wei', birth: 187, death: 226, birthPlace: '沛国谯县', title: '魏文帝', roles: ['曹魏开国皇帝','文学家'], avatar: '丕',
    bio: '曹操次子，篡汉建魏。确立九品中正制，著《典论·论文》开文学批评之先。在位七年而逝。',
    events: [
      { year: 211, place: '邺城', desc: '随父征马超，留守邺城' },
      { year: 217, place: '邺城', desc: '著《典论·论文》，立为太子' },
      { year: 220, place: '洛阳', desc: '代汉称帝，建魏' },
    ]
  },
  { id: 'simayi', name: '司马懿', courtesy: '仲达', alias: [], faction: 'wei', birth: 179, death: 251, birthPlace: '河内温县', title: '太傅', roles: ['权臣','军事家'], avatar: '懿',
    bio: '魏国四朝元老。抵御诸葛亮北伐，平定辽东。高平陵之变诛曹爽，专擅魏政，为晋代魏奠基。',
    events: [
      { year: 208, place: '许昌', desc: '被曹操强征为文学掾' },
      { year: 215, place: '汉中', desc: '随曹操取汉中，劝其乘胜入蜀' },
      { year: 219, place: '洛阳', desc: '襄樊之战，建议联合孙权夹击关羽' },
      { year: 226, place: '洛阳', desc: '曹叡即位，与曹爽同受遗诏辅政' },
      { year: 228, place: '祁山', desc: '奉诏拒诸葛亮北伐' },
      { year: 234, place: '五丈原', desc: '坚守不战，耗死诸葛亮' },
      { year: 238, place: '辽东', desc: '平公孙渊，擒斩之' },
      { year: 249, place: '洛阳', desc: '高平陵之变，诛曹爽专魏政' },
    ]
  },
  { id: 'xiahoudun', name: '夏侯惇', courtesy: '元让', alias: ['盲夏侯'], faction: 'wei', birth: 155, death: 220, birthPlace: '沛国谯县', title: '大将军', roles: ['曹魏宗将'], avatar: '惇',
    bio: '曹操族兄弟，从起兵即相随。拔矢啖睛，刚烈忠勇。曹操最亲信的宗族将领之一。',
    events: [
      { year: 194, place: '濮阳', desc: '拔矢啖睛' },
    ]
  },
  { id: 'xiahouyuan', name: '夏侯渊', courtesy: '妙才', alias: [], faction: 'wei', birth: 168, death: 219, birthPlace: '沛国谯县', title: '征西将军', roles: ['曹魏宗将'], avatar: '渊',
    bio: '曹操族兄弟，擅长途奔袭。平定关中、凉州。定军山为黄忠所袭杀。',
    events: [
      { year: 219, place: '定军山', desc: '为黄忠阵斩' },
    ]
  },
  { id: 'zhangliao', name: '张辽', courtesy: '文远', alias: [], faction: 'wei', birth: 169, death: 222, birthPlace: '雁门马邑', title: '征东将军', roles: ['曹魏名将'], avatar: '辽',
    bio: '本吕布部将，归曹后屡建奇功。合肥逍遥津以八百破孙权十万，威震江东，"张辽止啼"。',
    events: [
      { year: 215, place: '合肥', desc: '逍遥津破孙权' },
    ]
  },
  { id: 'xuchu', name: '许褚', courtesy: '仲康', alias: ['虎痴'], faction: 'wei', birth: 170, death: 230, birthPlace: '谯国谯县', title: '武卫将军', roles: ['曹魏猛将'], avatar: '褚',
    bio: '曹操宿卫，力大无穷，忠勇无双。裸衣斗马超，多次救曹操于危难。',
    events: [
      { year: 211, place: '潼关', desc: '裸衣斗马超' },
    ]
  },
  { id: 'xunyu', name: '荀彧', courtesy: '文若', alias: ['王佐之才'], faction: 'wei', birth: 163, death: 212, birthPlace: '颍川颍阴', title: '尚书令', roles: ['谋士','政治家'], avatar: '彧',
    bio: '曹操首席谋主，"吾之子房"。定战略迎天子都许，举荐大量人才。因反对曹操进魏公，忧愤而终。',
    events: [
      { year: 194, place: '兖州', desc: '坚守三城，保全曹操根基' },
      { year: 196, place: '许昌', desc: '建议迎献帝' },
      { year: 212, place: '许昌', desc: '反对加九锡，饮药而亡' },
    ]
  },
  { id: 'guojia', name: '郭嘉', courtesy: '奉孝', alias: [], faction: 'wei', birth: 170, death: 207, birthPlace: '颍川阳翟', title: '军师祭酒', roles: ['谋士'], avatar: '嘉',
    bio: '曹操奇谋之士，料事如神。十胜十败之论，预测孙策之死，遗计定辽东。38岁早逝，曹操赤壁后叹"郭奉孝在，不使孤至此"。',
    events: [
      { year: 200, place: '官渡', desc: '献十胜十败之策' },
      { year: 207, place: '柳城', desc: '征乌桓途中病逝' },
    ]
  },
  { id: 'dengai', name: '邓艾', courtesy: '士载', alias: [], faction: 'wei', birth: 197, death: 264, birthPlace: '义阳棘阳', title: '太尉', roles: ['曹魏名将'], avatar: '艾',
    bio: '出身寒微，由司马懿拔擢。偷渡阴平，直下成都，灭蜀首功。为钟会所诬，遭害。',
    events: [
      { year: 263, place: '阴平', desc: '偷渡阴平，迫降蜀汉' },
      { year: 264, place: '绵竹', desc: '为钟会所害' },
    ]
  },

  /* ===== 东吴 ===== */
  { id: 'sunquan', name: '孙权', courtesy: '仲谋', alias: ['吴大帝'], faction: 'wu', birth: 182, death: 252, birthPlace: '吴郡富春', title: '吴大帝', roles: ['东吴开国皇帝'], avatar: '权',
    bio: '承父兄基业，19岁继位。知人善任，赤壁用周瑜、夷陵用陆逊。据江东五十二年，晚年多疑。曹操叹"生子当如孙仲谋"。',
    events: [
      { year: 200, place: '江东', desc: '继兄孙策之位' },
      { year: 208, place: '柴桑', desc: '决意联刘抗曹' },
      { year: 219, place: '荆州', desc: '袭杀关羽，夺荆州' },
      { year: 229, place: '建业', desc: '称帝建吴' },
    ]
  },
  { id: 'zhouyu', name: '周瑜', courtesy: '公瑾', alias: [], faction: 'wu', birth: 175, death: 210, birthPlace: '庐江舒县', title: '偏将军 / 南郡太守', roles: ['名将','谋士'], avatar: '瑜',
    bio: '孙策、孙权两朝股肱。雅量高致，通晓音律，"曲有误，周郎顾"。赤壁主帅，火攻破曹。拟取益州，36岁病逝巴丘。',
    events: [
      { year: 195, place: '寿春', desc: '与孙策结交，倾财相助' },
      { year: 198, place: '皖城', desc: '随孙策攻皖，娶小乔' },
      { year: 200, place: '吴郡', desc: '孙策遇刺，以中护军辅佐孙权' },
      { year: 208, place: '柴桑', desc: '力主抗曹，统兵与刘备会师' },
      { year: 208, place: '赤壁', desc: '任大都督，火攻破曹' },
      { year: 209, place: '江陵', desc: '南郡之战，苦战年余击退曹仁' },
      { year: 210, place: '巴丘', desc: '拟取益州途中病逝，年三十六' },
    ]
  },
  { id: 'lusu', name: '鲁肃', courtesy: '子敬', alias: [], faction: 'wu', birth: 172, death: 217, birthPlace: '临淮东城', title: '横江将军', roles: ['谋士','外交家'], avatar: '肃',
    bio: '提出"榻上策"，定三分天下。力主联刘抗曹，单刀赴会与关羽谈判。东吴战略家，46岁早逝。',
    events: [
      { year: 200, place: '吴郡', desc: '榻上策，建言全据长江' },
      { year: 208, place: '柴桑', desc: '促成孙刘联盟' },
      { year: 215, place: '益阳', desc: '单刀赴会' },
    ]
  },
  { id: 'lvmeng', name: '吕蒙', courtesy: '子明', alias: [], faction: 'wu', birth: 178, death: 220, birthPlace: '汝南富陂', title: '南郡太守', roles: ['名将'], avatar: '蒙',
    bio: '初为吴下阿蒙，发愤读书令鲁肃刮目相看。白衣渡江，袭取荆州，擒杀关羽。封侯不久病逝。',
    events: [
      { year: 219, place: '荆州', desc: '白衣渡江，擒杀关羽' },
      { year: 220, place: '公安', desc: '病逝' },
    ]
  },
  { id: 'luxun', name: '陆逊', courtesy: '伯言', alias: [], faction: 'wu', birth: 183, death: 245, birthPlace: '吴郡吴县', title: '丞相 / 上大将军', roles: ['名将','政治家'], avatar: '逊',
    bio: '书生拜将，夷陵火烧连营破刘备。石亭之战败曹休。后任丞相，因卷入二宫之争忧愤而卒。',
    events: [
      { year: 222, place: '夷陵', desc: '火烧连营破刘备' },
      { year: 228, place: '石亭', desc: '大破曹休' },
    ]
  },
  { id: 'ganning', name: '甘宁', courtesy: '兴霸', alias: ['锦帆贼'], faction: 'wu', birth: 170, death: 220, birthPlace: '巴郡临江', title: '折冲将军', roles: ['东吴名将'], avatar: '宁',
    bio: '少为水贼，号"锦帆贼"。后归吴，百骑劫魏营，勇冠三军。孙权称"孟德有张辽，孤有兴霸"。',
    events: [
      { year: 215, place: '合肥', desc: '百骑劫曹营' },
    ]
  },
  { id: 'taishici', name: '太史慈', courtesy: '子义', alias: [], faction: 'wu', birth: 166, death: 206, birthPlace: '东莱黄县', title: '建昌都尉', roles: ['东吴名将'], avatar: '慈',
    bio: '猿臂善射，北海救孔融。与孙策神亭岭酣斗，后归附。镇守南方，平定山越。41岁病逝，叹"生当提七尺之剑，升天子之阶"。',
    events: [
      { year: 195, place: '神亭', desc: '与孙策酣斗' },
    ]
  },

  /* ===== 汉末群雄 ===== */
  { id: 'dongzhuo', name: '董卓', courtesy: '仲颖', alias: [], faction: 'other', birth: 132, death: 192, birthPlace: '陇西临洮', title: '太师', roles: ['军阀','权臣'], avatar: '卓',
    bio: '西凉军阀，趁何进之乱进京，废立皇帝，独揽朝政。残暴嗜杀，焚毁洛阳。为王允、吕布所诛。',
    events: [
      { year: 189, place: '洛阳', desc: '进京专权，废少帝立献帝' },
      { year: 190, place: '长安', desc: '挟献帝西迁，焚洛阳' },
      { year: 192, place: '长安', desc: '为吕布、王允所杀' },
    ]
  },
  { id: 'lvbu', name: '吕布', courtesy: '奉先', alias: ['飞将'], faction: 'other', birth: 156, death: 198, birthPlace: '五原郡九原', title: '温侯', roles: ['军阀','猛将'], avatar: '布',
    bio: '弓马娴熟，号称"人中吕布，马中赤兔"。三姓家奴，弑丁原、刺董卓。据徐州，终为曹操所擒缢杀。',
    events: [
      { year: 192, place: '长安', desc: '刺杀董卓' },
      { year: 196, place: '徐州', desc: '夺刘备徐州' },
      { year: 198, place: '下邳', desc: '为曹操擒杀' },
    ]
  },
  { id: 'yuanshao', name: '袁绍', courtesy: '本初', alias: [], faction: 'other', birth: 154, death: 202, birthPlace: '汝南汝阳', title: '大将军', roles: ['军阀'], avatar: '绍',
    bio: '四世三公，门生故吏遍天下。讨董联军盟主，后据河北四州，盛极一时。官渡惨败于曹操，忧愤病逝，诸子相残，基业尽丧。',
    events: [
      { year: 189, place: '洛阳', desc: '任司隶校尉，谋诛宦官' },
      { year: 190, place: '酸枣', desc: '推为讨董联军盟主' },
      { year: 200, place: '官渡', desc: '败于曹操' },
      { year: 202, place: '邺城', desc: '病逝' },
    ]
  },
  { id: 'liubiao', name: '刘表', courtesy: '景升', alias: [], faction: 'other', birth: 142, death: 208, birthPlace: '山阳高平', title: '荆州牧', roles: ['军阀'], avatar: '表',
    bio: '汉室宗亲，单骑定荆州。治荆州二十年，学校兴盛，中原士人避难云集。然外宽内忌，无进取之志，死后荆州遂分。',
    events: [
      { year: 190, place: '荆州', desc: '出任荆州牧' },
      { year: 208, place: '襄阳', desc: '病逝，荆州陷于争夺' },
    ]
  },

  /* ===== 补充人物（科技/文学领域） ===== */
  { id: 'huatuo', name: '华佗', courtesy: '元化', alias: ['神医'], faction: 'other', birth: 141, death: 208, birthPlace: '谯县', title: '神医', roles: ['医学家'], avatar: '佗',
    bio: '东汉末年名医，精通方药、针灸、外科。发明麻沸散用于全麻手术，创编五禽戏养生导引术。后因不愿为曹操专侍，被杀于狱中。',
    events: [
      { year: 200, place: '许昌', desc: '发明麻沸散，为曹操治头风' },
      { year: 205, place: '许昌', desc: '创编五禽戏' },
      { year: 208, place: '许昌', desc: '为曹操所杀' },
    ]
  },
  { id: 'zhangzhongjing', name: '张仲景', courtesy: '仲景', alias: ['名机','医圣'], faction: 'other', birth: 150, death: 219, birthPlace: '南阳涅阳', title: '长沙太守', roles: ['医学家'], avatar: '仲',
    bio: '东汉末年医学家，被后世尊为"医圣"。任长沙太守期间坐堂行医，著《伤寒杂病论》确立辨证论治原则，为中国医学奠基之作。',
    events: [
      { year: 210, place: '长沙', desc: '著成《伤寒杂病论》' },
    ]
  },
  { id: 'caozhi', name: '曹植', courtesy: '子建', alias: ['陈思王'], faction: 'wei', birth: 192, death: 232, birthPlace: '沛国谯县', title: '陈王', roles: ['诗人','文学家'], avatar: '植',
    bio: '曹操第三子，才高八斗，建安文学代表。七步成诗，著《洛神赋》《白马篇》等。因争储失败遭曹丕猜忌，郁郁而终。',
    events: [
      { year: 217, place: '邺城', desc: '争太子位失败，曹丕立为太子' },
      { year: 223, place: '洛阳', desc: '作《洛神赋》' },
      { year: 232, place: '陈县', desc: '郁郁而终' },
    ]
  },
  { id: 'jikang', name: '嵇康', courtesy: '叔夜', alias: [], faction: 'wei', birth: 224, death: 263, birthPlace: '谯国铚县', title: '中散大夫', roles: ['文学家','思想家','音乐家'], avatar: '康',
    bio: '竹林七贤之首，魏晋玄学代表。崇尚老庄，性尚自然。善鼓琴，著《广陵散》传世。因得罪司马氏，被诬处死，临刑抚琴叹"广陵散于今绝矣"。',
    events: [
      { year: 247, place: '山阳', desc: '与阮籍等游于竹林，称竹林七贤' },
      { year: 262, place: '洛阳', desc: '被司马昭处死，临刑弹《广陵散》' },
    ]
  },
  { id: 'liuhui', name: '刘徽', courtesy: '', alias: [], faction: 'wei', birth: 225, death: 295, birthPlace: '淄乡', title: '数学家', roles: ['数学家'], avatar: '徽',
    bio: '魏晋时期数学家，中国古典数学理论奠基人。注《九章算术》，提出"割圆术"算得圆周率3.1416，开创极限思想之先河。',
    events: [
      { year: 263, place: '洛阳', desc: '注《九章算术》，提出割圆术' },
    ]
  },

  /* ===== 建安七子 ===== */
  { id: 'wangcan', name: '王粲', courtesy: '仲宣', alias: [], faction: 'wei', birth: 177, death: 217, birthPlace: '山阳高平', title: '侍中', roles: ['文学家'], avatar: '粲',
    bio: '建安七子之一，文学成就最高。避乱荆州依刘表，后归曹操。著《登楼赋》《七哀诗》，与曹植并称"曹王"。',
    events: [
      { year: 208, place: '襄阳', desc: '归降曹操' },
      { year: 207, place: '邺城', desc: '建安七子汇聚邺城' },
    ]
  },
  { id: 'kongrong', name: '孔融', courtesy: '文举', alias: [], faction: 'wei', birth: 153, death: 208, birthPlace: '鲁国曲阜', title: '少府', roles: ['文学家'], avatar: '融',
    bio: '孔子二十世孙，建安七子之一。少有异才，"孔融让梨"传为佳话。性刚直，屡忤曹操，终被杀。',
    events: [
      { year: 196, place: '许昌', desc: '被曹操征入朝' },
      { year: 207, place: '邺城', desc: '建安七子汇聚邺城' },
      { year: 208, place: '许昌', desc: '因忤逆曹操被杀' },
    ]
  },
  { id: 'chenlin', name: '陈琳', courtesy: '孔璋', alias: [], faction: 'wei', birth: 155, death: 217, birthPlace: '广陵射阳', title: '门督', roles: ['文学家'], avatar: '琳',
    bio: '建安七子之一，以书檄文章闻名。曾为袁绍作讨曹操檄，曹操读后头风顿愈。后归曹操，爱其才不杀。',
    events: [
      { year: 200, place: '邺城', desc: '为袁绍作讨曹檄文' },
      { year: 207, place: '邺城', desc: '建安七子汇聚邺城' },
    ]
  },
  { id: 'xugan', name: '徐干', courtesy: '伟长', alias: [], faction: 'wei', birth: 171, death: 218, birthPlace: '北海', title: '司空军谋祭酒', roles: ['文学家','哲学家'], avatar: '干',
    bio: '建安七子之一，著《中论》二十余篇，为政论哲学著作。轻官重学，恬淡寡欲。',
    events: [
      { year: 207, place: '邺城', desc: '建安七子汇聚邺城，著《中论》' },
    ]
  },
  { id: 'ruanyu', name: '阮瑀', courtesy: '元瑜', alias: [], faction: 'wei', birth: 165, death: 212, birthPlace: '陈留尉氏', title: '司空军谋祭酒', roles: ['文学家'], avatar: '瑀',
    bio: '建安七子之一，阮籍之父。善书檄，与陈琳齐名。曹操使其作书与韩遂，挥笔立就。',
    events: [
      { year: 207, place: '邺城', desc: '建安七子汇聚邺城' },
    ]
  },
  { id: 'yingchang', name: '应玚', courtesy: '德琏', alias: [], faction: 'wei', birth: 175, death: 217, birthPlace: '汝南', title: '五官将文学', roles: ['文学家'], avatar: '玚',
    bio: '建安七子之一，汝南名士。善赋诗，曹丕称其"常斐然有述作之意"。',
    events: [
      { year: 207, place: '邺城', desc: '建安七子汇聚邺城' },
    ]
  },
  { id: 'liuzhen', name: '刘桢', courtesy: '公干', alias: [], faction: 'wei', birth: 170, death: 217, birthPlace: '东平宁阳', title: '丞相掾', roles: ['文学家'], avatar: '桢',
    bio: '建安七子之一，五言诗名家。曹丕称其"其五言诗之善者，妙绝时人"。性卓傲，以平视甄氏获罚。',
    events: [
      { year: 207, place: '邺城', desc: '建安七子汇聚邺城' },
    ]
  },
  { id: 'caowenji', name: '蔡文姬', courtesy: '昭姬', alias: ['蔡琰'], faction: 'other', birth: 177, death: 249, birthPlace: '陈留', title: '才女', roles: ['诗人','音乐家'], avatar: '文', bio: '蔡邕之女，被匈奴掳走十二年，曹操重金赎回，作《胡笳十八拍》《悲愤诗》。',
    events: [
      { year: 195, place: '长安', desc: '被匈奴左部掳走' },
      { year: 207, place: '邺城', desc: '曹操以金璧赎归，文姬归汉' },
    ]
  },
];

/* ---------- 人物关系 ---------- */
const RELATIONS = [
  // 蜀 — year = 关系建立年份，null 表示始终存在（如血缘）
  { source: 'liubei', target: 'guanyu', type: '结义', label: '桃园结义', year: 184 },
  { source: 'liubei', target: 'zhangfei', type: '结义', label: '桃园结义', year: 184 },
  { source: 'liubei', target: 'zhugeliang', type: '君臣', label: '三顾茅庐', year: 207 },
  { source: 'liubei', target: 'zhaoyun', type: '君臣', label: '主从', year: 200 },
  { source: 'liubei', target: 'machao', type: '君臣', label: '归附', year: 214 },
  { source: 'liubei', target: 'huangzhong', type: '君臣', label: '主从', year: 208 },
  { source: 'liubei', target: 'pangtong', type: '君臣', label: '军师', year: 208 },
  { source: 'liubei', target: 'weiyang', type: '君臣', label: '拔擢', year: 211 },
  { source: 'zhugeliang', target: 'jiangwei', type: '师徒', label: '传人', year: 228 },
  { source: 'guanyu', target: 'zhangfei', type: '结义', label: '兄弟', year: 184 },
  { source: 'machao', target: 'caocao', type: '敌对', label: '反曹', year: 211 },
  // 魏
  { source: 'caocao', target: 'caopi', type: '父子', label: '父子', year: null },
  { source: 'caocao', target: 'xiahoudun', type: '亲属', label: '族兄弟', year: null },
  { source: 'caocao', target: 'xiahouyuan', type: '亲属', label: '族兄弟', year: null },
  { source: 'caocao', target: 'zhangliao', type: '君臣', label: '收服', year: 198 },
  { source: 'caocao', target: 'xuchu', type: '君臣', label: '宿卫', year: 197 },
  { source: 'caocao', target: 'xunyu', type: '君臣', label: '首席谋主', year: 191 },
  { source: 'caocao', target: 'guojia', type: '君臣', label: '奇谋', year: 196 },
  { source: 'caocao', target: 'simayi', type: '君臣', label: '拔擢', year: 208 },
  { source: 'caopi', target: 'simayi', type: '君臣', label: '辅政', year: 220 },
  { source: 'simayi', target: 'dengai', type: '同僚', label: '拔擢', year: 240 },
  { source: 'xiahoudun', target: 'xiahouyuan', type: '兄弟', label: '族兄弟', year: null },
  // 吴
  { source: 'sunquan', target: 'zhouyu', type: '君臣', label: '倚重', year: 200 },
  { source: 'sunquan', target: 'lusu', type: '君臣', label: '腹心', year: 200 },
  { source: 'sunquan', target: 'lvmeng', type: '君臣', label: '劝学', year: 210 },
  { source: 'sunquan', target: 'luxun', type: '君臣', label: '拜将', year: 222 },
  { source: 'sunquan', target: 'ganning', type: '君臣', label: '归附', year: 203 },
  { source: 'sunquan', target: 'taishici', type: '君臣', label: '收服', year: 195 },
  { source: 'zhouyu', target: 'lusu', type: '同僚', label: '至交', year: 200 },
  { source: 'lusu', target: 'lvmeng', type: '同僚', label: '推荐', year: 210 },
  { source: 'lvmeng', target: 'luxun', type: '同僚', label: '荐引', year: 219 },
  // 跨阵营 / 群雄
  { source: 'dongzhuo', target: 'lvbu', type: '父子', label: '义父子', year: 189 },
  { source: 'lvbu', target: 'dongzhuo', type: '敌对', label: '弑主', year: 192 },
  { source: 'caocao', target: 'yuanshao', type: '敌对', label: '官渡决战', year: 200 },
  { source: 'caocao', target: 'dongzhuo', type: '敌对', label: '讨董', year: 189 },
  { source: 'caocao', target: 'lvbu', type: '敌对', label: '擒杀', year: 198 },
  { source: 'liubei', target: 'caocao', type: '敌对', label: '争霸', year: 196 },
  { source: 'liubei', target: 'liubiao', type: '亲属', label: '宗亲', year: 201 },
  { source: 'liubei', target: 'sunquan', type: '同僚', label: '赤壁联盟', year: 208 },
  { source: 'guanyu', target: 'lvmeng', type: '敌对', label: '被擒杀', year: 219 },
  { source: 'zhugeliang', target: 'simayi', type: '敌对', label: '北伐对峙', year: 228 },
  { source: 'lvbu', target: 'liubei', type: '敌对', label: '夺徐州', year: 196 },
];

/* ---------- 历史事件 ---------- */
const EVENTS = [
  /* ===== 军事 ===== */
  { id: 'e1', name: '黄巾起义', year: 184, domain: '军事', location: '巨鹿', desc: '张角于巨鹿率太平道信徒起事，波及全国，动摇东汉根基，拉开乱世序幕。', participants: ['liubei','guanyu','zhangfei','caocao','dongzhuo'] },
  { id: 'e3', name: '诸侯讨董', year: 190, domain: '军事', location: '洛阳', desc: '关东诸侯推袁绍为盟主讨伐董卓，董卓焚洛阳挟献帝西迁长安。', participants: ['yuanshao','caocao','liubei','guanyu','zhangfei','dongzhuo'] },
  { id: 'e4', name: '官渡之战', year: 200, domain: '军事', location: '官渡', desc: '曹操以弱胜强，大败袁绍，奠定统一北方的基础。', participants: ['caocao','yuanshao','xunyu','guojia'] },
  { id: 'e6', name: '赤壁之战', year: 208, domain: '军事', location: '赤壁', desc: '孙刘联军以火攻大破曹军，奠定三国鼎立格局。', participants: ['caocao','zhouyu','lusu','zhugeliang','sunquan','liubei','huangzhong'] },
  { id: 'e7', name: '刘备取益州', year: 214, domain: '军事', location: '成都', desc: '刘备军师庞统死后，诸葛亮、张飞、赵云入蜀，迫降刘璋，据有益州。', participants: ['liubei','zhugeliang','pangtong','zhangfei','zhaoyun','machao'] },
  { id: 'e8', name: '汉中之战', year: 219, domain: '军事', location: '汉中', desc: '刘备与曹操争夺汉中，黄忠斩夏侯渊，赵云空营退敌。刘备取胜，进位汉中王。', participants: ['liubei','caocao','huangzhong','zhaoyun','weiyang','xiahouyuan'] },
  { id: 'e9', name: '关羽北伐·失荆州', year: 219, domain: '军事', location: '襄阳', desc: '关羽围樊城、水淹七军、威震华夏。吕蒙白衣渡江袭取荆州，关羽败走麦城遇害。', participants: ['guanyu','lvmeng','sunquan','caocao'] },
  { id: 'e10', name: '夷陵之战', year: 222, domain: '军事', location: '夷陵', desc: '刘备伐吴复仇，陆逊坚守后火攻，烧连营七百里，刘备大败。', participants: ['liubei','luxun','zhaoyun'] },
  { id: 'e11', name: '诸葛亮南征', year: 225, domain: '军事', location: '南中', desc: '诸葛亮南征平叛，七擒孟获，稳定后方。', participants: ['zhugeliang'] },
  { id: 'e12', name: '诸葛亮北伐', year: 228, domain: '军事', location: '祁山', desc: '诸葛亮六出祁山北伐中原，与司马懿长期对峙，均无功而返。', participants: ['zhugeliang','simayi','jiangwei','zhaoyun','weiyang'] },
  { id: 'e15', name: '灭蜀之战', year: 263, domain: '军事', location: '阴平', desc: '司马昭遣钟会、邓艾伐蜀。邓艾偷渡阴平直逼成都，刘禅降，蜀汉亡。', participants: ['dengai','jiangwei'] },

  /* ===== 政治 ===== */
  { id: 'e2', name: '董卓进京', year: 189, domain: '政治', location: '洛阳', desc: '何进召董卓入京诛宦官，事泄身死。董卓趁乱控制朝政，废立皇帝。', participants: ['dongzhuo','caocao','yuanshao'] },
  { id: 'e5', name: '三顾茅庐', year: 207, domain: '政治', location: '隆中', desc: '刘备三访诸葛亮，诸葛亮献《隆中对》，定三分天下之策。', participants: ['liubei','zhugeliang'] },
  { id: 'e16', name: '曹操屯田制', year: 196, domain: '政治', location: '许昌', desc: '曹操采纳枣祗、韩浩建议实行屯田，解决军粮问题，奠定了统一北方的经济基础。', participants: ['caocao'] },
  { id: 'e17', name: '唯才是举令', year: 210, domain: '政治', location: '邺城', desc: '曹操颁布《求贤令》，提出"唯才是举"，打破门第观念，广纳寒门人才。', participants: ['caocao'] },
  { id: 'e18', name: '九品中正制', year: 220, domain: '政治', location: '洛阳', desc: '曹丕采纳陈群建议实行九品中正制，以门第选官，影响中国选官制度四百年。', participants: ['caopi'] },
  { id: 'e14', name: '高平陵之变', year: 249, domain: '政治', location: '洛阳', desc: '司马懿发动政变，诛杀曹爽一族，司马氏专擅魏政。', participants: ['simayi'] },

  /* ===== 文学 ===== */
  { id: 'e19', name: '建安七子', year: 207, domain: '文学', location: '邺城', desc: '孔融、陈琳、王粲、徐干、阮瑀、应玚、刘桢七位文士汇聚曹氏幕府，建安文学鼎盛。', participants: ['caocao','wangcan','kongrong','chenlin','xugan','ruanyu','yingchang','liuzhen'] },
  { id: 'e20', name: '《典论·论文》', year: 217, domain: '文学', location: '邺城', desc: '曹丕著《典论·论文》，提出"文章经国之大业"，开创中国文学批评之先河。', participants: ['caopi'] },
  { id: 'e21', name: '《洛神赋》', year: 223, domain: '文学', location: '洛阳', desc: '曹植作《洛神赋》，描绘洛水神女，辞采华美，为建安文学代表作。', participants: ['caozhi'] },
  { id: 'e22', name: '竹林七贤', year: 247, domain: '文学', location: '山阳', desc: '嵇康、阮籍、山涛、向秀、刘伶、王戎、阮咸七人游于竹林，倡玄学清谈，开魏晋风度。', participants: ['jikang'] },
  { id: 'e23', name: '《广陵散》绝', year: 262, domain: '文学', location: '洛阳', desc: '嵇康临刑抚琴，叹"广陵散于今绝矣"，魏晋名士风骨之绝唱。', participants: ['jikang'] },

  /* ===== 科技 ===== */
  { id: 'e24', name: '麻沸散', year: 200, domain: '科技', location: '许昌', desc: '华佗发明麻沸散，为世界最早全身麻醉外科手术用药，开创外科先河。', participants: ['caocao','huatuo'] },
  { id: 'e25', name: '五禽戏', year: 205, domain: '科技', location: '许昌', desc: '华佗创编五禽戏（虎、鹿、熊、猿、鸟），为中国传统导引养生术之祖。', participants: ['huatuo'] },
  { id: 'e26', name: '《伤寒杂病论》', year: 210, domain: '科技', location: '长沙', desc: '张仲景著成《伤寒杂病论》，确立辨证论治原则，被誉为"医方之祖"。', participants: ['zhangzhongjing'] },
  { id: 'e27', name: '木牛流马', year: 231, domain: '科技', location: '祁山', desc: '诸葛亮发明木牛流马解决蜀道运粮难题，为古代山地运输工具之创举。', participants: ['zhugeliang'] },
  { id: 'e28', name: '元戎连弩', year: 230, domain: '科技', location: '祁山', desc: '诸葛亮改进连弩，可连发十矢，称"元戎弩"，为古代高效远射武器。', participants: ['zhugeliang'] },
  { id: 'e29', name: '马钧水转百戏', year: 235, domain: '科技', location: '洛阳', desc: '机械发明家马钧以水力驱动百戏木偶，并改进织绫机效率五倍、发明翻车（龙骨水车）。', participants: [] },
  { id: 'e30', name: '《九章算术注》', year: 263, domain: '科技', location: '洛阳', desc: '刘徽注《九章算术》，提出割圆术算得圆周率3.1416，为中国古代数学理论奠基。', participants: ['liuhui'] },

  /* ===== 外交 ===== */
  { id: 'e31', name: '遣使辽东', year: 233, domain: '外交', location: '建业', desc: '孙权遣使渡海至辽东联络公孙渊，意图南北夹击曹魏，后公孙渊反复，使臣遇害。', participants: ['sunquan'] },
  { id: 'e32', name: '朱应康泰使南海', year: 245, domain: '外交', location: '建业', desc: '孙权遣朱应、康泰出使南海诸国，远至扶南（柬埔寨），开启海上丝绸之路外交。', participants: ['sunquan'] },

  /* ===== 文化 ===== */
  { id: 'e13', name: '星陨五丈原', year: 234, domain: '文化', location: '五丈原', desc: '诸葛亮最后一次北伐，积劳成疾，病逝于五丈原军中，年54岁。"鞠躬尽瘁，死而后已"。', participants: ['zhugeliang','simayi'] },
  { id: 'e33', name: '佛教东渐', year: 193, domain: '文化', location: '徐州', desc: '笮融在徐州建浮屠寺、造铜佛、举行浴佛会，为佛教在民间大规模传播之始。', participants: [] },

  /* ===== 文化经典（演义故事与民间传说） ===== */
  { id: 'e34', name: '桃园三结义', year: 184, domain: '文化', location: '涿郡', desc: '刘备、关羽、张飞于桃园焚香结为异姓兄弟，誓同生死。此为三国故事开篇，千古义气之典范。', participants: ['liubei','guanyu','zhangfei'] },
  { id: 'e35', name: '温酒斩华雄', year: 190, domain: '文化', location: '洛阳', desc: '关羽自请出战华雄，曹操斟热酒壮行，关羽提头归来时酒尚温。演义经典，关羽武勇之代表。', participants: ['guanyu','caocao'] },
  { id: 'e36', name: '煮酒论英雄', year: 199, domain: '文化', location: '许昌', desc: '曹操邀刘备小亭煮酒，论天下英雄，曰"今天下英雄，唯使君与操耳"。刘备惊落箸，以雷声掩饰。', participants: ['caocao','liubei'] },
  { id: 'e37', name: '千里走单骑', year: 200, domain: '文化', location: '许昌', desc: '关羽得知刘备下落后，挂印封金，护送嫂嫂过五关斩六将，千里寻兄。忠义千秋之典范。', participants: ['guanyu','caocao','liubei'] },
  { id: 'e38', name: '草船借箭', year: 208, domain: '文化', location: '赤壁', desc: '诸葛亮趁大雾以草船逼近曹军水寨，借得十万支箭。智慧与胆识的千古佳话。', participants: ['zhugeliang','zhouyu'] },
  { id: 'e39', name: '空城计', year: 228, domain: '文化', location: '祁山', desc: '马谡失街亭后，司马懿大军逼近西城。诸葛亮城中空虚，大开城门抚琴退敌。演义经典。', participants: ['zhugeliang','simayi'] },
];

/* ---------- 主要河流 ---------- */
const RIVERS = [
  {
    name: '黄河',
    width: 2.5,
    coords: [
      [96, 35], [100, 35.5], [103, 36], [105, 37], [106.5, 38], [108, 39.5],
      [110, 40.5], [111.5, 40.5], [112.5, 39.5], [111.5, 38], [110.5, 37],
      [110, 35.5], [110.3, 34.5], [112, 34.8], [114, 35], [116, 36],
      [118, 36.5], [119.5, 37.8],
    ],
  },
  {
    name: '长江',
    width: 2.5,
    coords: [
      [91, 33], [95, 31], [98, 30], [101, 29], [104, 28.8], [106.5, 29.5],
      [108, 30], [110, 30.2], [112, 30.3], [114.3, 30.6], [116, 30.2],
      [117.5, 30.5], [118.8, 32], [120, 31.8], [121.5, 31.3],
    ],
  },
  {
    name: '淮河',
    width: 1.5,
    coords: [
      [112, 33.2], [114, 33], [116, 32.8], [118, 33], [119.5, 33.5],
    ],
  },
  {
    name: '汉水',
    width: 1.5,
    coords: [
      [107, 33], [108, 32.5], [109.5, 32], [111, 31.5], [112.5, 30.5],
    ],
  },
];

/* ---------- 重要性分级 ---------- */
const PERSON_L1 = new Set(['liubei','caocao','sunquan','zhugeliang','simayi']);
const PERSON_L2 = new Set([
  'guanyu','zhangfei','zhaoyun','machao','huangzhong','pangtong','jiangwei',
  'caopi','xiahoudun','zhangliao','xunyu','guojia','dengai',
  'zhouyu','lusu','lvmeng','luxun','ganning',
  'dongzhuo','lvbu','yuanshao','liubiao','huatuo',
]);
function getPersonImportance(personId) {
  if (PERSON_L1.has(personId)) return 1;
  if (PERSON_L2.has(personId)) return 2;
  return 3;
}

const EVENT_L1 = new Set([
  'e1','e34','e2','e3','e4','e5','e6','e8','e9','e10','e12','e13','e15',
]);
const EVENT_L2 = new Set([
  'e7','e11','e14','e16','e18','e19','e22','e35','e36','e37','e38','e39','e24','e33',
]);
function getEventImportance(eventId) {
  if (EVENT_L1.has(eventId)) return 1;
  if (EVENT_L2.has(eventId)) return 2;
  return 3;
}

/* ---------- 人物地理坐标查找 ---------- */
const BIRTHPLACE_MODERN = {
  '涿郡': '今河北涿州',
  '河东解县': '今山西运城',
  '琅琊阳都': '今山东临沂',
  '常山真定': '今河北正定',
  '扶风茂陵': '今陕西兴平',
  '南阳': '今河南南阳',
  '襄阳': '今湖北襄阳',
  '天水冀县': '今甘肃甘谷',
  '义阳': '今河南信阳',
  '沛国谯县': '今安徽亳州',
  '河内温县': '今河南温县',
  '雁门马邑': '今山西朔州',
  '谯国谯县': '今安徽亳州',
  '颍川颍阴': '今河南许昌',
  '颍川阳翟': '今河南禹州',
  '义阳棘阳': '今河南南阳',
  '吴郡富春': '今浙江富阳',
  '庐江舒县': '今安徽庐江',
  '临淮东城': '今安徽定远',
  '汝南富陂': '今安徽阜南',
  '吴郡吴县': '今江苏苏州',
  '巴郡临江': '今重庆忠县',
  '东莱黄县': '今山东龙口',
  '陇西临洮': '今甘肃岷县',
  '五原郡九原': '今内蒙古包头',
  '汝南汝阳': '今河南商水',
  '山阳高平': '今山东邹城',
  '谯县': '今安徽亳州',
  '南阳涅阳': '今河南邓州',
  '谯国铚县': '今安徽淮北',
  '淄乡': '今山东淄博',
  '鲁国曲阜': '今山东曲阜',
  '广陵射阳': '今江苏淮安',
  '北海': '今山东潍坊',
  '陈留尉氏': '今河南尉氏',
  '汝南': '今河南汝南',
  '东平宁阳': '今山东宁阳',
};

const BIRTHPLACE_COORDS = {
  '谯县': [115.78, 33.85],
  '南阳涅阳': [112.53, 33.00],
  '谯国铚县': [116.23, 33.93],
  '淄乡': [120.38, 36.07],
  '鲁国曲阜': [117.01, 35.59],
  '广陵射阳': [119.55, 33.78],
  '北海': [119.10, 36.70],
  '陈留尉氏': [114.18, 34.41],
  '汝南': [114.35, 33.00],
  '东平宁阳': [116.80, 35.76],
  '涿郡': [115.98, 39.49],
  '河东解县': [111.00, 35.03],
  '琅琊阳都': [118.47, 35.55],
  '常山真定': [114.57, 38.14],
  '扶风茂陵': [108.49, 34.30],
  '南阳': [112.53, 33.00],
  '襄阳': [112.14, 32.04],
  '天水冀县': [105.34, 34.73],
  '义阳': [114.07, 32.13],
  '沛国谯县': [115.78, 33.85],
  '河内温县': [113.07, 34.95],
  '雁门马邑': [112.43, 39.33],
  '谯国谯县': [115.78, 33.85],
  '颍川颍阴': [113.85, 34.04],
  '颍川阳翟': [113.49, 34.16],
  '义阳棘阳': [112.36, 32.52],
  '吴郡富春': [119.95, 30.05],
  '庐江舒县': [117.29, 31.26],
  '临淮东城': [117.68, 32.53],
  '汝南富陂': [115.59, 32.63],
  '吴郡吴县': [120.62, 31.32],
  '巴郡临江': [108.04, 30.30],
  '东莱黄县': [120.51, 37.65],
  '陇西临洮': [103.86, 35.37],
  '五原郡九原': [109.84, 40.66],
  '汝南汝阳': [114.61, 33.33],
  '山阳高平': [116.97, 35.39],
};

const PERSON_IMAGES = {
  liubei:    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Liu_Bei_Tang.jpg/120px-Liu_Bei_Tang.jpg',
  guanyu:    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Guanyu-1.jpg/120px-Guanyu-1.jpg',
  zhugeliang:'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/%E6%98%8E%E4%BA%BA%E7%BB%98_%E3%80%8A%E8%AF%B8%E8%91%9B%E4%BA%AE%E5%83%8F%E3%80%8B%EF%BC%88%E5%8D%97%E8%96%B0%E6%AE%BF%E6%9C%AC%EF%BC%89.jpg/120px-%E6%98%8E%E4%BA%BA%E7%BB%98_%E3%80%8A%E8%AF%B8%E8%91%9B%E4%BA%AE%E5%83%8F%E3%80%8B%EF%BC%88%E5%8D%97%E8%96%B0%E6%AE%BF%E6%9C%AC%EF%BC%89.jpg',
  zhaoyun:   'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/ZhaoYun.jpg/120px-ZhaoYun.jpg',
  machao:    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/MaChao.jpg/120px-MaChao.jpg',
  huangzhong:'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Huang_Zhong_Portrait.jpg/120px-Huang_Zhong_Portrait.jpg',
  pangtong:  'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/PangTong.jpg/120px-PangTong.jpg',
  jiangwei:  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/JiangWei.jpg/120px-JiangWei.jpg',
  caocao:    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Cao_Cao_scth.jpg/120px-Cao_Cao_scth.jpg',
  caopi:     'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Cao_Pi_Tang.jpg/120px-Cao_Pi_Tang.jpg',
  simayi:    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/%E9%AD%8F%C2%B7%E5%A4%AA%E5%82%85_%E5%8F%B8%E9%A6%AC%E6%87%BF.jpg/120px-%E9%AD%8F%C2%B7%E5%A4%AA%E5%82%85_%E5%8F%B8%E9%A6%AC%E6%87%BF.jpg',
  xiahoudun: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Xiahou_Dun_Portrait.jpg/120px-Xiahou_Dun_Portrait.jpg',
  xiahouyuan:'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Xiahou_Yuan_Portrait.jpg/120px-Xiahou_Yuan_Portrait.jpg',
  zhangliao: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Zhang_Liao_Portrait.jpg/120px-Zhang_Liao_Portrait.jpg',
  xuchu:     'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Xu_Chu_Qing_illustration.jpg/120px-Xu_Chu_Qing_illustration.jpg',
  xunyu:     'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Portrait_of_Xun_Yu.jpg/120px-Portrait_of_Xun_Yu.jpg',
  guojia:    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/GuoJia.jpg/120px-GuoJia.jpg',
  dengai:    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Deng_Ai_Qing_portrait.jpg/120px-Deng_Ai_Qing_portrait.jpg',
  sunquan:   'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Sun_Quan_Tang.jpg/120px-Sun_Quan_Tang.jpg',
  zhouyu:    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/ZhouYu.jpg/120px-ZhouYu.jpg',
  lusu:      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/LuSu.jpg/120px-LuSu.jpg',
  ganning:   'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/GanNing.jpg/120px-GanNing.jpg',
  dongzhuo:  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Dong_Zhuo_Qing_Dynasty_Illustration.jpg/120px-Dong_Zhuo_Qing_Dynasty_Illustration.jpg',
  lvbu:      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/L%C3%BC_Bu_Portrait.jpg/120px-L%C3%BC_Bu_Portrait.jpg',
  yuanshao:  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Yuan_Shao_Portrait.jpg/120px-Yuan_Shao_Portrait.jpg',
  liubiao:   'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Liu_Biao_Qing_portait.jpg/120px-Liu_Biao_Qing_portait.jpg',
  huatuo:    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/HuaTuo.jpg/120px-HuaTuo.jpg',
};

/* ---------- 组装数据集 ---------- */
export const sanguoAtlas = {
  id: 'sanguo',
  name: '三国人物志',
  subtitle: '东汉末年 · 三国鼎立（184–280年）',
  era: '184–280',
  startYear: 184,
  endYear: 280,
  mapView: { center: [112, 33], zoom: 6, minZoom: 3, maxZoom: 12 },
  factions: FACTIONS,
  places: PLACES,
  persons: PERSONS,
  relations: RELATIONS,
  events: EVENTS,
  rivers: RIVERS,
  importance: { getPersonImportance, getEventImportance },
  birthplaceModern: BIRTHPLACE_MODERN,
  birthplaceCoords: BIRTHPLACE_COORDS,
  personImages: PERSON_IMAGES,
  timelineTicks: [184, 200, 208, 220, 229, 234, 263, 280],
};
