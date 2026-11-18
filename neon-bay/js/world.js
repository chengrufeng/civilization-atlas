'use strict';
/* =====================================================================
   霓虹湾 NEON BAY —— 世界：渲染器、城市生成、碰撞体、天空与昼夜
   坐标约定：y 向上；车/人的朝向 h 对应前进方向 (sin h, cos h)；
   前进方向 (fx, fz) 的右手边是 (-fz, fx)。
   ===================================================================== */

const N = 9;                 // 每边街区数
const BLOCK = 60;            // 街区边长（含人行道）
const ROAD = 16;             // 路宽
const PITCH = BLOCK + ROAD;  // 相邻路中心线间距
const HALF = N * PITCH / 2;
const LANE = 3.2;            // 行车道距中心线
const PARK_OFF = 6.7;        // 路边停车位距中心线
const TILE = 32;             // 外墙贴图一张对应的米数
const CURB = 0.15;           // 人行道高度
const X_MIN = -HALF - 40, X_MAX = HALF + 66, Z_MIN = -HALF - 40, Z_MAX = HALF + 40;

const rand = (a, b) => a + Math.random() * (b - a);
const randi = (a, b) => Math.floor(rand(a, b + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const wrapAngle = a => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };
const roadX = i => -HALF + i * PITCH;          // 第 i 条路的中心线坐标 (0..N)
const blockC = i => -HALF + (i + 0.5) * PITCH; // 第 i 个街区的中心坐标 (0..N-1)

// 固定种子，保证每次打开都是同一座城市
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const wr = mulberry32(20261117);
const wrand = (a, b) => a + wr() * (b - a);
const wpick = a => a[Math.floor(wr() * a.length)];

/* ---------------- 渲染器 / 场景 ---------------- */
const canvas = document.getElementById('game');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xffffff, 140, 950);
const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.5, 3200);
camera.position.set(0, 150, 260);

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

const hemi = new THREE.HemisphereLight(0xffffff, 0x8a7f74, 1);
const sun = new THREE.DirectionalLight(0xffffff, 3);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -110; sun.shadow.camera.right = 110;
sun.shadow.camera.top = 110; sun.shadow.camera.bottom = -110;
sun.shadow.camera.near = 10; sun.shadow.camera.far = 700;
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.6;
scene.add(hemi, sun, sun.target);

