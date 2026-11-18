'use strict';
/* =====================================================================
   霓虹湾 NEON BAY —— 实体：粒子、行人、车辆、物理、交通/警察 AI、玩家
   依赖 world.js；运行时引用 game.js 里的 cam / Sfx / UI 函数。
   ===================================================================== */

const _lam = new Map();
const lam = c => { let m = _lam.get(c); if (!m) { m = new THREE.MeshLambertMaterial({ color: c }); _lam.set(c, m); } return m; };
function box(parent, mat, w, h, d, x, y, z) {
  const m = new THREE.Mesh(UNIT_BOX, mat);
  m.scale.set(w, h, d); m.position.set(x, y, z); m.castShadow = true;
  parent.add(m); return m;
}
const _o = { x: 0, z: 0, hit: false, nx: 0, nz: 0 };

/* ---------------- 粒子 & 弹道 ---------------- */
const puffTex = canvasTex(64, 64, (g) => {
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
});
const PARTS = [];
for (let i = 0; i < 160; i++) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex, transparent: true, depthWrite: false }));
  s.visible = false; scene.add(s);
  PARTS.push({ s, life: 0, max: 1, vx: 0, vy: 0, vz: 0, size: 1, grow: 1 });
}
let _pi = 0;
function puff(x, y, z, color, size, life, vy, spread, grow, additive) {
  const p = PARTS[_pi]; _pi = (_pi + 1) % PARTS.length;
  p.s.position.set(x, y, z);
  p.s.material.color.setHex(color);
  p.s.material.blending = additive ? THREE.AdditiveBlending : THREE.NormalBlending;
  p.size = size; p.grow = grow; p.life = p.max = life;
  p.vx = rand(-spread, spread); p.vz = rand(-spread, spread); p.vy = vy + rand(-spread, spread) * 0.5;
  p.s.scale.setScalar(size); p.s.visible = true;
}
function updateParticles(dt) {
  for (let i = 0; i < PARTS.length; i++) {
    const p = PARTS[i]; if (p.life <= 0) continue;
    p.life -= dt;
    if (p.life <= 0) { p.s.visible = false; continue; }
    const k = 1 - p.life / p.max;
    p.s.position.x += p.vx * dt; p.s.position.y += p.vy * dt; p.s.position.z += p.vz * dt;
    p.s.scale.setScalar(p.size * (1 + p.grow * k));
    p.s.material.opacity = (1 - k) * 0.85;
  }
  for (let i = 0; i < TRACERS.length; i++) {
    const t = TRACERS[i]; if (t.life <= 0) continue;
    t.life -= dt; if (t.life <= 0) t.l.visible = false; else t.l.material.opacity = t.life / 0.08;
  }
}
const TRACERS = [];
for (let i = 0; i < 12; i++) {
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
  const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0xfff2a0, transparent: true }));
  l.frustumCulled = false; l.visible = false; scene.add(l);
  TRACERS.push({ l, life: 0 });
}
let _ti = 0;
function tracer(x0, y0, z0, x1, y1, z1) {
  const t = TRACERS[_ti]; _ti = (_ti + 1) % TRACERS.length;
  const a = t.l.geometry.attributes.position;
  a.setXYZ(0, x0, y0, z0); a.setXYZ(1, x1, y1, z1); a.needsUpdate = true;
  t.life = 0.08; t.l.visible = true;
}

/* ---------------- 小人模型 ---------------- */
const SKINS = [0xf1c9a5, 0xd9a57b, 0xa56b43, 0x6b4226];
const SHIRTS = [0xe84a5f, 0x2a9d8f, 0xf4a261, 0x457b9d, 0xffffff, 0xff7eb6, 0x8338ec, 0xffd166, 0x222222, 0x3fb27f];
const PANTS = [0x2b2d42, 0x3d405b, 0x6c757d, 0x1d3557, 0xcdb891, 0x222222];
const HAIRS = [0x1b1b1b, 0x4a2f1b, 0xc9a227, 0x7a7a7a, 0x8a3324];
function makeHuman(shirt, pants, skin, hair) {
  const g = new THREE.Group(), u = g.userData;
  box(g, lam(shirt), 0.5, 0.62, 0.27, 0, 1.15, 0);
  box(g, lam(pants), 0.48, 0.2, 0.26, 0, 0.78, 0);
  box(g, lam(skin), 0.28, 0.3, 0.28, 0, 1.63, 0);
  box(g, lam(hair), 0.3, 0.1, 0.3, 0, 1.81, 0);
  const limb = (mat, w, h, d, x, y) => { const p = new THREE.Group(); p.position.set(x, y, 0); box(p, mat, w, h, d, 0, -h / 2, 0); g.add(p); return p; };
  u.legL = limb(lam(pants), 0.2, 0.72, 0.22, -0.13, 0.72); u.legR = limb(lam(pants), 0.2, 0.72, 0.22, 0.13, 0.72);
  u.armL = limb(lam(shirt), 0.14, 0.6, 0.16, -0.33, 1.44); u.armR = limb(lam(shirt), 0.14, 0.6, 0.16, 0.33, 1.44);
  return g;
}
function animHuman(g, phase, amp) {
  const u = g.userData, s = Math.sin(phase) * amp;
  u.legL.rotation.x = s; u.legR.rotation.x = -s; u.armL.rotation.x = -s * 0.8; u.armR.rotation.x = s * 0.8;
}

