'use strict';
/* =====================================================================
   霓虹湾 NEON BAY —— 游戏：输入、相机、音效、HUD、小地图、任务、主循环
   ===================================================================== */

const $ = id => document.getElementById(id);
const UI = {
  hud: $('hud'), start: $('start'), pause: $('pause'), clock: $('clock'), money: $('money'), health: $('health'), stars: $('stars'),
  zone: $('zone'), carname: $('carname'), speedo: $('speedo'), radio: $('radio'), timer: $('timer'), objective: $('objective'),
  hint: $('hint'), crosshair: $('crosshair'), lockhint: $('lockhint'), big: $('big'), fade: $('fade'), hurt: $('hurt'),
  map: $('minimap').getContext('2d'),
};
let state = 'menu';   // menu | play
let paused = false, slowmo = 1, clock = 0;
const keys = {};
const cam = { yaw: -Math.PI / 2, pitch: 0.22, curDist: 6, shake: 0, lastMouse: -10 };
let locked = false, firing = false;

/* ---------------- 音效（全部用 WebAudio 合成，无素材文件） ---------------- */
const Sfx = {
  ctx: null, lastCrash: 0, radio: { on: true, step: 0, next: 0 },
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    try { this.ctx = new AC(); } catch (e) { return; }
    const c = this.ctx;
    this.master = c.createGain(); this.master.gain.value = 0.6; this.master.connect(c.destination);
    this.noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = this.noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    this.eOsc = c.createOscillator(); this.eOsc.type = 'sawtooth';
    this.eOsc2 = c.createOscillator(); this.eOsc2.type = 'square';
    this.eFilt = c.createBiquadFilter(); this.eFilt.type = 'lowpass'; this.eFilt.frequency.value = 400;
    this.eGain = c.createGain(); this.eGain.gain.value = 0;
    this.eOsc.connect(this.eFilt); this.eOsc2.connect(this.eFilt); this.eFilt.connect(this.eGain); this.eGain.connect(this.master);
    this.eOsc.start(); this.eOsc2.start();
    this.sOsc = c.createOscillator(); this.sOsc.type = 'triangle';
    this.sGain = c.createGain(); this.sGain.gain.value = 0;
    this.sOsc.connect(this.sGain); this.sGain.connect(this.master); this.sOsc.start();
    this.rGain = c.createGain(); this.rGain.gain.value = 0.55; this.rGain.connect(this.master);
  },
  tone(type, freq, t, dur, vol, cut, dest, slideTo) {
    const c = this.ctx; if (!c) return; t = t || c.currentTime;
    const o = c.createOscillator(); o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = cut || 4000;
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(f); f.connect(g); g.connect(dest || this.master); o.start(t); o.stop(t + dur + 0.03);
  },
  noise(dur, freq, vol, t, dest, type) {
    const c = this.ctx; if (!c) return; t = t || c.currentTime;
    const s = c.createBufferSource(); s.buffer = this.noiseBuf;
    const f = c.createBiquadFilter(); f.type = type || 'lowpass'; f.frequency.value = freq;
    const g = c.createGain(); g.gain.setValueAtTime(Math.max(0.0002, vol), t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(dest || this.master); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.03);
  },
  engine(on, rpm) {
    if (!this.ctx) return; const t = this.ctx.currentTime, f = 38 + rpm * 115;
    this.eGain.gain.setTargetAtTime(on ? 0.045 + rpm * 0.03 : 0, t, 0.08);
    this.eOsc.frequency.setTargetAtTime(f, t, 0.05); this.eOsc2.frequency.setTargetAtTime(f * 0.5, t, 0.05);
    this.eFilt.frequency.setTargetAtTime(240 + rpm * 900, t, 0.05);
  },
  siren(vol, now) {
    if (!this.ctx) return; const t = this.ctx.currentTime;
    this.sGain.gain.setTargetAtTime(vol, t, 0.2);
    this.sOsc.frequency.setTargetAtTime(720 + 260 * Math.sin(now * 5), t, 0.03);
  },
  shot(v) { this.noise(0.14, 3200, 0.5 * v); this.tone('square', 220, 0, 0.08, 0.15 * v, 1200, null, 60); },
  crash(imp) { if (clock - this.lastCrash < 0.12) return; this.lastCrash = clock; this.noise(0.28, 900, clamp(imp / 25, 0.1, 0.6)); },
  thud() { this.noise(0.16, 300, 0.5); },
  door() { this.noise(0.08, 600, 0.3); },
  boom(d) { const v = clamp(1 - d / 160, 0, 1); if (v <= 0) return; this.noise(1.3, 500, 0.9 * v); this.tone('sine', 90, 0, 0.8, 0.6 * v, 400, null, 30); },
  beep(f, dur) { this.tone('square', f, 0, dur || 0.12, 0.1, 3000); },
  jingle(ok) {
    const c = this.ctx; if (!c) return; const t = c.currentTime;
    (ok ? [523, 659, 784, 1047] : [392, 330, 262]).forEach((f, i) => this.tone('square', f, t + i * 0.13, 0.25, 0.1, 2500));
  },
  // 车载电台：一段循环的合成器浪潮 (Am - F - C - G)
  radioTick(active) {
    const c = this.ctx, r = this.radio; if (!c || !active || !r.on) return;
    const t = c.currentTime;
    if (r.next < t) r.next = t + 0.05;
    while (r.next < t + 0.25) { this.radioStep(r.step, r.next); r.step = (r.step + 1) % 64; r.next += 60 / 106 / 4; }
  },
  radioStep(s, t) {
    const bar = (s >> 4) & 3, root = [57, 53, 48, 55][bar], third = [3, 4, 4, 4][bar];
    const f = m => 440 * Math.pow(2, (m - 69) / 12), R = this.rGain;
    const arp = [0, 7, 12, 12 + third, 19, 12 + third, 12, 7];
    if (s % 2 === 0) this.tone('sawtooth', f(root - 24), t, 0.2, 0.17, 500, R);
    this.tone('square', f(root + arp[s % 8]), t, 0.13, 0.035, 2200, R);
    if (s % 16 === 0) for (const k of [0, third, 7]) this.tone('sawtooth', f(root + k), t, 2.1, 0.022, 1100, R);
    if (s % 4 === 0) this.tone('sine', 120, t, 0.14, 0.42, 800, R, 40);
    if (s % 8 === 4) this.noise(0.12, 1800, 0.16, t, R, 'bandpass');
    if (s % 2 === 1) this.noise(0.03, 7000, 0.05, t, R, 'highpass');
  },
};