/* ---------------- 贴图 ---------------- */
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// 外墙：一张贴图 = 32m x 32m = 8x8 扇窗；map 是白天外观，emap 是夜晚亮灯
function makeFacade(style, seed) {
  const r = mulberry32(seed);
  const lit = []; for (let i = 0; i < 64; i++) lit.push(r());
  const S = 256, C = 32;
  const rects = style === 0 ? [[6, 7, 20, 17]] : style === 1 ? [[1, 9, 30, 15]] : [[5, 6, 8, 19], [19, 6, 8, 19]];
  const each = cb => { for (let cy = 0; cy < 8; cy++) for (let cx = 0; cx < 8; cx++) cb(cx * C, cy * C, lit[cy * 8 + cx]); };
  const map = canvasTex(S, S, g => {
    g.fillStyle = '#ece8e1'; g.fillRect(0, 0, S, S);
    g.fillStyle = 'rgba(0,0,0,0.12)'; for (let y = 0; y < S; y += C) g.fillRect(0, y, S, 2);
    if (style === 2) { g.fillStyle = 'rgba(255,255,255,0.7)'; for (let y = 0; y < S; y += C) g.fillRect(0, y + 27, S, 3); }
    each((x, y) => {
      for (const q of rects) {
        const gr = g.createLinearGradient(0, y + q[1], 0, y + q[1] + q[3]);
        gr.addColorStop(0, '#6f93b3'); gr.addColorStop(1, '#22303f');
        g.fillStyle = gr; g.fillRect(x + q[0], y + q[1], q[2], q[3]);
      }
    });
  });
  const emap = canvasTex(S, S, g => {
    g.fillStyle = '#000'; g.fillRect(0, 0, S, S);
    each((x, y, L) => {
      if (L > 0.42) return;
      g.fillStyle = L < 0.05 ? '#9fd4ff' : L < 0.24 ? '#ffd58a' : '#fff0c4';
      for (const q of rects) g.fillRect(x + q[0], y + q[1], q[2], q[3]);
    });
  });
  return { map, emap };
}
const FACADES = [makeFacade(0, 11), makeFacade(1, 22), makeFacade(2, 33)];
const facadeMats = [];           // 用于夜晚统一调亮窗户
const _facadeCache = new Map();
function facadeMat(style, tint) {
  const key = style * 0x1000000 + tint;
  let m = _facadeCache.get(key);
  if (!m) {
    const side = new THREE.MeshStandardMaterial({
      map: FACADES[style].map, emissiveMap: FACADES[style].emap, emissive: 0xffffff, emissiveIntensity: 0,
      color: tint, roughness: 0.82, metalness: 0.05,
    });
    const roof = new THREE.MeshStandardMaterial({ color: new THREE.Color(tint).multiplyScalar(0.45), roughness: 0.95 });
    m = { side, roof, batch: new Batch() };
    facadeMats.push(side);
    _facadeCache.set(key, m);
  }
  return m;
}
// 把大量静态盒子合并成少数几个网格，大幅减少 draw call
class Batch {
  constructor() { this.pos = []; this.nor = []; this.uv = []; this.side = []; this.roof = []; this.n = 0; }
  add(geo, x, y, z) {
    const p = geo.attributes.position.array, nr = geo.attributes.normal.array, uv = geo.attributes.uv.array, idx = geo.index.array;
    for (let i = 0; i < p.length; i += 3) this.pos.push(p[i] + x, p[i + 1] + y, p[i + 2] + z);
    for (let i = 0; i < nr.length; i++) this.nor.push(nr[i]);
    for (let i = 0; i < uv.length; i++) this.uv.push(uv[i]);
    for (let i = 0; i < idx.length; i++) (i >= 12 && i < 24 ? this.roof : this.side).push(idx[i] + this.n); // 盒子的第 3、4 个面是顶和底
    this.n += p.length / 3;
    geo.dispose();
  }
  build(sideMat, roofMat, shadows) {
    if (!this.n) return null;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.nor, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2));
    g.setIndex(this.side.concat(this.roof));
    g.addGroup(0, this.side.length, 0); g.addGroup(this.side.length, this.roof.length, 1);
    const m = new THREE.Mesh(g, [sideMat, roofMat || sideMat]);
    m.castShadow = shadows; m.receiveShadow = shadows; scene.add(m);
    this.pos = this.nor = this.uv = this.side = this.roof = null;
    return m;
  }
}
function buildingGeo(w, h, d) {
  const g = new THREE.BoxGeometry(w, h, d);
  const uv = g.attributes.uv;
  for (let f = 0; f < 6; f++) { // 面顺序：+x -x +y -y +z -z
    const su = (f < 2 ? d : w) / TILE, sv = (f === 2 || f === 3 ? d : h) / TILE;
    for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) * su, uv.getY(i) * sv); }
  }
  return g;
}

/* ---------------- 碰撞体（按街区格子分桶的 AABB） ---------------- */
const buildings = [];            // 所有建筑 AABB：{x0,x1,z0,z1,h}
const colGrid = new Map();
const EMPTY = [];
const cellKey = (x, z) => (Math.floor((x + HALF) / PITCH) + 8) * 64 + Math.floor((z + HALF) / PITCH) + 8;
function addCollider(b) {
  const k = cellKey((b.x0 + b.x1) / 2, (b.z0 + b.z1) / 2);
  let a = colGrid.get(k); if (!a) colGrid.set(k, a = []);
  a.push(b);
}
const nearColliders = (x, z) => colGrid.get(cellKey(x, z)) || EMPTY;

