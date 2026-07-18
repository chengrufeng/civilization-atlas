/* =========================================================================
 * 华夏人物图鉴 · 唐宋人物志 数据集
 *
 * 涵盖唐朝（618–907）与宋朝（960–1279）两个时代。
 * 统一数据模型见 data/index.js 的类型定义。
 * ========================================================================= */

/* ---------- 势力 / 朝代 ---------- */
const FACTIONS = [
  { id: 'tang', name: '大唐', color: '#b23a2e', founded: 618, capital: '长安', capitalFrom: 618, desc: '李渊代隋而立，定都长安。大唐气象开放，兼容并蓄，国力强盛、文化辉煌，是中国古代鼎盛之朝。' },
  { id: 'song', name: '大宋', color: '#2f5d8a', founded: 960, capital: '开封', capitalFrom: 960, desc: '赵匡胤陈桥兵变代后周而立，定都开封。宋重文抑武，经济繁荣、文化登峰，科技领先世界，然军力积弱。' },
  { id: 'wudai', name: '五代十国', color: '#8a6d3b', founded: 907, capital: '开封', capitalFrom: 907, desc: '唐宋之间五十余年分裂动荡，梁唐晋汉周递嬗，十国割据南方。乱世终结于赵匡胤。' },
  { id: 'other', name: '周边政权', color: '#7b4b94', founded: 618, capital: '—', capitalFrom: 618, desc: '吐蕃、回鹘、南诏、大理、辽、西夏、金等，与唐宋并立的周边民族政权。' },
];

/* ---------- 地点 ---------- */
const PLACES = [
  /* 唐宋都城与核心城市 */
  { id: 'changan', name: '长安', modern: '陕西西安', coord: [108.95, 34.27], note: '唐都，当时世界最大都市，百万人口。' },
  { id: 'luoyang', name: '洛阳', modern: '河南洛阳', coord: [112.45, 34.62], note: '唐东都，武周时改称神都。' },
  { id: 'kaifeng', name: '开封', modern: '河南开封', coord: [114.31, 34.79], note: '北宋都城，又称东京汴梁。' },
  { id: 'linan', name: '临安', modern: '浙江杭州', coord: [120.16, 30.27], note: '南宋行在，南渡后的实际首都。' },
  { id: 'yongan', name: '扬州', modern: '江苏扬州', coord: [119.42, 32.39], note: '唐时东南第一大都会，"扬一益二"。' },
  { id: 'chengdu', name: '成都', modern: '四川成都', coord: [104.07, 30.67], note: '益州治所，唐时号为"锦城"，造纸中心。' },
  { id: 'jiangling', name: '江陵', modern: '湖北荆州', coord: [112.24, 30.33], note: '荆南节度使治所，长江中游重镇。' },

  /* 北方军事重镇 */
  { id: 'youzhou', name: '幽州', modern: '北京', coord: [116.40, 39.90], note: '北方军事重镇，安史之乱策源地。' },
  { id: 'shuofang', name: '朔方', modern: '宁夏灵武', coord: [106.24, 38.10], note: '西北边防，郭子仪朔方军驻地。' },
  { id: 'yangyuanguan', name: '阳关', modern: '甘肃敦煌', coord: [94.10, 40.10], note: '丝路南道要隘，西出阳关无故人。' },
  { id: 'yumen', name: '玉门关', modern: '甘肃敦煌西', coord: [93.87, 40.35], note: '丝路北道要隘，春风不度玉门关。' },
  { id: 'liangzhou', name: '凉州', modern: '甘肃武威', coord: [102.64, 37.93], note: '河西走廊门户，丝路重镇。' },
  { id: 'shazhou', name: '沙州', modern: '甘肃敦煌', coord: [94.66, 40.14], note: '敦煌莫高窟所在，西陲佛教艺术中心。' },
  { id: 'tingzhou', name: '庭州', modern: '新疆吉木萨尔', coord: [87.20, 44.00], note: '北庭都护府治所。' },
  { id: 'anxi', name: '安西', modern: '新疆库车', coord: [82.97, 41.72], note: '安西都护府治所，辖西域四镇。' },
  { id: 'qinghai', name: '青海', modern: '青海湖', coord: [100.20, 36.40], note: '吐谷浑故地，唐蕃交锋前线。' },
  { id: 'dabie', name: '大非川', modern: '青海共和', coord: [100.60, 36.20], note: '唐蕃之战，薛仁贵败绩之地。' },

  /* 南方与江南 */
  { id: 'jinling', name: '金陵', modern: '江苏南京', coord: [118.78, 32.06], note: '南唐都城，江南文化重镇。' },
  { id: 'suzhou', name: '苏州', modern: '江苏苏州', coord: [120.62, 31.32], note: '江南水乡，"上有天堂下有苏杭"。' },
  { id: 'quanzhou', name: '泉州', modern: '福建泉州', coord: [118.59, 24.87], note: '宋元东方第一大港，海上丝路起点。' },
  { id: 'guangzhou', name: '广州', modern: '广东广州', coord: [113.26, 23.13], note: '唐宋外贸大港，市舶司所在。' },
  { id: 'mingzhou', name: '明州', modern: '浙江宁波', coord: [121.55, 29.87], note: '宋代海贸重镇，与日本高丽通商。' },
  { id: 'yuezhou', name: '越州', modern: '浙江绍兴', coord: [120.58, 30.03], note: '南宋初高宗驻跸处。' },

  /* 宋代军事要地 */
  { id: 'yuefei_zhelu', name: '郾城', modern: '河南漯河', coord: [113.99, 33.58], note: '岳飞郾城大捷，破金兀术铁浮屠。' },
  { id: 'zhuxianzhen', name: '朱仙镇', modern: '河南开封南', coord: [114.20, 34.60], note: '岳飞北伐最远抵达地，十二金牌召回。' },
  { id: 'caishiluo', name: '采石', modern: '安徽马鞍山', coord: [118.50, 31.70], note: '虞允文采石矶之战，败完颜亮渡江。' },
  { id: 'yueyang', name: '岳阳', modern: '湖南岳阳', coord: [113.13, 29.37], note: '范仲淹《岳阳楼记》所写之地。' },
  { id: 'dengzhou', name: '登州', modern: '山东蓬莱', coord: [120.75, 37.81], note: '北宋海防前哨。' },
  { id: 'jingkou', name: '京口', modern: '江苏镇江', coord: [119.45, 32.20], note: '长江下游渡口，南北要冲。' },
  { id: 'xiangyang', name: '襄阳', modern: '湖北襄阳', coord: [112.14, 32.04], note: '宋元对峙前线，后为元所破。' },

  /* 唐代藩镇与叛乱地点 */
  { id: 'fanyang', name: '范阳', modern: '北京西南', coord: [116.30, 39.70], note: '安禄山老巢，节度使治所。' },
  { id: 'weizhou', name: '魏州', modern: '河北大名', coord: [115.15, 36.10], note: '河朔三镇之一，藩镇割据重地。' },
  { id: 'suizhou_lingshu', name: '灵州', modern: '宁夏灵武', coord: [106.24, 38.10], note: '朔方节度使治所，肃宗即位之地。' },
  { id: 'malingdao', name: '马嵬驿', modern: '陕西兴平', coord: [108.49, 34.30], note: '杨贵妃赐死之地。' },

  /* 其他 */
  { id: 'changchun', name: '黄龙府', modern: '吉林农安', coord: [125.18, 44.44], note: '岳飞誓言"直捣黄龙"。' },
  { id: 'shangjing_liao', name: '上京', modern: '内蒙古巴林左旗', coord: [119.36, 43.98], note: '辽国都城。' },
  { id: 'zhongdu', name: '中都', modern: '北京', coord: [116.40, 39.90], note: '金国都城，完颜亮迁都于此。' },
  { id: 'xingqing', name: '兴庆', modern: '宁夏银川', coord: [106.23, 38.49], note: '西夏都城。' },
  { id: 'luoxue_luo', name: '逻些', modern: '西藏拉萨', coord: [91.13, 29.65], note: '吐蕃都城。' },
  { id: 'dali', name: '大理', modern: '云南大理', coord: [100.23, 25.69], note: '大理国都城。' },
  { id: 'qinzhou', name: '钦州', modern: '广西钦州', coord: [108.62, 21.95], note: '南方边陲。' },
  { id: 'yongzhou', name: '永州', modern: '湖南永州', coord: [111.61, 26.42], note: '柳宗元谪居地。' },
  { id: 'jiangzhou_xun', name: '江州', modern: '江西九江', coord: [115.97, 29.71], note: '白居易谪居地，"江州司马青衫湿"。' },
  { id: 'huangzhou', name: '黄州', modern: '湖北黄冈', coord: [114.87, 30.45], note: '苏轼贬谪地，写前后《赤壁赋》。' },
  { id: 'dan_ertoy', name: '儋州', modern: '海南儋州', coord: [109.58, 19.52], note: '苏轼晚年贬谪极边。' },
  { id: 'chaozhou', name: '潮州', modern: '广东潮州', coord: [116.62, 23.66], note: '韩愈贬谪地。' },
  { id: 'yichang', name: '夷陵', modern: '湖北宜昌', coord: [111.29, 30.70], note: '欧阳修贬谪地。' },
  { id: 'xianyou', name: '仙游', modern: '福建仙游', coord: [118.70, 25.36], note: '蔡襄故里。' },
  { id: 'mianchi_yi', name: '渑池', modern: '河南渑池', coord: [111.76, 34.77], note: '苏辙"怀渑池"诗中之地。' },
  { id: 'tao_zhou', name: '洮州', modern: '甘肃临潭', coord: [103.52, 34.70], note: '王韶拓边之地。' },

  /* 补充事件地点 */
  { id: 'yinshan', name: '阴山', modern: '内蒙古阴山', coord: [108.50, 41.00], note: '李靖破东突厥之地。' },
  { id: 'taiyuan', name: '太原', modern: '山西太原', coord: [112.55, 37.87], note: '北汉都城，宋灭北汉之地。' },
  { id: 'chanzhou', name: '澶州', modern: '河南濮阳', coord: [115.03, 35.76], note: '澶渊之盟签订地。' },
  { id: 'yashan', name: '崖山', modern: '广东新会', coord: [113.10, 22.20], note: '南宋亡国之地。' },
  { id: 'shangrao', name: '上饶', modern: '江西上饶', coord: [117.97, 28.45], note: '辛弃疾稼轩所在。' },
  { id: 'runzhou', name: '润州', modern: '江苏镇江', coord: [119.45, 32.20], note: '沈括梦溪园所在。' },
  { id: 'pingyuan', name: '平原', modern: '山东平原', coord: [116.43, 37.16], note: '颜真卿起兵之地。' },
  { id: 'lushan', name: '庐山', modern: '江西庐山', coord: [116.00, 29.55], note: '白鹿洞书院所在。' },
  { id: 'dengzhou_nanyang', name: '邓州', modern: '河南邓州', coord: [112.08, 32.68], note: '范仲淹贬所，写《岳阳楼记》。' },
  { id: 'songjiang', name: '松江', modern: '上海松江', coord: [121.23, 31.03], note: '黄道婆故里。' },
  { id: 'caizhou', name: '蔡州', modern: '河南汝南', coord: [114.36, 33.00], note: '颜真卿、韩愈相关。' },
  { id: 'yangshan', name: '阳山', modern: '广东阳山', coord: [112.65, 24.50], note: '韩愈贬阳山令之地。' },

  /* 人物轨迹补充地点 */
  { id: 'liaodong', name: '辽东', modern: '辽宁辽阳', coord: [123.17, 41.27], note: '太宗征高句丽之地。' },
  { id: 'leiyang', name: '耒阳', modern: '湖南耒阳', coord: [112.87, 26.42], note: '杜甫病逝之地。' },
  { id: 'lantian', name: '蓝田', modern: '陕西蓝田', coord: [109.32, 34.15], note: '王维辋川别业所在。' },
  { id: 'hangzhou', name: '杭州', modern: '浙江杭州', coord: [120.16, 30.27], note: '白居易任刺史之地。' },
  { id: 'liuzhou', name: '柳州', modern: '广西柳州', coord: [109.43, 24.33], note: '柳宗元贬所。' },
  { id: 'langzhou', name: '朗州', modern: '湖南常德', coord: [111.69, 29.04], note: '刘禹锡贬所。' },
  { id: 'lianzhou', name: '连州', modern: '广东连州', coord: [112.37, 24.78], note: '刘禹锡贬所。' },
  { id: 'nailiang', name: '奈良', modern: '日本奈良', coord: [135.83, 34.68], note: '鉴真东渡目的地。' },
  { id: 'huizhou', name: '惠州', modern: '广东惠州', coord: [114.42, 23.11], note: '苏轼贬所。' },
  { id: 'changzhou', name: '常州', modern: '江苏常州', coord: [119.97, 31.78], note: '苏轼病逝之地。' },
  { id: 'leizhou', name: '雷州', modern: '广东雷州', coord: [110.10, 20.91], note: '苏辙贬所。' },
  { id: 'xuzhou_song', name: '许州', modern: '河南许昌', coord: [113.85, 34.04], note: '苏辙卒地。' },
  { id: 'yingzhou', name: '颍州', modern: '安徽阜阳', coord: [115.82, 32.89], note: '欧阳修退居之地。' },
  { id: 'yanan', name: '延安', modern: '陕西延安', coord: [109.49, 36.62], note: '范仲淹经略陕西之地。' },
  { id: 'xuzhou_xu', name: '徐州', modern: '江苏徐州', coord: [117.28, 34.21], note: '范仲淹卒地。' },
  { id: 'tangyin', name: '汤阴', modern: '河南汤阴', coord: [114.36, 35.92], note: '岳飞故里。' },
  { id: 'ganzhou', name: '赣州', modern: '江西赣州', coord: [114.93, 25.83], note: '文天祥起兵勤王之地。' },
  { id: 'haifeng', name: '海丰', modern: '广东海丰', coord: [115.30, 22.97], note: '文天祥被俘之地。' },
  { id: 'dadu', name: '大都', modern: '北京', coord: [116.40, 39.90], note: '元都，文天祥就义之地。' },
  { id: 'shaoxing', name: '绍兴', modern: '浙江绍兴', coord: [120.58, 30.03], note: '辛弃疾晚年任职之地。' },
  { id: 'qianshan', name: '铅山', modern: '江西铅山', coord: [117.70, 28.30], note: '辛弃疾卒地。' },
  { id: 'jiankang', name: '建康', modern: '江苏南京', coord: [118.78, 32.06], note: '李清照南渡之地。' },
  { id: 'kuizhou', name: '夔州', modern: '重庆奉节', coord: [109.46, 31.05], note: '陆游任通判之地。' },
  { id: 'nanzheng', name: '南郑', modern: '陕西汉中', coord: [106.94, 33.07], note: '陆游从军之地。' },
  { id: 'shanyin', name: '山阴', modern: '浙江绍兴', coord: [120.58, 30.03], note: '陆游故里，卒地。' },
  { id: 'liaoshangjing', name: '辽上京', modern: '内蒙古巴林左旗', coord: [119.36, 43.98], note: '沈括使辽议界之地。' },
  { id: 'jianyang', name: '建阳', modern: '福建建阳', coord: [117.97, 27.33], note: '朱熹讲学考亭之地。' },
  { id: 'changsha', name: '长沙', modern: '湖南长沙', coord: [112.94, 28.23], note: '朱熹知潭州之地。' },
  { id: 'yazhou_hai', name: '崖州', modern: '海南三亚', coord: [109.50, 18.30], note: '黄道婆流落之地。' },
  { id: 'jiangning', name: '江宁', modern: '江苏南京', coord: [118.78, 32.06], note: '王安石退居、李清照南渡之地。' },
  { id: 'jinan', name: '济南', modern: '山东济南', coord: [117.00, 36.65], note: '辛弃疾、李清照故里。' },
  { id: 'dangtu', name: '当涂', modern: '安徽马鞍山', coord: [118.50, 31.55], note: '李白卒地' },
  { id: 'qizhou', name: '蕲州', modern: '湖北蕲春', coord: [115.43, 30.22], note: '毕昇故里' },
];

