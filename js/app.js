/* =========================================================================
 * 华夏人物图鉴 · 地图优先版（Leaflet 引擎）
 *
 * 用 Leaflet 真实地图瓦片做底图，标记/连线/高亮全部用 Leaflet 原生 API。
 * 瓦片自带地形、河流、行政区划、城市名，无需手动绘制。
 * ========================================================================= */

import {
  sanguoAtlas as ATLAS,
  getPerson, getFaction, getPlace, getRelationsOf,
  getPersonCoord, getEventCoord, getPersonPositionAtYear, getPersonImage,
  getPersonImportance, getEventImportance, getBirthplaceModern,
} from './data.js';

/* ---------- 常量 ---------- */
const FACTION_COLOR = { shu: '#4a7c59', wei: '#2f5d8a', wu: '#b23a2e', other: '#8a6d3b' };
const FACTION_NAME  = { shu: '蜀汉', wei: '曹魏', wu: '东吴', other: '汉末群雄' };
const ERA_START = 184;
const ERA_END   = 280;

const DOMAIN_COLOR = {
  '军事': '#b23a2e', '政治': '#2f5d8a', '文学': '#7b4b94',
  '科技': '#2d8a6e', '外交': '#b8893a', '文化': '#8a6d3b',
};

/* 标签朝向 → tooltip 像素偏移 */
const LABEL_OFFSET = {
  right: [12, 0], left: [-12, 0], top: [0, -14], bottom: [0, 14],
};

/* [lng, lat] → [lat, lng] (Leaflet 用 [lat, lng]) */
function ll(coord) { return [coord[1], coord[0]]; }

/* ---------- 全局状态 ---------- */
const state = {
  map: null,
  factionFilter: 'all',
  layers: { persons: true, events: true, capitals: true },
  domainFilter: new Set(['军事','政治','文学','科技','外交','文化']),
  collapsedDomains: new Set(),  // 折叠的领域
  expandedEvent: null,          // 一览表中展开详情的事件
  yearFilter: null,
  selectedPerson: null,
  highlightedPersons: new Set(),
  eventFocus: null,
  playing: false,
  playTimer: null,
  detailClosedByUser: false,  // 播放中用户手动关闭详情后不再自动弹出
  autoTrack: true,
  // Leaflet 图层组
  layerPersons: null, layerEvents: null, layerCapitals: null,
  layerRelations: null, layerTrajectory: null,
  // 标记索引（用于高亮）
  personMarkers: new Map(), // personId → marker
};

/* =========================================================================
 * 初始化
 * ========================================================================= */
function init() {
  initMap();
  bindControls();

  // 小屏默认收起右侧大事记，避免遮挡地图
  if (window.innerWidth <= 768) {
    document.getElementById('event-list-panel').classList.add('hidden');
    document.getElementById('btn-events').classList.remove('active');
  }
  buildTimelineTicks();
  buildTimelineEvents();
  buildEventList();
  updateStats();
  render();

  document.getElementById('loading-overlay').classList.add('hide');
}

/* =========================================================================
 * Leaflet 地图初始化
 * ========================================================================= */
function initMap() {
  state.map = L.map('map-chart', {
    zoomControl: false,
    attributionControl: false,
    center: [33, 112],
    zoom: 6,
    minZoom: 3,
    maxZoom: 12,
  });

  // 底图1：行政区划（高德地图，纯中文标注，无拼音干扰）
  const adminLayer = L.tileLayer(
    'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
    { maxZoom: 18, subdomains: ['1','2','3','4'], attribution: '高德地图' }
  );

  // 底图2：地形图（Esri World Physical Map，自然地貌）
  const terrainLayer = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}',
    { maxZoom: 18, maxNativeZoom: 8, attribution: 'Esri' }
  );

  // 底图3：卫星图（Esri World Imagery）— 默认底图
  const satelliteLayer = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    { maxZoom: 18, attribution: 'Esri' }
  ).addTo(state.map);

  // 图层切换控件
  L.control.layers({
    '卫星图': satelliteLayer,
    '行政区划': adminLayer,
    '地形图': terrainLayer,
  }, null, { position: 'bottomleft', collapsed: true }).addTo(state.map);

  L.control.zoom({ position: 'bottomleft' }).addTo(state.map);

  // 创建图层组
  state.layerRelations  = L.layerGroup().addTo(state.map);
  state.layerTrajectory = L.layerGroup().addTo(state.map);
  state.layerPersons    = L.layerGroup().addTo(state.map);
  state.layerEvents     = L.layerGroup().addTo(state.map);
  state.layerCapitals   = L.layerGroup().addTo(state.map);

  // 缩放级别联动标签显示：
  //   zoom < 4: 全部隐藏
  //   zoom 4-7: 显示都城+人物标签
  //   zoom 8+: 全部显示（含事件）
  function updateLabelVisibility() {
    const zoom = state.map.getZoom();
    const c = state.map.getContainer();
    c.classList.toggle('zoom-hide-all', zoom < 4);
    c.classList.toggle('zoom-hide-events', zoom < 8);
  }
  state.map.on('zoomend', () => {
    updateLabelVisibility();
    render(); // 缩放变化时按新阈值重绘
  });
  updateLabelVisibility();

  // 点击地图空白处关闭详情面板
  state.map.on('click', () => {
    if (state.selectedPerson) closeDetail(true);
  });
}

/* =========================================================================
 * 主渲染：清空图层组并重建
 * ========================================================================= */