function inBlock(x, z) {
  const u = x + HALF, v = z + HALF;
  if (u < 0 || v < 0 || u >= N * PITCH || v >= N * PITCH) return false;
  const lu = u % PITCH, lv = v % PITCH;
  return lu > ROAD / 2 && lu < PITCH - ROAD / 2 && lv > ROAD / 2 && lv < PITCH - ROAD / 2;
}
const groundY = (x, z) => inBlock(x, z) ? CURB : 0;

// 圆 vs 附近 AABB：把圆推出去，结果写入 out {x,z,hit,nx,nz}
function resolveCircle(x, z, r, out) {
  out.x = x; out.z = z; out.hit = false;
  const list = nearColliders(x, z);
  for (let i = 0; i < list.length; i++) {
    const b = list[i];
    const px = clamp(out.x, b.x0, b.x1), pz = clamp(out.z, b.z0, b.z1);
    let dx = out.x - px, dz = out.z - pz;
    const d2 = dx * dx + dz * dz;
    if (d2 >= r * r) continue;
    if (d2 > 1e-8) {
      const d = Math.sqrt(d2); dx /= d; dz /= d;
      out.x = px + dx * r; out.z = pz + dz * r; out.nx = dx; out.nz = dz;
    } else { // 圆心在盒内：沿最近的边推出
      const l = out.x - b.x0, rr = b.x1 - out.x, t = out.z - b.z0, bt = b.z1 - out.z, m = Math.min(l, rr, t, bt);
      if (m === l) { out.x = b.x0 - r; out.nx = -1; out.nz = 0; }
      else if (m === rr) { out.x = b.x1 + r; out.nx = 1; out.nz = 0; }
      else if (m === t) { out.z = b.z0 - r; out.nx = 0; out.nz = -1; }
      else { out.z = b.z1 + r; out.nx = 0; out.nz = 1; }
    }
    out.hit = true;
  }
}
function pointInBuilding(x, y, z) {
  const list = nearColliders(x, z);
  for (let i = 0; i < list.length; i++) { const b = list[i]; if (x > b.x0 && x < b.x1 && z > b.z0 && z < b.z1 && y < b.h) return true; }
  return false;
}
// 两点之间（俯视）是否没有建筑遮挡
function losFree(x0, z0, x1, z1) {
  const dx = x1 - x0, dz = z1 - z0;
  for (let i = 0; i < buildings.length; i++) {
    const b = buildings[i];
    let t0 = 0, t1 = 1;
    if (Math.abs(dx) < 1e-6) { if (x0 < b.x0 || x0 > b.x1) continue; }
    else { let a = (b.x0 - x0) / dx, c = (b.x1 - x0) / dx; if (a > c) { const s = a; a = c; c = s; } t0 = Math.max(t0, a); t1 = Math.min(t1, c); if (t0 > t1) continue; }
    if (Math.abs(dz) < 1e-6) { if (z0 < b.z0 || z0 > b.z1) continue; }
    else { let a = (b.z0 - z0) / dz, c = (b.z1 - z0) / dz; if (a > c) { const s = a; a = c; c = s; } t0 = Math.max(t0, a); t1 = Math.min(t1, c); if (t0 > t1) continue; }
    return false;
  }
  return true;
}

/* ---------------- 地面 ---------------- */
function flat(x0, x1, z0, z1, y, mat) {
  const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0); g.rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(g, mat); m.position.set((x0 + x1) / 2, y, (z0 + z1) / 2); m.receiveShadow = true;
  scene.add(m); return m;
}
const E = HALF + ROAD / 2; // 城市柏油路面的边界
const asphaltTex = canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = '#565961'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 2600; i++) { const v = 60 + Math.random() * 50 | 0; g.fillStyle = `rgba(${v},${v},${v + 6},0.5)`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
});
asphaltTex.repeat.set(2 * E / 24, 2 * E / 24);
flat(-E, E, -E, E, 0, new THREE.MeshStandardMaterial({ map: asphaltTex, roughness: 0.92 }));
const grassMat = new THREE.MeshStandardMaterial({ color: 0x4a8a42, roughness: 1 });
flat(-3000, -E, -3000, 3000, 0, grassMat);
flat(-E, E, -3000, -E, 0, grassMat);
flat(-E, E, E, 3000, 0, grassMat);
flat(E, E + 64, -3000, 3000, 0, new THREE.MeshStandardMaterial({ color: 0xe6d3a0, roughness: 1 })); // 沙滩
const ocean = flat(E + 62, 3200, -3000, 3000, -0.12, new THREE.MeshPhongMaterial({ color: 0x1f86b8, shininess: 120, specular: 0xbfe9ff }));
ocean.receiveShadow = false;