/* ---------------- 车辆 ---------------- */
const SEDAN_DIM = { w: 1.9, h: 0.6, l: 4.5, cabW: 1.64, cabH: 0.52, cabL: 2.3, cabZ: -0.2 };
const CAR_TYPES = {
  sedan: { ...SEDAN_DIM, name: '海风 Sedan', max: 32, accel: 11, turn: 2.2, grip: 7, colors: [0xd9d9d9, 0x2b2d42, 0x8d99ae, 0x9b2226, 0x1d3557, 0x386641, 0xf4f1de] },
  sport: { w: 2.0, h: 0.46, l: 4.4, cabW: 1.6, cabH: 0.4, cabL: 1.7, cabZ: -0.3, name: '彗星 GT', max: 48, accel: 17, turn: 2.5, grip: 9, colors: [0xff1654, 0xffd60a, 0x00e5ff, 0xff5fa2, 0xffffff, 0x9d4edd] },
  pickup: { w: 2.0, h: 0.7, l: 5.0, cabW: 1.8, cabH: 0.62, cabL: 1.7, cabZ: 0.35, name: '牧场主 Pickup', max: 28, accel: 9, turn: 2.0, grip: 6, colors: [0x7f5539, 0x495057, 0xbc4749, 0x264653] },
  van: { w: 2.0, h: 1.45, l: 4.8, cabW: 0, cabH: 0, cabL: 0, cabZ: 0, name: '小马 Van', max: 25, accel: 8, turn: 1.9, grip: 6, colors: [0xffffff, 0xe9c46a, 0x8ecae6] },
  taxi: { ...SEDAN_DIM, name: '出租车 Taxi', max: 32, accel: 11, turn: 2.2, grip: 7, colors: [0xffc300] },
  police: { ...SEDAN_DIM, name: '警车 Police', max: 40, accel: 15, turn: 2.4, grip: 8.5, colors: [0x15171c] },
};
const TRAFFIC_MIX = ['sedan', 'sedan', 'sedan', 'taxi', 'taxi', 'pickup', 'van', 'sport'];
const glassMat = new THREE.MeshStandardMaterial({ color: 0x1a2b3a, roughness: 0.2, metalness: 0.4 });
const tireMat = lam(0x14141a);
const wheelGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.28, 12); wheelGeo.rotateZ(Math.PI / 2);
const headMat = new THREE.MeshBasicMaterial({ color: 0xfff3c4 });
const tailMat = new THREE.MeshBasicMaterial({ color: 0xff2030 });
const sirenR = new THREE.MeshBasicMaterial({ color: 0xff2020 }), sirenB = new THREE.MeshBasicMaterial({ color: 0x2060ff }), sirenOff = lam(0x3a3a44);
const wreckMat = lam(0x161616);
const BY = 0.28; // 车身离地

function buildCarMesh(c) {
  const T = c.T, g = new THREE.Group(), ch = new THREE.Group();
  g.add(ch); c.chassis = ch;
  c.bodyMat = new THREE.MeshStandardMaterial({ color: c.color, roughness: 0.38, metalness: 0.3 });
  box(ch, c.bodyMat, T.w, T.h, T.l, 0, BY + T.h / 2, 0);
  c.glass = [];
  if (T.cabW) {
    c.glass.push(box(ch, glassMat, T.cabW, T.cabH, T.cabL, 0, BY + T.h + T.cabH / 2, T.cabZ));
    box(ch, c.bodyMat, T.cabW + 0.02, 0.07, T.cabL - 0.5, 0, BY + T.h + T.cabH + 0.03, T.cabZ);
  }
  if (c.key === 'van') c.glass.push(box(ch, glassMat, T.w - 0.2, 0.55, 0.08, 0, BY + 1.05, T.l / 2), box(ch, glassMat, T.w + 0.04, 0.45, 1.2, 0, BY + 1.1, T.l / 2 - 1.1));
  if (c.key === 'sport') box(ch, c.bodyMat, T.w - 0.2, 0.07, 0.35, 0, BY + T.h + 0.28, -T.l / 2 + 0.25);
  if (c.key === 'pickup') box(ch, lam(0x222226), T.w - 0.3, 0.05, 2.0, 0, BY + T.h + 0.03, -T.l / 2 + 1.15);
  if (c.key === 'taxi') box(ch, headMat, 0.7, 0.2, 0.28, 0, BY + T.h + T.cabH + 0.17, T.cabZ);
  if (c.key === 'police') {
    box(ch, lam(0xf2f2f2), T.w + 0.03, T.h - 0.1, 1.7, 0, BY + T.h / 2, -0.2);
    c.sirens = [box(ch, sirenOff, 0.55, 0.16, 0.3, -0.36, BY + T.h + T.cabH + 0.15, T.cabZ), box(ch, sirenOff, 0.55, 0.16, 0.3, 0.36, BY + T.h + T.cabH + 0.15, T.cabZ)];
  }
  const ly = BY + T.h * 0.62, lx = T.w / 2 - 0.36;
  for (const sx of [-1, 1]) {
    const hl = box(ch, headMat, 0.42, 0.16, 0.06, sx * lx, ly, T.l / 2 + 0.01); hl.castShadow = false;
    const tl = box(ch, tailMat, 0.42, 0.14, 0.06, sx * lx, ly, -T.l / 2 - 0.01); tl.castShadow = false;
  }
  c.wheels = [];
  for (const sz of [1, -1]) for (const sx of [-1, 1]) {
    const w = new THREE.Mesh(wheelGeo, tireMat);
    w.position.set(sx * (T.w / 2 - 0.1), 0.36, sz * (T.l / 2 - 0.85)); w.rotation.order = 'YXZ'; w.castShadow = true;
    g.add(w); c.wheels.push(w);
  }
  return g;
}

const cars = [];
class Car {
  constructor(key, x, z, h, color) {
    this.key = key; this.T = CAR_TYPES[key];
    this.color = color === undefined ? pick(this.T.colors) : color;
    this.x = x; this.z = z; this.y = groundY(x, z); this.h = h; this.vx = 0; this.vz = 0;
    this.health = 100; this.driver = null; this.ai = null;
    this.parked = true;   // 休眠：不参与物理积分
    this.used = false;    // 被玩家开过（走远后可回收）
    this.wreck = false; this.wreckT = 0; this.burning = false; this.burn = 0; this.removed = false; this.mission = false;
    this.fireCd = 0; this.roll = 0;
    this.playerHit = -99; // 玩家最近一次伤到这辆车的时刻
    this.inp = { throttle: 0, steer: 0, handbrake: false };
    this.mesh = buildCarMesh(this); scene.add(this.mesh);
    this.sync(); cars.push(this);
  }
  get speed() { return Math.hypot(this.vx, this.vz); }
  fwdSpeed() { return this.vx * Math.sin(this.h) + this.vz * Math.cos(this.h); }
  sync() { this.mesh.position.set(this.x, this.y, this.z); this.mesh.rotation.y = this.h; }
  remove() {
    if (this.removed) return;
    this.removed = true; scene.remove(this.mesh); this.bodyMat.dispose();
    const i = cars.indexOf(this); if (i >= 0) cars.splice(i, 1);
  }
}
function hurtCar(c, n) {
  if (c.wreck) return;
  c.health -= n;
  if (c.health <= 0) c.parked = false; // 唤醒，进入燃烧流程
}