/* ---------- 人物 ---------- */
const PERSONS = [
  /* ===== 大唐 ===== */
  { id: 'liyuan', name: '李渊', courtesy: '叔德', alias: ['唐高祖'], faction: 'tang', birth: 566, death: 635, birthPlace: '长安', title: '唐高祖', roles: ['大唐开国皇帝'], avatar: '渊',
    bio: '北周贵族出身，袭封唐国公。隋末太原起兵，攻入长安，立代王侑为帝，次年受禅称帝，建唐朝。在位九年后由世民发动玄武门之变，被迫退位为太上皇。',
    events: [
      { year: 617, place: '长安', desc: '太原起兵，攻入长安，立代王侑' },
      { year: 618, place: '长安', desc: '受禅称帝，国号唐' },
      { year: 626, place: '长安', desc: '玄武门之变后退位为太上皇' },
    ]
  },
  { id: 'lishimin', name: '李世民', courtesy: '世民', alias: ['唐太宗','天可汗'], faction: 'tang', birth: 598, death: 649, birthPlace: '长安', title: '唐太宗', roles: ['皇帝','政治家','军事家'], avatar: '民',
    bio: '李渊次子。助父建唐，平定群雄。发动玄武门之变杀兄建成、弟元吉，即帝位。在位期间开创"贞观之治"，纳谏如流，四夷宾服，被尊"天可汗"，为中国史上最著名明君之一。',
    events: [
      { year: 618, place: '长安', desc: '唐朝建立，封秦王' },
      { year: 621, place: '洛阳', desc: '虎牢关之战，擒窦建德、降王世充' },
      { year: 626, place: '长安', desc: '玄武门之变，即帝位' },
      { year: 627, place: '长安', desc: '改元贞观，始贞观之治' },
      { year: 630, place: '阴山', desc: '李靖破突厥，四夷尊为天可汗' },
      { year: 641, place: '青海', desc: '文成公主入藏嫁松赞干布' },
      { year: 645, place: '辽东', desc: '亲征高句丽' },
      { year: 649, place: '长安', desc: '病逝' },
    ]
  },
  { id: 'weizheng', name: '魏徵', courtesy: '玄成', alias: ['魏征'], faction: 'tang', birth: 580, death: 643, birthPlace: '巨鹿', title: '谏议大夫·郑国公', roles: ['名臣','诤臣'], avatar: '徵',
    bio: '初为太子建成洗马，玄武门之变后归顺世民。以直言敢谏著称，先后陈谏二百余事，"兼听则明，偏信则暗"为其名言。卒后太宗叹"以人为镜，可明得失"。',
    events: [
      { year: 627, place: '长安', desc: '授谏议大夫，始入太宗幕' },
      { year: 637, place: '长安', desc: '上《十思疏》陈谏' },
      { year: 643, place: '长安', desc: '病逝，太宗废朝五日' },
    ]
  },
  { id: 'fangxuanling', name: '房玄龄', courtesy: '玄龄', alias: ['房乔'], faction: 'tang', birth: 579, death: 648, birthPlace: '齐州', title: '尚书左仆射·梁国公', roles: ['名相'], avatar: '房',
    bio: '十八岁举进士。世民幕僚，参谋军政。贞观元年为中书令，后任尚书左仆射，监修国史。与杜如晦并称"房谋杜断"，共掌朝政，奠定贞观之治格局。',
    events: [
      { year: 626, place: '长安', desc: '玄武门之变主谋之一' },
      { year: 629, place: '长安', desc: '任尚书左仆射，综理朝政' },
      { year: 648, place: '长安', desc: '病逝' },
    ]
  },
  { id: 'duzhuanzhuan', name: '杜如晦', courtesy: '克明', alias: [], faction: 'tang', birth: 585, death: 630, birthPlace: '京兆杜陵', title: '尚书右仆射·蔡国公', roles: ['名相'], avatar: '杜',
    bio: '世民幕僚，与房玄龄共掌朝政。果决明断，与房并称"房谋杜断"。贞观三年任尚书右仆射，与房共定制度，惜早逝。',
    events: [
      { year: 626, place: '长安', desc: '玄武门之变主谋之一' },
      { year: 629, place: '长安', desc: '任尚书右仆射' },
      { year: 630, place: '长安', desc: '病逝' },
    ]
  },
  { id: 'lijing', name: '李靖', courtesy: '药师', alias: ['李卫公'], faction: 'tang', birth: 571, death: 649, birthPlace: '京兆三原', title: '尚书右仆射·卫国公', roles: ['名将','军事家'], avatar: '靖',
    bio: '初仕隋，归唐后战功赫赫。灭萧铣、平辅公祏，贞观四年以三千骑夜袭定襄，破东突厥，擒颉利可汗。后吐谷浑之役再立大功。著《李卫公问对》，列武庙十哲。',
    events: [
      { year: 621, place: '江陵', desc: '灭萧铣' },
      { year: 630, place: '阴山', desc: '破东突厥，擒颉利可汗' },
      { year: 635, place: '青海', desc: '破吐谷浑' },
      { year: 649, place: '长安', desc: '病逝' },
    ]
  },
  { id: 'wuzetian', name: '武则天', courtesy: '曌', alias: ['武后','武媚娘'], faction: 'tang', birth: 624, death: 705, birthPlace: '并州文水', title: '武周圣神皇帝', roles: ['皇帝','政治家'], avatar: '武',
    bio: '初为太宗才人，高宗立为皇后，称"二圣"临朝。后废中宗、睿宗，690年称帝，国号周，是中国历史上唯一正统女皇帝。在位期间以科举取士，贬抑关陇门阀，国力续盛。',
    events: [
      { year: 655, place: '长安', desc: '立为皇后' },
      { year: 683, place: '洛阳', desc: '高宗崩，临朝称制' },
      { year: 690, place: '洛阳', desc: '称帝，国号周' },
      { year: 705, place: '洛阳', desc: '神龙政变，被迫退位' },
    ]
  },
  { id: 'libai', name: '李白', courtesy: '太白', alias: ['青莲居士','谪仙人'], faction: 'tang', birth: 701, death: 762, birthPlace: '碎叶城', title: '翰林供奉', roles: ['诗人'], avatar: '白',
    bio: '生于碎叶（今吉尔吉斯斯坦），五岁随父迁蜀。喜纵横剑术，好神仙。仗剑去国辞亲远游，42岁奉诏入京为翰林供奉，不久遭谗赐金放还。安史之乱中入永王幕，永王败，流夜郎遇赦。"诗仙"之名冠绝古今。',
    events: [
      { year: 725, place: '江陵', desc: '仗剑去国辞亲远游' },
      { year: 742, place: '长安', desc: '奉诏入京，翰林供奉' },
      { year: 744, place: '洛阳', desc: '赐金放还，与杜甫相识' },
      { year: 756, place: '江陵', desc: '入永王幕，后流夜郎' },
      { year: 762, place: '当涂', desc: '病逝' },
    ]
  },
  { id: 'dufu', name: '杜甫', courtesy: '子美', alias: ['少陵野老','杜工部'], faction: 'tang', birth: 712, death: 770, birthPlace: '巩县', title: '检校工部员外郎', roles: ['诗人'], avatar: '甫',
    bio: '杜审言之孙。少贫，举进士不第。与李白同游齐赵。安史之乱中流离，一度陷贼，脱身后任左拾遗。后弃官入蜀，依严武，结草堂于成都。大历中客死耒阳。"诗圣"，诗号"诗史"。',
    events: [
      { year: 744, place: '洛阳', desc: '与李白相识，同游齐赵' },
      { year: 755, place: '长安', desc: '安史之乱起，流离颠沛' },
      { year: 757, place: '长安', desc: '脱贼至凤翔，任左拾遗' },
      { year: 759, place: '成都', desc: '入蜀依严武，建浣花溪草堂' },
      { year: 770, place: '耒阳', desc: '病逝于湘江舟中' },
    ]
  },
  { id: 'wangwei', name: '王维', courtesy: '摩诘', alias: ['王右丞','诗佛'], faction: 'tang', birth: 701, death: 761, birthPlace: '蒲州', title: '尚书右丞', roles: ['诗人','画家','音乐家'], avatar: '维',
    bio: '开元九年进士，通音律、善书画。安史之乱中为贼所俘，授伪职，乱后以诗获免。晚年居蓝田辋川，诗画参禅，开山水诗画一派。苏轼称"诗中有画，画中有诗"。',
    events: [
      { year: 721, place: '长安', desc: '中进士，授太乐丞' },
      { year: 756, place: '长安', desc: '安史之乱陷贼，授伪职' },
      { year: 758, place: '长安', desc: '乱后定罪，以诗获免' },
      { year: 761, place: '蓝田', desc: '卒于辋川别业' },
    ]
  },
  { id: 'baijiuyi', name: '白居易', courtesy: '乐天', alias: ['香山居士','白傅'], faction: 'tang', birth: 772, death: 846, birthPlace: '新郑', title: '杭州刺史·苏州刺史', roles: ['诗人','官员'], avatar: '易',
    bio: '贞元进士，元和间任翰林学士、左拾遗。因上言请捕刺武元衡之贼，贬江州司马。后历任杭、苏二州刺史，政绩斐然。晚年居洛阳香山。倡导新乐府运动，"文章合为时而著"。',
    events: [
      { year: 800, place: '长安', desc: '中进士' },
      { year: 815, place: '江州', desc: '贬江州司马，作《琵琶行》' },
      { year: 822, place: '杭州', desc: '任杭州刺史，疏六井' },
      { year: 825, place: '苏州', desc: '任苏州刺史' },
      { year: 846, place: '洛阳', desc: '卒于香山' },
    ]
  },
  { id: 'hanyu', name: '韩愈', courtesy: '退之', alias: ['韩昌黎','文公'], faction: 'tang', birth: 768, death: 824, birthPlace: '河内', title: '吏部侍郎', roles: ['文学家','思想家','官员'], avatar: '愈',
    bio: '贞元进士。任监察御史时上《御史台上论天旱人饥状》贬阳山令。元和间从裴度平淮西，谏迎佛骨贬潮州。卒谥文公。倡古文运动，"文以载道"，列唐宋八大家之首。',
    events: [
      { year: 792, place: '长安', desc: '中进士' },
      { year: 803, place: '阳山', desc: '贬阳山令' },
      { year: 817, place: '蔡州', desc: '从裴度平淮西，作《平淮西碑》' },
      { year: 819, place: '潮州', desc: '谏迎佛骨，贬潮州刺史' },
      { year: 824, place: '长安', desc: '病逝' },
    ]
  },
  { id: 'liuzongyuan', name: '柳宗元', courtesy: '子厚', alias: ['柳河东','柳柳州'], faction: 'tang', birth: 773, death: 819, birthPlace: '长安', title: '柳州刺史', roles: ['文学家','思想家'], avatar: '柳',
    bio: '贞元进士，与刘禹锡同为王叔文集团核心，参与永贞革新。败后贬永州司马十年，后迁柳州刺史。著《天说》《封建论》，倡古文，写《永州八记》。唐宋八大家之一。',
    events: [
      { year: 805, place: '永州', desc: '永贞革新败，贬永州司马' },
      { year: 815, place: '柳州', desc: '迁柳州刺史' },
      { year: 819, place: '柳州', desc: '卒于任' },
    ]
  },
  { id: 'liuyuxi', name: '刘禹锡', courtesy: '梦得', alias: ['刘宾客'], faction: 'tang', birth: 772, death: 842, birthPlace: '洛阳', title: '太子宾客', roles: ['文学家','哲学家'], avatar: '禹',
    bio: '永贞革新核心成员，败后贬朗州司马。召还后因诗"玄都观里桃千树"触怒权贵，再贬连州。后历任夔州、和州刺史。"沉舟侧畔千帆过，病树前头万木春"为其名句。',
    events: [
      { year: 805, place: '朗州', desc: '永贞革新败，贬朗州司马' },
      { year: 815, place: '连州', desc: '召还后再贬连州' },
      { year: 842, place: '洛阳', desc: '卒' },
    ]
  },
  { id: 'guo_ziyi', name: '郭子仪', courtesy: '子仪', alias: ['郭令公','汾阳王'], faction: 'tang', birth: 697, death: 781, birthPlace: '华州郑县', title: '汾阳郡王·太尉', roles: ['名将','政治家'], avatar: '郭',
    bio: '武举出身。安史之乱中以朔方节度使收复两京，功第一。后屡平叛乱，吐蕃入寇时再出镇。八子七婿皆为显贵，寿至八十五，封汾阳王。"功高震主而主不疑"。',
    events: [
      { year: 756, place: '朔方', desc: '任朔方节度使，平乱' },
      { year: 757, place: '长安', desc: '收复长安' },
      { year: 763, place: '长安', desc: '吐蕃入寇，再起镇之' },
      { year: 781, place: '长安', desc: '病逝，年85' },
    ]
  },
  { id: 'an_lushan', name: '安禄山', courtesy: '—', alias: [], faction: 'other', birth: 703, death: 757, birthPlace: '营州', title: '范阳节度使·燕帝', roles: ['叛将'], avatar: '禄',
    bio: '胡人出身，通六蕃语。以骁勇得玄宗宠信，身兼三镇节度使，拥兵十五万。755年起兵反唐，陷两京，建国号燕。后为其子庆绪所杀。',
    events: [
      { year: 742, place: '范阳', desc: '任平卢节度使' },
      { year: 751, place: '范阳', desc: '兼三镇节度使' },
      { year: 755, place: '范阳', desc: '起兵反唐，安史之乱始' },
      { year: 756, place: '洛阳', desc: '称帝，国号燕' },
      { year: 757, place: '洛阳', desc: '为子庆绪所杀' },
    ]
  },
  { id: 'shisiming', name: '史思明', courtesy: '—', alias: [], faction: 'other', birth: 703, death: 761, birthPlace: '营州', title: '范阳节度使·燕帝', roles: ['叛将'], avatar: '史',
    bio: '安禄山旧部，与禄山同起兵。禄山死后降唐，复叛，称燕帝。为其子朝义所杀。',
    events: [
      { year: 755, place: '范阳', desc: '从安禄山反' },
      { year: 757, place: '范阳', desc: '降唐，复叛' },
      { year: 759, place: '魏州', desc: '称帝' },
      { year: 761, place: '洛阳', desc: '为子朝义所杀' },
    ]
  },
  { id: 'gaoshilun', name: '高适', courtesy: '达夫', alias: ['高常侍'], faction: 'tang', birth: 704, death: 765, birthPlace: '沧州', title: '散骑常侍·渤海县侯', roles: ['诗人','官员'], avatar: '适',
    bio: '半生潦倒，五十始入仕。安史之乱中从肃宗，授淮南节度使。后任蜀州刺史、彭州刺史，与严武、杜甫交好。与岑参并称"高岑"，为盛唐边塞诗代表。',
    events: [
      { year: 756, place: '扬州', desc: '任淮南节度使，讨永王' },
      { year: 764, place: '成都', desc: '任剑南节度使' },
      { year: 765, place: '长安', desc: '病逝' },
    ]
  },
  { id: 'cen_shen', name: '岑参', courtesy: '—', alias: [], faction: 'tang', birth: 715, death: 770, birthPlace: '江陵', title: '嘉州刺史', roles: ['诗人'], avatar: '岑',
    bio: '天宝进士。两度出塞，在安西、北庭幕府数年，写边塞风光雄奇壮丽。"忽如一夜春风来，千树万树梨花开"为其名句。与高适并称"高岑"。',
    events: [
      { year: 749, place: '安西', desc: '赴安西节度使幕' },
      { year: 754, place: '庭州', desc: '赴北庭节度使幕' },
      { year: 770, place: '成都', desc: '卒于客舍' },
    ]
  },
  { id: 'shangguan_waner', name: '上官婉儿', courtesy: '—', alias: ['上官昭容'], faction: 'tang', birth: 664, death: 710, birthPlace: '陇西', title: '昭容', roles: ['才女','女官'], avatar: '婉',
    bio: '上官仪孙女。仪被诛，婉儿没入掖庭，以文才为武后所用，掌诏命。中宗时封昭容，主持风雅。韦后乱时为李隆基所诛。',
    events: [
      { year: 677, place: '长安', desc: '入掖庭为奴' },
      { year: 696, place: '洛阳', desc: '武后命掌诏命' },
      { year: 710, place: '长安', desc: '唐隆政变，为李隆基诛' },
    ]
  },
  { id: 'yan_zhenqing', name: '颜真卿', courtesy: '清臣', alias: ['颜鲁公'], faction: 'tang', birth: 709, death: 785, birthPlace: '京兆万年', title: '太子太师', roles: ['书法家','名臣'], avatar: '颜',
    bio: '开元进士。安史之乱中起兵讨贼，河北十七郡同日归之。德宗时李希烈叛，奉使宣谕，为希烈缢杀。书法雄浑，创"颜体"，与柳公权并称"颜筋柳骨"。',
    events: [
      { year: 756, place: '平原', desc: '起兵讨安禄山' },
      { year: 784, place: '蔡州', desc: '奉使李希烈，被留' },
      { year: 785, place: '蔡州', desc: '为希烈缢杀' },
    ]
  },
  { id: 'liu_gongquan', name: '柳公权', courtesy: '诚悬', alias: [], faction: 'tang', birth: 778, death: 865, birthPlace: '京兆华原', title: '太子少师', roles: ['书法家'], avatar: '柳',
    bio: '元和进士。历仕七朝，以书名世。"心正则笔正"为其名言。书法遒劲，创"柳体"，与颜真卿并称"颜筋柳骨"。',
    events: [
      { year: 808, place: '长安', desc: '中进士' },
      { year: 865, place: '长安', desc: '卒，年88' },
    ]
  },
  { id: 'wu_daozi', name: '吴道子', courtesy: '道子', alias: ['画圣'], faction: 'tang', birth: 680, death: 759, birthPlace: '阳翟', title: '内教博士', roles: ['画家'], avatar: '吴',
    bio: '少贫，学书不成，转而学画。玄宗召入禁中。善画佛道人物，笔势圆转，衣袂飘举，称"吴带当风"。苏轼谓"画至吴道子，天下之能事毕矣"。',
    events: [
      { year: 742, place: '洛阳', desc: '于天宫寺画壁画' },
      { year: 759, place: '长安', desc: '卒' },
    ]
  },
  { id: 'xuan_zang', name: '玄奘', courtesy: '—', alias: ['三藏法师','唐僧'], faction: 'tang', birth: 602, death: 664, birthPlace: '洛州缑氏', title: '大慈恩寺住持', roles: ['高僧','翻译家','旅行家'], avatar: '奘',
    bio: '13岁出家。贞观元年西行求法，历十七年，经西域至天竺，在那烂陀寺从戒贤学。归国后译经75部1335卷，著《大唐西域记》。法相宗创始人。',
    events: [
      { year: 627, place: '长安', desc: '西行求法' },
      { year: 645, place: '长安', desc: '归国，携佛经657部' },
      { year: 648, place: '长安', desc: '任大慈恩寺住持，始译经' },
      { year: 664, place: '长安', desc: '圆寂' },
    ]
  },
  { id: 'jian_zhen', name: '鉴真', courtesy: '—', alias: [], faction: 'tang', birth: 688, death: 763, birthPlace: '扬州', title: '大唐寺大和尚', roles: ['高僧','律宗'], avatar: '鉴',
    bio: '扬州大明寺住持，律宗高僧。五次东渡日本未果，双目失明，第六次成功。在日本建唐招提寺，传律宗，对日本佛教、建筑、医药影响深远。',
    events: [
      { year: 742, place: '扬州', desc: '应日僧之请，始谋东渡' },
      { year: 748, place: '明州', desc: '五次东渡失败' },
      { year: 753, place: '明州', desc: '六次东渡，双目失明仍成行' },
      { year: 754, place: '奈良', desc: '至日本，传律宗' },
      { year: 763, place: '奈良', desc: '圆寂' },
    ]
  },
  { id: 'songzan', name: '松赞干布', courtesy: '—', alias: [], faction: 'other', birth: 617, death: 650, birthPlace: '逻些', title: '吐蕃赞普', roles: ['吐蕃君主'], avatar: '赞',
    bio: '统一吐蕃诸部，建都逻些（拉萨），定佛教为国教，创吐蕃文字。641年迎唐文成公主，娶为后。唐蕃和亲，文化交流。',
    events: [
      { year: 632, place: '逻些', desc: '统一吐蕃，建都' },
      { year: 641, place: '青海', desc: '迎文成公主' },
      { year: 650, place: '逻些', desc: '卒' },
    ]
  },
  { id: 'wencheng', name: '文成公主', courtesy: '—', alias: [], faction: 'tang', birth: 625, death: 680, birthPlace: '长安', title: '—', roles: ['唐室宗女'], avatar: '文',
    bio: '唐宗室女。太宗赐嫁松赞干布，641年入藏，携经书、工匠、种子。对汉藏文化交流贡献巨大，至今藏地寺庙奉祀不绝。',
    events: [
      { year: 641, place: '青海', desc: '入藏嫁松赞干布' },
      { year: 680, place: '逻些', desc: '卒于吐蕃' },
    ]
  },

  /* ===== 大宋 ===== */
  { id: 'zhaokuangyin', name: '赵匡胤', courtesy: '元朗', alias: ['宋太祖'], faction: 'song', birth: 927, death: 976, birthPlace: '涿郡', title: '宋太祖', roles: ['宋朝开国皇帝'], avatar: '匡',
    bio: '后周殿前都点检。960年陈桥兵变，黄袍加身，代后周称帝，国号宋。在位十六年，灭荆南、后蜀、南汉、南唐，基本统一南方。"杯酒释兵权"，以文抑武开宋制之先。',
    events: [
      { year: 960, place: '开封', desc: '陈桥兵变，建国宋' },
      { year: 963, place: '江陵', desc: '灭荆南' },
      { year: 965, place: '成都', desc: '灭后蜀' },
      { year: 971, place: '广州', desc: '灭南汉' },
      { year: 975, place: '金陵', desc: '灭南唐' },
      { year: 976, place: '开封', desc: '崩，弟光义即位' },
    ]
  },
  { id: 'zhaoguangyi', name: '赵光义', courtesy: '廷美', alias: ['宋太宗'], faction: 'song', birth: 939, death: 997, birthPlace: '涿郡', title: '宋太宗', roles: ['皇帝'], avatar: '义',
    bio: '太祖弟，"烛影斧声"后即位。979年灭北汉，一统天下。同年伐辽，高梁河之战大败。在位期间大兴文教，扩大科举，确立文臣治国格局。',
    events: [
      { year: 976, place: '开封', desc: '即位' },
      { year: 979, place: '太原', desc: '灭北汉，统一' },
      { year: 979, place: '幽州', desc: '伐辽，高梁河之战大败' },
      { year: 997, place: '开封', desc: '崩' },
    ]
  },
  { id: 'wanganshi', name: '王安石', courtesy: '介甫', alias: ['王半山','王荆公'], faction: 'song', birth: 1021, death: 1086, birthPlace: '临川', title: '同中书门下平章事', roles: ['政治家','文学家','改革家'], avatar: '石',
    bio: '庆历进士。神宗朝拜相，推行新法（青苗、均输、市易、免役、保甲等），以理财强兵为务。因保守派反对，两度罢相。封荆国公。唐宋八大家之一，文章险峭奇崛。',
    events: [
      { year: 1042, place: '开封', desc: '中进士' },
      { year: 1069, place: '开封', desc: '神宗拜相，推行新法' },
      { year: 1074, place: '江宁', desc: '第一次罢相' },
      { year: 1075, place: '开封', desc: '复相' },
      { year: 1076, place: '江宁', desc: '再罢相，退居半山园' },
      { year: 1086, place: '江宁', desc: '卒' },
    ]
  },
  { id: 'simaguang', name: '司马光', courtesy: '君实', alias: ['司马温公','涑水先生'], faction: 'song', birth: 1019, death: 1086, birthPlace: '陕州夏县', title: '尚书左仆射·太师', roles: ['政治家','史学家'], avatar: '光',
    bio: '宝元进士。神宗朝以反对新法出居洛阳，专修《资治通鉴》十九年。哲宗即位，起为相，尽废新法。著《资治通鉴》294卷，为中国编年体通史巨著。',
    events: [
      { year: 1038, place: '开封', desc: '中进士' },
      { year: 1070, place: '洛阳', desc: '因反对新法，退居洛阳修《资治通鉴》' },
      { year: 1085, place: '开封', desc: '哲宗立，起为相，尽废新法' },
      { year: 1086, place: '开封', desc: '卒' },
    ]
  },
  { id: 'sushi', name: '苏轼', courtesy: '子瞻', alias: ['苏东坡','东坡居士'], faction: 'song', birth: 1037, death: 1101, birthPlace: '眉山', title: '礼部尚书', roles: ['文学家','书画家','官员'], avatar: '轼',
    bio: '嘉祐进士。因乌台诗案贬黄州，后起用，又贬惠州、儋州。宦海沉浮，所至有政绩。文章、诗词、书画皆绝，为北宋文坛领袖。与父洵、弟辙合称"三苏"，列唐宋八大家。',
    events: [
      { year: 1057, place: '开封', desc: '中进士' },
      { year: 1079, place: '开封', desc: '乌台诗案入狱' },
      { year: 1080, place: '黄州', desc: '贬黄州团练副使，写前后《赤壁赋》' },
      { year: 1094, place: '惠州', desc: '贬惠州' },
      { year: 1097, place: '儋州', desc: '贬儋州' },
      { year: 1101, place: '常州', desc: '病逝' },
    ]
  },
  { id: 'suche', name: '苏辙', courtesy: '子由', alias: ['苏颍滨'], faction: 'song', birth: 1039, death: 1112, birthPlace: '眉山', title: '门下侍郎', roles: ['文学家','官员'], avatar: '辙',
    bio: '苏轼弟。嘉祐进士。与兄同科，文章汪洋淡泊。乌台诗案中上书乞以官赎兄罪。哲宗朝官至门下侍郎。后贬筠州、雷州。著《栾城集》。唐宋八大家之一。',
    events: [
      { year: 1057, place: '开封', desc: '与兄同中进士' },
      { year: 1079, place: '开封', desc: '上书乞赎兄罪，贬筠州' },
      { year: 1094, place: '雷州', desc: '贬雷州' },
      { year: 1112, place: '许州', desc: '卒' },
    ]
  },
  { id: 'ouxiu_xiu', name: '欧阳修', courtesy: '永叔', alias: ['醉翁','六一居士'], faction: 'song', birth: 1007, death: 1072, birthPlace: '吉州庐陵', title: '枢密副使·参知政事', roles: ['文学家','史学家','官员'], avatar: '修',
    bio: '天圣进士。景祐间贬夷陵。庆历新政主将之一。嘉祐二年知贡举，拔苏轼、苏辙、曾巩，扭转文风。官至参知政事。倡导诗文革新，唐宋八大家之一。著《新五代史》。',
    events: [
      { year: 1030, place: '开封', desc: '中进士' },
      { year: 1036, place: '夷陵', desc: '贬夷陵令' },
      { year: 1057, place: '开封', desc: '知贡举，拔苏轼等' },
      { year: 1070, place: '颍州', desc: '退居颍州' },
      { year: 1072, place: '颍州', desc: '卒' },
    ]
  },
  { id: 'fanzhongyan', name: '范仲淹', courtesy: '希文', alias: ['范文正'], faction: 'song', birth: 989, death: 1052, birthPlace: '苏州', title: '参知政事', roles: ['政治家','文学家','军事家'], avatar: '范',
    bio: '大中祥符进士。康定元年经略陕西，号"小范老子"。庆历三年拜参知政事，推行庆历新政。后贬邓州，作《岳阳楼记》，"先天下之忧而忧，后天下之乐而乐"。',
    events: [
      { year: 1015, place: '开封', desc: '中进士' },
      { year: 1040, place: '延安', desc: '经略陕西，御西夏' },
      { year: 1043, place: '开封', desc: '拜参知政事，庆历新政' },
      { year: 1046, place: '邓州', desc: '贬邓州，作《岳阳楼记》' },
      { year: 1052, place: '徐州', desc: '卒' },
    ]
  },
  { id: 'yuefei', name: '岳飞', courtesy: '鹏举', alias: ['岳武穆'], faction: 'song', birth: 1103, death: 1142, birthPlace: '汤阴', title: '武昌军节度使', roles: ['名将','民族英雄'], avatar: '岳',
    bio: '起于行伍。建炎至绍兴间抗金，收复失地，郾城大捷破金兀术铁浮屠。欲直捣黄龙，为秦桧十二金牌召回。以"莫须有"罪名遇害于风波亭。孝宗时平反，谥武穆。',
    events: [
      { year: 1122, place: '汤阴', desc: '应募从军' },
      { year: 1134, place: '襄阳', desc: '收复襄阳六郡' },
      { year: 1140, place: '郾城', desc: '郾城大捷，破金兀术' },
      { year: 1140, place: '朱仙镇', desc: '十二金牌召回' },
      { year: 1142, place: '临安', desc: '遇害于风波亭' },
    ]
  },
  { id: 'wenzhanxiang', name: '文天祥', courtesy: '宋瑞', alias: ['文山','文丞相互'], faction: 'song', birth: 1236, death: 1283, birthPlace: '吉州庐陵', title: '右丞相', roles: ['政治家','文学家','民族英雄'], avatar: '天',
    bio: '宝祐状元。德祐二年元军南下，散家财起兵勤王。后使元被留，脱走后拥端宗、帝昺于福建、广东抗元。五坡岭被俘，囚大都四年不屈就义。"人生自古谁无死，留取丹心照汗青"。',
    events: [
      { year: 1256, place: '临安', desc: '中状元' },
      { year: 1275, place: '赣州', desc: '起兵勤王' },
      { year: 1278, place: '海丰', desc: '五坡岭被俘' },
      { year: 1279, place: '崖山', desc: '崖山之战，宋亡' },
      { year: 1283, place: '大都', desc: '就义' },
    ]
  },
  { id: 'xin_qiji', name: '辛弃疾', courtesy: '幼安', alias: ['稼轩'], faction: 'song', birth: 1140, death: 1207, birthPlace: '济南', title: '知福州·浙东安抚使', roles: ['词人','将领'], avatar: '弃',
    bio: '生于金占区，22岁聚二千义兵归宋。献《美芹十论》《九议》，主抗金。历任地方官，所至有政绩。后落职闲居上饶、铅山。词风豪放，与苏轼并称"苏辛"。',
    events: [
      { year: 1162, place: '济南', desc: '聚义兵归宋' },
      { year: 1180, place: '上饶', desc: '建稼轩，落职闲居' },
      { year: 1203, place: '绍兴', desc: '起知绍兴府，后知镇江' },
      { year: 1207, place: '铅山', desc: '卒' },
    ]
  },
  { id: 'liqinzhao', name: '李清照', courtesy: '易安', alias: ['易安居士'], faction: 'song', birth: 1084, death: 1155, birthPlace: '济南', title: '—', roles: ['女词人'], avatar: '清',
    bio: '李格非之女，赵明诚之妻。早期与夫共校金石，词写闺情。靖康之变后南渡，夫病死，晚年孤苦。词号"易安体"，为婉约派大家。"生当作人杰，死亦为鬼雄"。',
    events: [
      { year: 1101, place: '开封', desc: '嫁赵明诚' },
      { year: 1127, place: '江宁', desc: '靖康之变，南渡' },
      { year: 1129, place: '建康', desc: '赵明诚病卒' },
      { year: 1155, place: '临安', desc: '卒' },
    ]
  },
  { id: 'lu_you', name: '陆游', courtesy: '务观', alias: ['放翁'], faction: 'song', birth: 1125, death: 1210, birthPlace: '越州山阴', title: '宝章阁待制', roles: ['诗人'], avatar: '游',
    bio: '绍兴间试礼部，为秦桧所黜。后任夔州通判，入王炎、范成大幕。一生主抗金，不遂。诗作九千余首，为宋诗之冠。"王师北定中原日，家祭无忘告乃翁"。',
    events: [
      { year: 1153, place: '临安', desc: '省试第一，为秦桧黜' },
      { year: 1170, place: '夔州', desc: '任夔州通判' },
      { year: 1172, place: '南郑', desc: '入王炎幕，从军' },
      { year: 1210, place: '山阴', desc: '卒' },
    ]
  },
  { id: 'bi_sheng', name: '毕昇', courtesy: '—', alias: [], faction: 'song', birth: 972, death: 1051, birthPlace: '蕲州', title: '工匠', roles: ['发明家'], avatar: '毕',
    bio: '布衣工匠。约庆历年间发明胶泥活字印刷术，为世界印刷史革命。比德国古腾堡早约四百年。沈括《梦溪笔谈》记其事。',
    events: [
      { year: 1041, place: '开封', desc: '发明活字印刷术' },
      { year: 1051, place: '蕲州', desc: '卒' },
    ]
  },
  { id: 'shen_kuo', name: '沈括', courtesy: '存中', alias: [], faction: 'song', birth: 1031, death: 1095, birthPlace: '杭州', title: '翰林学士', roles: ['科学家','官员'], avatar: '括',
    bio: '嘉祐进士。博学多能，于天文、数学、物理、地理、医药皆有造诣。熙宁间参与新法。后贬润州，筑梦溪园，著《梦溪笔谈》26卷，记毕昇活字印刷、磁偏角等，誉为中国科技史坐标。',
    events: [
      { year: 1063, place: '开封', desc: '中进士' },
      { year: 1075, place: '辽上京', desc: '使辽议边界' },
      { year: 1088, place: '润州', desc: '居梦溪园，著《梦溪笔谈》' },
      { year: 1095, place: '润州', desc: '卒' },
    ]
  },
  { id: 'su_song', name: '苏颂', courtesy: '子容', alias: [], faction: 'song', birth: 1020, death: 1101, birthPlace: '泉州', title: '尚书右仆射', roles: ['科学家','官员'], avatar: '颂',
    bio: '庆历进士。元祐七年拜相。博学，于天文、机械、医药皆有造诣。制水运仪象台，集天文观测、报时、演示于一体，为世界最早机械钟之雏形。著《本草图经》《新仪象法要》。',
    events: [
      { year: 1042, place: '开封', desc: '中进士' },
      { year: 1088, place: '开封', desc: '造水运仪象台成' },
      { year: 1092, place: '开封', desc: '拜尚书右仆射' },
      { year: 1101, place: '润州', desc: '卒' },
    ]
  },
  { id: 'qinyue_qin', name: '秦桧', courtesy: '会之', alias: [], faction: 'song', birth: 1090, death: 1155, birthPlace: '江宁', title: '尚书左仆射·太师', roles: ['权臣','主和派'], avatar: '桧',
    bio: '政和进士。靖康中为金所俘，后南归。绍兴年间为相，主和议。以"莫须有"罪名杀岳飞。在位十九年，贬斥主战派，权倾朝野。',
    events: [
      { year: 1115, place: '开封', desc: '中进士' },
      { year: 1130, place: '临安', desc: '自金南归' },
      { year: 1141, place: '临安', desc: '主和议，罢岳飞兵权' },
      { year: 1142, place: '临安', desc: '杀岳飞于风波亭' },
      { year: 1155, place: '临安', desc: '病卒' },
    ]
  },
  { id: 'zhuxi', name: '朱熹', courtesy: '元晦', alias: ['朱文公','考亭先生'], faction: 'song', birth: 1130, death: 1200, birthPlace: '尤溪', title: '焕章阁待制', roles: ['哲学家','教育家'], avatar: '熹',
    bio: '绍兴进士。理学集大成者，融周敦颐、二程、张载之说，建构"理气""心性"体系，集宋学之大成。著《四书章句集注》，为元明清科举定本。讲学白鹿洞、考亭，影响后世七百年。',
    events: [
      { year: 1148, place: '建阳', desc: '中进士' },
      { year: 1179, place: '庐山', desc: '复白鹿洞书院，讲学' },
      { year: 1194, place: '长沙', desc: '知潭州，新政' },
      { year: 1200, place: '建阳', desc: '卒' },
    ]
  },
  { id: 'huo_xiaobo', name: '黄道婆', courtesy: '—', alias: [], faction: 'song', birth: 1245, death: 1330, birthPlace: '松江', title: '—', roles: ['纺织技术革新者'], avatar: '婆',
    bio: '南宋末年松江贫女。流落崖州三十余年，习黎族棉纺织技术。元初归故里，改良纺车，传艺乡里，松江棉纺织业由是兴。',
    events: [
      { year: 1263, place: '崖州', desc: '流落海南，习纺织' },
      { year: 1296, place: '松江', desc: '归故里，传艺' },
    ]
  },
  { id: 'qin_gui', name: '完颜阿骨打', courtesy: '—', alias: ['金太祖'], faction: 'other', birth: 1068, death: 1123, birthPlace: '上京', title: '金太祖', roles: ['金国开国皇帝'], avatar: '骨',
    bio: '女真完颜部首领。1115年统一女真诸部，起兵反辽，称帝，国号金。十年间灭辽。1123年崩，弟吴乞买继之，1127年灭北宋。',
    events: [
      { year: 1114, place: '上京', desc: '起兵反辽' },
      { year: 1115, place: '上京', desc: '称帝，国号金' },
      { year: 1120, place: '上京', desc: '克辽上京' },
      { year: 1123, place: '上京', desc: '崩' },
    ]
  },
];