// 路中心虚线
const dashTex = canvasTex(8, 64, (g) => { g.clearRect(0, 0, 8, 64); g.fillStyle = '#f0cf55'; g.fillRect(0, 0, 8, 30); });
dashTex.repeat.set(1, 2 * HALF / 10);
const dashMat = new THREE.MeshLambertMaterial({ map: dashTex, transparent: true, alphaTest: 0.5, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
for (let i = 0; i <= N; i++) {
  for (const along of [0, 1]) {
    const g = new THREE.PlaneGeometry(0.3, 2 * HALF); g.rotateX(-Math.PI / 2);
    const m = new THREE.Mesh(g, dashMat);
    if (along) { m.rotation.y = Math.PI / 2; m.position.set(0, 0.01, roadX(i)); } else m.position.set(roadX(i), 0.01, 0);
    scene.add(m);
  }
}

/* ---------------- 城市 ---------------- */
const blocks = [];
const blockAt = (i, j) => blocks[i * N + j];
const SPECIAL = { '1,6': 'hospital', '6,2': 'police', '0,1': 'garage' };
const POI = {
  spawn: { x: blockC(5) - 6, z: blockC(5) + 27.6 },
  hospital: { x: blockC(1), z: blockC(6) + 27.6 },
  police: { x: blockC(6), z: blockC(2) + 27.6 },
  garage: { x: roadX(0), z: blockC(1) },
  beach: { x: roadX(N), z: blockC(4) },
  downtown: { x: blockC(4), z: blockC(4) },
};
const TINTS = {
  downtown: [0x8fb4d9, 0xa9b8c9, 0x7d9bb8, 0xd2dae3, 0x6f8fb0, 0xb9c6d6],
  mid: [0xd9c9b0, 0xc9b8a0, 0xe2d6c4, 0xb8b2aa, 0xcfa9a0, 0xa9c0c9],
  low: [0xd8b99a, 0xc9a98a, 0xe6d3b8, 0xbfa58f, 0xd9a9a0, 0xb9c9a9],
  beach: [0xffa9c9, 0x9eeacc, 0xffcfa5, 0xa9dcff, 0xfff2a8, 0xffffff, 0xd9b3ff],
};
const NEON = [0xff3fa4, 0x29e6ff, 0xb44dff, 0xffb347].map(c => {
  const m = new THREE.MeshBasicMaterial({ color: c }); m.userData.base = new THREE.Color(c); m.userData.batch = new Batch(); return m;
});
const UNIT_BOX = new THREE.BoxGeometry(1, 1, 1);
const palmList = [];

function textSprite(text, color, bg) {
  const tex = canvasTex(512, 128, (g) => {
    g.fillStyle = bg; g.fillRect(0, 0, 512, 128);
    g.fillStyle = color; g.font = 'bold 76px "PingFang SC","Microsoft YaHei",sans-serif';
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 256, 68);
  });
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
  s.scale.set(18, 4.5, 1);
  return s;
}
function addLabel(text, color, bg, x, y, z) { const s = textSprite(text, color, bg); s.position.set(x, y, z); scene.add(s); }

function addBuilding(x, z, w, d, h, o) {
  const fm = facadeMat(o.style, o.tint);
  fm.batch.add(buildingGeo(w, h, d), x, CURB + h / 2, z);
  const b = { x0: x - w / 2, x1: x + w / 2, z0: z - d / 2, z1: z + d / 2, h: h + CURB };
  buildings.push(b); addCollider(b);
  if (h >= 48 && wr() < 0.75) { // 高楼加个塔冠
    const cw = Math.round(w * 0.6 / 4) * 4, cd = Math.round(d * 0.6 / 4) * 4, ch = Math.round(h * wrand(0.15, 0.35) / 4) * 4;
    fm.batch.add(buildingGeo(cw, ch, cd), x, CURB + h + ch / 2, z);
  }
  if (o.neon) { // 霓虹腰线
    wpick(NEON).userData.batch.add(new THREE.BoxGeometry(w + 0.5, 0.7, d + 0.5), x, CURB + h - 1.6, z);
  }
}
function addPalm(x, z) {
  palmList.push({ x, z, s: wrand(0.85, 1.3), rot: wr() * 6.28, lean: wrand(-0.08, 0.08) });
  addCollider({ x0: x - 0.3, x1: x + 0.3, z0: z - 0.3, z1: z + 0.3, h: 7 });
}

const QUAD = [[-14, -14, 24, 24], [14, -14, 24, 24], [-14, 14, 24, 24], [14, 14, 24, 24]];
const HX = [[-14, 0, 24, 52], [14, 0, 24, 52]], HZ = [[0, -14, 52, 24], [0, 14, 52, 24]], ONE = [[0, 0, 44, 44]];
const parkCenters = [];

function genBlock(i, j) {
  const cx = blockC(i), cz = blockC(j);
  const dC = Math.max(Math.abs(i - 4), Math.abs(j - 4));
  let type = SPECIAL[i + ',' + j];
  if (!type) {
    if (i === N - 1) type = 'beach';
    else if (dC <= 1) type = 'downtown';
    else if (wr() < 0.13 && !(i === 5 && j === 5)) type = 'park';
    else type = dC === 2 ? 'mid' : 'low';
  }
  blocks.push({ i, j, cx, cz, type });

  if (type === 'park') {
    parkCenters.push([cx, cz]);
    const n = 7 + Math.floor(wr() * 5);
    for (let k = 0; k < n; k++) addPalm(cx + wrand(-23, 23), cz + wrand(-23, 23));
    return;
  }
  if (type === 'hospital') {
    addBuilding(cx, cz - 6, 44, 32, 20, { style: 1, tint: 0xffffff });
    addLabel('✚ 医院', '#e5183c', 'rgba(255,255,255,0.92)', cx, 27, cz + 10.5); return;
  }
  if (type === 'police') {
    addBuilding(cx, cz - 6, 44, 32, 16, { style: 1, tint: 0x8aa0c8 });
    addLabel('警察局', '#ffffff', 'rgba(20,50,140,0.92)', cx, 23, cz + 10.5); return;
  }
  if (type === 'garage') {
    addBuilding(cx + 6, cz, 36, 48, 12, { style: 0, tint: 0x9a9a9a });
    addLabel('西港车库', '#111111', 'rgba(255,225,77,0.95)', cx - 12.5, 16, cz); return;
  }
  const r = wr();
  let lots;
  if (type === 'downtown') lots = r < 0.45 ? ONE : r < 0.7 ? HX : r < 0.85 ? HZ : QUAD;
  else if (type === 'mid') lots = r < 0.2 ? ONE : r < 0.45 ? HX : r < 0.7 ? HZ : QUAD;
  else if (type === 'beach') lots = r < 0.5 ? HZ : QUAD;
  else lots = r < 0.3 ? HX : r < 0.6 ? HZ : QUAD;
  for (const [ox, oz, w, d] of lots) {
    if (type === 'low' && wr() < 0.12) continue; // 空地
    const sw = w - 4 * Math.floor(wr() * 2), sd = d - 4 * Math.floor(wr() * 2);
    let h, style, neonP;
    if (type === 'downtown') { h = lots === ONE ? wrand(64, 128) : wrand(36, 88); style = wr() < 0.7 ? 1 : 0; neonP = 0.5; }
    else if (type === 'mid') { h = wrand(16, 44); style = wr() < 0.5 ? 0 : wr() < 0.5 ? 1 : 2; neonP = 0.25; }
    else if (type === 'beach') { h = wrand(12, 32); style = 2; neonP = 0.75; }
    else { h = wrand(8, 20); style = wr() < 0.6 ? 0 : 2; neonP = 0.15; }
    h = Math.round(h / 4) * 4;
    addBuilding(cx + ox, cz + oz, sw, sd, h, { style, tint: wpick(TINTS[type]), neon: wr() < neonP });
  }
  if (type === 'beach') for (let k = -2; k <= 2; k++) addPalm(cx + 28.6, cz + k * 11);
}
for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) genBlock(i, j);
for (const fm of _facadeCache.values()) fm.batch.build(fm.side, fm.roof, true);
for (const nm of NEON) nm.userData.batch.build(nm, null, false);