function carPhysics(c, dt) {
  const inp = c.inp, T = c.T;
  let s = Math.sin(c.h), co = Math.cos(c.h);
  let vf = c.vx * s + c.vz * co;
  const sp = Math.abs(vf);
  const steerPow = Math.min(1, sp / 5) * (1 - 0.5 * Math.min(1, sp / T.max));
  const yaw = inp.steer * T.turn * steerPow * (vf >= 0 ? 1 : -1) * (inp.handbrake ? 1.35 : 1);
  c.h += yaw * dt;
  s = Math.sin(c.h); co = Math.cos(c.h);
  vf = c.vx * s + c.vz * co;
  let vl = -c.vx * co + c.vz * s; // 侧向（朝右为正）
  const alive = !c.wreck && !c.burning;
  if (alive && inp.throttle > 0) { if (vf < T.max) vf += T.accel * inp.throttle * dt * (1 - 0.55 * clamp(vf / T.max, 0, 1)); }
  else if (alive && inp.throttle < 0) { if (vf > 1) vf -= 24 * dt; else if (vf > -T.max * 0.3) vf -= T.accel * 0.7 * dt; }
  else vf -= Math.sign(vf) * Math.min(Math.abs(vf), 2.2 * dt); // 滑行阻力
  vf -= vf * 0.1 * dt;
  if (inp.handbrake) vf -= Math.sign(vf) * Math.min(Math.abs(vf), 11 * dt);
  // 侧向抓地：抓地越强，侧滑消失越快；手刹时大幅降低 → 漂移
  const before = Math.hypot(vf, vl);
  vl *= Math.exp(-(inp.handbrake ? 1.4 : T.grip) * dt);
  const lost = before - Math.hypot(vf, vl);
  if (Math.abs(vf) > 1 && !inp.handbrake) vf += Math.sign(vf) * lost * 0.6; // 过弯保留一部分速度
  c.vx = s * vf - co * vl; c.vz = co * vf + s * vl;
  c.x += c.vx * dt; c.z += c.vz * dt;
  if (c.x < X_MIN) { c.x = X_MIN; c.vx = 0; } else if (c.x > X_MAX) { c.x = X_MAX; c.vx = 0; }
  if (c.z < Z_MIN) { c.z = Z_MIN; c.vz = 0; } else if (c.z > Z_MAX) { c.z = Z_MAX; c.vz = 0; }
  c.y += (groundY(c.x, c.z) - c.y) * Math.min(1, dt * 14);
  // 视觉：车身侧倾、车轮
  c.roll += (clamp(-yaw * vf * 0.006, -0.09, 0.09) - c.roll) * Math.min(1, dt * 6);
  c.chassis.rotation.z = c.roll;
  const spin = vf * dt / 0.36;
  for (let i = 0; i < 4; i++) { const w = c.wheels[i]; w.rotation.x += spin; if (i < 2) w.rotation.y = inp.steer * 0.45; }
  if (inp.handbrake && Math.abs(vl) > 4 && Math.random() < dt * 30) puff(c.x - s * 1.6, 0.3, c.z - co * 1.6, 0xdddddd, 1.0, 0.7, 0.6, 0.6, 2, false);
}

function onCarImpact(c, impact) {
  if (impact > 4) hurtCar(c, (impact - 4) * 1.3);
  if (c === P.car && impact > 3) { cam.shake = Math.min(1.2, cam.shake + impact * 0.05); Sfx.crash(impact); }
}
function carVsWorld(c) {
  const s = Math.sin(c.h), co = Math.cos(c.h), off = c.T.l / 2 - 1.05;
  for (let k = -1; k <= 1; k += 2) {
    const cx = c.x + s * off * k, cz = c.z + co * off * k;
    resolveCircle(cx, cz, 1.05, _o);
    if (!_o.hit) continue;
    c.x += _o.x - cx; c.z += _o.z - cz;
    const vn = c.vx * _o.nx + c.vz * _o.nz;
    if (vn < 0) {
      c.vx -= 1.25 * vn * _o.nx; c.vz -= 1.25 * vn * _o.nz; c.vx *= 0.92; c.vz *= 0.92;
      onCarImpact(c, -vn);
      if (-vn > 6) for (let i = 0; i < 4; i++) puff(_o.x - _o.nx, 0.7, _o.z - _o.nz, 0xffc070, 0.35, 0.3, 2, 3, 0.5, true);
    }
  }
}
function carVsCars() {
  const R = 2.1;
  for (let i = 0; i < cars.length; i++) {
    const a = cars[i];
    const sa = Math.sin(a.h), ca = Math.cos(a.h), oa = a.T.l / 2 - 1.05;
    for (let j = i + 1; j < cars.length; j++) {
      const b = cars[j];
      if (a.parked && b.parked) continue;
      const qx = b.x - a.x, qz = b.z - a.z;
      if (qx * qx + qz * qz > 36) continue;
      const sb = Math.sin(b.h), cb = Math.cos(b.h), ob = b.T.l / 2 - 1.05;
      for (let ka = -1; ka <= 1; ka += 2) for (let kb = -1; kb <= 1; kb += 2) {
        const ax = a.x + sa * oa * ka, az = a.z + ca * oa * ka, bx = b.x + sb * ob * kb, bz = b.z + cb * ob * kb;
        let ex = bx - ax, ez = bz - az; const d2 = ex * ex + ez * ez;
        if (d2 >= R * R || d2 < 1e-6) continue;
        const d = Math.sqrt(d2), pen = R - d; ex /= d; ez /= d;
        a.x -= ex * pen * 0.5; a.z -= ez * pen * 0.5; b.x += ex * pen * 0.5; b.z += ez * pen * 0.5;
        const rv = (b.vx - a.vx) * ex + (b.vz - a.vz) * ez;
        if (rv < 0) {
          const jimp = -1.3 * rv / 2;
          a.vx -= jimp * ex; a.vz -= jimp * ez; b.vx += jimp * ex; b.vz += jimp * ez;
          onCarCrash(a, b, -rv);
        }
        a.parked = false; b.parked = false;
      }
    }
  }
}
function onCarCrash(a, b, imp) {
  if (imp > 4) { hurtCar(a, (imp - 4) * 0.7); hurtCar(b, (imp - 4) * 0.7); }
  const mine = a === P.car ? a : b === P.car ? b : null;
  if (!mine) return;
  const other = mine === a ? b : a;
  if (imp > 2) { cam.shake = Math.min(1.2, cam.shake + imp * 0.05); Sfx.crash(imp); other.playerHit = clock; }
  if (other.driver === 'cop' && imp > 3 && P.crimeCd <= 0) { addCrime(1); P.crimeCd = 2; }
  if (other.driver === 'ai' && imp > 6) other.ai.panic = 6;
}