/* ---------------- HUD 小工具 ---------------- */
let hintUntil = 0, hintHtml = '', bigUntil = 0, carNameUntil = 0, zoneUntil = 0, radioUntil = 0, curZone = '', zoneCd = 0, shownMoney = 0;
function setHintHtml(h) { if (h === hintHtml) return; hintHtml = h; if (h) UI.hint.innerHTML = h; UI.hint.style.opacity = h ? 1 : 0; }
function hint(html, ms) { setHintHtml(html); hintUntil = clock + (ms || 2000) / 1000; }
function bigText(main, sub, cls, ms) {
  UI.big.className = 'stroke ' + cls;
  UI.big.children[0].textContent = main; UI.big.children[1].textContent = sub || '';
  UI.big.style.opacity = 1; bigUntil = clock + ms / 1000;
}
function showCarName(n) { UI.carname.textContent = n; UI.carname.style.opacity = 1; carNameUntil = clock + 3; if (Sfx.radio.on) showRadio('♪ 霓虹湾电台 FM 106.0'); }
function showRadio(t) { UI.radio.textContent = t; UI.radio.style.opacity = 1; radioUntil = clock + 3; }
function setObj(html) { UI.objective.innerHTML = html; }
function hurtFlash() { UI.hurt.style.opacity = 1; setTimeout(() => { UI.hurt.style.opacity = 0; }, 180); }