// 沙滩边一排棕榈 + 零星几棵
for (let z = -HALF + 6; z < HALF; z += 12) addPalm(E + 4 + wrand(0, 1.5), z + wrand(-2, 2));
for (let k = 0; k < 26; k++) addPalm(E + wrand(14, 48), wrand(-HALF, HALF));

/* 人行道（实例化，一次绘制） */
{
  const tex = canvasTex(64, 64, (g) => {
    g.fillStyle = '#b9b6ae'; g.fillRect(0, 0, 64, 64);
    g.strokeStyle = 'rgba(0,0,0,0.18)'; g.lineWidth = 2; g.strokeRect(0, 0, 64, 64);
  });
  tex.repeat.set(20, 20);
  const im = new THREE.InstancedMesh(new THREE.BoxGeometry(BLOCK, CURB * 2, BLOCK), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 }), blocks.length);
  const m4 = new THREE.Matrix4();
  blocks.forEach((b, k) => { m4.makeTranslation(b.cx, 0, b.cz); im.setMatrixAt(k, m4); });
  im.receiveShadow = true; im.frustumCulled = false; scene.add(im);

  const pg = new THREE.PlaneGeometry(BLOCK - 7, BLOCK - 7); pg.rotateX(-Math.PI / 2);
  const pm = new THREE.InstancedMesh(pg, new THREE.MeshStandardMaterial({ color: 0x4f9a48, roughness: 1, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }), Math.max(1, parkCenters.length));
  parkCenters.forEach((p, k) => { m4.makeTranslation(p[0], CURB + 0.01, p[1]); pm.setMatrixAt(k, m4); });
  pm.count = parkCenters.length; pm.receiveShadow = true; pm.frustumCulled = false; scene.add(pm);
}