function explodeCar(c) {
  c.wreck = true; c.wreckT = 0; c.burning = false;
  c.bodyMat.color.setHex(0x141414); c.bodyMat.roughness = 1; c.bodyMat.metalness = 0;
  for (const g of c.glass) g.material = wreckMat;
  if (c.sirens) for (const s of c.sirens) s.material = sirenOff;
  for (let i = 0; i < 26; i++) puff(c.x + rand(-1.5, 1.5), 1 + rand(0, 1.5), c.z + rand(-1.5, 1.5), i % 3 ? 0xff8a20 : 0xffe080, rand(2, 4), rand(0.5, 1.1), 3, 4, 1.5, true);
  for (let i = 0; i < 10; i++) puff(c.x, 2, c.z, 0x222222, 3, rand(1.5, 2.5), 3, 2, 2.5, false);
  const dP = Math.hypot(c.x - P.x, c.z - P.z);
  Sfx.boom(dP);
  if (dP < 60) cam.shake = Math.min(1.5, cam.shake + 1.5 * (1 - dP / 60));
  const wasCop = c.driver === 'cop' || c.wasCop;
  if (P.car === c) { P.car = null; P.mesh.visible = true; damagePlayer(999); }
  else if (!P.car && dP < 8) damagePlayer(20 + 70 * (1 - dP / 8));
  c.driver = null; c.ai = null; c.vx *= 0.3; c.vz *= 0.3;
  for (const p of peds) if (!p.dead && Math.hypot(p.x - c.x, p.z - c.z) < 7) killPed(p, (p.x - c.x) * 1.5, (p.z - c.z) * 1.5, false);
  for (const o of cars) if (o !== c && !o.wreck) { const d = Math.hypot(o.x - c.x, o.z - c.z); if (d < 8) { hurtCar(o, 45 * (1 - d / 8) + 10); o.parked = false; o.vx += (o.x - c.x) / (d + 0.5) * 5; o.vz += (o.z - c.z) / (d + 0.5) * 5; } }
  if (wasCop && !P.dead && clock - c.playerHit < 10) addCrime(2); // 警车自己撞毁不算玩家头上
}
function updateCarState(c, dt) {
  if (c.wreck) { c.wreckT += dt; if (Math.random() < dt * 4) puff(c.x, 1.4, c.z, 0x2a2a2a, 1.6, 1.8, 2.2, 0.4, 2, false); return; }
  if (c.health < 40 && Math.random() < dt * 10) {
    const s = Math.sin(c.h), co = Math.cos(c.h);
    puff(c.x + s * 1.6, 1.1, c.z + co * 1.6, c.health < 15 ? 0x1c1c1c : 0x9a9a9a, 0.8, 1.2, 2, 0.3, 2.2, false);
  }
  if (c.health <= 0) {
    if (!c.burning) {
      c.burning = true; c.burn = 3.2; c.wasCop = c.driver === 'cop';
      if (c.ai) { c.driver = null; c.ai = null; }
      if (c === P.car) hint('车要炸了！快按 <b>F</b> 跳车', 3000);
    }
    c.burn -= dt;
    if (Math.random() < dt * 25) puff(c.x + rand(-0.8, 0.8), 1.1, c.z + rand(-0.8, 0.8), 0xff7a1a, 1.1, 0.5, 2.5, 0.5, 1, true);
    if (c.burn <= 0) explodeCar(c);
  }
}

/* ---------------- 车辆 AI：沿路网行驶 ---------------- */
const DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]];
const validNode = (ix, iz) => ix >= 0 && ix <= N && iz >= 0 && iz <= N;
// 到达节点 (a.ix,a.iz) 后的下一段方向；警察贪心地朝玩家靠近
function pickNext(a, cop) {
  const opts = [];
  for (const d of DIRS) { if (d[0] === -a.dx && d[1] === -a.dz) continue; if (validNode(a.ix + d[0], a.iz + d[1])) opts.push(d); }
  if (!opts.length) return [-a.dx, -a.dz];
  if (cop) {
    let best = 1e9, ch = opts[0];
    const back = [-a.dx, -a.dz];
    const all = (a.dx || a.dz) && validNode(a.ix + back[0], a.iz + back[1]) ? opts.concat([back]) : opts;
    for (const o of all) { const d = Math.hypot(roadX(a.ix + o[0]) - P.x, roadX(a.iz + o[1]) - P.z) + (o === back ? 30 : 0); if (d < best) { best = d; ch = o; } }
    return ch;
  }
  const st = opts.find(o => o[0] === a.dx && o[1] === a.dz);
  return st && Math.random() < 0.55 ? st : pick(opts);
}
function makeRoute(ix, iz, dx, dz, cop) {
  const a = { ix, iz, dx, dz, ndx: 0, ndz: 0, cruise: rand(9, 13), stuck: 0, rev: 0, wait: 0, ignore: 0, panic: 0, lost: false };
  const n = pickNext(a, cop); a.ndx = n[0]; a.ndz = n[1];
  return a;
}
// 追击结束后回到路网：对准最近的路口
function snapToRoad(c) {
  const a = c.ai;
  a.ix = clamp(Math.round((c.x + HALF) / PITCH), 0, N); a.iz = clamp(Math.round((c.z + HALF) / PITCH), 0, N);
  const ex = roadX(a.ix) - c.x, ez = roadX(a.iz) - c.z;
  if (Math.abs(ex) > Math.abs(ez)) { a.dx = Math.sign(ex) || 1; a.dz = 0; } else { a.dx = 0; a.dz = Math.sign(ez) || 1; }
  const n = pickNext(a, true); a.ndx = n[0]; a.ndz = n[1];
}
function obstacleAhead(c, vf) {
  const s = Math.sin(c.h), co = Math.cos(c.h), range = 6 + Math.max(0, vf) * 0.9;
  for (let i = 0; i < cars.length; i++) {
    const o = cars[i]; if (o === c) continue;
    const dx = o.x - c.x, dz = o.z - c.z, f = dx * s + dz * co;
    if (f < 1 || f > range + 2.5) continue;
    if (Math.abs(-dx * co + dz * s) < 2.0) return true;
  }
  for (let i = 0; i < peds.length; i++) {
    const p = peds[i]; if (p.dead) continue;
    const dx = p.x - c.x, dz = p.z - c.z, f = dx * s + dz * co;
    if (f < 1 || f > range) continue;
    if (Math.abs(-dx * co + dz * s) < 1.5) return true;
  }
  if (!P.car) {
    const dx = P.x - c.x, dz = P.z - c.z, f = dx * s + dz * co;
    if (f > 1 && f < range && Math.abs(-dx * co + dz * s) < 1.5) return true;
  }
  return false;
}
function aiDrive(c, dt) {
  const a = c.ai, inp = c.inp, cop = c.driver === 'cop';
  let tx, tz, want, direct = false, turning = false;
  const dP = Math.hypot(P.x - c.x, P.z - c.z);
  if (cop && dP < 60 && (dP < 16 || losFree(c.x, c.z, P.x, P.z))) direct = true;
  if (direct) { // 直接追击
    const lead = Math.min(1, dP / 30);
    tx = P.x + P.vx * lead; tz = P.z + P.vz * lead;
    const pv = Math.hypot(P.vx, P.vz);
    if (P.car && pv > 8 && wantedStars() >= 3) want = c.T.max;          // 三星以上且玩家在跑：直接撞
    else want = dP < 7 ? pv : clamp(pv + (dP - 6) * 0.9 + 3, 3, c.T.max); // 否则贴近后减速，准备逮捕
    a.lost = true;
  } else {
    if (a.lost) { snapToRoad(c); a.lost = false; }
    let t = (roadX(a.ix) - c.x) * a.dx + (roadX(a.iz) - c.z) * a.dz; // 距目标路口还有多远
    const cross = a.dx * a.ndz - a.dz * a.ndx, dot = a.dx * a.ndx + a.dz * a.ndz; // cross>0 右转
    const thr = dot < 0 ? 2 : cross > 0 ? 10 : cross < 0 ? 5 : 8;
    if (t < thr) {
      a.dx = a.ndx; a.dz = a.ndz; a.ix += a.dx; a.iz += a.dz;
      const n = pickNext(a, cop); a.ndx = n[0]; a.ndz = n[1];
      t = (roadX(a.ix) - c.x) * a.dx + (roadX(a.iz) - c.z) * a.dz;
    } else if (cop && t > 26 && t < 34) { const n = pickNext(a, true); a.ndx = n[0]; a.ndz = n[1]; }
    const look = Math.max(t - (cop ? 12 : 8), 0);
    tx = roadX(a.ix) - a.dx * look - a.dz * LANE; tz = roadX(a.iz) - a.dz * look + a.dx * LANE;
    turning = (cross !== 0 || dot < 0) && t < 24;
    if (a.panic > 0) { a.panic -= dt; want = turning ? 9 : 22; }
    else want = cop ? (turning ? 12 : c.T.max * 0.85) : (turning ? 5.5 : a.cruise);
  }
  const diff = wrapAngle(Math.atan2(tx - c.x, tz - c.z) - c.h);
  const vf = c.fwdSpeed();
  inp.steer = clamp(diff * 2.5, -1, 1);
  if (Math.abs(diff) > 0.6) want = Math.min(want, cop ? 11 : 5);
  let blocked = false;
  if (!cop && a.panic <= 0) {
    if (a.ignore > 0) a.ignore -= dt;
    else if (obstacleAhead(c, vf)) { blocked = true; a.wait += dt; if (a.wait > 5) { a.ignore = 2; a.wait = 0; } want = 0; }
    else a.wait = Math.max(0, a.wait - dt);
  }
  inp.handbrake = false;
  if (vf < want - 0.5) inp.throttle = 1; else if (vf > want + 1.5) inp.throttle = -1; else inp.throttle = 0;
  if (want === 0 && vf < 1) { inp.throttle = 0; inp.handbrake = true; }
  if (cop && direct && Math.abs(diff) > 1.3 && vf > 12) inp.handbrake = true;
  // 卡住了就倒车
  if (a.rev > 0) { a.rev -= dt; inp.throttle = -1; inp.steer = -inp.steer; inp.handbrake = false; }
  else if (!blocked && Math.abs(vf) < 0.7) { a.stuck += dt; if (a.stuck > 2) { a.rev = 1.3; a.stuck = 0; } }
  else a.stuck = 0;
}