function render() {
  if (!state.map) return;

  // 1. 人物标记 —— 先渲染，后续连线端点取标记实际位置
  renderPersonMarkers();

  // 2. 选中人物的个人关系连线（端点对齐到标记的偏移后位置）
  state.layerRelations.clearLayers();
  if (state.selectedPerson) {
    const myMarker = state.personMarkers.get(state.selectedPerson);
    buildPersonRelationLines(state.selectedPerson).forEach(line => {
      const otherMarker = state.personMarkers.get(line.otherId);
      const from = myMarker ? myMarker.getLatLng() : ll(line.coords[0]);
      const to = otherMarker ? otherMarker.getLatLng() : ll(line.coords[1]);
      L.polyline([from, to], {
        color: line.color,
        weight: line.weight,
        opacity: line.opacity,
        dashArray: line.dashed ? '4,4' : null,
      }).bindTooltip(line.tooltip, {
        sticky: true, direction: 'top',
        className: 'relation-tooltip',
      }).addTo(state.layerRelations);
    });
  }

  // 3. 活动轨迹
  state.layerTrajectory.clearLayers();
  if (state.selectedPerson) {
    const { lines, points } = buildTrajectory(state.selectedPerson);
    // 轨迹线段（带 tooltip）
    lines.forEach(seg => {
      L.polyline([ll(seg.coords[0]), ll(seg.coords[1])], {
        color: '#b8893a', weight: 3, opacity: 0.8,
        dashArray: '8,4',
      }).bindTooltip(seg.tooltip, {
        sticky: true, direction: 'top',
        className: 'relation-tooltip',
      }).addTo(state.layerTrajectory);
    });
    // 轨迹节点标记（每个途经地点）
    points.forEach(pt => {
      L.circleMarker(ll(pt.coord), {
        radius: 5,
        fillColor: '#b8893a', color: '#fff', weight: 2,
        fillOpacity: 0.9, opacity: 1,
      }).bindTooltip(`${pt.year}年 ${pt.place}｜${pt.desc}`, {
        direction: 'top', offset: [0, -6],
        className: 'relation-tooltip',
      }).addTo(state.layerTrajectory);
    });
  }

  // 3.5 事件参与者连线（标记定位后绘制）
  if (state.eventFocus && !state.selectedPerson) {
    state.layerRelations.clearLayers();
    const center = ll(state.eventFocus.coord);
    const eventName = ATLAS.events.find(e => {
      const c = getEventCoord(e);
      return c && c[0] === state.eventFocus.coord[0] && c[1] === state.eventFocus.coord[1] && e.year === state.yearFilter;
    })?.name || '事件';
    state.eventFocus.participants.forEach(pid => {
      const marker = state.personMarkers.get(pid);
      const person = getPerson(pid);
      if (marker && person) {
        L.polyline([center, marker.getLatLng()], {
          color: '#e8a838', weight: 2.5, opacity: 0.75, dashArray: '5,3',
        }).bindTooltip(`${person.name} 参与「${eventName}」`, {
          sticky: true, direction: 'top',
          className: 'relation-tooltip',
        }).addTo(state.layerRelations);
      }
    });
  }

  // 4. 事件标记
  state.layerEvents.clearLayers();
  if (state.layers.events) {
    buildEventData().forEach(d => {
      const color = DOMAIN_COLOR[d.domain] || '#b23a2e';
      const icon = L.divIcon({
        html: `<div class="event-marker" style="color:${color}">◆</div>`,
        className: '', iconSize: [14, 14], iconAnchor: [7, 7],
      });
      const marker = L.marker(ll(d.coord), { icon });
      marker.bindTooltip(d.name, {
        permanent: true, direction: d.labelDir,
        offset: LABEL_OFFSET[d.labelDir] || [0, -8],
        className: 'marker-label event-label',
      });
      marker.on('click', () => showEventInfo(d.eventId));
      marker.addTo(state.layerEvents);
    });
  }

  // 5. 都城 + 城市标记
  state.layerCapitals.clearLayers();
  if (state.layers.capitals) {
    // 都城
    const capitalCoords = new Set();
    buildCapitalData().forEach(d => {
      capitalCoords.add(d.name);
      const icon = L.divIcon({
        html: `<div class="city-marker capital-marker">
          <svg viewBox="0 0 24 24"><path d="M4 20V10l4-3v3l4-3v3l4-3v3l4-3v13H4z M8 20v-5h2v5 M14 20v-5h2v5"/></svg>
        </div>`,
        className: '', iconSize: [26, 26], iconAnchor: [13, 26],
      });
      const marker = L.marker(ll(d.coord), { icon });
      marker.bindTooltip(d.name + ' · 都城', {
        permanent: true, direction: 'right', offset: [8, -13],
        className: 'marker-label capital-label',
      });
      marker.addTo(state.layerCapitals);
    });

    // 一般城市（事件发生地但非都城，只在 zoom>=6 时显示）
    if (state.map.getZoom() >= 6) {
      const cityPlaces = new Set();
      const threshold = getVisibleImportanceThreshold();
      ATLAS.events.forEach(e => {
        if (state.yearFilter !== null && e.year > state.yearFilter) return;
        if (!state.domainFilter.has(e.domain)) return;
        if (getEventImportance(e.id) > threshold) return;
        if (!capitalCoords.has(e.location)) cityPlaces.add(e.location);
      });
      cityPlaces.forEach(placeName => {
        const place = ATLAS.places.find(p => p.name === placeName);
        if (!place) return;
        const icon = L.divIcon({
          html: `<div class="city-marker minor-city">
            <svg viewBox="0 0 24 24"><path d="M4 20V10l4-3v3l4-3v3l4-3v3l4-3v13H4z"/></svg>
          </div>`,
          className: '', iconSize: [16, 16], iconAnchor: [8, 16],
        });
        L.marker(ll(place.coord), { icon })
          .bindTooltip(place.name, {
            direction: 'right', offset: [6, -8],
            className: 'marker-label',
          })
          .addTo(state.layerCapitals);
      });
    }
  }

  updateLineLegend();
}

/* =========================================================================
 * 人物标记渲染 —— 持久化标记，位置随年份平滑移动
 * ========================================================================= */