/* ---------- 人物关系 ---------- */
const RELATIONS = [
  /* 唐代 */
  { source: 'liyuan', target: 'lishimin', type: '父子', label: '高祖·太宗', year: 618 },
  { source: 'lishimin', target: 'weizheng', type: '君臣', label: '太宗纳谏', year: 627 },
  { source: 'lishimin', target: 'fangxuanling', type: '君臣', label: '房谋', year: 626 },
  { source: 'lishimin', target: 'duzhuanzhuan', type: '君臣', label: '杜断', year: 626 },
  { source: 'lishimin', target: 'lijing', type: '君臣', label: '将帅', year: 621 },
  { source: 'fangxuanling', target: 'duzhuanzhuan', type: '同僚', label: '房谋杜断', year: 626 },
  { source: 'lijing', target: 'lishimin', type: '君臣', label: '平突厥', year: 630 },
  { source: 'wuzetian', target: 'lishimin', type: '其他', label: '才人→皇后→皇帝', year: 637 },
  { source: 'wuzetian', target: 'shangguan_waner', type: '君臣', label: '掌诏命', year: 696 },
  { source: 'an_lushan', target: 'shisiming', type: '同僚', label: '叛将同党', year: 755 },
  { source: 'an_lushan', target: 'guo_ziyi', type: '敌对', label: '平叛', year: 755 },
  { source: 'guo_ziyi', target: 'lishimin', type: '其他', label: '后继名将', year: 756 },
  { source: 'libai', target: 'dufu', type: '同僚', label: '李杜同游', year: 744 },
  { source: 'libai', target: 'wangwei', type: '同僚', label: '王李并称', year: 742 },
  { source: 'dufu', target: 'gaoshilun', type: '同僚', label: '唱和', year: 757 },
  { source: 'dufu', target: 'cen_shen', type: '同僚', label: '边塞唱和', year: 757 },
  { source: 'hanyu', target: 'liuzongyuan', type: '同僚', label: '古文运动', year: 795 },
  { source: 'hanyu', target: 'liuyuxi', type: '同僚', label: '永贞旧交', year: 805 },
  { source: 'liuzongyuan', target: 'liuyuxi', type: '同僚', label: '刘柳同贬', year: 805 },
  { source: 'yan_zhenqing', target: 'liu_gongquan', type: '同僚', label: '颜筋柳骨', year: 785 },
  { source: 'xuan_zang', target: 'lishimin', type: '君臣', label: '译经护持', year: 645 },
  { source: 'wencheng', target: 'songzan', type: '其他', label: '和亲', year: 641 },
  { source: 'wencheng', target: 'lishimin', type: '其他', label: '赐嫁', year: 641 },
  { source: 'jian_zhen', target: 'wuzetian', type: '其他', label: '佛门异时', year: 688 },

  /* 宋代 */
  { source: 'zhaokuangyin', target: 'zhaoguangyi', type: '兄弟', label: '兄终弟及', year: 976 },
  { source: 'zhaokuangyin', target: 'fanzhongyan', type: '其他', label: '前代臣子', year: 1015 },
  { source: 'fanzhongyan', target: 'ouxiu_xiu', type: '同僚', label: '庆历同党', year: 1043 },
  { source: 'ouxiu_xiu', target: 'sushi', type: '师徒', label: '知贡举拔轼', year: 1057 },
  { source: 'ouxiu_xiu', target: 'suche', type: '师徒', label: '同榜', year: 1057 },
  { source: 'sushi', target: 'suche', type: '兄弟', label: '兄弟同科', year: 1057 },
  { source: 'sushi', target: 'wanganshi', type: '同僚', label: '新旧之争', year: 1069 },
  { source: 'wanganshi', target: 'simaguang', type: '敌对', label: '新旧党争', year: 1069 },
  { source: 'simaguang', target: 'sushi', type: '同僚', label: '旧党同志', year: 1085 },
  { source: 'yuefei', target: 'qinyue_qin', type: '敌对', label: '风波亭之冤', year: 1142 },
  { source: 'yuefei', target: 'zhaoguangyi', type: '其他', label: '后朝忠臣', year: 1130 },
  { source: 'xin_qiji', target: 'sushi', type: '其他', label: '豪放词宗', year: 1162 },
  { source: 'xin_qiji', target: 'lu_you', type: '同僚', label: '主战同声', year: 1172 },
  { source: 'liqinzhao', target: 'sushi', type: '其他', label: '前后词家', year: 1101 },
  { source: 'lu_you', target: 'fanzhongyan', type: '其他', label: '前后承续', year: 1125 },
  { source: 'wenzhanxiang', target: 'lu_you', type: '其他', label: '忠义承续', year: 1236 },
  { source: 'wenzhanxiang', target: 'xin_qiji', type: '其他', label: '忠义承续', year: 1207 },
  { source: 'shen_kuo', target: 'wanganshi', type: '同僚', label: '新法幕僚', year: 1069 },
  { source: 'shen_kuo', target: 'bi_sheng', type: '其他', label: '记毕昇事', year: 1041 },
  { source: 'su_song', target: 'shen_kuo', type: '同僚', label: '科技同僚', year: 1088 },
  { source: 'zhuxi', target: 'sushi', type: '其他', label: '理学与时文', year: 1130 },
  { source: 'zhuxi', target: 'lu_you', type: '同僚', label: '讲学之交', year: 1190 },

  /* 唐宋跨代 */
  { source: 'hanyu', target: 'ouxiu_xiu', type: '其他', label: '古文运动先导', year: 792 },
  { source: 'libai', target: 'sushi', type: '其他', label: '诗仙词豪', year: 1057 },
  { source: 'dufu', target: 'lu_you', type: '其他', label: '诗圣诗豪', year: 1170 },
  { source: 'yan_zhenqing', target: 'sushi', type: '其他', label: '书画同道', year: 1080 },
  { source: 'baijiuyi', target: 'ouxiu_xiu', type: '其他', label: '诗文革新先导', year: 1040 },
];