/* 棕榈树（实例化：树干 + 7 片叶子） */
{
  const trunkG = new THREE.CylinderGeometry(0.16, 0.3, 7, 6); trunkG.translate(0, 3.5, 0);
  const leafG = new THREE.BoxGeometry(0.95, 0.06, 3.8); leafG.translate(0, 0, 1.9); leafG.rotateX(0.5);
  const trunks = new THREE.InstancedMesh(trunkG, new THREE.MeshLambertMaterial({ color: 0x8a6a45 }), palmList.length);
  const leaves = new THREE.InstancedMesh(leafG, new THREE.MeshLambertMaterial({ color: 0x2f9440 }), palmList.length * 7);
  const o = new THREE.Object3D(), crown = new THREE.Vector3();
  palmList.forEach((p, k) => {
    o.position.set(p.x, groundY(p.x, p.z), p.z); o.rotation.set(p.lean, p.rot, p.lean); o.scale.setScalar(p.s); o.updateMatrix();
    trunks.setMatrixAt(k, o.matrix);
    crown.set(0, 6.9, 0).applyMatrix4(o.matrix); // 树干顶端（树干略有倾斜）
    for (let l = 0; l < 7; l++) {
      o.position.copy(crown);
      o.rotation.set(0, p.rot + l * Math.PI * 2 / 7, 0); o.scale.setScalar(p.s); o.updateMatrix();
      leaves.setMatrixAt(k * 7 + l, o.matrix);
    }
  });
  trunks.castShadow = leaves.castShadow = true; trunks.frustumCulled = leaves.frustumCulled = false;
  scene.add(trunks, leaves);
}