/* ---------------- 标记物 ---------------- */
function makeBeam(color, r) {
  const g = new THREE.Group();
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 90, 24, 1, true),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.24, side: THREE.DoubleSide, depthWrite: false, fog: false }));
  beam.position.y = 45; g.add(beam);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.16, 8, 36), new THREE.MeshBasicMaterial({ color, fog: false }));
  ring.rotation.x = Math.PI / 2; ring.position.y = 0.35; g.add(ring);
  g.visible = false; scene.add(g); return g;
}
const goal = makeBeam(0xffe14d, 3.4), mstart = makeBeam(0xff4fa8, 2.2);
function setGoal(x, z) { goal.position.set(x, 0, z); goal.visible = true; }
function clearGoal() { goal.visible = false; }
const nearGoal = r => goal.visible && Math.hypot(P.x - goal.position.x, P.z - goal.position.z) < r;
const packages = [];
{
  const mat = new THREE.MeshBasicMaterial({ color: 0x5dff8f });
  for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(UNIT_BOX, mat); m.scale.set(0.9, 0.9, 0.9); m.visible = false; scene.add(m); packages.push(m); }
}

/* ---------------- 任务 ---------------- */
const M = { idx: 0, active: null, t: 0, cd: 0.5, spot: null };
const SPOTS = [
  { x: blockC(5) - 22, z: blockC(5) + 27.6 },
  { x: blockC(6) + 27.6, z: blockC(3) },
  { x: blockC(4), z: blockC(4) + 27.6 },
  { x: blockC(2) - 27.6, z: blockC(5) },
  { x: blockC(7), z: blockC(6) - 27.6 },
  { x: blockC(3) + 27.6, z: blockC(1) },
];
const MISSIONS = [
  {
    title: '初来乍到', reward: 500,
    start() { this.s = 0; setObj('找一辆车，靠近后按 <b>F</b> 上车（有人的车也能抢）'); },
    update() {
      if (this.s === 0 && P.car) { this.s = 1; setGoal(POI.beach.x, POI.beach.z); setObj('一路向东，把车开到 <b>海洋大道</b> 的黄色光柱'); }
      if (this.s === 1 && P.car && nearGoal(8)) return true;
    },
  },
  {
    title: '极速快递', reward: 1500, time: 150,
    start() {
      const used = [];
      for (const m of packages) {
        let x, z, tries = 0;
        do {
          if (Math.random() < 0.5) { x = roadX(randi(0, N)); z = blockC(randi(0, N - 1)); } else { x = blockC(randi(0, N - 1)); z = roadX(randi(0, N)); }
          tries++;
        } while (tries < 60 && (Math.hypot(x - P.x, z - P.z) < 60 || Math.hypot(x - P.x, z - P.z) > 300 || used.includes(x + ',' + z)));
        used.push(x + ',' + z);
        m.position.set(x, 1.2, z); m.visible = true;
      }
      this.left = packages.length; this.show();
    },
    show() { setObj('限时收集绿色包裹（小地图上的绿点）：<b>' + (packages.length - this.left) + ' / ' + packages.length + '</b>'); },
    update() {
      for (const m of packages) {
        if (!m.visible) continue;
        if (Math.hypot(m.position.x - P.x, m.position.z - P.z) < 3.2) { m.visible = false; this.left--; M.t += 8; Sfx.beep(880); Sfx.beep(1320, 0.2); this.show(); }
      }
      if (this.left <= 0) return true;
    },
    end() { for (const m of packages) m.visible = false; },
  },
  {
    title: '借车不还', reward: 3000,
    start() {
      const x = blockC(4), z = roadX(4) + PARK_OFF;
      for (let i = cars.length - 1; i >= 0; i--) { const c = cars[i]; if (c !== P.car && Math.hypot(c.x - x, c.z - z) < 8) c.remove(); }
      this.car = new Car('sport', x, z, Math.PI / 2, 0xffc400); this.car.mission = true;
      this.s = 0; setGoal(x, z); setObj('去 <b>市中心</b> 偷走那辆金色的 <b>彗星 GT</b>');
    },
    update() {
      const c = this.car;
      if (c.wreck || c.burning || c.removed) return '目标车辆被毁';
      if (this.s === 0 && P.car === c) {
        this.s = 1; P.heat = Math.max(P.heat, 3); P.unseen = 0;
        setGoal(POI.garage.x, POI.garage.z); setObj('车主报警了！把车完好地开到 <b>西港车库</b>');
      }
      if (this.s === 1 && P.car === c && nearGoal(8) && c.speed < 8) return true;
    },
    end(ok) {
      this.car.mission = false;
      if (ok && P.car === this.car) { exitCar(); this.car.remove(); P.heat = 0; }
    },
  },
  {
    title: '全城通缉', reward: 5000, time: 80, survive: true,
    start() { P.heatFloor = 6; P.heat = Math.max(P.heat, 6); P.unseen = 0; setObj('你被三星通缉！<b>活下去</b>，撑到倒计时结束'); },
    update() { },
    end() { P.heatFloor = 0; P.heat = 0; },
  },
];
function makeJob() { // 前四个任务之后的无限随机送货
  let gx, gz, d, tries = 0;
  do { gx = roadX(randi(0, N)); gz = blockC(randi(0, N - 1)); d = Math.hypot(gx - P.x, gz - P.z); tries++; } while (d < 220 && tries < 80);
  return {
    title: '送货上门', reward: Math.round(d * 3 / 50) * 50 + 300, time: Math.round(d / 11 + 25),
    start() { setGoal(gx, gz); setObj('限时把货送到 <b>' + zoneName(gx, gz) + '</b> 的黄色光柱'); },
    update() { if (nearGoal(8)) return true; },
  };
}
function startMission() {
  const def = M.idx < MISSIONS.length ? MISSIONS[M.idx] : makeJob();
  M.active = def; M.t = def.time || 0; mstart.visible = false;
  def.start();
  bigText(def.title, '任务开始', 'mission', 2600); Sfx.jingle(true);
}
function finishMission(ok, why, silent) {
  const def = M.active; if (!def) return;
  if (def.end) def.end(ok);
  M.active = null; M.cd = 5; clearGoal(); setObj(''); UI.timer.textContent = '';
  if (ok) { P.money += def.reward; M.idx++; bigText('任务完成', '+ $' + def.reward, 'passed', 3600); Sfx.jingle(true); }
  else if (!silent) { bigText('任务失败', why || '', 'failed', 3600); Sfx.jingle(false); }
}
function updateMission(dt) {
  if (!M.active) {
    if (M.cd > 0) {
      M.cd -= dt;
      if (M.cd <= 0) {
        M.spot = M.idx < SPOTS.length ? SPOTS[M.idx] : pick(SPOTS.filter(s => Math.hypot(s.x - P.x, s.z - P.z) > 40));
        mstart.position.set(M.spot.x, 0, M.spot.z); mstart.visible = true;
      }
      return;
    }
    if (mstart.visible && !P.dead && Math.hypot(P.x - M.spot.x, P.z - M.spot.z) < 3.4) startMission();
    return;
  }
  const def = M.active;
  if (def.time) {
    M.t -= dt;
    const s = Math.max(0, Math.ceil(M.t));
    UI.timer.textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
    if (M.t <= 0) { finishMission(!!def.survive, '时间到'); return; }
  }
  const r = def.update(dt);
  if (r === true) finishMission(true); else if (typeof r === 'string') finishMission(false, r);
}