/* ---------- 历史事件 ---------- */
const EVENTS = [
  /* ===== 军事 ===== */
  { id: 't1', name: '太原起兵', year: 617, domain: '军事', location: '长安', desc: '李渊在太原起兵，攻入长安，立代王侑为帝，自任大丞相，奠定唐代隋之基。', participants: ['liyuan','lishimin'] },
  { id: 't2', name: '虎牢关之战', year: 621, domain: '军事', location: '洛阳', desc: '李世民于虎牢关一举擒窦建德、降王世充，平定河南，奠定唐统一格局。', participants: ['lishimin','lijing'] },
  { id: 't3', name: '玄武门之变', year: 626, domain: '军事', location: '长安', desc: '李世民发动玄武门之变，杀太子建成、齐王元吉，李渊退位，世民即帝位。', participants: ['lishimin','liyuan','fangxuanling','duzhuanzhuan'] },
  { id: 't4', name: '灭东突厥', year: 630, domain: '军事', location: '阴山', desc: '李靖率三千骑夜袭定襄，破东突厥，擒颉利可汗。四夷尊太宗为"天可汗"。', participants: ['lijing','lishimin'] },
  { id: 't5', name: '安史之乱', year: 755, domain: '军事', location: '范阳', desc: '安禄山起兵反唐，陷两京。乱起八年，两京再陷，唐由盛转衰。', participants: ['an_lushan','shisiming','guo_ziyi'] },
  { id: 't6', name: '收复两京', year: 757, domain: '军事', location: '长安', desc: '郭子仪、李光弼率朔方军联合回纥，收复长安、洛阳。', participants: ['guo_ziyi'] },
  { id: 't7', name: '陈桥兵变', year: 960, domain: '军事', location: '开封', desc: '赵匡胤在陈桥驿被军士黄袍加身，回师开封，代后周称帝，建国号宋。', participants: ['zhaokuangyin'] },
  { id: 't8', name: '灭北汉·统一', year: 979, domain: '军事', location: '太原', desc: '赵光义亲征北汉，北汉主刘继元降，唐宋之间五十余年分裂终结。', participants: ['zhaoguangyi'] },
  { id: 't9', name: '高梁河之战', year: 979, domain: '军事', location: '幽州', desc: '赵光义灭北汉后伐辽，于高梁河大败，乘驴车逃归。宋辽对峙格局形成。', participants: ['zhaoguangyi'] },
  { id: 't10', name: '澶渊之盟', year: 1005, domain: '军事', location: '澶州', desc: '宋辽订澶渊之盟，宋岁输辽银绢各十万，两国休兵百余年。', participants: [] },
  { id: 't11', name: '靖康之变', year: 1127, domain: '军事', location: '开封', desc: '金军攻陷开封，掳徽钦二帝及宗室北去，北宋亡。赵构南渡，建南宋。', participants: ['liqinzhao'] },
  { id: 't12', name: '郾城大捷', year: 1140, domain: '军事', location: '郾城', desc: '岳飞于郾城大破金兀术铁浮屠、拐子马，乘胜进至朱仙镇。', participants: ['yuefei'] },
  { id: 't13', name: '采石之战', year: 1161, domain: '军事', location: '采石', desc: '虞允文以文官临时督师，于采石矶大败完颜亮渡江之军，南宋转危为安。', participants: [] },
  { id: 't14', name: '崖山之战', year: 1279, domain: '军事', location: '崖山', desc: '元将张弘范以火船大破宋军于崖山，陆秀夫负帝昺投海，南宋亡。', participants: ['wenzhanxiang'] },

  /* ===== 政治 ===== */
  { id: 't15', name: '贞观之治', year: 627, domain: '政治', location: '长安', desc: '太宗改元贞观，任贤纳谏，轻徭薄赋，四年大治，开大唐盛世之基。', participants: ['lishimin','weizheng','fangxuanling','duzhuanzhuan'] },
  { id: 't16', name: '武周代唐', year: 690, domain: '政治', location: '洛阳', desc: '武则天改国号为周，称圣神皇帝，迁都洛阳，为中国历史上唯一正统女皇帝。', participants: ['wuzetian','shangguan_waner'] },
  { id: 't17', name: '神龙政变', year: 705, domain: '政治', location: '洛阳', desc: '张柬之等五大臣发动神龙政变，迫武则天退位，中宗复辟，唐号恢复。', participants: ['wuzetian'] },
  { id: 't18', name: '永贞革新', year: 805, domain: '政治', location: '长安', desc: '顺宗朝王叔文、王伾与柳宗元、刘禹锡等推行新政，数月即败，二王八司马皆贬。', participants: ['liuzongyuan','liuyuxi'] },
  { id: 't19', name: '庆历新政', year: 1043, domain: '政治', location: '开封', desc: '范仲淹、欧阳修等推行庆历新政，明黜陟、抑侥幸，因反对派阻挠，一年即罢。', participants: ['fanzhongyan','ouxiu_xiu'] },
  { id: 't20', name: '王安石变法', year: 1069, domain: '政治', location: '开封', desc: '神宗拜王安石为相，推行青苗、均输、市易、免役、保甲等新法，以理财强兵。新旧党争起。', participants: ['wanganshi','simaguang','shen_kuo'] },
  { id: 't21', name: '元祐更化', year: 1085, domain: '政治', location: '开封', desc: '哲宗即位，高太后听政，起用司马光为相，尽废新法，旧党执政。', participants: ['simaguang','sushi'] },

  /* ===== 文学 ===== */
  { id: 't22', name: '盛唐诗坛', year: 742, domain: '文学', location: '长安', desc: '李白、杜甫、王维、高适、岑参等并世，盛唐诗坛群星璀璨，中国诗歌巅峰。', participants: ['libai','dufu','wangwei','gaoshilun','cen_shen'] },
  { id: 't23', name: '李杜相遇', year: 744, domain: '文学', location: '洛阳', desc: '李白与杜甫在洛阳相识，同游齐赵。"醉眠秋共被，携手日同行"，中国文学史千古佳会。', participants: ['libai','dufu'] },
  { id: 't24', name: '古文运动', year: 795, domain: '文学', location: '长安', desc: '韩愈、柳宗元倡古文，反对骈俪，主张"文以载道"，开唐宋古文运动之先。', participants: ['hanyu','liuzongyuan'] },
  { id: 't25', name: '新乐府运动', year: 810, domain: '文学', location: '长安', desc: '白居易、元稹倡新乐府，"文章合为时而著，歌诗合为事而作"，诗歌反映现实。', participants: ['baijiuyi'] },
  { id: 't26', name: '唐宋八大家', year: 1057, domain: '文学', location: '开封', desc: '嘉祐二年，欧阳修知贡举，拔苏轼、苏辙、曾巩，加之韩愈、柳宗元、王安石、苏洵，唐宋八大家之名遂定。', participants: ['ouxiu_xiu','sushi','suche'] },
  { id: 't27', name: '赤壁赋', year: 1080, domain: '文学', location: '黄州', desc: '苏轼贬黄州，写前后《赤壁赋》及《念奴娇·赤壁怀古》，词开豪放一派。', participants: ['sushi'] },
  { id: 't28', name: '稼轩词', year: 1180, domain: '文学', location: '上饶', desc: '辛弃疾落职闲居上饶稼轩，词风悲壮豪放，与苏轼并称"苏辛"。', participants: ['xin_qiji'] },
  { id: 't29', name: '易安词', year: 1127, domain: '文学', location: '江宁', desc: '李清照南渡后，词写家国之痛，号"易安体"，为婉约派大家。', participants: ['liqinzhao'] },

  /* ===== 科技 ===== */
  { id: 't30', name: '活字印刷术', year: 1041, domain: '科技', location: '开封', desc: '毕昇发明胶泥活字印刷术，为世界印刷史革命，沈括《梦溪笔谈》记之。', participants: ['bi_sheng','shen_kuo'] },
  { id: 't31', name: '《梦溪笔谈》', year: 1088, domain: '科技', location: '润州', desc: '沈括著《梦溪笔谈》26卷，记毕昇活字、磁偏角等，誉为中国科技史坐标。', participants: ['shen_kuo'] },
  { id: 't32', name: '水运仪象台', year: 1088, domain: '科技', location: '开封', desc: '苏颂主持造水运仪象台，集天文观测、报时、演示于一体，为世界最早机械钟雏形。', participants: ['su_song'] },
  { id: 't33', name: '火药兵器', year: 1044, domain: '科技', location: '开封', desc: '《武经总要》载火药配方与火器，宋人将火药用于军事，为世界首创。', participants: [] },
  { id: 't34', name: '指南针', year: 1090, domain: '科技', location: '泉州', desc: '宋代海船普遍用指南针导航，沈括记磁偏角，为航海史革命。', participants: ['shen_kuo'] },
  { id: 't35', name: '《本草图经》', year: 1062, domain: '科技', location: '开封', desc: '苏颂编《本草图经》，为药学巨著，图文并茂。', participants: ['su_song'] },

  /* ===== 外交 ===== */
  { id: 't36', name: '文成公主入藏', year: 641, domain: '外交', location: '青海', desc: '唐太宗赐文成公主嫁吐蕃赞普松赞干布，唐蕃和亲，汉藏文化交流开启。', participants: ['lishimin','wencheng','songzan'] },
  { id: 't37', name: '鉴真东渡', year: 754, domain: '外交', location: '明州', desc: '鉴真六次东渡日本，传律宗，对日本佛教、建筑、医药影响深远。', participants: ['jian_zhen'] },
  { id: 't38', name: '玄奘西行', year: 627, domain: '外交', location: '长安', desc: '玄奘西行求法，历十七年，至天竺那烂陀寺，归国译经75部，著《大唐西域记》。', participants: ['xuan_zang','lishimin'] },
  { id: 't39', name: '海上丝绸之路', year: 1080, domain: '外交', location: '泉州', desc: '宋代泉州成为东方第一大港，海贸远至阿拉伯、东非，市舶司岁入百万贯。', participants: [] },

  /* ===== 文化 ===== */
  { id: 't40', name: '颜体书法', year: 756, domain: '文化', location: '平原', desc: '颜真卿起兵讨安禄山，后书法雄浑开颜体，与柳公权并称"颜筋柳骨"。', participants: ['yan_zhenqing','liu_gongquan'] },
  { id: 't41', name: '画圣吴道子', year: 742, domain: '文化', location: '洛阳', desc: '吴道子于天宫寺画壁画，笔势圆转，"吴带当风"，被誉为画圣。', participants: ['wu_daozi'] },
  { id: 't42', name: '白鹿洞书院', year: 1179, domain: '文化', location: '庐山', desc: '朱熹复白鹿洞书院，讲学其中，订《白鹿洞书院学规》，为宋代理学教育重镇。', participants: ['zhuxi'] },
  { id: 't43', name: '《资治通鉴》', year: 1084, domain: '文化', location: '洛阳', desc: '司马光修《资治通鉴》成，294卷，记1362年史事，为中国编年体通史巨著。', participants: ['simaguang'] },
  { id: 't44', name: '《岳阳楼记》', year: 1046, domain: '文化', location: '邓州', desc: '范仲淹贬邓州，应滕子京之请作《岳阳楼记》，"先天下之忧而忧"传诵千古。', participants: ['fanzhongyan'] },
  { id: 't45', name: '黄道婆传艺', year: 1296, domain: '文化', location: '松江', desc: '黄道婆自崖州归松江，改良纺车，传棉纺织艺，松江棉纺织业由是兴。', participants: ['huo_xiaobo'] },
];

