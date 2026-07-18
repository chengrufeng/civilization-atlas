/* =========================================================================
 * 解说播放（Narration Playback）
 *
 * 数据驱动版 Life Journey：以预生成的音频为时间轴，按 segment.t 触发：
 *   - state.yearFilter = segment.year → 关系图层自动按年份高亮
 *   - state.map.flyTo(place.coord) → 镜头跟随
 *   - 累计绘制轨迹 polyline（橙色虚线）+ 头部 circleMarker
 *   - 底部居中字幕（segment.caption）随音频同步显示
 *
 * 与 timeline play / life journey 互斥：启动前会 stop 两者。
 *
 * 数据来源：data/narrations/<personId>.json（含 audio + segments）
 * ========================================================================= */

import { state, ll, formatYear } from './state.js';
import { current, getPerson, manifest } from './atlas.js';
import { stopPlay } from './timeline.js';
import { stopLifeJourney } from './life-journey.js';
import { render, updateStats } from './render.js';
import { buildEventList } from './event-list.js';
import { syncUrlState } from './url-state.js';
import { t, localized } from './i18n.js';
import { getPersonImage } from './atlas.js';
import { closeDetail, openDetail } from './detail.js';

const NARRATION_BASE = '../data/narrations/';

let session = null;   // { script, audio, steps, idx, pathLayer, headMarker, cleanup }

/* 复用 life-journey 的轨迹线样式（独立常量，避免循环引用） */
const PATH_STYLE = {
  color: '#d4691c', weight: 3, opacity: 0.85,
  dashArray: '6 8', lineCap: 'round', lineJoin: 'round',
};
const HEAD_STYLE = {
  radius: 7, color: '#fff', weight: 2,
  fillColor: '#d4691c', fillOpacity: 1,
};

/* 解析脚本的 step 字段 → 实际坐标。
 *  step 对应当前 atlas 的 person.events 顺序（含去重过滤后的可定位事件）。
 *  返回 [{ year, place, coord }] */
function resolveSteps(personId) {
  const atlas = current();
  const person = getPerson(personId);
  if (!person?.events) return [];
  return person.events
    .filter(e => {
      const place = atlas.places.find(p => p.name === e.place);
      return place && place.coord;
    })
    .slice()
    .sort((a, b) => a.year - b.year)
    .map(e => {
      const place = atlas.places.find(p => p.name === e.place);
      return { year: e.year, place: e.place, coord: place.coord, desc: e.desc };
    });
}

/* ---------- UI ---------- */

function ensureBar() {
  let bar = document.getElementById('narration-bar');
  if (bar) return bar;
  bar = document.createElement('div');
  bar.id = 'narration-bar';
  bar.className = 'narration-bar';
  bar.innerHTML = `
    <button class="nr-stop" title="${t('common.close') || '退出'}">✕</button>
    <div class="nr-info">
      <div class="nr-title"></div>
      <div class="nr-progress">
        <div class="nr-progress-track"><div class="nr-progress-fill"></div></div>
        <div class="nr-progress-text"></div>
      </div>
    </div>
    <button class="nr-play-pause" title="${t('common.pause') || '暂停'}">⏸</button>
  `;
  document.body.appendChild(bar);
  bar.querySelector('.nr-play-pause').addEventListener('click', togglePause);
  bar.querySelector('.nr-stop').addEventListener('click', () => stopNarration());
  return bar;
}

function ensureCaption() {
  let cap = document.getElementById('narration-caption');
  if (cap) return cap;
  cap = document.createElement('div');
  cap.id = 'narration-caption';
  cap.className = 'narration-caption';
  document.body.appendChild(cap);
  return cap;
}

function removeUI() {
  document.getElementById('narration-bar')?.remove();
  document.getElementById('narration-caption')?.remove();
  document.getElementById('narration-hero-card')?.remove();
  document.getElementById('narration-year-banner')?.remove();
  document.getElementById('narration-image-card')?.remove();
}