function carNear(x, z, r) { for (const c of cars) if (Math.abs(c.x - x) < r && Math.abs(c.z - z) < r) return true; return false; }
function spawnTraffic(minD, maxD) {
  for (let tries = 0; tries < 20; tries++) {
    const ix = randi(0, N), iz = randi(0, N), d = pick(DIRS);
    if (!validNode(ix + d[0], iz + d[1])) continue;
    const x = roadX(ix) + d[0] * PITCH / 2 - d[1] * LANE, z = roadX(iz) + d[1] * PITCH / 2 + d[0] * LANE;
    const dist = Math.hypot(x - P.x, z - P.z);
    if (dist < minD || dist > maxD || carNear(x, z, 12)) continue;
    const c = new Car(pick(TRAFFIC_MIX), x, z, Math.atan2(d[0], d[1]));
    c.driver = 'ai'; c.parked = false; c.ai = makeRoute(ix + d[0], iz + d[1], d[0], d[1], false);
    c.vx = d[0] * 8; c.vz = d[1] * 8;
    return c;
  }
  return null;
}
function spawnParked(minD) {
  for (let tries = 0; tries < 20; tries++) {
    const ix = randi(0, N), iz = randi(0, N), d = pick(DIRS);
    if (!validNode(ix + d[0], iz + d[1])) continue;
    const t = rand(14, PITCH - 14);
    const x = roadX(ix) + d[0] * t - d[1] * PARK_OFF, z = roadX(iz) + d[1] * t + d[0] * PARK_OFF;
    if (Math.hypot(x - P.x, z - P.z) < minD || carNear(x, z, 7)) continue;
    return new Car(pick(TRAFFIC_MIX), x, z, Math.atan2(d[0], d[1]));
  }
  return null;
}
function spawnCop() {
  for (let tries = 0; tries < 30; tries++) {
    const ix = randi(0, N), iz = randi(0, N);
    const dist = Math.hypot(roadX(ix) - P.x, roadX(iz) - P.z);
    if (dist < 95 || dist > 190) continue;
    const d = pickNext({ ix, iz, dx: 0, dz: 0 }, true);
    const x = roadX(ix) - d[1] * LANE, z = roadX(iz) + d[0] * LANE;
    if (carNear(x, z, 8)) continue;
    const c = new Car('police', x, z, Math.atan2(d[0], d[1]));
    c.driver = 'cop'; c.parked = false; c.ai = makeRoute(ix + d[0], iz + d[1], d[0], d[1], true);
    c.vx = d[0] * 15; c.vz = d[1] * 15; c.fireCd = rand(0.5, 1.5);
    return c;
  }
  return null;
}