/* 路灯（实例化）+ 夜晚光晕 */
const lampBulbMat = new THREE.MeshBasicMaterial({ color: 0x888888 });
let lampGlow;
{
  const pts = [];
  for (const b of blocks) for (const sx of [-1, 1]) for (const sz of [-1, 1]) pts.push([b.cx + sx * (BLOCK / 2 - 1.1), b.cz + sz * (BLOCK / 2 - 1.1)]);
  const poleG = new THREE.CylinderGeometry(0.08, 0.12, 6.5, 6); poleG.translate(0, 3.25 + CURB, 0);
  const bulbG = new THREE.SphereGeometry(0.3, 8, 6); bulbG.translate(0, 6.6 + CURB, 0);
  const poles = new THREE.InstancedMesh(poleG, new THREE.MeshLambertMaterial({ color: 0x2a2d33 }), pts.length);
  const bulbs = new THREE.InstancedMesh(bulbG, lampBulbMat, pts.length);
  const m4 = new THREE.Matrix4(), pos = new Float32Array(pts.length * 3);
  pts.forEach((p, k) => { m4.makeTranslation(p[0], 0, p[1]); poles.setMatrixAt(k, m4); bulbs.setMatrixAt(k, m4); pos[k * 3] = p[0]; pos[k * 3 + 1] = 6.6 + CURB; pos[k * 3 + 2] = p[1]; });
  poles.frustumCulled = bulbs.frustumCulled = false; scene.add(poles, bulbs);
  const glowTex = canvasTex(64, 64, (g) => {
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  });
  const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  lampGlow = new THREE.Points(gg, new THREE.PointsMaterial({ map: glowTex, size: 7, color: 0xffd9a0, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
  lampGlow.frustumCulled = false; scene.add(lampGlow);
}

/* ---------------- 天空与昼夜 ---------------- */
const skyU = {
  topCol: { value: new THREE.Color() }, horCol: { value: new THREE.Color() },
  sunDir: { value: new THREE.Vector3(0, 1, 0) }, sunCol: { value: new THREE.Color() },
};
const sky = new THREE.Mesh(new THREE.SphereGeometry(2600, 32, 16), new THREE.ShaderMaterial({
  uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
  vertexShader: `varying vec3 vP;
    void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `uniform vec3 topCol; uniform vec3 horCol; uniform vec3 sunDir; uniform vec3 sunCol; varying vec3 vP;
    void main(){
      vec3 d = normalize(vP);
      float h = clamp(d.y, 0.0, 1.0);
      vec3 c = mix(horCol, topCol, pow(h, 0.45));
      float s = max(dot(d, sunDir), 0.0);
      c += sunCol * (smoothstep(0.9993, 0.9997, s) * 1.4 + pow(s, 28.0) * 0.4 + pow(s, 4.0) * 0.14);
      gl_FragColor = vec4(c, 1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`,
}));
sky.renderOrder = -10; sky.frustumCulled = false; scene.add(sky);

let starField;
{
  const n = 700, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, y = Math.random() * 0.95 + 0.05, r = Math.sqrt(1 - y * y);
    pos[i * 3] = Math.cos(a) * r * 2400; pos[i * 3 + 1] = y * 2400; pos[i * 3 + 2] = Math.sin(a) * r * 2400;
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  starField = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 2, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false }));
  starField.frustumCulled = false; scene.add(starField);
}

// 关键帧：时刻、天顶色、地平线色、阳光色、阳光强度、环境光强度、夜晚系数
const SKY = [
  { t: 0,    top: 0x04050f, hor: 0x10152b, sun: 0x8fa8ff, si: 0.8, hi: 0.95, night: 1 },
  { t: 4.8,  top: 0x070a1c, hor: 0x1b2140, sun: 0x8fa8ff, si: 0.8, hi: 0.95, night: 1 },
  { t: 6.2,  top: 0x35539a, hor: 0xff9e73, sun: 0xffb27a, si: 3.0, hi: 2.6, night: 0.5 },
  { t: 8,    top: 0x2f86d9, hor: 0xbfe2f7, sun: 0xfff1dc, si: 4.6, hi: 3.6, night: 0 },
  { t: 16,   top: 0x2a7fd6, hor: 0xc4e4f5, sun: 0xfff4e0, si: 4.8, hi: 3.8, night: 0 },
  { t: 18,   top: 0x4a3f9a, hor: 0xff9a6a, sun: 0xffa066, si: 4.6, hi: 3.4, night: 0.15 },
  { t: 19.2, top: 0x2a1f66, hor: 0xff5fa2, sun: 0xff6f91, si: 2.8, hi: 2.8, night: 0.6 },
  { t: 20.5, top: 0x0a0c26, hor: 0x40245e, sun: 0x8fa8ff, si: 0.8, hi: 1.15, night: 1 },
  { t: 24,   top: 0x04050f, hor: 0x10152b, sun: 0x8fa8ff, si: 0.8, hi: 0.95, night: 1 },
];
const ENV = { hour: 17.2, night: 0, sunDir: new THREE.Vector3(0, 1, 0) };
const _tc = new THREE.Color();
function setTime(h) {
  let a = SKY[0], b = SKY[1];
  for (let i = 0; i < SKY.length - 1; i++) if (h >= SKY[i].t && h <= SKY[i + 1].t) { a = SKY[i]; b = SKY[i + 1]; break; }
  const k = (h - a.t) / ((b.t - a.t) || 1);
  skyU.topCol.value.setHex(a.top).lerp(_tc.setHex(b.top), k);
  skyU.horCol.value.setHex(a.hor).lerp(_tc.setHex(b.hor), k);
  sun.color.setHex(a.sun).lerp(_tc.setHex(b.sun), k);
  const si = lerp(a.si, b.si, k);
  hemi.intensity = lerp(a.hi, b.hi, k);
  const night = ENV.night = lerp(a.night, b.night, k);

  const ang = (h - 6) / 13.5 * Math.PI, sy = Math.sin(ang), sx = Math.cos(ang);
  if (sy > 0.02) { ENV.sunDir.set(sx * 0.85, sy, 0.3).normalize(); sun.intensity = si * smooth(0.02, 0.22, sy); }
  else { ENV.sunDir.set(-0.45, 0.8, 0.35).normalize(); sun.intensity = si * clamp((0.02 - sy) / 0.2, 0, 1); } // 月光
  skyU.sunDir.value.copy(ENV.sunDir);
  skyU.sunCol.value.copy(sun.color).multiplyScalar(sy > 0.02 ? 1 : 0.5);
  hemi.color.copy(skyU.topCol.value).lerp(_tc.setHex(0xffffff), 0.6);
  scene.fog.color.copy(skyU.horCol.value);

  const glow = smooth(0.2, 0.75, night);
  for (let i = 0; i < facadeMats.length; i++) facadeMats[i].emissiveIntensity = glow * 1.25;
  for (let i = 0; i < NEON.length; i++) NEON[i].color.copy(NEON[i].userData.base).multiplyScalar(0.3 + 0.9 * glow);
  lampBulbMat.color.setHex(0x777777).lerp(_tc.setHex(0xffe6b0), glow);
  lampGlow.material.opacity = glow * 0.9;
  starField.material.opacity = smooth(0.6, 1, night) * 0.9;
}
setTime(ENV.hour);

// 阴影跟随焦点
function focusLight(x, z) {
  const gx = Math.round(x / 4) * 4, gz = Math.round(z / 4) * 4;
  sun.target.position.set(gx, 0, gz);
  sun.position.set(gx + ENV.sunDir.x * 300, ENV.sunDir.y * 300, gz + ENV.sunDir.z * 300);
}

function zoneName(x, z) {
  if (x > E + 2) return '日落海滩';
  if (x > roadX(N - 1)) return '海洋大道';
  if (Math.abs(x) < PITCH * 1.5 && Math.abs(z) < PITCH * 1.5) return '市中心';
  if (x < roadX(2)) return '西港区';
  if (z < roadX(2)) return '北岸';
  if (z > roadX(N - 2)) return '小哈瓦那';
  return '中城';
}
