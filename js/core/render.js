/* =========================================================================
 * 华夏人物图鉴 · 主渲染管线
 *
 * render() 清空并重建所有 Leaflet 图层：
 *   1. 人物标记（持久化，位置随年份平滑移动）
 *   2. 选中人物的关系连线
 *   3. 选中人物的活动轨迹
 *   4. 事件参与者连线
 *   5. 事件标记
 *   6. 都城 + 一般城市标记
 * ========================================================================= */

import { state, DOMAIN_COLOR, LABEL_OFFSET, ll, formatYear, relationStyle, relationLabel } from './state.js';
import {
  current, FACTION_COLOR, ERA_START, ERA_END,
  getPerson, getEventCoord, getPersonImage, getPersonPositionAtYear,
  getPersonImportance, getEventImportance, getRelationsOf,
} from './atlas.js';
import { showEventInfo } from './detail.js';
import { openDetail } from './detail.js';
import { mapView } from './map.js';

/* =========================================================================
 * 主渲染
 * ========================================================================= */
export function render() {
  if (!state.map) return;

  // 1. 人物标记
  renderPersonMarkers();

  // 2. 选中人物的关系连线
  state.layerRelations.clearLayers();
  if (state.selectedPerson) {
    const myMarker = state.personMarkers.get(state.selectedPerson);
    buildPersonRelationLines(state.selectedPerson).forEach(line => {
      const otherMarker = state.personMarkers.get(line.otherId);
      const from = myMarker ? myMarker.getLatLng() : ll(line.coords[0]);
      const to = otherMarker ? otherMarker.getLatLng() : ll(line.coords[1]);
      const poly = L.polyline([from, to], {
        color: line.color, weight: line.weight, opacity: line.opacity,
        dashArray: line.dashed ? '4,4' : null,
      }).bindTooltip(line.tooltip, {
        sticky: true, direction: 'top', className: 'relation-tooltip',
      });
      // E5: 点击连线 → 打开对方人物详情
      poly.on('click', () => {
        import('./detail.js').then(m => m.openDetail(line.otherId));
      });
      poly.addTo(state.layerRelations);
    });
  }

  // 3. 活动轨迹
  state.layerTrajectory.clearLayers();
  if (state.selectedPerson) {
    const { lines, points } = buildTrajectory(state.selectedPerson);
    lines.forEach(seg => {
      L.polyline([ll(seg.coords[0]), ll(seg.coords[1])], {
        color: '#b8893a', weight: 3, opacity: 0.8, dashArray: '8,4',
      }).bindTooltip(seg.tooltip, {
        sticky: true, direction: 'top', className: 'relation-tooltip',
      }).addTo(state.layerTrajectory);
    });
    points.forEach(pt => {
      L.circleMarker(ll(pt.coord), {
        radius: 5, fillColor: '#b8893a', color: '#fff', weight: 2,
        fillOpacity: 0.9, opacity: 1,
      }).bindTooltip(`${formatYear(pt.year)} ${pt.place}｜${pt.desc}`, {
        direction: 'top', offset: [0, -6], className: 'relation-tooltip',
      }).addTo(state.layerTrajectory);
    });
  }

  // 3.5 事件参与者连线
  if (state.eventFocus && !state.selectedPerson) {
    state.layerRelations.clearLayers();
    const center = ll(state.eventFocus.coord);
    const atlas = current();
    const eventName = atlas.events.find(e => {
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
          sticky: true, direction: 'top', className: 'relation-tooltip',
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
    renderCapitalAndCities();
  }

  // F14 热力图层
  renderHeatLayer();

  updateLineLegend();
}

/* =========================================================================
 * 人物标记渲染（持久化标记）
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
      marker.setLatLng(ll(d.coord));
      marker.setOpacity(opacity);
      if (marker._labelDir !== d.labelDir) {
        marker.unbindTooltip();
        marker.bindTooltip(d.name, {
          permanent: true, direction: d.labelDir, offset: LABEL_OFFSET[d.labelDir],
          className: 'marker-label person-label',
        });
        marker._labelDir = d.labelDir;
      }
      const tipEl = marker.getTooltip?.()?.getElement?.();
      if (tipEl) {
        tipEl.classList.toggle('label-selected', isSelected);
        tipEl.classList.toggle('label-highlighted', isHighlighted);
      }
    } else {
      const fc = FACTION_COLOR[d.faction];
      const fcHex = fc.replace('#', '');
      const person = getPerson(d.personId);
      const avatarChar = person?.avatar || '?';
      const imgUrl = getPersonImage(d.personId)
        || `https://ui-avatars.com/api/?name=${encodeURIComponent(avatarChar)}&size=64&background=${fcHex}&color=fff&bold=true&font-size=0.5`;
      const icon = L.divIcon({
        html: `<div class="person-avatar-marker" style="--fc:${fc}">
          <img src="${imgUrl}" alt="${d.name}" loading="lazy" decoding="async" onerror="this.style.display='none';this.parentNode.classList.add('fallback')" />
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

function getVisibleImportanceThreshold() {
  const zoom = state.map ? state.map.getZoom() : 6;
  const [z1, z2] = mapView().importanceZoom;
  if (zoom < z1) return 1;
  if (zoom < z2) return 2;
  return 3;
}

function buildPersonData() {
  const threshold = getVisibleImportanceThreshold();
  const atlas = current();
  const persons = atlas.persons.filter(p => {
    if (state.factionFilter !== 'all' && p.faction !== state.factionFilter) return false;
    if (state.yearFilter !== null && (p.birth > state.yearFilter || p.death < state.yearFilter)) return false;
    if (state.selectedPerson === p.id) return true;
    if (state.highlightedPersons.has(p.id)) return true;
    if (state.eventFocus && state.eventFocus.participants.includes(p.id)) return true;
    if (getPersonImportance(p.id) > threshold) return false;
    return true;
  });

  const groups = new Map();
  for (const p of persons) {
    let coord;
    if (state.eventFocus && state.eventFocus.participants.includes(p.id)) {
      coord = state.eventFocus.coord;
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
      if (count > 1 && p.id !== state.selectedPerson) {
        const zoom = state.map ? state.map.getZoom() : 6;
        const degPerPx = 360 / (256 * Math.pow(2, zoom));
        const radius = Math.min(1.2, (26 + count * 6) * degPerPx);
        const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
        const c = Math.cos(angle), sn = Math.sin(angle);
        lng += c * radius;
        lat += sn * radius;
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

function buildEventData() {
  const threshold = getVisibleImportanceThreshold();
  const atlas = current();
  const events = atlas.events.filter(e => {
    if (state.yearFilter !== null && e.year > state.yearFilter) return false;
    if (!state.domainFilter.has(e.domain)) return false;
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

function renderCapitalAndCities() {
  const atlas = current();
  const capitalCoords = new Set();

  // 都城
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

  // 一般城市
  if (state.map.getZoom() >= mapView().cityZoom) {
    const cityPlaces = new Set();
    const threshold = getVisibleImportanceThreshold();
    atlas.events.forEach(e => {
      if (state.yearFilter !== null && e.year > state.yearFilter) return;
      if (!state.domainFilter.has(e.domain)) return;
      if (getEventImportance(e.id) > threshold) return;
      if (!capitalCoords.has(e.location)) cityPlaces.add(e.location);
    });
    cityPlaces.forEach(placeName => {
      const place = atlas.places.find(p => p.name === placeName);
      if (!place) return;
      const icon = L.divIcon({
        html: `<div class="city-marker minor-city">
          <svg viewBox="0 0 24 24"><path d="M4 20V10l4-3v3l4-3v3l4-3v3l4-3v13H4z"/></svg>
        </div>`,
        className: '', iconSize: [16, 16], iconAnchor: [8, 16],
      });
      L.marker(ll(place.coord), { icon })
        .bindTooltip(place.name, {
          direction: 'right', offset: [6, -8], className: 'marker-label',
        })
        .addTo(state.layerCapitals);
    });
  }
}

function buildCapitalData() {
  const atlas = current();
  const seen = new Set();
  return atlas.factions
    .filter(f => {
      if (state.factionFilter !== 'all' && f.id !== state.factionFilter) return false;
      if (state.yearFilter !== null && f.capitalFrom && state.yearFilter < f.capitalFrom) return false;
      return true;
    })
    .map(f => {
      const place = atlas.places.find(p => p.name === f.capital);
      if (!place || seen.has(place.name)) return null;
      seen.add(place.name);
      return { name: place.name, coord: place.coord };
    })
    .filter(Boolean);
}

/* ---------- 关系连线 ---------- */
function isRelationActive(r, year) {
  if (year === null) return true;
  const sp = getPerson(r.source), tp = getPerson(r.target);
  if (!sp || !tp) return false;
  if (sp.birth > year || sp.death < year) return false;
  if (tp.birth > year || tp.death < year) return false;
  if (r.year !== null && r.year !== undefined && year < r.year) return false;
  return true;
}

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
      const style = relationStyle(r.type);
      const canonicalType = style.label;
      // 亲属/师承/结义：用关系色；君臣/同时代/其他：用对方势力色（保留原有视觉）
      const useRelationColor = ['亲属', '师承', '结义', '敌对'].includes(canonicalType);
      return {
        otherId,
        coords: [myCoord, otherCoord],
        color: useRelationColor ? style.color : FACTION_COLOR[other.faction],
        weight: 2,
        opacity: 0.65,
        dashed: style.dashed,
        tooltip: `${person.name} ↔ ${other.name}：${relationLabel(r.type)}（${r.label}）`,
      };
    })
    .filter(Boolean);
}