/* ---------------- 行人 ---------------- */
const peds = [];
const CORN = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
const PED_R = BLOCK / 2 - 2.4;
class Ped {
  constructor() {
    this.mesh = makeHuman(pick(SHIRTS), pick(PANTS), pick(SKINS), pick(HAIRS));
    scene.add(this.mesh);
    this.x = 0; this.z = 0; this.y = 0; this.h = 0; this.bi = 0; this.bj = 0; this.k = 0; this.dir = 1;
    this.walk = rand(1.2, 1.9); this.phase = rand(0, 6); this.flee = 0; this.health = 100;
    this.dead = false; this.deadT = 0; this.kx = 0; this.kz = 0; this.vy = 0;
    peds.push(this);
  }
}
function revivePed(p) { p.dead = false; p.deadT = 0; p.health = 100; p.flee = 0; p.y = 0; p.mesh.rotation.x = 0; }
// 把行人放到玩家周围某个街区的人行道上
function placePed(p, minD, maxD) {
  for (let tries = 0; tries < 30; tries++) {
    const bi = randi(0, N - 1), bj = randi(0, N - 1), cx = blockC(bi), cz = blockC(bj);
    const k = randi(0, 3), k2 = (k + 1) % 4, t = Math.random();
    const x = cx + lerp(CORN[k][0], CORN[k2][0], t) * PED_R, z = cz + lerp(CORN[k][1], CORN[k2][1], t) * PED_R;
    const d = Math.hypot(x - P.x, z - P.z);
    if (d < minD || d > maxD) continue;
    revivePed(p);
    p.x = x; p.z = z; p.bi = bi; p.bj = bj; p.dir = Math.random() < 0.5 ? 1 : -1; p.k = p.dir > 0 ? k2 : k;
    return true;
  }
  return false;
}
function assignBlock(p) {
  p.bi = clamp(Math.floor((p.x + HALF) / PITCH), 0, N - 1); p.bj = clamp(Math.floor((p.z + HALF) / PITCH), 0, N - 1);
  const cx = blockC(p.bi), cz = blockC(p.bj);
  let best = 1e9;
  for (let k = 0; k < 4; k++) { const d = Math.hypot(cx + CORN[k][0] * PED_R - p.x, cz + CORN[k][1] * PED_R - p.z); if (d < best) { best = d; p.k = k; } }
}
function killPed(p, kx, kz, byPlayer) {
  if (p.dead) return;
  p.dead = true; p.deadT = 0; p.kx = kx; p.kz = kz; p.vy = 4; p.mesh.rotation.x = -Math.PI / 2;
  animHuman(p.mesh, 0, 0);
  if (byPlayer) addCrime(2);
}
function scarePeds(x, z, r, t) {
  for (const p of peds) if (!p.dead && Math.hypot(p.x - x, p.z - z) < r) {
    if (p.flee <= 0) { // 朝远离威胁的方向跑
      const cx = blockC(p.bi), cz = blockC(p.bj);
      const kA = (p.k + 4) % 4, kB = (p.k - p.dir + 4) % 4;
      const dA = Math.hypot(cx + CORN[kA][0] * PED_R - x, cz + CORN[kA][1] * PED_R - z), dB = Math.hypot(cx + CORN[kB][0] * PED_R - x, cz + CORN[kB][1] * PED_R - z);
      if (dB > dA) { p.dir = -p.dir; p.k = kB; }
    }
    p.flee = Math.max(p.flee, t);
  }
}
function updatePeds(dt) {
  for (let i = 0; i < peds.length; i++) {
    const p = peds[i];
    if (p.dead) {
      p.deadT += dt;
      p.x += p.kx * dt; p.z += p.kz * dt; p.y += p.vy * dt; p.vy -= 20 * dt;
      if (p.y <= 0.2) { p.y = 0.2; p.vy = 0; p.kx *= Math.exp(-6 * dt); p.kz *= Math.exp(-6 * dt); }
      p.mesh.position.set(p.x, p.y, p.z);
      if (p.deadT > 14) placePed(p, 70, 150);
      continue;
    }
    if (Math.hypot(p.x - P.x, p.z - P.z) > 175) { placePed(p, 70, 150); }
    if (p.flee > 0) p.flee -= dt;
    const tx = blockC(p.bi) + CORN[p.k][0] * PED_R, tz = blockC(p.bj) + CORN[p.k][1] * PED_R;
    const dx = tx - p.x, dz = tz - p.z, d = Math.hypot(dx, dz);
    const sp = p.flee > 0 ? 5.6 : p.walk;
    if (d < 0.6) p.k = (p.k + p.dir + 4) % 4;
    else {
      p.x += dx / d * sp * dt; p.z += dz / d * sp * dt;
      p.h += wrapAngle(Math.atan2(dx, dz) - p.h) * Math.min(1, dt * 8);
    }
    p.y = groundY(p.x, p.z);
    // 被车撞
    for (let j = 0; j < cars.length; j++) {
      const c = cars[j]; if (c.parked) continue;
      const qx = p.x - c.x, qz = p.z - c.z;
      if (qx * qx + qz * qz > 12) continue;
      const v = c.speed; if (v < 1.5) continue;
      const s = Math.sin(c.h), co = Math.cos(c.h), f = qx * s + qz * co, l = -qx * co + qz * s;
      if (Math.abs(f) < c.T.l / 2 + 0.3 && Math.abs(l) < c.T.w / 2 + 0.3) {
        if (v > 5) {
          killPed(p, c.vx * 0.8 + rand(-1, 1), c.vz * 0.8 + rand(-1, 1), c === P.car);
          if (c === P.car) { Sfx.thud(); cam.shake = Math.min(1, cam.shake + 0.25); scarePeds(p.x, p.z, 30, 8); }
        } else { p.x += Math.sign(l || 1) * -co * 2 * dt; p.z += Math.sign(l || 1) * s * 2 * dt; }
        break;
      }
    }
    p.phase += dt * sp * 2.8;
    p.mesh.position.set(p.x, p.y, p.z); p.mesh.rotation.y = p.h;
    animHuman(p.mesh, p.phase, p.flee > 0 ? 0.95 : 0.5);
  }
}

/* ---------------- 玩家 ---------------- */
const P = {
  x: POI.spawn.x, z: POI.spawn.z, y: CURB, vy: 0, h: -Math.PI / 2, vx: 0, vz: 0, onGround: true, moving: false,
  health: 100, money: 0, car: null, phase: 0, shootCd: 0, aimT: 0, hitCd: 0, lastHurt: 99,
  heat: 0, heatFloor: 0, unseen: 0, bust: 0, crimeCd: 0, dead: false, deadT: 0, deadKind: '',
  mesh: makeHuman(0x19c4b0, 0x2b3350, 0xe0b08a, 0x2a1a10),
};
box(P.mesh.userData.armR, lam(0x111111), 0.08, 0.14, 0.3, 0, -0.62, 0.1); // 手枪
scene.add(P.mesh);
P.mesh.position.set(P.x, P.y, P.z);

function wantedStars() { const h = Math.max(P.heat, P.heatFloor); return h >= 15 ? 5 : h >= 10 ? 4 : h >= 6 ? 3 : h >= 3 ? 2 : h >= 1 ? 1 : 0; }
function addCrime(pts) { P.heat = Math.min(18, P.heat + pts); P.unseen = 0; }

function damagePlayer(n) {
  if (P.dead || state !== 'play') return;
  P.health -= n; P.lastHurt = 0;
  hurtFlash();
  if (P.health <= 0) { P.health = 0; endLife('wasted'); }
}