/* ---------- 主要河流（简化坐标） ---------- */
const RIVERS = [
  {
    name: '黄河',
    coords: [
      [96.0, 35.0], [100.0, 35.5], [103.8, 36.1], [106.2, 38.0], [109.5, 39.0],
      [111.0, 40.0], [112.5, 39.5], [114.5, 38.0], [116.0, 37.5], [118.0, 37.5],
    ],
  },
  {
    name: '长江',
    coords: [
      [91.0, 33.0], [97.0, 32.5], [101.0, 29.5], [104.0, 28.5], [107.0, 30.0],
      [110.0, 30.5], [113.0, 30.5], [116.0, 30.0], [118.0, 30.0], [121.0, 31.0],
    ],
  },
  {
    name: '大运河',
    coords: [
      [116.40, 39.90], [117.20, 39.13], [118.00, 37.70], [118.50, 36.60],
      [116.60, 35.40], [114.31, 34.79], [119.42, 32.39], [120.62, 31.32], [120.16, 30.27],
    ],
  },
  {
    name: '珠江',
    coords: [
      [102.0, 24.5], [104.0, 24.0], [108.5, 23.5], [112.0, 23.0], [113.26, 23.13],
    ],
  },
];

/* ---------- 重要性分级 ---------- */
const PERSON_L1 = new Set(['lishimin', 'wuzetian', 'libai', 'dufu', 'sushi', 'zhaokuangyin', 'yuefei', 'wenzhanxiang']);
const PERSON_L2 = new Set([
  'liyuan', 'weizheng', 'fangxuanling', 'lijing', 'guo_ziyi', 'wangwei', 'baijiuyi',
  'hanyu', 'liuzongyuan', 'yan_zhenqing', 'xuan_zang', 'wanganshi', 'simaguang',
  'ouxiu_xiu', 'fanzhongyan', 'suche', 'liqinzhao', 'xin_qiji', 'lu_you', 'shen_kuo',
  'su_song', 'bi_sheng', 'zhuxi', 'an_lushan', 'shisiming',
]);
function getPersonImportance(personId) {
  if (PERSON_L1.has(personId)) return 1;
  if (PERSON_L2.has(personId)) return 2;
  return 3;
}