function renderPersonMarkers() {
  if (!state.layers.persons) {
    state.layerPersons.clearLayers();
    state.personMarkers.clear();
    return;
  }

  const personData = buildPersonData();
  const visibleIds = new Set(personData.map(d => d.personId));

  // 移除不再可见的标记
  for (const [id, marker] of state.personMarkers) {
    if (!visibleIds.has(id)) {
      state.layerPersons.removeLayer(marker);
      state.personMarkers.delete(id);
    }
  }

  // 新增或更新标记
  personData.forEach(d => {
    const opacity = getPersonOpacity(d.personId);
    const isSelected = state.selectedPerson === d.personId;
    const isHighlighted = state.highlightedPersons.has(d.personId);
    let marker = state.personMarkers.get(d.personId);

    if (marker) {
      // 更新已有标记位置（CSS transition 会让它平滑滑动）
      marker.setLatLng(ll(d.coord));
      marker.setOpacity(opacity);
      // 标签朝向随人群位置变化时重建 tooltip
      if (marker._labelDir !== d.labelDir) {
        marker.unbindTooltip();
        marker.bindTooltip(d.name, {
          permanent: true, direction: d.labelDir, offset: LABEL_OFFSET[d.labelDir],
          className: 'marker-label person-label',
        });
        marker._labelDir = d.labelDir;
      }
      // 更新 tooltip 高亮类
      const tipEl = marker.getTooltip?.()?.getElement?.();
      if (tipEl) {
        tipEl.classList.toggle('label-selected', isSelected);
        tipEl.classList.toggle('label-highlighted', isHighlighted);
      }
    } else {
      // 创建新标记 —— 头像式标记
      const fc = FACTION_COLOR[d.faction];
      const fcHex = fc.replace('#', '');
      const person = getPerson(d.personId);
      const avatarChar = person?.avatar || '?';
      const imgUrl = getPersonImage(d.personId)
        || `https://ui-avatars.com/api/?name=${encodeURIComponent(avatarChar)}&size=64&background=${fcHex}&color=fff&bold=true&font-size=0.5`;
      const icon = L.divIcon({
        html: `<div class="person-avatar-marker" style="--fc:${fc}">
          <img src="${imgUrl}" alt="${d.name}" onerror="this.style.display='none';this.parentNode.classList.add('fallback')" />
          <span class="avatar-char">${avatarChar}</span>
        </div>`,
        className: '', iconSize: [30, 30], iconAnchor: [15, 15],
      });
      marker = L.marker(ll(d.coord), { icon, opacity });
      const tipClass = isSelected
        ? 'marker-label person-label label-selected'
        : isHighlighted
          ? 'marker-label person-label label-highlighted'
          : 'marker-label person-label';
      marker.bindTooltip(d.name, {
        permanent: true, direction: d.labelDir, offset: LABEL_OFFSET[d.labelDir],
        className: tipClass,
      });
      marker._labelDir = d.labelDir;
      // 不绑定 popup，详情面板已足够
      marker.on('click', () => openDetail(d.personId));
      marker.addTo(state.layerPersons);
      state.personMarkers.set(d.personId, marker);
    }
  });
}

/* =========================================================================
 * 数据构建函数
 * ========================================================================= */

function getPersonOpacity(personId) {
  if (state.selectedPerson) {
    if (state.selectedPerson === personId) return 1.0;
    if (state.highlightedPersons.has(personId)) return 0.85;
    return 0.3;
  }
  if (state.highlightedPersons.size > 0) {
    return state.highlightedPersons.has(personId) ? 1.0 : 0.3;
  }
  return 0.85;
}

/** 根据当前 zoom 决定可见的重要性阈值 */
function getVisibleImportanceThreshold() {
  const zoom = state.map ? state.map.getZoom() : 6;
  if (zoom < 6) return 1;   // 只看核心
  if (zoom < 8) return 2;   // 核心+重要
  return 3;                  // 全部
}

/** 人物数据 —— 同地点圆形偏移，按 zoom 过滤重要性 */
function buildPersonData() {
  const threshold = getVisibleImportanceThreshold();
  const persons = ATLAS.persons.filter(p => {
    if (state.factionFilter !== 'all' && p.faction !== state.factionFilter) return false;
    if (state.yearFilter !== null && (p.birth > state.yearFilter || p.death < state.yearFilter)) return false;
    // 按重要性过滤，但选中/高亮/事件参与者必须显示
    if (state.selectedPerson === p.id) return true;
    if (state.highlightedPersons.has(p.id)) return true;
    if (state.eventFocus && state.eventFocus.participants.includes(p.id)) return true;
    if (getPersonImportance(p.id) > threshold) return false;
    return true;
  });

  // 按当前位置分组（事件聚焦时参与者聚到事件位置）
  const groups = new Map();
  for (const p of persons) {
    let coord;
    if (state.eventFocus && state.eventFocus.participants.includes(p.id)) {
      coord = state.eventFocus.coord; // 事件参与者聚到事件位置
    } else {
      coord = getPersonPositionAtYear(p, state.yearFilter);
    }
    if (!coord) continue;
    const key = `${coord[0].toFixed(2)},${coord[1].toFixed(2)}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({ person: p, coord });
  }

  const data = [];
  for (const [, group] of groups) {
    const count = group.length;
    group.forEach(({ person: p, coord }, i) => {
      let lng = coord[0], lat = coord[1];
      let labelDir = 'right';
      // 同地点多人沿小圆错开；选中人物固定在真实位置，避免与轨迹/关系线脱节。
      // 半径按当前 zoom 换算成固定像素间距，缩放时不会把人物推到几百公里外。
      if (count > 1 && p.id !== state.selectedPerson) {
        const zoom = state.map ? state.map.getZoom() : 6;
        const degPerPx = 360 / (256 * Math.pow(2, zoom));
        const radius = Math.min(1.2, (26 + count * 6) * degPerPx);
        const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
        const c = Math.cos(angle), sn = Math.sin(angle);
        lng += c * radius;
        lat += sn * radius;
        // 标签朝圆外，避免同地点标签互相压盖
        labelDir = Math.abs(c) >= Math.abs(sn)
          ? (c >= 0 ? 'right' : 'left')
          : (sn >= 0 ? 'top' : 'bottom');
      }
      const relCount = getRelationsOf(p.id).length;
      const eventCount = (p.events || []).length;
      data.push({
        personId: p.id, name: p.name, faction: p.faction,
        coord: [lng, lat], weight: relCount + eventCount, labelDir,
      });
    });
  }
  return data;
}

/** 事件数据 —— 同地点偏移，按 zoom 过滤重要性 */
function buildEventData() {
  const threshold = getVisibleImportanceThreshold();
  const events = ATLAS.events.filter(e => {
    if (state.yearFilter !== null && e.year > state.yearFilter) return false;
    if (!state.domainFilter.has(e.domain)) return false;
    // 当前展开的事件必须显示
    if (state.expandedEvent === e.id) return true;
    if (state.eventFocus && getEventCoord(e) && state.eventFocus.coord[0] === getEventCoord(e)[0]) return true;
    if (getEventImportance(e.id) > threshold) return false;
    return true;
  });

  const groups = new Map();
  for (const e of events) {
    const coord = getEventCoord(e);
    if (!coord) continue;
    const key = `${coord[0].toFixed(2)},${coord[1].toFixed(2)}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({ event: e, coord });
  }

  const data = [];
  for (const [, group] of groups) {
    const count = group.length;
    group.forEach(({ event: e, coord }, i) => {
      let lng = coord[0], lat = coord[1];
      let labelDir = 'top';
      if (count > 1) {
        const zoom = state.map ? state.map.getZoom() : 6;
        const degPerPx = 360 / (256 * Math.pow(2, zoom));
        // 事件排在人物圈的外圈，与人物标记错开
        const radius = Math.min(1.6, (52 + count * 6) * degPerPx);
        const angle = (i / count) * Math.PI * 2 + Math.PI / 4;
        const c = Math.cos(angle), sn = Math.sin(angle);
        lng += c * radius;
        lat += sn * radius;
        labelDir = Math.abs(sn) >= Math.abs(c)
          ? (sn >= 0 ? 'top' : 'bottom')
          : (c >= 0 ? 'right' : 'left');
      }
      data.push({ eventId: e.id, name: e.name, domain: e.domain, coord: [lng, lat], labelDir });
    });
  }
  return data;
}