/* ---------------- 死亡 / 被捕 / 重生 ---------------- */
function endLife(kind) {
  if (P.dead) return;
  P.dead = true; P.deadT = 0; P.deadKind = kind; slowmo = 0.35; firing = false;
  if (P.car) { P.car.inp.throttle = 0; P.car.inp.handbrake = true; }
  bigText(kind === 'wasted' ? 'WASTED' : 'BUSTED', kind === 'wasted' ? '你挂了' : '你被捕了', kind, 4200);
  if (M.active) finishMission(false, '', true);
  Sfx.jingle(false);
}
function deadTick(real) {
  const before = P.deadT; P.deadT += real;
  if (!P.car && P.deadKind === 'wasted') { P.mesh.rotation.x += (-Math.PI / 2 - P.mesh.rotation.x) * Math.min(1, real * 6); P.mesh.position.y = P.y + 0.15; }
  if (before < 3.4 && P.deadT >= 3.4) UI.fade.style.opacity = 1;
  if (P.deadT >= 4.3) respawn();
}
function respawn() {
  const poi = P.deadKind === 'wasted' ? POI.hospital : POI.police;
  if (P.car) { P.car.driver = null; P.car.inp.handbrake = false; P.car = null; }
  const fee = Math.min(P.money, P.deadKind === 'wasted' ? 800 : 500);
  P.money -= fee;
  P.x = poi.x; P.z = poi.z; P.y = CURB; P.vy = 0; P.vx = 0; P.vz = 0; P.h = 0;
  P.health = 100; P.heat = 0; P.heatFloor = 0; P.unseen = 0; P.bust = 0; P.dead = false; P.lastHurt = 99;
  P.mesh.visible = true; P.mesh.rotation.x = 0; P.mesh.position.set(P.x, P.y, P.z); P.mesh.rotation.y = 0;
  cam.yaw = 0; cam.pitch = 0.3; slowmo = 1;
  for (let i = cars.length - 1; i >= 0; i--) { if (cars[i].driver === 'cop') cars[i].remove(); else cars[i].playerHit = -99; }
  UI.fade.style.opacity = 0;
  hint((P.deadKind === 'wasted' ? '你在医院醒来' : '你被保释出来了') + (fee ? '，花掉 $' + fee : ''), 4000);
}