const EVENT_L1 = new Set([
  't1', 't3', 't5', 't7', 't11', 't12', 't15', 't20', 't23', 't30',
]);
const EVENT_L2 = new Set([
  't2', 't4', 't6', 't8', 't10', 't14', 't16', 't17', 't19', 't21',
  't22', 't26', 't27', 't31', 't32', 't36', 't38', 't43', 't44',
]);
function getEventImportance(eventId) {
  if (EVENT_L1.has(eventId)) return 1;
  if (EVENT_L2.has(eventId)) return 2;
  return 3;
}

/* ---------- 人物地理坐标查找 ---------- */
const BIRTHPLACE_MODERN = {
  '碎叶城': '今吉尔吉斯斯坦托克马克',
  '巩县': '今河南巩义',
  '蒲州': '今山西永济',
  '新郑': '今河南新郑',
  '河内': '今河南沁阳',
  '并州文水': '今山西文水',
  '京兆三原': '今陕西三原',
  '京兆杜陵': '今陕西西安',
  '京兆万年': '今陕西西安',
  '京兆华原': '今陕西铜川',
  '齐州': '今山东济南',
  '巨鹿': '今河北巨鹿',
  '华州郑县': '今陕西华县',
  '阳翟': '今河南禹州',
  '营州': '今辽宁朝阳',
  '洛州缑氏': '今河南偃师',
  '沧州': '今河北沧州',
  '江陵': '今湖北荆州',
  '陇西': '今甘肃陇西',
  '涿郡': '今河北涿州',
  '临川': '今江西抚州',
  '陕州夏县': '今山西夏县',
  '眉山': '今四川眉山',
  '吉州庐陵': '今江西吉安',
  '苏州': '今江苏苏州',
  '汤阴': '今河南汤阴',
  '蕲州': '今湖北蕲春',
  '杭州': '今浙江杭州',
  '泉州': '今福建泉州',
  '松江': '今上海松江',
  '济南': '今山东济南',
  '尤溪': '今福建尤溪',
  '上京': '今内蒙古巴林左旗',
  '逻些': '今西藏拉萨',
  '崖州': '今海南三亚',
  '越州山阴': '今浙江绍兴',
  '江宁': '今江苏南京',
};