/** 都城数据 */
function buildCapitalData() {
  const seen = new Set();
  return ATLAS.factions
    .filter(f => {
      if (state.factionFilter !== 'all' && f.id !== state.factionFilter) return false;
      // 都城按 capitalFrom 年份过滤
      if (state.yearFilter !== null && f.capitalFrom && state.yearFilter < f.capitalFrom) return false;
      return true;
    })
    .map(f => {
      const place = ATLAS.places.find(p => p.name === f.capital);
      if (!place || seen.has(place.name)) return null;
      seen.add(place.name);
      return { name: place.name, coord: place.coord };
    })
    .filter(Boolean);
}

/** 关系连线 */
/** 选中人物的直接关系连线 */
/** 判断关系在指定年份是否已建立 */
function isRelationActive(r, year) {
  if (year === null) return true;
  // 双方必须在世
  const sp = getPerson(r.source), tp = getPerson(r.target);
  if (!sp || !tp) return false;
  if (sp.birth > year || sp.death < year) return false;
  if (tp.birth > year || tp.death < year) return false;
  // 有起始年的关系需检查
  if (r.year !== null && r.year !== undefined && year < r.year) return false;
  return true;
}

/** 选中人物的直接关系连线（按年份过滤） */
function buildPersonRelationLines(personId) {
  const person = getPerson(personId);
  if (!person) return [];
  const myCoord = getPersonPositionAtYear(person, state.yearFilter);
  if (!myCoord) return [];

  return getRelationsOf(personId)
    .filter(r => isRelationActive(r, state.yearFilter))
    .map(r => {
      const otherId = r.source === personId ? r.target : r.source;
      const other = getPerson(otherId);
      if (!other) return null;
      const otherCoord = getPersonPositionAtYear(other, state.yearFilter);
      if (!otherCoord) return null;
      const hostile = r.type === '敌对';
      return {
        otherId,
        coords: [myCoord, otherCoord],
        color: hostile ? '#b23a2e' : FACTION_COLOR[other.faction],
        weight: 2,
        opacity: 0.6,
        dashed: hostile,
        tooltip: `${person.name} ↔ ${other.name}：${r.type}（${r.label}）`,
      };
    })
    .filter(Boolean);
}

/** 活动轨迹 */
function buildTrajectory(personId) {
  const person = getPerson(personId);
  if (!person || !person.events || person.events.length < 2) return { lines: [], points: [] };
  const points = person.events
    .filter(e => state.yearFilter === null || e.year <= state.yearFilter)
    .slice().sort((a, b) => a.year - b.year)
    .map(e => {
      const place = ATLAS.places.find(p => p.name === e.place);
      return place ? { coord: place.coord, year: e.year, place: e.place, desc: e.desc } : null;
    })
    .filter(Boolean);
  if (points.length < 2) return { lines: [], points };
  const lines = [];
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i], b = points[i + 1];
    if (a.coord[0] === b.coord[0] && a.coord[1] === b.coord[1]) continue;
    lines.push({
      coords: [a.coord, b.coord],
      tooltip: `${person.name}｜${a.year}年 ${a.place} → ${b.year}年 ${b.place}`,
    });
  }
  return { lines, points };
}

/* =========================================================================
 * 控件绑定
 * ========================================================================= */
/** 更新线条说明浮层可见性 */
function updateLineLegend() {
  const shouldShow = !!(state.selectedPerson || state.eventFocus);
  document.getElementById('line-legend').classList.toggle('visible', shouldShow);
}

/** 通用面板显示/隐藏切换 */
function togglePanel(panelId, btnId) {
  const panel = document.getElementById(panelId);
  const btn = document.getElementById(btnId);
  panel.classList.toggle('hidden');
  btn.classList.toggle('active', !panel.classList.contains('hidden'));
  // 地图延迟刷新以适应面板变化
  if (state.map) setTimeout(() => state.map.invalidateSize(), 320);
}