/* ---------------- 输入 ---------------- */
function lockMouse() { try { const p = canvas.requestPointerLock(); if (p && p.catch) p.catch(() => { }); } catch (e) { } }
function togglePause() {
  if (state !== 'play') return;
  paused = !paused; UI.pause.classList.toggle('hidden', !paused);
  if (paused) { if (document.pointerLockElement) document.exitPointerLock(); Sfx.engine(false, 0); Sfx.siren(0, 0); } else lockMouse();
}
window.addEventListener('keydown', e => {
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.code)) e.preventDefault();
  if (e.repeat) return;
  keys[e.code] = true;
  if (state !== 'play') return;
  if (e.code === 'KeyP') togglePause();
  if (paused) return;
  if (e.code === 'KeyF') tryEnterExit();
  if (e.code === 'KeyR') { Sfx.radio.on = !Sfx.radio.on; showRadio(Sfx.radio.on ? '♪ 霓虹湾电台 FM 106.0' : '电台：关'); }
});
window.addEventListener('keyup', e => { keys[e.code] = false; });
window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; firing = false; });
canvas.addEventListener('mousedown', e => {
  if (state !== 'play' || paused) return;
  Sfx.init();
  if (!locked) { lockMouse(); return; }
  if (e.button === 0) firing = true;
});
window.addEventListener('mouseup', () => { firing = false; });
document.addEventListener('pointerlockchange', () => {
  locked = document.pointerLockElement === canvas;
  UI.lockhint.classList.toggle('hidden', locked);
  if (!locked) firing = false;
});
document.addEventListener('mousemove', e => {
  if (!locked || paused) return;
  cam.yaw -= e.movementX * 0.0026; cam.pitch += e.movementY * 0.0022; cam.lastMouse = clock;
});
UI.pause.addEventListener('click', () => { if (paused) togglePause(); });

function playerInput(dt) {
  const up = keys.KeyW || keys.ArrowUp, down = keys.KeyS || keys.ArrowDown, left = keys.KeyA || keys.ArrowLeft, right = keys.KeyD || keys.ArrowRight;
  if (P.shootCd > 0) P.shootCd -= dt;
  if (P.car) {
    const c = P.car;
    c.inp.throttle = (up ? 1 : 0) - (down ? 1 : 0);
    c.inp.steer += ((left ? 1 : 0) - (right ? 1 : 0) - c.inp.steer) * Math.min(1, dt * 7);
    c.inp.handbrake = !!keys.Space;
  } else {
    updatePlayerFoot(dt, (right ? 1 : 0) - (left ? 1 : 0), (up ? 1 : 0) - (down ? 1 : 0), !!(keys.ShiftLeft || keys.ShiftRight), !!keys.Space);
    if (firing && locked) shoot();
  }
}