const BIRTHPLACE_COORDS = {
  '长安': [108.95, 34.27],
  '洛阳': [112.45, 34.62],
  '开封': [114.31, 34.79],
  '碎叶城': [75.30, 42.80],
  '巩县': [113.00, 34.70],
  '蒲州': [110.45, 34.85],
  '新郑': [113.73, 34.40],
  '河内': [112.93, 35.10],
  '并州文水': [112.20, 37.45],
  '京兆三原': [108.94, 34.62],
  '京兆杜陵': [108.95, 34.20],
  '京兆万年': [108.95, 34.27],
  '京兆华原': [108.96, 34.90],
  '齐州': [117.00, 36.65],
  '巨鹿': [115.04, 37.22],
  '华州郑县': [109.77, 34.50],
  '阳翟': [113.49, 34.16],
  '营州': [120.42, 41.57],
  '洛州缑氏': [112.70, 34.60],
  '沧州': [116.84, 38.30],
  '江陵': [112.24, 30.33],
  '陇西': [104.60, 35.00],
  '涿郡': [115.98, 39.49],
  '临川': [116.36, 27.95],
  '陕州夏县': [111.30, 35.10],
  '眉山': [103.85, 30.08],
  '吉州庐陵': [114.97, 27.10],
  '苏州': [120.62, 31.32],
  '汤阴': [114.36, 35.92],
  '蕲州': [115.43, 30.23],
  '杭州': [120.16, 30.27],
  '泉州': [118.59, 24.87],
  '松江': [121.23, 31.03],
  '济南': [117.00, 36.65],
  '尤溪': [118.18, 26.17],
  '上京': [119.36, 43.98],
  '逻些': [91.13, 29.65],
  '崖州': [109.50, 18.30],
  '越州山阴': [120.58, 30.03],
  '江宁': [118.78, 32.06],
};