/* ---------- 活动轨迹 ---------- */
function buildTrajectory(personId) {
  const person = getPerson(personId);
  if (!person || !person.events || person.events.length < 2) return { lines: [], points: [] };
  const atlas = current();
  const points = person.events
    .filter(e => state.yearFilter === null || e.year <= state.yearFilter)
    .slice().sort((a, b) => a.year - b.year)
    .map(e => {
      const place = atlas.places.find(p => p.name === e.place);
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
      tooltip: `${person.name}｜${formatYear(a.year)} ${a.place} → ${formatYear(b.year)} ${b.place}`,
    });
  }
  return { lines, points };
}

/* ---------- F14 事件热力图 ---------- */
let heatLayer = null;
function renderHeatLayer() {
  if (!state.layers.heat) {
    if (heatLayer) {
      state.map.removeLayer(heatLayer);
      heatLayer = null;
    }
    return;
  }
  const atlas = current();
  const latlngs = [];
  for (const e of atlas.events || []) {
    if (state.domainFilter.size && !state.domainFilter.has(e.domain)) continue;
    if (state.yearFilter !== null && e.year !== state.yearFilter) continue;
    const coord = getEventCoord(e);
    if (coord) latlngs.push([coord[1], coord[0]]);  // [lat, lng]
  }
  // 懒加载 heat-layer 模块
  if (!window.__heatLayerLoaded) {
    import('./heat-layer.js').then(() => {
      window.__heatLayerLoaded = true;
      drawHeat(latlngs);
    });
  } else {
    drawHeat(latlngs);
  }
}
function drawHeat(latlngs) {
  if (heatLayer) {
    heatLayer.setLatLngs(latlngs);
  } else {
    heatLayer = L.heatLayer(latlngs, { radius: 35, maxOpacity: 0.55 });
    heatLayer.addTo(state.map);
  }
}

/* ---------- 线条说明浮层 ---------- */
function updateLineLegend() {
  const shouldShow = !!(state.selectedPerson || state.eventFocus);
  document.getElementById('line-legend').classList.toggle('visible', shouldShow);
}

/* ---------- 统计 ---------- */
export function updateStats() {
  const atlas = current();
  const persons = atlas.persons.filter(p => {
    if (state.factionFilter !== 'all' && p.faction !== state.factionFilter) return false;
    if (state.yearFilter !== null && (p.birth > state.yearFilter || p.death < state.yearFilter)) return false;
    return true;
  });
  const events = atlas.events.filter(e => {
    if (state.yearFilter !== null && e.year > state.yearFilter) return false;
    if (!state.domainFilter.has(e.domain)) return false;
    return true;
  });
  const relations = atlas.relations.filter(r => {
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

/* ---------- 导出供其他模块使用 ---------- */
export { isRelationActive };