/** 地图大字年份浮现：每次段切换时，"公元 184 年 · 涿郡" 居中淡入淡出 2.2s */
function showYearBanner(seg) {
  if (!seg || seg.year == null) return;
  let banner = document.getElementById('narration-year-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'narration-year-banner';
    banner.className = 'narration-year-banner';
    document.body.appendChild(banner);
  }
  // 重启动动画：先去 class → 强制 reflow → 加 class
  banner.classList.remove('show');
  const yearText = seg.year < 0 ? `公元前 ${Math.abs(seg.year)} 年` : `公元 ${seg.year} 年`;
  banner.innerHTML = `${yearText}${seg.place ? `<span class="nyb-place">${seg.place}</span>` : ''}`;
  void banner.offsetWidth; // reflow
  banner.classList.add('show');
}

/** 图片浮动卡片（右侧中部大图）：如果 segment 配置了 image，则展示 */
function showImageCard(seg) {
  let card = document.getElementById('narration-image-card');
  if (!seg || !seg.image) {
    hideImageCard();
    return;
  }
  if (!card) {
    card = document.createElement('div');
    card.id = 'narration-image-card';
    card.className = 'narration-image-card';
    card.innerHTML = `
      <div class="nic-img-wrap"><img class="nic-img" alt="" /></div>
      <div class="nic-caption"></div>
    `;
    document.body.appendChild(card);
  }
  const img = card.querySelector('.nic-img');
  const cap = card.querySelector('.nic-caption');

  // 决定展示模式：
  //   - seg.imageMode 显式指定时优先
  //   - 否则按段索引轮换（避免单调）：0/1=side, 2=corner-tl, 3=corner-bl，hero 只能手动指定
  const idx = seg._idx != null ? seg._idx : 0;
  let mode = seg.imageMode;
  if (!mode) {
    const rotation = ['mode-side', 'mode-side', 'mode-corner-tl', 'mode-corner-bl'];
    mode = rotation[idx % rotation.length];
  } else {
    mode = `mode-${seg.imageMode}`;
  }
  const animClass = `anim-${idx % 4}`;

  // 重置 class，触发动画
  card.classList.remove('show', 'mode-side', 'mode-hero', 'mode-corner-tl', 'mode-corner-bl',
    'anim-0', 'anim-1', 'anim-2', 'anim-3');
  // 强制 reflow 让动画重启
  void card.offsetWidth;
  card.classList.add(mode, animClass);

  // 新图加载完成后才显示
  img.onload = () => {
    if (!session) return;
    // caption 优先用脚本预填的 imageCaption；否则用 segment.caption 摘要
    const text = seg.imageCaption || (seg.caption && seg.caption.length > 40
      ? seg.caption.slice(0, 38) + '…'
      : (seg.caption || ''));
    cap.textContent = text;
    // 设置模糊背景为同图，填充 contain 模式下的空白
    const wrap = card.querySelector('.nic-img-wrap');
    if (wrap) wrap.style.setProperty('--blur-bg', `url("${seg.image}")`);
    card.classList.add('show');
  };
  img.onerror = () => {
    card.classList.remove('show');
  };
  img.src = seg.image;
}

function hideImageCard() {
  document.getElementById('narration-image-card')?.classList.remove('show');
}

function updateBar() {
  const bar = document.getElementById('narration-bar');
  if (!bar || !session) return;
  const cur = session.audio.currentTime;
  const dur = session.audio.duration || session.script.totalDurationSec || 0;
  const pct = dur > 0 ? (cur / dur) * 100 : 0;
  bar.querySelector('.nr-progress-fill').style.width = `${pct}%`;
  bar.querySelector('.nr-progress-text').textContent = `${formatTs(cur)} / ${formatTs(dur)}`;
  const seg = currentSegment();
  // 标题：年份 · 地点 · 事件摘要（caption 去除前缀年份后的前 18 字）
  // 让用户清楚"成都（取益州）" vs "成都（称帝）"的区别
  if (seg) {
    const eventHint = (seg.caption || '')
      .replace(/^公元\s*-?\d+\s*[年载]?[，。、]*/, '')
      .replace(/^同年冬[—。、]*/, '')
      .slice(0, 18);
    const yearText = seg.year ? formatYear(seg.year) : '';
    const placeText = seg.place || '';
    bar.querySelector('.nr-title').textContent =
      [yearText, placeText, eventHint].filter(Boolean).join(' · ');
  } else {
    bar.querySelector('.nr-title').textContent = session.script.title || '';
  }
  bar.querySelector('.nr-play-pause').textContent = session.audio.paused ? '▶' : '⏸';
}