function bindControls() {
  // 搜索：防抖 + 候选下拉列表（避免输入即跳转）
  const searchInput = document.getElementById('search');
  const suggestBox = document.createElement('div');
  suggestBox.className = 'search-suggest';
  document.body.appendChild(suggestBox);

  const hideSuggest = () => suggestBox.classList.remove('show');
  const selectPerson = (pid) => {
    hideSuggest();
    const person = getPerson(pid);
    if (!person) return;
    searchInput.value = person.name;
    openDetail(pid); // openDetail 内部会飞到人物位置
  };

  let searchDebounce = null;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      const kw = searchInput.value.trim();
      if (!kw) { hideSuggest(); return; }
      const matches = ATLAS.persons.filter(p =>
        p.name.includes(kw) ||
        (p.courtesy && p.courtesy.includes(kw)) ||
        (p.alias || []).some(a => a.includes(kw))
      ).slice(0, 8);
      const rect = searchInput.getBoundingClientRect();
      suggestBox.style.left = `${rect.left}px`;
      suggestBox.style.top = `${rect.bottom + 6}px`;
      suggestBox.style.minWidth = `${rect.width}px`;
      if (matches.length === 0) {
        suggestBox.innerHTML = '<div class="ss-empty">未找到匹配人物</div>';
      } else {
        suggestBox.innerHTML = matches.map(p => `
          <div class="ss-item" data-id="${p.id}">
            <b>${p.name}</b><span class="ss-sub">${p.courtesy ? '字 ' + p.courtesy + ' · ' : ''}${FACTION_NAME[p.faction]}</span>
          </div>`).join('');
        suggestBox.querySelectorAll('.ss-item').forEach(el => {
          el.addEventListener('click', () => selectPerson(el.dataset.id));
        });
      }
      suggestBox.classList.add('show');
    }, 300);
  });
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const first = suggestBox.querySelector('.ss-item');
      if (first) selectPerson(first.dataset.id);
    } else if (e.key === 'Escape') {
      hideSuggest();
    }
  });
  document.addEventListener('click', (e) => {
    if (e.target !== searchInput && !suggestBox.contains(e.target)) hideSuggest();
  });

  // 势力筛选
  document.querySelectorAll('.chip[data-faction]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.chip[data-faction]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.factionFilter = btn.dataset.faction;
      updateStats();
      render();
    });
  });

  // 图层切换
  document.querySelectorAll('.toggle input[data-layer]').forEach(cb => {
    cb.addEventListener('change', () => {
      state.layers[cb.dataset.layer] = cb.checked;
      render();
    });
  });

  // 领域筛选
  document.querySelectorAll('.domain-toggle input[data-domain]').forEach(cb => {
    cb.addEventListener('change', () => {
      const d = cb.dataset.domain;
      if (cb.checked) state.domainFilter.add(d);
      else state.domainFilter.delete(d);
      buildTimelineEvents();
      buildEventList();
      updateStats();
      render();
    });
  });
  document.getElementById('btn-list').addEventListener('click', () => {
    document.getElementById('list-overlay').classList.add('open');
    buildListOverlay();
  });
  document.getElementById('list-close').addEventListener('click', () => {
    document.getElementById('list-overlay').classList.remove('open');
  });

  // 大事记按钮 — 切换事件一览表显示
  document.getElementById('btn-events').addEventListener('click', () => {
    togglePanel('event-list-panel', 'btn-events');
  });

  // 筛选面板按钮
  document.getElementById('btn-left-panel').addEventListener('click', () => {
    togglePanel('left-panel', 'btn-left-panel');
  });

  // 时间轴按钮
  document.getElementById('btn-timeline').addEventListener('click', () => {
    togglePanel('timeline-bar', 'btn-timeline');
    // 联动 Leaflet 控件位置
    document.body.classList.toggle('no-timeline', document.getElementById('timeline-bar').classList.contains('hidden'));
  });

  // 全屏按钮 — 一键隐藏/显示所有面板
  document.getElementById('btn-fullscreen').addEventListener('click', () => {
    const panels = [
      ['left-panel', 'btn-left-panel'],
      ['event-list-panel', 'btn-events'],
      ['timeline-bar', 'btn-timeline'],
    ];
    const allHidden = panels.every(([pid]) => document.getElementById(pid).classList.contains('hidden'));
    panels.forEach(([pid, bid]) => {
      const el = document.getElementById(pid);
      const btn = document.getElementById(bid);
      if (allHidden) {
        el.classList.remove('hidden');
        btn.classList.add('active');
      } else {
        el.classList.add('hidden');
        btn.classList.remove('active');
      }
    });
    document.getElementById('btn-fullscreen').textContent = allHidden ? '⤢' : '⤡';
    // 同步 no-timeline 状态
    document.body.classList.toggle('no-timeline', document.getElementById('timeline-bar').classList.contains('hidden'));
  });

  // 时间轴滑块（拖动实时刷新，停顿后才弹事件通知/自动追踪，避免快速拖动风暴）
  const slider = document.getElementById('year-slider');
  let toastDebounce = null;
  slider.addEventListener('input', () => {
    const year = parseInt(slider.value);
    stopPlay();
    state.yearFilter = year;
    state.eventFocus = null;
    if (state.expandedEvent !== null) {
      state.expandedEvent = null;
      buildEventList();
    }
    document.getElementById('year-display').textContent = `${year} 年`;
    updateStats();
    render();
    updateEventTrackCurrent();
    clearTimeout(toastDebounce);
    toastDebounce = setTimeout(() => showYearToasts(year), 250);
  });

  // 重置
  document.getElementById('reset-btn').addEventListener('click', () => {
    state.yearFilter = null;
    state.eventFocus = null;
    state.expandedEvent = null;
    state.highlightedPersons.clear();
    slider.value = ERA_START;
    document.getElementById('year-display').textContent = '全部年份';
    stopPlay();
    state.map.flyTo([33, 112], 6, { duration: 0.8 });
    updateStats();
    render();
    buildEventList();
    updateEventTrackCurrent();
  });

  // 播放/暂停
  document.getElementById('play-btn').addEventListener('click', () => {
    if (state.playing) stopPlay();
    else startPlay();
  });

  // 自动追踪开关
  document.getElementById('track-btn').addEventListener('click', () => {
    state.autoTrack = !state.autoTrack;
    document.getElementById('track-btn').classList.toggle('active', state.autoTrack);
    if (!state.autoTrack) {
      state.eventFocus = null;
    state.highlightedPersons.clear();
      render();
    }
  });

  // 详情关闭
  document.getElementById('detail-close').addEventListener('click', () => closeDetail(true));
  document.getElementById('detail-mask').addEventListener('click', () => closeDetail(true));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (document.getElementById('detail-panel').classList.contains('open')) closeDetail(true);
      document.getElementById('list-overlay').classList.remove('open');
    }
  });
}