function updatePlayerFoot(dt, ix, iz, run, jump) {
  const fx = Math.sin(cam.yaw), fz = Math.cos(cam.yaw), rx = -fz, rz = fx;
  let mx = fx * iz + rx * ix, mz = fz * iz + rz * ix;
  const ml = Math.hypot(mx, mz);
  P.moving = ml > 0.01;
  const sp = run ? 7.2 : 3.6;
  if (P.moving) {
    mx /= ml; mz /= ml; P.vx = mx * sp; P.vz = mz * sp;
    if (P.aimT <= 0) P.h += wrapAngle(Math.atan2(mx, mz) - P.h) * Math.min(1, dt * 12);
    P.phase += dt * sp * 2.6;
  } else { P.vx = 0; P.vz = 0; }
  if (P.aimT > 0) { P.aimT -= dt; P.h = cam.yaw; }
  P.x += P.vx * dt; P.z += P.vz * dt;
  const gy = groundY(P.x, P.z);
  if (jump && P.onGround) { P.vy = 6; P.onGround = false; }
  P.vy -= 18 * dt; P.y += P.vy * dt;
  if (P.y <= gy) { P.y = gy; P.vy = 0; P.onGround = true; }
  resolveCircle(P.x, P.z, 0.38, _o); P.x = _o.x; P.z = _o.z;
  if (P.hitCd > 0) P.hitCd -= dt;
  for (let i = 0; i < cars.length; i++) { // 和车的碰撞
    const c = cars[i]; const qx = P.x - c.x, qz = P.z - c.z;
    if (qx * qx + qz * qz > 16) continue;
    const s = Math.sin(c.h), co = Math.cos(c.h), off = c.T.l / 2 - 1.05, R = 1.05 + 0.35;
    for (let k = -1; k <= 1; k += 2) {
      const cx = c.x + s * off * k, cz = c.z + co * off * k;
      let ex = P.x - cx, ez = P.z - cz; const d = Math.hypot(ex, ez);
      if (d >= R || d < 1e-4) continue;
      ex /= d; ez /= d; P.x = cx + ex * R; P.z = cz + ez * R;
      const v = c.speed;
      if (v > 5 && P.hitCd <= 0 && P.y < 1) { P.hitCd = 0.6; damagePlayer((v - 4) * 4.5); Sfx.thud(); cam.shake = Math.min(1.2, cam.shake + 0.5); }
    }
  }
  P.x = clamp(P.x, X_MIN, X_MAX); P.z = clamp(P.z, Z_MIN, Z_MAX);
  P.mesh.position.set(P.x, P.y, P.z); P.mesh.rotation.y = P.h;
  animHuman(P.mesh, P.phase, P.moving ? (run ? 0.95 : 0.55) : 0);
  if (P.aimT > 0) P.mesh.userData.armR.rotation.x = -Math.PI / 2 + cam.pitch * 0.6;
}

function nearestCar(maxD) {
  let best = null, bd = maxD;
  for (const c of cars) { if (c.wreck || c.burning) continue; const d = Math.hypot(c.x - P.x, c.z - P.z); if (d < bd) { bd = d; best = c; } }
  return best;
}
function ejectDriver(c) {
  let best = null, bd = -1;
  for (const p of peds) { const d = (p.x - P.x) ** 2 + (p.z - P.z) ** 2; if (d > bd) { bd = d; best = p; } }
  if (!best) return;
  revivePed(best);
  best.x = c.x - Math.cos(c.h) * 2.0; best.z = c.z + Math.sin(c.h) * 2.0; // 从副驾一侧被拽出去
  assignBlock(best); best.flee = 12;
}
function exitCar() {
  const c = P.car; if (!c) return;
  const s = Math.sin(c.h), co = Math.cos(c.h), off = c.T.w / 2 + 0.9;
  for (const side of [1, -1]) { // 先试驾驶座一侧（左），被挡住就换右侧
    const ex = c.x + co * side * off, ez = c.z - s * side * off;
    resolveCircle(ex, ez, 0.4, _o);
    if (!_o.hit || side === -1) { P.x = _o.x; P.z = _o.z; break; }
  }
  P.h = c.h; P.y = groundY(P.x, P.z); P.vy = 0; P.vx = 0; P.vz = 0;
  c.driver = null; c.inp.throttle = 0; c.inp.steer = 0; c.inp.handbrake = false;
  P.car = null; P.mesh.visible = true; P.mesh.position.set(P.x, P.y, P.z);
}
function tryEnterExit() {
  if (P.dead || state !== 'play') return;
  if (P.car) {
    if (P.car.speed > 9 && !P.car.burning) { hint('车速太快，先减速再下车', 1500); return; }
    exitCar(); return;
  }
  const c = nearestCar(4.4); if (!c) return;
  if (c.driver === 'ai' || c.driver === 'cop') { // 劫车
    ejectDriver(c);
    addCrime(c.driver === 'cop' ? 3 : 1);
    scarePeds(c.x, c.z, 25, 8);
  } else if (c.key === 'police') addCrime(2);
  c.driver = 'player'; c.ai = null; c.parked = false; c.used = true;
  c.inp.throttle = 0; c.inp.steer = 0; c.inp.handbrake = false;
  if (c.sirens) for (const s of c.sirens) s.material = sirenOff;
  P.car = c; P.mesh.visible = false; P.aimT = 0;
  cam.lastMouse = -10;
  showCarName(c.T.name);
  Sfx.door();
}