/* ---------------- 相机 ---------------- */
const headlight = new THREE.SpotLight(0xfff2d0, 0, 70, 0.55, 0.6, 1);
scene.add(headlight, headlight.target);
function updateCamera(dt) {
  if (state === 'menu') { // 标题画面：绕着市中心慢慢转
    const a = clock * 0.05 + 0.9;
    camera.position.set(Math.cos(a) * 300, 150, Math.sin(a) * 300);
    camera.lookAt(0, 30, 0);
    camera.fov = 55; camera.updateProjectionMatrix();
    return;
  }
  const c = P.car;
  let tx, ty, tz, dist;
  if (c) {
    tx = c.x; ty = c.y + 1.5; tz = c.z; dist = 8.5 + c.speed * 0.07;
    if (clock - cam.lastMouse > 1.5 && c.speed > 2) { // 没动鼠标时相机自动回到车后
      const target = c.fwdSpeed() >= -1 ? c.h : c.h + Math.PI;
      cam.yaw += wrapAngle(target - cam.yaw) * Math.min(1, dt * 3);
      cam.pitch += (0.26 - cam.pitch) * Math.min(1, dt * 2);
    }
  } else {
    tx = P.x; ty = P.y + 1.55; tz = P.z; dist = 5.2;
    const fwd = keys.KeyW || keys.ArrowUp, back = keys.KeyS || keys.ArrowDown;
    if (!locked && P.moving && !back && clock - cam.lastMouse > 1.5) cam.yaw += wrapAngle(P.h - cam.yaw) * Math.min(1, dt * (fwd ? 1.2 : 1.6));
    tx -= Math.cos(cam.yaw) * 0.55; tz += Math.sin(cam.yaw) * 0.55; // 越肩视角：准星不被自己挡住
  }
  cam.yaw = wrapAngle(cam.yaw);
  cam.pitch = clamp(cam.pitch, -0.12, 1.25);
  const cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
  const dx = Math.sin(cam.yaw) * cp, dy = -sp, dz = Math.cos(cam.yaw) * cp;
  let d = dist; // 相机被建筑挡住时拉近
  for (let k = 1; k <= 10; k++) {
    const q = dist * k / 10;
    if (pointInBuilding(tx - dx * q, ty - dy * q, tz - dz * q)) { d = Math.max(0.8, dist * (k - 1) / 10); break; }
  }
  cam.curDist += (d - cam.curDist) * Math.min(1, dt * (d < cam.curDist ? 30 : 6));
  d = cam.curDist;
  let px = tx - dx * d, py = Math.max(0.4, ty - dy * d), pz = tz - dz * d;
  if (cam.shake > 0.001) { px += rand(-1, 1) * cam.shake * 0.25; py += rand(-1, 1) * cam.shake * 0.25; pz += rand(-1, 1) * cam.shake * 0.25; cam.shake *= Math.exp(-6 * dt); }
  camera.position.set(px, py, pz);
  camera.lookAt(px + dx, py + dy, pz + dz);
  const fov = 62 + (c ? Math.min(16, c.speed * 0.33) : 0);
  if (Math.abs(fov - camera.fov) > 0.05) { camera.fov += (fov - camera.fov) * Math.min(1, dt * 4); camera.updateProjectionMatrix(); }

  // 夜晚给玩家的车打一盏前大灯
  const glow = smooth(0.2, 0.75, ENV.night);
  if (c && glow > 0.02) {
    const s = Math.sin(c.h), co = Math.cos(c.h);
    headlight.intensity = 45 * glow;
    headlight.position.set(c.x + s * 2, 1.0, c.z + co * 2); headlight.target.position.set(c.x + s * 22, 0, c.z + co * 22);
  } else headlight.intensity = 0;
}

