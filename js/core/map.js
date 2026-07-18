/* =========================================================================
 * 华夏人物图鉴 · Leaflet 地图初始化
 * ========================================================================= */

import { state, ll } from './state.js';
import { current } from './atlas.js';
import { render } from './render.js';
import { closeDetail } from './detail.js';

/* 缺省地图视角（数据集未提供 mapView 时回退到中国范围） */
const DEFAULT_MAP_VIEW = {
  center: [112, 33], zoom: 6, minZoom: 3, maxZoom: 12,
  labelZoom: { hideAll: 4, hideEvents: 8 },  // 低于该缩放隐藏 全部标签 / 事件标签
  importanceZoom: [6, 8],                    // 重要性阈值分界：<[0]只L1, <[1]显L2, 否则全显
  cityZoom: 6,                               // 一般城市显示的最小缩放
  baseLayer: 'satellite',                    // 默认底图：satellite | admin | terrain
};

export function mapView() {
  const atlas = current();
  return (atlas && atlas.mapView) ? { ...DEFAULT_MAP_VIEW, ...atlas.mapView } : DEFAULT_MAP_VIEW;
}

export function initMap() {
  const view = mapView();
  state.map = L.map('map-chart', {
    zoomControl: false,
    attributionControl: false,
    center: ll(view.center),
    zoom: view.zoom,
    minZoom: view.minZoom,
    maxZoom: view.maxZoom,
  });

  // 底图1：行政区划（高德地图）
  const adminLayer = L.tileLayer(
    'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
    { maxZoom: 18, subdomains: ['1','2','3','4'], attribution: '高德地图' }
  );

  // 底图2：地形图（Esri World Physical Map）
  const terrainLayer = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}',
    { maxZoom: 18, maxNativeZoom: 8, attribution: 'Esri' }
  );

  // 底图3：卫星图（Esri World Imagery）
  const satelliteLayer = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    { maxZoom: 18, attribution: 'Esri' }
  );

  // 按数据集默认底图选择初始图层
  const baseLayers = { satellite: satelliteLayer, admin: adminLayer, terrain: terrainLayer };
  (baseLayers[view.baseLayer] || satelliteLayer).addTo(state.map);

  L.control.layers({
    '卫星图': satelliteLayer,
    '行政区划': adminLayer,
    '地形图': terrainLayer,
  }, null, { position: 'bottomleft', collapsed: true }).addTo(state.map);

  L.control.zoom({ position: 'bottomleft' }).addTo(state.map);

  // 创建图层组（渲染顺序：关系→轨迹→人物→事件→都城）
  state.layerRelations  = L.layerGroup().addTo(state.map);
  state.layerTrajectory = L.layerGroup().addTo(state.map);
  state.layerPersons    = L.layerGroup().addTo(state.map);
  state.layerEvents     = L.layerGroup().addTo(state.map);
  state.layerCapitals   = L.layerGroup().addTo(state.map);

  state.map.on('zoomend', () => {
    updateLabelVisibility();
    render();
  });
  updateLabelVisibility();

  // 点击地图空白处关闭详情面板
  state.map.on('click', () => {
    if (state.selectedPerson) closeDetail(true);
  });
}

/** 缩放级别联动标签显示（阈值随数据集 mapView.labelZoom 变化） */
export function updateLabelVisibility() {
  if (!state.map) return;
  const zoom = state.map.getZoom();
  const c = state.map.getContainer();
  const lz = mapView().labelZoom;
  c.classList.toggle('zoom-hide-all', zoom < lz.hideAll);
  c.classList.toggle('zoom-hide-events', zoom < lz.hideEvents);
}

/** 清空所有图层（切换数据集时调用） */
export function clearAllLayers() {
  if (!state.map) return;
  state.layerRelations.clearLayers();
  state.layerTrajectory.clearLayers();
  state.layerPersons.clearLayers();
  state.layerEvents.clearLayers();
  state.layerCapitals.clearLayers();
  state.personMarkers.clear();
}

/** 飞回当前数据集的默认中心视图 */
export function flyToDefault(zoom) {
  if (!state.map) return;
  const view = mapView();
  state.map.flyTo(ll(view.center), zoom ?? view.zoom, { duration: 0.8 });
}