/* ---------------- 射击 ---------------- */
const _rd = new THREE.Vector3();
function raySphere(o, d, cx, cy, cz, r) {
  const ox = o.x - cx, oy = o.y - cy, oz = o.z - cz;
  const b = ox * d.x + oy * d.y + oz * d.z, c = ox * ox + oy * oy + oz * oz - r * r, disc = b * b - c;
  if (disc < 0) return -1;
  return -b - Math.sqrt(disc);
}
function rayBox(o, d, b) {
  let t0 = 0, t1 = 1e9;
  const mins = [b.x0, 0, b.z0], maxs = [b.x1, b.h, b.z1], oo = [o.x, o.y, o.z], dd = [d.x, d.y, d.z];
  for (let k = 0; k < 3; k++) {
    if (Math.abs(dd[k]) < 1e-8) { if (oo[k] < mins[k] || oo[k] > maxs[k]) return -1; continue; }
    let a = (mins[k] - oo[k]) / dd[k], c = (maxs[k] - oo[k]) / dd[k];
    if (a > c) { const s = a; a = c; c = s; }
    t0 = Math.max(t0, a); t1 = Math.min(t1, c);
    if (t0 > t1) return -1;
  }
  return t0;
}
function shoot() {
  if (P.car || P.dead || P.shootCd > 0) return;
  P.shootCd = 0.26; P.aimT = 0.7; P.h = cam.yaw;
  const o = camera.position, d = camera.getWorldDirection(_rd);
  const tMin = cam.curDist * 0.8; // 忽略相机和玩家之间的东西
  let tHit = 180, hitPed = null, hitCar = null;
  for (let i = 0; i < buildings.length; i++) { const t = rayBox(o, d, buildings[i]); if (t > 0 && t < tHit) tHit = t; }
  if (d.y < -1e-4) { const t = -o.y / d.y; if (t < tHit) tHit = t; }
  for (const p of peds) { if (p.dead) continue; const t = raySphere(o, d, p.x, p.y + 1.0, p.z, 0.7); if (t > tMin && t < tHit) { tHit = t; hitPed = p; hitCar = null; } }
  for (const c of cars) { if (c.wreck) continue; const t = raySphere(o, d, c.x, 0.8, c.z, 1.6); if (t > tMin && t < tHit) { tHit = t; hitCar = c; hitPed = null; } }
  const ex = o.x + d.x * tHit, ey = o.y + d.y * tHit, ez = o.z + d.z * tHit;
  const mx = P.x + Math.sin(P.h) * 0.6 - Math.cos(P.h) * 0.3, my = P.y + 1.42, mz = P.z + Math.cos(P.h) * 0.6 + Math.sin(P.h) * 0.3;
  tracer(mx, my, mz, ex, ey, ez);
  puff(mx, my, mz, 0xffd070, 0.5, 0.07, 0, 0, 0.5, true);
  puff(ex, ey, ez, hitPed ? 0xb01020 : 0xd8d0c0, 0.4, 0.35, 1, 0.8, 1.5, false);
  Sfx.shot(1);
  cam.shake = Math.min(1, cam.shake + 0.08);
  if (hitPed) {
    hitPed.health -= 55;
    if (hitPed.health <= 0) killPed(hitPed, d.x * 2.5, d.z * 2.5, true);
  } else if (hitCar) {
    hurtCar(hitCar, 14); hitCar.playerHit = clock;
    if (hitCar.driver === 'ai') hitCar.ai.panic = 8;
    if (hitCar.driver === 'cop' && P.crimeCd <= 0) { addCrime(1); P.crimeCd = 1; }
  }
  let witness = false;
  for (const p of peds) if (!p.dead && Math.hypot(p.x - P.x, p.z - P.z) < 60) { witness = true; break; }
  if (witness) addCrime(0.34);
  scarePeds(P.x, P.z, 45, 9);
}

/* ---------------- 警察 & 通缉 ---------------- */
const COPS_BY_STAR = [0, 1, 2, 3, 4, 6];
let copSpawnCd = 0;
function clearCops() { for (const c of cars) if (c.driver === 'cop') { c.driver = 'ai'; c.ai.lost = true; if (c.sirens) for (const s of c.sirens) s.material = sirenOff; } }
function updatePolice(dt, now) {
  const st = wantedStars();
  if (P.crimeCd > 0) P.crimeCd -= dt;
  let nearest = 1e9;
  if (st === 0) { clearCops(); P.unseen = 0; P.bust = 0; return nearest; }
  let n = 0, seen = false, bustClose = false;
  const pv = Math.hypot(P.vx, P.vz), blink = Math.floor(now * 6) % 2;
  for (const c of cars) {
    if (c.driver !== 'cop') continue;
    n++;
    const d = Math.hypot(c.x - P.x, c.z - P.z);
    if (d < nearest) nearest = d;
    c.sirens[0].material = blink ? sirenR : sirenOff; c.sirens[1].material = blink ? sirenOff : sirenB;
    const los = d < 80 && losFree(c.x, c.z, P.x, P.z);
    if (los) seen = true;
    if (st >= 2 && los && d < 40) { // 开枪
      c.fireCd -= dt;
      if (c.fireCd <= 0) {
        c.fireCd = rand(0.5, 1.1) / (0.7 + st * 0.15);
        const hit = Math.random() < (P.car ? 0.32 : 0.26);
        const jx = hit ? 0 : rand(-2, 2), jz = hit ? 0 : rand(-2, 2);
        tracer(c.x, 1.3, c.z, P.x + jx, P.y + 1.1, P.z + jz);
        Sfx.shot(clamp(1 - d / 50, 0.15, 0.6));
        if (hit) { if (P.car) hurtCar(P.car, 2.6); else damagePlayer(6); }
      }
    }
    if (st <= 2 && d < 6.5 && c.speed < 4 && pv < 2.5) bustClose = true;
  }
  copSpawnCd -= dt;
  if (n < COPS_BY_STAR[st] && copSpawnCd <= 0) { spawnCop(); copSpawnCd = 2.2; }
  if (seen) P.unseen = 0; else P.unseen += dt;
  if (P.unseen > 14 && P.heatFloor === 0) { P.heat = 0; P.unseen = 0; hint('已摆脱通缉', 2500); }
  if (bustClose) { P.bust += dt; if (P.bust > 1.6) endLife('busted'); } else P.bust = Math.max(0, P.bust - dt);
  return nearest;
}

/* ---------------- 数量管理：刷新 / 回收 ---------------- */
const TRAFFIC = 16, PARKED = 46, PEDS = 28;
let trafficCd = 0;
function manageWorld(dt) {
  let nAi = 0, nParked = 0;
  for (let i = cars.length - 1; i >= 0; i--) {
    const c = cars[i];
    if (c === P.car || c.mission) continue;
    const d = Math.hypot(c.x - P.x, c.z - P.z);
    c.mesh.visible = d < 300 || state === 'menu'; // 远处的车不渲染
    if (c.driver === 'ai') { if (d > 250) c.remove(); else nAi++; }
    else if (c.driver === 'cop') { if (d > 320) c.remove(); }
    else if (c.wreck) { if (d > 170 || c.wreckT > 90) c.remove(); }
    else if (c.used) { if (d > 260) c.remove(); }
    else nParked++;
  }
  trafficCd -= dt;
  if (trafficCd <= 0) {
    trafficCd = 0.25;
    if (nAi < TRAFFIC) spawnTraffic(120, 230);
    if (nParked < PARKED) spawnParked(150);
  }
}
function populateWorld() {
  // 出生点旁边固定放两辆车，保证开局就有车可开
  const z0 = roadX(6) - PARK_OFF;
  new Car('sport', blockC(5) - 24, z0, -Math.PI / 2, 0xff1654);
  new Car('sedan', blockC(5) + 10, z0, -Math.PI / 2, 0x8d99ae);
  for (let i = 0; i < PARKED - 2; i++) spawnParked(30);
  for (let i = 0; i < TRAFFIC; i++) spawnTraffic(25, 230);
  for (let i = 0; i < PEDS; i++) placePed(new Ped(), 8, 150);
}