/* ---------------- 小地图 ---------------- */
const MS = 0.4; // 像素 / 米
function drawMinimap(now) {
  const g = UI.map, W = 200, R = 100, a = cam.yaw + Math.PI, ca = Math.cos(a), sa = Math.sin(a);
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = '#3d7a3c'; g.fillRect(0, 0, W, W);
  g.translate(R, R); g.rotate(a); g.scale(MS, MS); g.translate(-P.x, -P.z);
  g.fillStyle = '#e2cf9b'; g.fillRect(E, -3000, 64, 6000);
  g.fillStyle = '#1d74ad'; g.fillRect(E + 62, -3000, 3000, 6000);
  g.fillStyle = '#6b7079'; g.fillRect(-E, -E, 2 * E, 2 * E);
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (Math.abs(b.cx - P.x) > 400 || Math.abs(b.cz - P.z) > 400) continue;
    g.fillStyle = b.type === 'park' ? '#3f8f4c' : b.type === 'hospital' ? '#8a4a55' : b.type === 'police' ? '#3d55a0' : '#262a33';
    g.fillRect(b.cx - BLOCK / 2, b.cz - BLOCK / 2, BLOCK, BLOCK);
  }
  g.setTransform(1, 0, 0, 1, 0, 0);
  const blip = (x, z, color, r, edge, label) => {
    let mx = ((x - P.x) * ca - (z - P.z) * sa) * MS, mz = ((x - P.x) * sa + (z - P.z) * ca) * MS;
    const l = Math.hypot(mx, mz);
    if (l > R - 8) { if (!edge) return; mx *= (R - 8) / l; mz *= (R - 8) / l; }
    g.fillStyle = color; g.strokeStyle = '#000'; g.lineWidth = 1.5;
    g.beginPath(); g.arc(R + mx, R + mz, r, 0, 6.3); g.fill(); g.stroke();
    if (label) { g.fillStyle = '#000'; g.font = 'bold 10px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(label, R + mx, R + mz + 0.5); }
  };
  for (const c of cars) if (c.driver === 'cop') blip(c.x, c.z, Math.floor(now * 6) % 2 ? '#ff3030' : '#3080ff', 4, false);
  for (const m of packages) if (m.visible) blip(m.position.x, m.position.z, '#5dff8f', 4, true);
  if (mstart.visible) blip(mstart.position.x, mstart.position.z, '#ff4fa8', 7, true, 'M');
  if (goal.visible) blip(goal.position.x, goal.position.z, '#ffe14d', 6, true);
  // 玩家箭头
  const rh = P.h - a, ax = Math.sin(rh), az = Math.cos(rh);
  g.fillStyle = '#fff'; g.strokeStyle = '#000'; g.lineWidth = 1.5;
  g.beginPath(); g.moveTo(R + ax * 9, R + az * 9); g.lineTo(R - ax * 5 - az * 5.5, R - az * 5 + ax * 5.5); g.lineTo(R - ax * 2, R - az * 2); g.lineTo(R - ax * 5 + az * 5.5, R - az * 5 - ax * 5.5); g.closePath(); g.fill(); g.stroke();
  // 北
  g.fillStyle = '#fff'; g.font = 'bold 12px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('N', R + (-(-1) * sa) * (R - 12), R + ((-1) * ca) * (R - 12));
}

/* ---------------- HUD ---------------- */
let lastStars = -1, lastClock = '', lastHealth = -1, lastMoney = -1, lastSpeed = -1, frameNo = 0;
function updateHud(dt) {
  const hh = Math.floor(ENV.hour), mm = Math.floor((ENV.hour - hh) * 60);
  const ck = String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
  if (ck !== lastClock) { lastClock = ck; UI.clock.textContent = ck; }
  shownMoney += (P.money - shownMoney) * Math.min(1, dt * 5);
  if (Math.abs(P.money - shownMoney) < 1) shownMoney = P.money;
  const mny = Math.round(shownMoney);
  if (mny !== lastMoney) { lastMoney = mny; UI.money.textContent = '$' + String(mny).padStart(8, '0'); }
  const hp = Math.round(P.health);
  if (hp !== lastHealth) { lastHealth = hp; UI.health.style.width = hp + '%'; }
  const st = wantedStars();
  if (st !== lastStars) { lastStars = st; for (let i = 0; i < 5; i++) UI.stars.children[i].className = i < st ? 'on' : ''; }
  UI.stars.classList.toggle('flash', st > 0 && P.unseen > 5);
  const kmh = P.car ? Math.round(P.car.speed * 3.6) : -1;
  if (kmh !== lastSpeed) { lastSpeed = kmh; UI.speedo.innerHTML = kmh < 0 ? '' : kmh + '<small>km/h</small>'; }
  UI.crosshair.style.display = P.car || P.dead ? 'none' : 'block';

  if (clock > bigUntil) UI.big.style.opacity = 0;
  if (clock > carNameUntil) UI.carname.style.opacity = 0;
  if (clock > zoneUntil) UI.zone.style.opacity = 0;
  if (clock > radioUntil) UI.radio.style.opacity = 0;
  zoneCd -= dt;
  if (zoneCd <= 0) {
    zoneCd = 0.5;
    const z = zoneName(P.x, P.z);
    if (z !== curZone) { curZone = z; UI.zone.textContent = z; UI.zone.style.opacity = 1; zoneUntil = clock + 3.5; }
  }
  if (clock > hintUntil) { // 没有临时提示时，显示上下文提示
    let h = '';
    if (!P.dead && !P.car) { const c = nearestCar(4.4); if (c) h = c.driver ? '按 <b>F</b> 劫车' : '按 <b>F</b> 上车'; }
    setHintHtml(h);
  }
  if ((frameNo++ & 1) === 0) drawMinimap(clock);
}