function formatTs(s) {
  if (!Number.isFinite(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
}

/** 字幕渲染：双行（meta + body）。
 *  - 有 year/place 时显示"公元 184 年 · 涿郡"作为小标题
 *  - body 是 caption 正文 */
function renderCaption(seg) {
  const cap = document.getElementById('narration-caption');
  if (!cap) return;
  if (!seg || !seg.caption) { cap.classList.remove('show'); return; }
  const meta = (seg.year || seg.place)
    ? `${seg.year ? formatYear(seg.year) : ''}${seg.year && seg.place ? ' · ' : ''}${seg.place || ''}`
    : '';
  cap.innerHTML = meta
    ? `<span class="nc-meta">${meta}</span><span class="nc-body">${seg.caption}</span>`
    : `<span class="nc-body">${seg.caption}</span>`;
  cap.classList.add('show');
  // 地图大字年份水印（每次段切换浮现一次）
  showYearBanner(seg);
}

/** 主角名章：左下浮动卡片，半透明头像 + 姓名 + 生卒年 */
function showHeroCard(personId) {
  const atlas = current();
  const person = getPerson(personId);
  if (!person) return;
  let card = document.getElementById('narration-hero-card');
  if (!card) {
    card = document.createElement('div');
    card.id = 'narration-hero-card';
    card.className = 'narration-hero-card';
    document.body.appendChild(card);
  }
  const imgUrl = getPersonImage(personId);
  const faction = (atlas.factions.find(f => f.id === person.faction) || {});
  const fc = faction.color || '#d4691c';
  const avatarHtml = imgUrl
    ? `<img src="${imgUrl}" alt="${person.name}" onerror="this.replaceWith(Object.assign(document.createElement('span'),{textContent:'${person.avatar || person.name[0]}',className:'avatar-fallback'}))" />`
    : (person.avatar || person.name[0]);
  card.innerHTML = `
    <div class="nhc-avatar" style="--fc:${fc}">${avatarHtml}</div>
    <div class="nhc-info">
      <div class="nhc-name">${person.name}</div>
      <div class="nhc-meta">${person.birth && person.death ? `${formatYear(person.birth)} – ${formatYear(person.death)}` : ''}${person.title ? ' · ' + person.title : ''}</div>
    </div>
  `;
  // 触发 transition
  requestAnimationFrame(() => card.classList.add('show'));
}

function hideHeroCard() {
  document.getElementById('narration-hero-card')?.classList.remove('show');
}

/** 氛围特效（火焰 / 桃花飘落） */
function showEffect(effect) {
  hideEffect();
  if (effect === 'fire') {
    const layer = document.createElement('div');
    layer.id = 'narration-effect';
    layer.className = 'nr-effect-fire';
    // 生成 18 个粒子，随机水平位置 + 错相 + 漂移方向
    for (let i = 0; i < 18; i++) {
      const p = document.createElement('div');
      p.className = 'nr-fire-particle';
      p.style.left = `${Math.random() * 100}%`;
      p.style.animationDelay = `${(Math.random() * 3.2).toFixed(2)}s`;
      p.style.animationDuration = `${(2.8 + Math.random() * 1.6).toFixed(2)}s`;
      p.style.setProperty('--drift', `${(Math.random() * 80 - 40).toFixed(0)}px`);
      const size = 16 + Math.random() * 24;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      layer.appendChild(p);
    }
    document.body.appendChild(layer);
  } else if (effect === 'blossom') {
    const layer = document.createElement('div');
    layer.id = 'narration-effect';
    layer.className = 'nr-effect-blossom';
    // 生成 24 片花瓣，随机位置 + 错相 + 漂移 + 落速
    for (let i = 0; i < 24; i++) {
      const p = document.createElement('div');
      p.className = 'nr-petal';
      p.style.left = `${Math.random() * 100}%`;
      const fallDur = 7 + Math.random() * 6;  // 7–13s 落完一屏
      p.style.setProperty('--fall-dur', `${fallDur.toFixed(2)}s`);
      p.style.animationDelay = `${(Math.random() * fallDur).toFixed(2)}s`;
      p.style.setProperty('--drift', `${(Math.random() * 200 - 100).toFixed(0)}px`);
      const size = 12 + Math.random() * 14;   // 12–26px
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      layer.appendChild(p);
    }
    document.body.appendChild(layer);
  }
}

function hideEffect() {
  document.getElementById('narration-effect')?.remove();
}

/** 在当前 step 地点 marker 上添加脉冲波纹 class */
function applyPulseMarker(personId) {
  // 清除旧的
  document.querySelectorAll('.nr-pulse-marker').forEach(el => el.classList.remove('nr-pulse-marker'));
  const marker = state.personMarkers?.get(personId);
  if (!marker) return;
  const el = marker.getElement();
  if (el) el.classList.add('nr-pulse-marker');
}

function clearPulseMarker() {
  document.querySelectorAll('.nr-pulse-marker').forEach(el => el.classList.remove('nr-pulse-marker'));
}


/* ---------- 时间 → segment ---------- */

function currentSegment() {
  if (!session) return null;
  const t0 = session.audio.currentTime;
  const segs = session.script.segments;
  for (let i = segs.length - 1; i >= 0; i--) {
    if (t0 >= segs[i].t) return { ...segs[i], _idx: i };
  }
  return segs[0] ? { ...segs[0], _idx: 0 } : null;
}

/* ---------- step 推进（地图 + 轨迹 + 关系高亮） ---------- */

/** 计算两点地理距离（公里），用于自适应 flyTo 时长 */
function haversineKm(a, b) {
  const R = 6371;
  const dLat = (b[0] - a[0]) * Math.PI / 180;
  const dLng = (b[1] - a[1]) * Math.PI / 180;
  const x = Math.sin(dLat / 2) ** 2 +
    Math.cos(a[0] * Math.PI / 180) * Math.cos(b[0] * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

let renderRafId = null;   // render 防抖句柄
let trailLayer = null;    // 累积轨迹 polyline（增量 addLatLng，避免每次全量重画）

/** 段切换：字幕 + 地图状态 + flyTo + 轨迹 + 图片 全部同步切换
 *  只把 render/buildEventList（重量级 DOM 重建）推迟并防抖。
 *  修复"字幕先到位、地图后到位"的累积漂移问题。 */
function applySegment(seg) {
  if (!seg) return;

  // 1. 字幕（同步）
  renderCaption(seg);

  // 2. 地图状态（同步，与字幕同一帧）
  if (typeof seg.step === 'number' && session.steps[seg.step]) {
    const step = session.steps[seg.step];
    state.yearFilter = step.year;
    state.selectedPerson = session.script.personId;
    state.expandedEvent = null;

    // 关系同期高亮（±10 年）
    state.highlightedPersons.clear();
    const atlas = current();
    const person = getPerson(session.script.personId);
    if (person) {
      for (const r of (atlas.relations || [])) {
        if (r.source !== session.script.personId && r.target !== session.script.personId) continue;
        const rYear = r.year ?? step.year;
        if (Math.abs(rYear - step.year) <= 10) {
          state.highlightedPersons.add(r.source === session.script.personId ? r.target : r.source);
        }
      }
    }

    // flyTo：自适应时长（按地理距离 0.4–0.9s），立即启动
    // Leaflet 自己调度动画，不阻塞主线程
    const curCenter = state.map.getCenter();
    const curLatlng = [curCenter.lat, curCenter.lng];
    const targetLatlng = ll(step.coord);
    const dist = haversineKm(curLatlng, targetLatlng);
    const flyDur = Math.min(0.9, 0.4 + Math.min(dist, 2000) / 4000);
    state.map.flyTo(targetLatlng, Math.max(state.map.getZoom(), 6), {
      duration: flyDur,
      easeLinearity: 0.4,
    });

    // 轨迹线增量更新（不每次全量重画）
    redrawTrailIncremental(seg.step);

    // slider / year-display 同步
    const slider = document.getElementById('year-slider');
    if (slider) slider.value = step.year;
    const yd = document.getElementById('year-display');
    if (yd) yd.textContent = formatYear(step.year);

    // 图片切换（异步加载，不阻塞）
    showImageCard(seg);
    showEffect(seg.effect);
  } else {
    // hook / 引入 / 结尾段：清状态 + 移除脉冲
    state.highlightedPersons.clear();
    clearPulseMarker();
    hideImageCard();
    hideEffect();
  }

  // 3. render + buildEventList 推迟并防抖（连续段切换时只执行最后一次）
  //    这是重量级 DOM 重建，避免每段都全量重画阻塞主线程
  if (renderRafId) cancelAnimationFrame(renderRafId);
  renderRafId = requestAnimationFrame(() => {
    renderRafId = null;
    if (!session) return;
    updateStats();
    render();
    // buildEventList 再次推迟（最重的 DOM 操作）
    requestAnimationFrame(() => {
      if (!session) return;
      buildEventList();
      applyPulseMarker(session.script.personId);
    });
  });
}

/** 轨迹线增量更新：每次段切换只追加最新点，不重画整条线。
 *  step 回退（seek 时）则全量重建。 */
function redrawTrailIncremental(stepIdx) {
  if (!state.map) return;
  const allLatLngs = session.steps.slice(0, stepIdx + 1).map(s => ll(s.coord));

  // 头标位置
  const head = allLatLngs[allLatLngs.length - 1];
  if (head) {
    if (!session.headMarker) {
      session.headMarker = L.circleMarker(head, HEAD_STYLE).addTo(state.map);
    } else {
      session.headMarker.setLatLng(head);
    }
  }

  // 折线：复用已有 layer，追加或重建
  if (!session.pathLayer) {
    if (allLatLngs.length >= 2) {
      session.pathLayer = L.polyline(allLatLngs, PATH_STYLE).addTo(state.map);
      session.pathStepCount = stepIdx + 1;
    }
    return;
  }
  // 段切换检测：如果新长度 > 旧长度，append；否则全量重建（用户 seek 后退）
  if (stepIdx + 1 > (session.pathStepCount || 0)) {
    // 增量：只加新点
    const newPoints = allLatLngs.slice(session.pathStepCount);
    const cur = session.pathLayer.getLatLngs();
    newPoints.forEach(p => cur.push(p));
    session.pathLayer.setLatLngs(cur);
    session.pathStepCount = stepIdx + 1;
  } else if (stepIdx + 1 < (session.pathStepCount || 0)) {
    // 后退：全量重建
    session.pathLayer.setLatLngs(allLatLngs);
    session.pathStepCount = stepIdx + 1;
  }
  // 相等：不动作（同段重复触发）
}

// applySegment / applySegmentSlow 已合并到上方新版实现（同步切换 + render 防抖）

function clearMapArtifacts() {
  if (session?.pathLayer) { session.pathLayer.remove(); session.pathLayer = null; }
  if (session?.headMarker) { session.headMarker.remove(); session.headMarker = null; }
}

/* ---------- 音频事件 ---------- */

let lastSegIdx = -1;
let rafId = null;

/** rAF 高频（60Hz）轮询 currentTime，立即触发段切换。
 *  浏览器原生 timeupdate 仅约 4Hz（250ms），字幕与地图会出现明显延迟。 */
function tick() {
  if (!session || session.audio.paused) {
    rafId = null;
    return;
  }
  const seg = currentSegment();
  if (seg && seg._idx !== lastSegIdx) {
    lastSegIdx = seg._idx;
    applySegment(seg);
  }
  updateBar();
  rafId = requestAnimationFrame(tick);
}

function startTick() {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(tick);
}

function stopTick() {
  if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
}

function onPlay() { startTick(); updateBar(); }
function onPause() { stopTick(); updateBar(); }
function onEnded() { stopNarration(); }
// 兜底：暂停 / seek 等场景
function onTimeUpdate() {
  if (session && !session.audio.paused) return; // rAF 已接管
  const seg = currentSegment();
  if (seg && seg._idx !== lastSegIdx) {
    lastSegIdx = seg._idx;
    applySegment(seg);
  }
  updateBar();
}

/* ---------- 公共 API ---------- */

export async function startNarration(personId, opts = {}) {
  // 1. 加载脚本
  const url = `${NARRATION_BASE}${personId}.json`;
  let script;
  try {
    script = await (await fetch(url)).json();
  } catch (e) {
    console.error('解说脚本加载失败：', e);
    return;
  }

  // 2. 校验当前 atlas（脚本期望的 atlasId 与当前不一致则切换）
  if (script.atlasId && current().id !== script.atlasId) {
    const { switchAtlas } = await import('./atlas.js');
    await switchAtlas(script.atlasId);
  }

  // 3. 解析 steps（person.events 排序后）
  const steps = resolveSteps(personId);
  if (!steps.length) {
    console.warn('当前人物无可定位事件');
    return;
  }

  // 4. 互斥：停掉 life journey / timeline play
  stopPlay();
  stopLifeJourney();

  // 5. 准备音频
  const audio = new Audio(script.audio);
  audio.crossOrigin = 'anonymous';
  audio.preload = 'auto';

  // 记录是否由详情面板触发（结束时恢复）
  const detailWasOpen = document.getElementById('detail-panel')?.classList.contains('open');

  session = {
    script, audio, steps, idx: 0,
    pathLayer: null, headMarker: null,
    personId, detailWasOpen,
  };
  lastSegIdx = -1;
  state.lifeJourney = { personId, total: steps.length, idx: 0, narration: true };
  state.selectedPerson = personId;

  ensureBar();
  ensureCaption();
  audio.addEventListener('timeupdate', onTimeUpdate);
  audio.addEventListener('play', onPlay);
  audio.addEventListener('pause', onPause);
  audio.addEventListener('ended', onEnded);
  audio.addEventListener('seeked', onTimeUpdate);

  // 聚焦模式：弱化其他 UI（含详情面板，时间轴保留）
  document.body.classList.add('narration-focus');
  // 启动时收起详情面板
  try { closeDetail(); } catch {}

  // 主角名章（左下浮动卡片）
  showHeroCard(personId);

  try {
    await audio.play();
  } catch (e) {
    console.warn('自动播放被浏览器拦截，请点击 ▶：', e);
  }

  // 立即应用第一段（hook）
  applySegment(script.segments[0]);
  lastSegIdx = 0;
  updateBar();
}

export function stopNarration() {
  if (!session) return;
  const { personId, detailWasOpen } = session;
  stopTick();
  session.audio.pause();
  session.audio.removeEventListener('timeupdate', onTimeUpdate);
  session.audio.removeEventListener('play', onPlay);
  session.audio.removeEventListener('pause', onPause);
  session.audio.removeEventListener('ended', onEnded);
  session.audio.removeEventListener('seeked', onTimeUpdate);
  clearMapArtifacts();
  clearPulseMarker();
  hideHeroCard();
  hideImageCard();
  hideEffect();
  document.body.classList.remove('narration-focus');
  session = null;
  state.lifeJourney = null;
  state.highlightedPersons.clear();
  lastSegIdx = -1;
  removeUI();
  // 触发一次 render 让图层恢复正常显示
  render();
  // 解说结束后：恢复详情面板（如果启动时是打开的）
  if (detailWasOpen && personId) {
    setTimeout(() => {
      try { openDetail(personId); } catch {}
    }, 400);
  }
}

export function togglePause() {
  if (!session) return;
  if (session.audio.paused) session.audio.play();
  else session.audio.pause();
}

export function isNarrationActive() { return !!session; }

/** 详情面板用：检查某人是否有解说脚本（返回相对 URL 或 null） */
export async function hasNarration(personId) {
  try {
    const r = await fetch(`${NARRATION_BASE}${personId}.json`, { method: 'HEAD' });
    return r.ok ? `${NARRATION_BASE}${personId}.json` : null;
  } catch {
    return null;
  }
}

/** 查看完整解说脚本（详情面板入口）：
 *  弹出 overlay，按时间顺序展示每段的 t / 年份 / 地点 / 文案，可关闭 */
export async function openScriptOverlay(personId) {
  let script;
  try {
    script = await (await fetch(`${NARRATION_BASE}${personId}.json`)).json();
  } catch (e) {
    console.error('脚本加载失败：', e);
    return;
  }

  // 移除已存在的
  document.getElementById('narration-script-overlay')?.remove();
  document.getElementById('narration-script-mask')?.remove();

  const fmtTs = s => {
    if (!Number.isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  const rows = script.segments.map((seg, i) => {
    const yearText = seg.year == null ? '—' : formatYear(seg.year);
    const place = seg.place || '—';
    return `<tr>
      <td class="ns-idx">${i + 1}</td>
      <td class="ns-ts">${fmtTs(seg.t || 0)}</td>
      <td class="ns-year">${yearText}</td>
      <td class="ns-place">${place}</td>
      <td class="ns-caption">${seg.caption || ''}</td>
    </tr>`;
  }).join('');

  const total = script.segments.length;
  const dur = script.totalDurationSec ? fmtTs(script.totalDurationSec) : '—';

  const html = `
    <div class="ns-mask" id="narration-script-mask"></div>
    <div class="ns-overlay" id="narration-script-overlay" aria-hidden="false">
      <div class="ns-header">
        <div class="ns-title">
          <h3>${script.title || personId}</h3>
          <div class="ns-sub">${total} 段 · 总时长 ${dur}${script.voice ? ` · ${script.voice}` : ''}</div>
        </div>
        <button class="ns-close" aria-label="关闭">×</button>
      </div>
      <div class="ns-body">
        <table class="ns-table">
          <thead><tr>
            <th>#</th><th>时间</th><th>年份</th><th>地点</th><th>文案</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div class="ns-footer">
        <button class="ns-play-btn">🎧 ${t('narration.btn') || '解说播放'}</button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);

  const overlay = document.getElementById('narration-script-overlay');
  const mask = document.getElementById('narration-script-mask');
  // 触发 mask 渐入（默认 opacity:0 + pointer-events:none，需加 .show 才可见 + 可点）
  requestAnimationFrame(() => mask.classList.add('show'));
  const close = () => {
    mask.classList.remove('show');
    overlay.classList.remove('show');
    // 等 transition 结束再移除
    setTimeout(() => {
      overlay.remove();
      mask.remove();
    }, 250);
  };
  overlay.querySelector('.ns-close').addEventListener('click', close);
  mask.addEventListener('click', close);
  document.addEventListener('keydown', function onKey(e) {
    if (e.key === 'Escape') {
      close();
      document.removeEventListener('keydown', onKey);
    }
  });
  overlay.querySelector('.ns-play-btn').addEventListener('click', async () => {
    close();
    // 关掉详情面板，避免遮挡
    try { (await import('./detail.js')).closeDetail(); } catch {}
    await startNarration(personId);
  });
}