const PERSON_IMAGES = {
  lishimin:  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Tang_Taizong_1.jpg/120px-Tang_Taizong_1.jpg',
  wuzetian:  'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Wu_Zetian2.jpg/120px-Wu_Zetian2.jpg',
  libai:     'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Li_Bai_1.jpg/120px-Li_Bai_1.jpg',
  dufu:      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Du_Fu_1.jpg/120px-Du_Fu_1.jpg',
  wangwei:   'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Wang_Wei_1.jpg/120px-Wang_Wei_1.jpg',
  baijiuyi:  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Bai_Juyi_1.jpg/120px-Bai_Juyi_1.jpg',
  hanyu:     'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Han_Yu_1.jpg/120px-Han_Yu_1.jpg',
  guo_ziyi:  'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Guo_Ziyi_1.jpg/120px-Guo_Ziyi_1.jpg',
  yuefei:    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Yue_Fei_1.jpg/120px-Yue_Fei_1.jpg',
  wenzhanxiang: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Wen_Tianxiang_1.jpg/120px-Wen_Tianxiang_1.jpg',
  sushi:     'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Su_Shi_1.jpg/120px-Su_Shi_1.jpg',
  wanganshi: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Wang_Anshi_1.jpg/120px-Wang_Anshi_1.jpg',
  simaguang: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Sima_Guang_1.jpg/120px-Sima_Guang_1.jpg',
  ouxiu_xiu: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Ouyang_Xiu_1.jpg/120px-Ouyang_Xiu_1.jpg',
  fanzhongyan: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Fan_Zhongyan_1.jpg/120px-Fan_Zhongyan_1.jpg',
  zhuxi:     'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Zhu_Xi_1.jpg/120px-Zhu_Xi_1.jpg',
};

/* ---------- 组装数据集 ---------- */
export const tangsongAtlas = {
  id: 'tangsong',
  name: '唐宋人物志',
  subtitle: '盛唐气象 · 文治天下（618–1279年）',
  era: '618–1279',
  startYear: 618,
  endYear: 1279,
  mapView: { center: [112, 34], zoom: 5, minZoom: 3, maxZoom: 12 },
  factions: FACTIONS,
  places: PLACES,
  persons: PERSONS,
  relations: RELATIONS,
  events: EVENTS,
  rivers: RIVERS,
  // 数据集专属配置
  importance: {
    getPersonImportance,
    getEventImportance,
  },
  birthplaceModern: BIRTHPLACE_MODERN,
  birthplaceCoords: BIRTHPLACE_COORDS,
  personImages: PERSON_IMAGES,
  // 时间轴关键年份
  timelineTicks: [618, 627, 690, 755, 760, 907, 960, 1005, 1069, 1127, 1140, 1279],
};
