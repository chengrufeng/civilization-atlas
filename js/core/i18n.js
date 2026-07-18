/* =========================================================================
 * i18n：UI 文案中英双语。
 *   - 静态 UI（按钮、面板标题、提示语）通过 setLang() 切换
 *   - 数据集内容（朝代名、人名、事件）保持原文（多为专有名词）
 *
 * 用法：
 *   import { setLang, t, currentLang } from './core/i18n.js';
 *   setLang('en');          // 切到英文
 *   t('search.placeholder') // 取当前语言的字符串
 * ========================================================================= */

const STRINGS = {
  zh: {
    'app.title': '华夏人物图鉴',
    'app.subtitle': '文明图谱',

    'topbar.atlas_selector': '数据集',
    'topbar.search_placeholder': '搜索人物…',
    'topbar.filter': '筛选',
    'topbar.events': '大事记',
    'topbar.timeline': '时间轴',
    'topbar.list': '名册',
    'topbar.compare': '对照',
    'topbar.fullscreen_on': '⤢',
    'topbar.fullscreen_off': '⤡',

    'panel.factions': '势力',
    'panel.factions_all': '全部',
    'panel.layers': '图层',
    'panel.persons': '● 人物',
    'panel.events_layer': '◆ 事件',
    'panel.capitals': '📍 都城',
    'panel.heat': '🔥 事件热力',
    'panel.layer_hint': '选中人物后显示 ──关系 ┄┄敌对 ━▶轨迹',
    'panel.domains': '事件领域',
    'panel.domains_browser': '跨数据集领域浏览',
    'panel.stats': '统计',
    'panel.stat_persons': '人物',
    'panel.stat_relations': '关系',
    'panel.stat_events': '事件',
    'atlas.stat_factions': '势力',

    'timeline.play': '▶',
    'timeline.pause': '⏸',
    'timeline.year_all': '全部年份',
    'timeline.track': '追踪',
    'timeline.reset': '全部',
    'timeline.click_to_view': '点击在地图上查看 →',

    'atlas_overlay.title': '选择数据集',
    'compare_overlay.title': '时代对照',
    'compare_overlay.hint': '👆 点击轴上任一年份，查看全球同时代人物',
    'compare_overlay.row_hint': '点击任意条带切换至该数据集',
    'compare_overlay.empty': '暂无可对照数据',
    'contemp_overlay.title': ' 年 · 同时代人物',
    'contemp.loading': '加载中…',
    'contemp.empty': '该年份无在世人物数据',
    'contemp.index_failed': '索引加载失败',
    'domain_browser.title': '跨数据集领域浏览',
    'domain_browser.summary': '共 {events} 条「{domain}」事件，分布于 {atlases} 个数据集',
    'domain_browser.empty': '该领域无事件数据',
    'common.close': '关闭',
    'common.all_years': '全部年份',

    'list_overlay.title': '人物名册',
    'shortcuts.title': '键盘快捷键',
    'shortcuts.space': '播放 / 暂停',
    'shortcuts.arrows': '年份 -1 / +1',
    'shortcuts.shift_arrows': '年份 -10 / +10',
    'shortcuts.home_end': '跳到起始 / 结束年份',
    'shortcuts.slash': '聚焦搜索框',
    'shortcuts.l': '打开数据集切换',
    'shortcuts.c': '打开时代对照',
    'shortcuts.question': '显示本帮助',
    'shortcuts.esc': '关闭任何浮层',

    'detail.basic': '基本信息',
    'detail.birth_death': '生卒',
    'detail.hometown': '故里',
    'detail.title': '官职',
    'detail.identity': '身份',
    'detail.bio': '生平简介',
    'detail.events': '生平大事（地图轨迹）',
    'detail.relations': '人物关系',
    'detail.cross_links': '跨数据集关联',
    'detail.no_data': '暂无',
    'detail.cross_same_person': '同一人物',
    'detail.cross_interaction': '互动',

    'toast.not_found': '未找到匹配人物',
    'search.domain_hint': '在「{domain}」领域继续输入人物关键字…',

    'compare_figures.title': '人物对比',
    'compare_figures.toggle_select': '加入/移除对比',
    'compare_figures.selected_count': '已选 {n} / {max}',
    'compare_figures.open_btn': '对比选中',
    'compare_figures.clear_btn': '清空',
    'compare_figures.remove': '移除',
    'compare_figures.need_more': '请至少选择 2 位人物（还差 {n} 位）',
    'compare_figures.empty': '部分人物数据缺失',
    'compare_figures.lifespan': '生卒',
    'compare_figures.age': '享年',
    'compare_figures.years_unit': '岁',
    'compare_figures.identity': '身份',
    'compare_figures.title_field': '官职',
    'compare_figures.events': '事件数',
    'compare_figures.relations': '关系数',
    'compare_figures.legend_max': '■ 最值高亮',
    'compare_figures.legend_min': '■ 极值',

    'settings.title': '设置',
    'settings.play_speed': '播放速度',
    'settings.speed_auto': '自动（按事件密度）',
    'settings.speed_slow': '慢 (1.5×)',
    'settings.speed_normal': '正常 (1×)',
    'settings.speed_fast': '快 (0.6×)',
    'settings.default_layers': '默认图层',
    'settings.data': '数据',
    'settings.preload': '空闲时预加载数据集（节省切换等待，消耗流量）',
    'settings.danger_zone': '危险区',
    'settings.reset': '重置偏好（含收藏与最近）',
    'settings.reset_confirm': '确定重置所有偏好、收藏和最近浏览？',
    'topbar.settings': '⚙',
    'topbar.print': '🖨 Print / Export PDF',
    'print.title': 'Civilization Atlas · {atlas}',
    'print.year': 'Year: {year}',
    'print.stats': 'Figures {persons} · Events {events} · Factions {factions}',
    'topbar.print': '🖨 打印 / 导出 PDF',
    'print.title': '文明图鉴 · {atlas}',
    'print.year': '年份：{year}',
    'print.stats': '人物 {persons} · 事件 {events} · 势力 {factions}',
    'event_list.title': '大事记',
    'event_list.count_suffix': ' 件',
    'list.courtesy_prefix': '字',
    'detail.courtesy_label': '字',
    'detail.alias_sep': '、',
    'detail.age': '享年{n}岁',
    'detail.year_range': '{a}–{b}年',
    'detail.relations_count': '人物关系（{n}）',
    'detail.events_count': '生平大事（地图轨迹）',

    'loading.text': '地图加载中…',
    'loading.error.title': '页面初始化失败',
    'loading.error.hint': '请打开浏览器控制台（F12）查看详细错误。',
    'loading.atlas_error.title': '数据集加载失败',
    'loading.atlas_error.hint': '请检查网络或数据文件后重试。',
    'loading.file_error.title': '无法直接双击打开',
    'loading.file_error.body_html': '<p>本项目使用 ES Modules，浏览器禁止通过 <code>file://</code> 加载模块脚本。</p>',
    'loading.file_error.cmd_html': '<pre>python3 -m http.server 8080\n# 或\nnpx serve .</pre>',
    'loading.file_error.open_html': '<p>然后打开 <code>http://localhost:8080</code></p>',
    'loading.leaflet_error.title': '地图库加载失败',
    'loading.leaflet_error.body': '无法从 CDN 加载 Leaflet，请检查网络连接后刷新页面。',

    'life_journey.start': '▶ 人生回放',
    'life_journey.pause': '暂停',
    'life_journey.resume': '继续',
    'life_journey.exit': '退出',
    'life_journey.finished': '人生回放结束',
    'life_journey.no_events': '该人物暂无生平事件地点，无法回放',
    'life_journey.cross_badge': '🔗 跨 {n} 个数据集',
    'life_journey.switching': '切换数据集',

    'quick.favorites': '★ 收藏',
    'quick.recent': '🕒 最近',
    'quick.empty': '—',
    'detail.toggle_favorite': '加入/移除收藏',

    'local_atlas.btn': '📁 导入本地数据集',
    'local_atlas.title': '导入本地数据集',
    'local_atlas.hint': '拖拽 / 选择符合 schema 的 JSON 文件，浏览器内即时解析，不会上传到服务器。',
    'local_atlas.drop_hint': '将 .json 文件拖到这里，或点击选择',
    'local_atlas.parsing': '正在解析…',
    'local_atlas.validating': '正在校验…',
    'local_atlas.loaded': '已导入「{name}」（人物 {persons} · 事件 {events}）',
    'local_atlas.load_failed': '导入失败：{msg}',
    'local_atlas.schema_link': '查看 schema 模板',
    'local_atlas.switch_now': '立即切换',
  },

  en: {
    'app.title': 'Civilization Atlas',
    'app.subtitle': 'ATLAS',

    'topbar.atlas_selector': 'Dataset',
    'topbar.search_placeholder': 'Search figures…',
    'topbar.filter': 'Filter',
    'topbar.events': 'Chronicle',
    'topbar.timeline': 'Timeline',
    'topbar.list': 'Roster',
    'topbar.compare': 'Compare',
    'topbar.fullscreen_on': '⤢',
    'topbar.fullscreen_off': '⤡',

    'panel.factions': 'Factions',
    'panel.factions_all': 'All',
    'panel.layers': 'Layers',
    'panel.persons': '● Figures',
    'panel.events_layer': '◆ Events',
    'panel.capitals': '📍 Capitals',
    'panel.heat': '🔥 Event Heatmap',
    'panel.layer_hint': 'After selecting a figure ──relation ┄┄rival ━▶trajectory',
    'panel.domains': 'Event Domains',
    'panel.domains_browser': 'Cross-dataset domain browser',
    'panel.stats': 'Stats',
    'panel.stat_persons': 'Figures',
    'panel.stat_relations': 'Relations',
    'panel.stat_events': 'Events',
    'atlas.stat_factions': 'Factions',

    'timeline.play': '▶',
    'timeline.pause': '⏸',
    'timeline.year_all': 'All years',
    'timeline.track': 'Track',
    'timeline.reset': 'All',
    'timeline.click_to_view': 'Click to view on map →',

    'atlas_overlay.title': 'Select Dataset',
    'compare_overlay.title': 'Era Comparison',
    'compare_overlay.hint': '👆 Click any year on the axis to view contemporaries worldwide',
    'compare_overlay.row_hint': 'Click any bar to switch to that dataset',
    'compare_overlay.empty': 'No data to compare',
    'contemp_overlay.title': ' · Contemporaries',
    'contemp.loading': 'Loading…',
    'contemp.empty': 'No data for this year',
    'contemp.index_failed': 'Index load failed',
    'domain_browser.title': 'Cross-dataset Domain Browser',
    'domain_browser.summary': '{events} "{domain}" events across {atlases} datasets',
    'domain_browser.empty': 'No events for this domain',
    'common.close': 'Close',
    'common.all_years': 'All years',

    'list_overlay.title': 'Figure Roster',
    'shortcuts.title': 'Keyboard Shortcuts',
    'shortcuts.space': 'Play / Pause',
    'shortcuts.arrows': 'Year -1 / +1',
    'shortcuts.shift_arrows': 'Year -10 / +10',
    'shortcuts.home_end': 'Jump to start / end year',
    'shortcuts.slash': 'Focus search box',
    'shortcuts.l': 'Open dataset switcher',
    'shortcuts.c': 'Open era comparison',
    'shortcuts.question': 'Show this help',
    'shortcuts.esc': 'Close any overlay',

    'detail.basic': 'Basic Info',
    'detail.birth_death': 'Born–Died',
    'detail.hometown': 'Origin',
    'detail.title': 'Title',
    'detail.identity': 'Roles',
    'detail.bio': 'Biography',
    'detail.events': 'Life Events (Trajectory)',
    'detail.relations': 'Relationships',
    'detail.cross_links': 'Cross-dataset Links',
    'detail.no_data': 'None',
    'detail.cross_same_person': 'Same person',
    'detail.cross_interaction': 'Interaction',

    'toast.not_found': 'No matching figures',
    'search.domain_hint': 'Type a name to search within "{domain}" domain…',

    'compare_figures.title': 'Compare Figures',
    'compare_figures.toggle_select': 'Add/remove from compare',
    'compare_figures.selected_count': '{n} / {max} selected',
    'compare_figures.open_btn': 'Compare Selected',
    'compare_figures.clear_btn': 'Clear',
    'compare_figures.remove': 'Remove',
    'compare_figures.need_more': 'Select at least 2 figures ({n} more to go)',
    'compare_figures.empty': 'Some figure data is missing',
    'compare_figures.lifespan': 'Lifespan',
    'compare_figures.age': 'Age',
    'compare_figures.years_unit': 'y',
    'compare_figures.identity': 'Roles',
    'compare_figures.title_field': 'Title',
    'compare_figures.events': 'Events',
    'compare_figures.relations': 'Relations',
    'compare_figures.legend_max': '■ max highlight',
    'compare_figures.legend_min': '■ min',

    'settings.title': 'Settings',
    'settings.play_speed': 'Play Speed',
    'settings.speed_auto': 'Auto (by event density)',
    'settings.speed_slow': 'Slow (1.5×)',
    'settings.speed_normal': 'Normal (1×)',
    'settings.speed_fast': 'Fast (0.6×)',
    'settings.default_layers': 'Default Layers',
    'settings.data': 'Data',
    'settings.preload': 'Preload datasets on idle (faster switches, uses bandwidth)',
    'settings.danger_zone': 'Danger Zone',
    'settings.reset': 'Reset prefs (incl. favorites & recent)',
    'settings.reset_confirm': 'Reset all preferences, favorites and recent?',
    'topbar.settings': '⚙',
    'topbar.print': '🖨 Print / Export PDF',
    'print.title': 'Civilization Atlas · {atlas}',
    'print.year': 'Year: {year}',
    'print.stats': 'Figures {persons} · Events {events} · Factions {factions}',
    'topbar.print': '🖨 打印 / 导出 PDF',
    'print.title': '文明图鉴 · {atlas}',
    'print.year': '年份：{year}',
    'print.stats': '人物 {persons} · 事件 {events} · 势力 {factions}',
    'event_list.title': 'Chronicle',
    'event_list.count_suffix': '',
    'list.courtesy_prefix': 'Courtesy',
    'detail.courtesy_label': 'Courtesy',
    'detail.alias_sep': ', ',
    'detail.age': 'lived {n} y',
    'detail.year_range': '{a}–{b}',
    'detail.relations_count': 'Relationships ({n})',
    'detail.events_count': 'Life Events (Trajectory)',

    'loading.text': 'Loading map…',
    'loading.error.title': 'Initialization failed',
    'loading.error.hint': 'Please open the browser console (F12) for details.',
    'loading.atlas_error.title': 'Dataset load failed',
    'loading.atlas_error.hint': 'Please check the network or data files and retry.',
    'loading.file_error.title': 'Cannot open via double-click',
    'loading.file_error.body_html': '<p>This project uses ES Modules; browsers block module scripts over <code>file://</code>.</p>',
    'loading.file_error.cmd_html': '<pre>python3 -m http.server 8080\n# or\nnpx serve .</pre>',
    'loading.file_error.open_html': '<p>Then open <code>http://localhost:8080</code></p>',
    'loading.leaflet_error.title': 'Map library failed to load',
    'loading.leaflet_error.body': 'Could not load Leaflet from CDN. Check your network and refresh.',

    'life_journey.start': '▶ Life Replay',
    'life_journey.pause': 'Pause',
    'life_journey.resume': 'Resume',
    'life_journey.exit': 'Exit',
    'life_journey.finished': 'Life replay finished',
    'life_journey.no_events': 'No geolocated life events for this figure',
    'life_journey.cross_badge': '🔗 across {n} datasets',
    'life_journey.switching': 'Switching dataset',

    'quick.favorites': '★ Favorites',
    'quick.recent': '🕒 Recent',
    'quick.empty': '—',
    'detail.toggle_favorite': 'Toggle favorite',

    'local_atlas.btn': '📁 Import local dataset',
    'local_atlas.title': 'Import local dataset',
    'local_atlas.hint': 'Drop or pick a schema-compliant JSON file. Parsed fully in-browser, never uploaded.',
    'local_atlas.drop_hint': 'Drop a .json here, or click to pick',
    'local_atlas.parsing': 'Parsing…',
    'local_atlas.validating': 'Validating…',
    'local_atlas.loaded': 'Imported "{name}" ({persons} figures · {events} events)',
    'local_atlas.load_failed': 'Import failed: {msg}',
    'local_atlas.schema_link': 'View schema template',
    'local_atlas.switch_now': 'Switch now',
  },
};