/* ---------- 时间轴播放 ---------- */
function startPlay() {
  state.playing = true;
  state.detailClosedByUser = false;
  document.getElementById('play-btn').textContent = '⏸';

  // 构建按年份+id排序的事件序列（仅显示的领域）
  const sortedEvents = ATLAS.events
    .filter(e => state.domainFilter.has(e.domain))
    .sort((a, b) => a.year - b.year || a.id.localeCompare(b.id));
  if (sortedEvents.length === 0) { stopPlay(); return; }

  // 找到当前索引：从当前年份开始或从0开始
  let idx = 0;
  if (state.yearFilter !== null) {
    idx = sortedEvents.findIndex(e => e.year > state.yearFilter);
    if (idx === -1) idx = 0;
  }

  // 立即跳到第一个事件
  const jumpToEvent = (i) => {
    const ev = sortedEvents[i];
    if (!ev) return;
    const coord = getEventCoord(ev);

    state.expandedEvent = ev.id;
    state.yearFilter = ev.year;
    document.getElementById('year-slider').value = ev.year;
    document.getElementById('year-display').textContent = `${ev.year} 年`;

    // 事件聚焦：参与者聚到事件位置
    state.eventFocus = (coord && ev.participants && ev.participants.length > 0)
      ? { coord, participants: ev.participants } : null;
    state.highlightedPersons.clear();
    if (ev.participants) ev.participants.forEach(pid => state.highlightedPersons.add(pid));

    // 飞到事件位置
    if (coord) state.map.flyTo(ll(coord), Math.max(state.map.getZoom(), 6), { duration: 0.6 });

    updateStats();
    render();
    buildEventList();
    updateEventTrackCurrent();

    // 左侧展示第一个参与者的人物详情（用户手动关闭后不再自动弹出）
    if (state.detailClosedByUser) {
      // 尊重用户选择，保持关闭
    } else if (ev.participants && ev.participants.length > 0) {
      // 不调用 openDetail (会覆盖 eventFocus)，直接构建详情内容
      showPersonDetail(ev.participants[0]);
    } else {
      closeDetail();
    }
  };

  jumpToEvent(idx);
  state.playTimer = setInterval(() => {
    idx = (idx + 1) % sortedEvents.length;
    jumpToEvent(idx);
  }, 3000);
}

function stopPlay() {
  state.playing = false;
  document.getElementById('play-btn').textContent = '▶';
  if (state.playTimer) { clearInterval(state.playTimer); state.playTimer = null; }
}

/* ---------- 年份事件 toast + 自动追踪 ---------- */
function showYearToasts(year, skipAutoTrack) {
  const events = ATLAS.events.filter(e =>
    e.year === year && state.domainFilter.has(e.domain)
  );
  if (!events.length) {
    if (!skipAutoTrack && state.highlightedPersons.size > 0) {
      state.eventFocus = null;
    state.highlightedPersons.clear();
      render();
    }
    return;
  }

  const container = document.getElementById('toast-container');
  for (const ev of events) {
    const color = DOMAIN_COLOR[ev.domain] || '#b23a2e';
    // 参与者名称
    const participantNames = (ev.participants || [])
      .map(pid => getPerson(pid)?.name)
      .filter(Boolean);
    const participantsHtml = participantNames.length
      ? `<div class="toast-people">👤 ${participantNames.join('、')}</div>`
      : '';
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.setProperty('--toast-color', color);
    toast.dataset.eventId = ev.id;
    toast.innerHTML = `
      <div class="toast-year">${ev.year}</div>
      <div class="toast-body">
        <div class="toast-title">
          <span class="toast-name">${ev.name}</span>
          <span class="toast-domain">${ev.domain}</span>
          <span class="toast-loc">📍 ${ev.location}</span>
        </div>
        <div class="toast-desc">${ev.desc}</div>
        ${participantsHtml}
        <div class="toast-hint">点击在地图上查看 →</div>
      </div>
    `;
    // 点击 toast → 凸显事件位置
    toast.addEventListener('click', () => {
      toast.remove();
      showEventInfo(ev.id);
    });
    // 悬停时暂停自动消失
    let removeTimer;
    const scheduleRemove = () => { removeTimer = setTimeout(() => toast.remove(), 5200); };
    const cancelRemove = () => clearTimeout(removeTimer);
    toast.addEventListener('mouseenter', cancelRemove);
    toast.addEventListener('mouseleave', scheduleRemove);
    container.appendChild(toast);
    scheduleRemove();
  }

  if (state.autoTrack && !skipAutoTrack) autoTrackEvents(events);
}

function autoTrackEvents(events) {
  state.eventFocus = null;
  const trackedEvent = events.find(e => getEventCoord(e));
  if (trackedEvent) {
    const coord = getEventCoord(trackedEvent);
    state.map.flyTo(ll(coord), 7, { duration: 1.2 });
  }
  state.highlightedPersons.clear();
  for (const ev of events) {
    if (ev.participants) ev.participants.forEach(pid => state.highlightedPersons.add(pid));
  }
  render();
}

/* ---------- 时间轴事件标记 ---------- */
function buildTimelineEvents() {
  const track = document.getElementById('event-track');
  const span = ERA_END - ERA_START;
  const dots = ATLAS.events
    .filter(e => state.domainFilter.has(e.domain))
    .map(e => {
      const pct = ((e.year - ERA_START) / span) * 100;
      const color = DOMAIN_COLOR[e.domain] || '#b23a2e';
      return `<div class="event-dot" style="left:${pct}%;background:${color}"
        data-year="${e.year}" data-event="${e.id}"
        title="${e.year}年 · ${e.name}（${e.domain}）"></div>`;
    }).join('');
  track.innerHTML = dots;
  track.querySelectorAll('.event-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      const year = parseInt(dot.dataset.year);
      state.yearFilter = year;
      document.getElementById('year-slider').value = year;
      document.getElementById('year-display').textContent = `${year} 年`;
      stopPlay();
      updateStats();
      render();
      showYearToasts(year);
      updateEventTrackCurrent();
    });
  });
  updateEventTrackCurrent();
}

function updateEventTrackCurrent() {
  document.querySelectorAll('.event-dot').forEach(dot => {
    const dotYear = parseInt(dot.dataset.year);
    dot.classList.toggle('current',
      state.yearFilter !== null && dotYear === state.yearFilter
    );
    dot.classList.toggle('future',
      state.yearFilter !== null && dotYear > state.yearFilter
    );
  });
  // 同步事件一览表高亮和滚动
  highlightCurrentEvent();
}