/* ---------------- 主循环 ---------------- */
function step(dt, real) {
  ENV.hour = (ENV.hour + dt / 75) % 24; // 游戏里 1 小时 = 现实 75 秒（一天 30 分钟）
  setTime(ENV.hour);

  if (state === 'play') { if (P.dead) deadTick(real); else playerInput(dt); }
  for (let i = 0; i < cars.length; i++) { const c = cars[i]; if (c.ai && !c.wreck && !c.burning) aiDrive(c, dt); }
  for (let i = 0; i < cars.length; i++) {
    const c = cars[i];
    if (!c.parked) { carPhysics(c, dt); carVsWorld(c); }
    if (!c.parked || c.wreck) updateCarState(c, dt);
  }
  carVsCars();
  for (let i = 0; i < cars.length; i++) {
    const c = cars[i]; if (c.parked) continue;
    if (!c.driver && !c.burning && c.speed < 0.15) { c.vx = 0; c.vz = 0; c.parked = true; }
    c.sync();
  }
  if (P.car) { const c = P.car; P.x = c.x; P.z = c.z; P.y = c.y; P.vx = c.vx; P.vz = c.vz; P.h = c.h; }
  updatePeds(dt);

  if (state === 'play') {
    const nearestCop = updatePolice(dt, clock);
    updateMission(dt);
    P.lastHurt += dt;
    if (!P.dead && P.lastHurt > 6 && P.health < 100) P.health = Math.min(100, P.health + 4 * dt);
    // 声音
    if (P.car && !P.dead) {
      const c = P.car, sp = Math.abs(c.fwdSpeed()), gs = c.T.max / 4, gear = Math.min(3, Math.floor(sp / gs));
      Sfx.engine(true, clamp(0.15 + (sp - gear * gs) / gs * 0.7 + gear * 0.05 + (c.inp.throttle ? 0.1 : 0), 0, 1.1));
    } else Sfx.engine(false, 0);
    Sfx.siren(nearestCop < 90 ? 0.035 * (1 - nearestCop / 90) + 0.008 : 0, clock);
    Sfx.radioTick(!!P.car && !P.dead);
    // 任务标记的小动画
    const pulse = 1 + Math.sin(clock * 4) * 0.08;
    goal.scale.set(pulse, 1, pulse); mstart.scale.set(pulse, 1, pulse);
    for (const m of packages) if (m.visible) { m.rotation.y += dt * 2.5; m.position.y = 1.2 + Math.sin(clock * 3) * 0.2; }
  }
  manageWorld(dt);
  updateParticles(dt);
  updateCamera(dt);
  focusLight(state === 'menu' ? 0 : P.x, state === 'menu' ? 0 : P.z);
  sky.position.copy(camera.position); starField.position.copy(camera.position);
  if (state === 'play') updateHud(dt);
}

let lastT = performance.now();
function frame(nowMs) {
  requestAnimationFrame(frame);
  const real = Math.min(0.05, (nowMs - lastT) / 1000); lastT = nowMs;
  if (!paused) { clock += real; step(real * slowmo, real); }
  renderer.render(scene, camera);
}

function startGame() {
  if (state === 'play') return;
  state = 'play';
  UI.start.classList.add('hidden'); UI.hud.classList.remove('hidden');
  Sfx.init(); lockMouse();
  cam.yaw = -Math.PI / 2; cam.pitch = 0.22; // 开局沿街朝西，对着日落
  hint('走进<b>粉色光柱</b>开始任务，或者随便逛逛', 7000);
}
$('startBtn').addEventListener('click', startGame);

populateWorld();
requestAnimationFrame(frame);

// 调试 / 自动化测试用
window.G = { P, cars, peds, cam, M, ENV, keys, startGame, shoot, tryEnterExit, addCrime, wantedStars, get state() { return state; } };