let lang = 'zh';
const listeners = new Set();

export function currentLang() { return lang; }

export function setLang(newLang) {
  if (!STRINGS[newLang]) return false;
  if (lang === newLang) return true;
  lang = newLang;
  if (typeof document !== 'undefined') applyToDOM();
  listeners.forEach(fn => fn(lang));
  return true;
}

export function t(key) {
  return (STRINGS[lang] && STRINGS[lang][key]) || (STRINGS.zh[key]) || key;
}

/** 模板替换：tf('key', { n: 3 }) 把 {n} 替换为 3 */
export function tf(key, vars = {}) {
  let s = t(key);
  for (const [k, v] of Object.entries(vars)) {
    s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
  }
  return s;
}

/** 取数据集 manifest 条目的本地化字段（name/subtitle/group） */
export function localized(meta, field) {
  if (!meta) return '';
  if (lang === 'en') {
    const en = meta[`${field}En`];
    if (en) return en;
  }
  return meta[field] || meta[`${field}En`] || '';
}

export function onLangChange(fn) { listeners.add(fn); }

/** 把 data-i18n 标注的 DOM 元素全部刷新到当前语言 */
export function applyToDOM() {
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = t(key);
    if (val) el.textContent = val;
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const val = t(key);
    if (val) el.setAttribute('placeholder', val);
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    const val = t(key);
    if (val) el.setAttribute('title', val);
  });
}