function buildTimelineTicks() {
  const ticks = document.getElementById('timeline-ticks');
  const years = [184, 200, 208, 220, 229, 234, 263, 280];
  const span = ERA_END - ERA_START;
  ticks.innerHTML = years.map(y => {
    const pct = ((y - ERA_START) / span) * 100;
    return `<span class="tick" style="left:${pct}%">${y}</span>`;
  }).join('');
}

/* =========================================================================
 * 统计
 * ========================================================================= */
function updateStats() {
  const persons = ATLAS.persons.filter(p => {
    if (state.factionFilter !== 'all' && p.faction !== state.factionFilter) return false;
    if (state.yearFilter !== null && (p.birth > state.yearFilter || p.death < state.yearFilter)) return false;
    return true;
  });
  const events = ATLAS.events.filter(e => {
    if (state.yearFilter !== null && e.year > state.yearFilter) return false;
    if (!state.domainFilter.has(e.domain)) return false;
    return true;
  });
  const relations = ATLAS.relations.filter(r => {
    if (state.factionFilter !== 'all') {
      const sp = getPerson(r.source), tp = getPerson(r.target);
      if (sp?.faction !== state.factionFilter && tp?.faction !== state.factionFilter) return false;
    }
    return isRelationActive(r, state.yearFilter);
  });
  document.getElementById('stat-persons').textContent = persons.length;
  document.getElementById('stat-relations').textContent = relations.length;
  document.getElementById('stat-events').textContent = events.length;
}

/* =========================================================================
 * 人物详情面板
 * ========================================================================= */
function openDetail(personId) {
  const person = getPerson(personId);
  if (!person) return;
  state.selectedPerson = personId;
  state.eventFocus = null;

  // 地图飞到人物当前位置居中
  const coord = getPersonPositionAtYear(person, state.yearFilter);
  if (coord) state.map.flyTo(ll(coord), Math.max(state.map.getZoom(), 6), { duration: 0.8 });

  // 高亮该人物在当前年份已建立关系的关联人物
  state.highlightedPersons.clear();
  for (const r of getRelationsOf(personId)) {
    if (!isRelationActive(r, state.yearFilter)) continue;
    const otherId = r.source === personId ? r.target : r.source;
    state.highlightedPersons.add(otherId);
  }

  renderDetailContent(person);
  render();
}

/** 仅渲染详情内容并打开面板（不改地图状态，播放时使用） */
function showPersonDetail(personId) {
  const person = getPerson(personId);
  if (!person) return;
  renderDetailContent(person);
}

/** 生成人物详情 HTML 并挂载 */
function renderDetailContent(person) {
  const faction = getFaction(person.faction);
  const relations = getRelationsOf(person.id);
  const events = person.events || [];

  const relationsHtml = relations.map(r => {
    const otherId = r.source === person.id ? r.target : r.source;
    const other = getPerson(otherId);
    if (!other) return '';
    const dir = r.source === person.id ? '→' : '←';
    return `<span class="relation-chip" data-person="${other.id}">${dir} ${other.name}<span class="rel-type">${r.type}</span></span>`;
  }).join('');

  const eventsHtml = events.map(e => `
    <div class="detail-fact">
      <span class="k">${e.year}年</span>
      <span><b>${e.place}</b> · ${e.desc}</span>
    </div>
  `).join('');

  document.getElementById('detail-content').innerHTML = `
    <div class="detail-hero">
      <div class="detail-avatar" style="background:${faction.color}">${getPersonImage(person.id) ? `<img src="${getPersonImage(person.id)}" alt="${person.name}" onerror="this.outerHTML='${person.avatar}'" />` : person.avatar}</div>
      <div class="detail-hero-info">
        <h3>${person.name}</h3>
        <div class="courtesy">字 ${person.courtesy}${person.alias.length ? ' · ' + person.alias.join('、') : ''}</div>
        <span class="detail-tag" style="background:${faction.color}">${faction.name}</span>
      </div>
    </div>
    <div class="detail-section">
      <h4>基本信息</h4>
      <div class="detail-fact"><span class="k">生卒</span><span>${person.birth}–${person.death}年（享年${person.death - person.birth}岁）</span></div>
      <div class="detail-fact"><span class="k">故里</span><span>${person.birthPlace}${getBirthplaceModern(person.birthPlace) ? `<span class="modern-loc">（${getBirthplaceModern(person.birthPlace)}）</span>` : ''}</span></div>
      <div class="detail-fact"><span class="k">官职</span><span>${person.title}</span></div>
      <div class="detail-fact"><span class="k">身份</span><span>${person.roles.join('、')}</span></div>
    </div>
    <div class="detail-section">
      <h4>生平简介</h4>
      <p>${person.bio}</p>
    </div>
    <div class="detail-section">
      <h4>生平大事（地图轨迹）</h4>
      ${eventsHtml || '<p style="color:var(--ink-light)">暂无</p>'}
    </div>
    <div class="detail-section">
      <h4>人物关系（${relations.length}）</h4>
      <div class="detail-relations">${relationsHtml || '<span style="color:var(--ink-light)">暂无</span>'}</div>
    </div>
  `;

  document.querySelectorAll('.relation-chip').forEach(chip => {
    chip.addEventListener('click', () => openDetail(chip.dataset.person));
  });

  document.getElementById('detail-panel').classList.add('open');
  document.getElementById('detail-panel').setAttribute('aria-hidden', 'false');
  document.getElementById('detail-mask').classList.add('show');
}

function closeDetail(byUser) {
  if (byUser && state.playing) state.detailClosedByUser = true;
  state.selectedPerson = null;
  state.eventFocus = null;
  state.highlightedPersons.clear();
  document.getElementById('detail-panel').classList.remove('open');
  document.getElementById('detail-panel').setAttribute('aria-hidden', 'true');
  document.getElementById('detail-mask').classList.remove('show');
  render();
}

/* =========================================================================
 * 事件信息
 * ========================================================================= */
function showEventInfo(eventId) {
  const ev = ATLAS.events.find(e => e.id === eventId);
  if (!ev) return;
  stopPlay();
  // 如果人物详情面板打开，自动关闭
  if (state.selectedPerson) closeDetail();
  const coord = getEventCoord(ev);
  state.eventFocus = (coord && ev.participants && ev.participants.length > 0)
    ? { coord, participants: ev.participants }
    : null;
  if (coord) state.map.flyTo(ll(coord), 7, { duration: 1 });
  state.highlightedPersons.clear();
  if (ev.participants) ev.participants.forEach(pid => state.highlightedPersons.add(pid));
  state.yearFilter = ev.year;
  state.expandedEvent = eventId;
  document.getElementById('year-slider').value = ev.year;
  document.getElementById('year-display').textContent = `${ev.year} 年`;
  updateStats();
  render();
  buildEventList(); // 同步右侧一览表展开该事件
  updateEventTrackCurrent();
}

/* =========================================================================
 * 人物名册浮层
 * ========================================================================= */
function buildListOverlay() {
  const body = document.getElementById('list-overlay-body');
  const grid = ATLAS.persons.map(p => `
    <div class="person-card ${p.faction}" data-id="${p.id}">
      <div class="person-avatar">${p.avatar}</div>
      <div class="person-name">${p.name}</div>
      <div class="person-courtesy">字 ${p.courtesy}</div>
      <div class="person-role">${FACTION_NAME[p.faction]} · ${p.title}</div>
      <div class="person-years">${p.birth}–${p.death}年</div>
    </div>
  `).join('');
  body.innerHTML = `<div class="person-grid">${grid}</div>`;
  body.querySelectorAll('.person-card').forEach(card => {
    card.addEventListener('click', () => {
      document.getElementById('list-overlay').classList.remove('open');
      openDetail(card.dataset.id); // openDetail 内部已 flyTo 到正确位置
    });
  });
}

/* =========================================================================
 * 事件一览表（右侧常驻面板，按领域分组+可折叠）
 * ========================================================================= */
const DOMAIN_ORDER = ['军事','政治','文学','科技','外交','文化'];

function buildEventList() {
  const body = document.getElementById('event-list-body');
  const allEvents = [...ATLAS.events].sort((a, b) => a.year - b.year || a.id.localeCompare(b.id));
  const visibleCount = allEvents.filter(e => state.domainFilter.has(e.domain)).length;
  document.getElementById('event-list-count').textContent = `${visibleCount} 件`;

  let html = '';
  for (const domain of DOMAIN_ORDER) {
    const dc = DOMAIN_COLOR[domain] || '#888';
    const enabled = state.domainFilter.has(domain);
    const collapsed = state.collapsedDomains.has(domain);
    const events = allEvents.filter(e => e.domain === domain);

    // 分组标题
    html += `
      <div class="el-group-header" data-domain="${domain}">
        <span class="el-fold ${collapsed ? 'folded' : ''}">${collapsed ? '▶' : '▼'}</span>
        <span class="el-dot" style="background:${dc}"></span>
        <span class="el-group-name">${domain}</span>
        <span class="el-group-count">${events.length}</span>
        <input type="checkbox" class="el-group-toggle" data-domain="${domain}" ${enabled ? 'checked' : ''} />
      </div>
    `;

    // 事件列表（折叠时隐藏）
    if (enabled && !collapsed) {
      html += '<div class="el-group-body">';
      for (const e of events) {
        const isExpanded = state.expandedEvent === e.id;
        const participantNames = (e.participants || [])
          .map(pid => getPerson(pid)?.name).filter(Boolean);
        html += `
          <div class="event-list-item ${isExpanded ? 'expanded' : ''}" data-event="${e.id}" data-year="${e.year}">
            <div class="el-year">${e.year}</div>
            <div class="el-body">
              <div class="el-name">${e.name}<span class="el-tag" style="--dc:${dc}">${e.domain}</span></div>
              ${isExpanded ? `
                <div class="el-detail">
                  <div class="el-loc">📍 ${e.location}</div>
                  <div class="el-desc">${e.desc}</div>
                  ${participantNames.length ? `<div class="el-people">👤 ${participantNames.join('、')}</div>` : ''}
                </div>
              ` : ''}
            </div>
          </div>
        `;
      }
      html += '</div>';
    }
  }

  body.innerHTML = html;

  // 绑定事件条目点击 — 展开/折叠 + 地图联动
  body.querySelectorAll('.event-list-item').forEach(item => {
    item.addEventListener('click', () => {
      const eid = item.dataset.event;
      if (state.expandedEvent === eid) {
        // 已展开 → 折叠
        state.expandedEvent = null;
        buildEventList();
      } else {
        // 展开 + 地图联动（showEventInfo 内部会重建一览表）
        showEventInfo(eid);
      }
    });
  });

  // 绑定分组折叠
  body.querySelectorAll('.el-group-header').forEach(header => {
    header.addEventListener('click', (e) => {
      if (e.target.classList.contains('el-group-toggle')) return; // checkbox 单独处理
      const domain = header.dataset.domain;
      if (state.collapsedDomains.has(domain)) {
        state.collapsedDomains.delete(domain);
      } else {
        state.collapsedDomains.add(domain);
      }
      buildEventList();
    });
  });

  // 绑定领域开关
  body.querySelectorAll('.el-group-toggle').forEach(cb => {
    cb.addEventListener('change', (e) => {
      e.stopPropagation();
      const d = cb.dataset.domain;
      if (cb.checked) state.domainFilter.add(d);
      else state.domainFilter.delete(d);
      // 同步左面板的领域 checkbox
      const leftCb = document.querySelector(`.domain-toggle input[data-domain="${d}"]`);
      if (leftCb) leftCb.checked = cb.checked;
      buildTimelineEvents();
      buildEventList();
      updateStats();
      render();
    });
  });

  highlightCurrentEvent();
}

/** 高亮当前年份的事件并自动滚动 */
function highlightCurrentEvent() {
  const items = document.querySelectorAll('.event-list-item');
  if (!items.length) return;
  const year = state.yearFilter;
  let firstActive = null;

  items.forEach(item => {
    const evYear = parseInt(item.dataset.year);
    const isActive = year !== null && evYear === year;
    const isPast = year !== null && evYear < year;
    item.classList.toggle('active', isActive);
    item.classList.toggle('past', isPast);
    if (isActive && !firstActive) firstActive = item;
  });

  if (firstActive) {
    firstActive.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

/* =========================================================================
 * 启动
 * ========================================================================= */
document.addEventListener('DOMContentLoaded', init);
