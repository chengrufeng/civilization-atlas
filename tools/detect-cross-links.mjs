/* =========================================================================
 * F1 跨数据集人物关联自动检测
 *
 * 扫描所有数据集，找出可能存在的跨集关联候选，分两类输出：
 *   1. same-person 候选：同一姓名（或同一 alias）出现在多个 atlas 中，
 *      且生卒年窗口至少有重叠。
 *   2. interaction 候选（同代）：同时代、跨文明，birth/death 区间相交。
 *      仅作为人工筛选提示，输出量较大时会被截断。
 *
 * 已存在于 cross-links.js 的关联会被跳过，避免重复。
 *
 * 运行：node tools/detect-cross-links.mjs
 * ========================================================================= */

import { ATLAS_MANIFEST } from '../js/data/index.js';
import { CROSS_LINKS } from '../js/data/cross-links.js';

async function loadAll() {
  const atlases = [];
  for (const meta of ATLAS_MANIFEST) {
    const atlas = await meta.load();
    atlases.push({ meta, atlas });
  }
  return atlases;
}

function nameKey(name) {
  return (name || '').trim();
}

function aliasKeys(person) {
  const keys = new Set();
  if (person.name) keys.add(nameKey(person.name));
  for (const a of person.alias || []) {
    if (a) keys.add(nameKey(a));
  }
  return keys;
}

function overlap(a, b) {
  return a.birth <= b.death && b.birth <= a.death;
}

async function main() {
  const atlases = await loadAll();

  // 索引：nameKey → [{ atlas, person }]
  const nameIdx = new Map();
  for (const { meta, atlas } of atlases) {
    for (const p of atlas.persons) {
      for (const k of aliasKeys(p)) {
        if (!nameIdx.has(k)) nameIdx.set(k, []);
        nameIdx.get(k).push({ atlasId: atlas.id, atlasName: meta.name, person: p });
      }
    }
  }

  // 已注册的 same-person key（按 person-set）
  const registered = new Set();
  for (const link of CROSS_LINKS) {
    if (link.kind !== 'same-person') continue;
    const ids = link.persons.map(p => `${p.atlas}:${p.id}`).sort().join('|');
    registered.add(ids);
  }

  /* ---- same-person 候选 ---- */
  const samePersonCandidates = [];
  for (const [key, entries] of nameIdx) {
    // 只看跨 atlas 的命中
    const atlasIds = new Set(entries.map(e => e.atlasId));
    if (atlasIds.size < 2) continue;

    // 按 atlas 去重，每个 atlas 取第一个
    const byAtlas = new Map();
    for (const e of entries) {
      if (!byAtlas.has(e.atlasId)) byAtlas.set(e.atlasId, e);
    }
    const unique = [...byAtlas.values()];
    if (unique.length < 2) continue;

    // 检查生卒窗口是否兼容（至少存在两两 overlap 或同 name 视为同一人）
    // 简化：取所有人，若任意两人 overlap 即视为强候选
    let allOverlap = true;
    for (let i = 0; i < unique.length; i++) {
      for (let j = i + 1; j < unique.length; j++) {
        if (!overlap(unique[i].person, unique[j].person)) { allOverlap = false; break; }
      }
      if (!allOverlap) break;
    }
    const sig = unique.map(e => `${e.atlasId}:${e.person.id}`).sort().join('|');
    if (registered.has(sig)) continue;

    samePersonCandidates.push({
      key,
      overlap: allOverlap,
      entries: unique.map(e => ({
        atlasId: e.atlasId, atlasName: e.atlasName,
        personId: e.person.id, personName: e.person.name,
        birth: e.person.birth, death: e.person.death,
      })),
    });
  }

  // 排序：强候选在前；人数多在前
  samePersonCandidates.sort((a, b) => {
    if (a.overlap !== b.overlap) return a.overlap ? -1 : 1;
    return b.entries.length - a.entries.length;
  });

  /* ---- interaction 候选（同时代跨集，仅给前若干条）----
   * 全 O(n²) 过大，限制：只取每个 atlas 的"标志性人物"（importance=1 或前 3 个） */
  const featured = [];
  for (const { meta, atlas } of atlases) {
    const cap = Math.min(3, atlas.persons.length);
    for (let i = 0; i < cap; i++) featured.push({
      atlasId: atlas.id, atlasName: meta.name, person: atlas.persons[i],
    });
  }
  const interactionCandidates = [];
  for (let i = 0; i < featured.length; i++) {
    for (let j = i + 1; j < featured.length; j++) {
      const a = featured[i], b = featured[j];
      if (a.atlasId === b.atlasId) continue;
      if (!overlap(a.person, b.person)) continue;
      interactionCandidates.push({
        a: { atlasId: a.atlasId, atlasName: a.atlasName, personName: a.person.name, personId: a.person.id, birth: a.person.birth, death: a.person.death },
        b: { atlasId: b.atlasId, atlasName: b.atlasName, personName: b.person.name, personId: b.person.id, birth: b.person.birth, death: b.person.death },
      });
    }
  }
  interactionCandidates.sort((x, y) => {
    const xOv = Math.min(x.a.death, x.b.death) - Math.max(x.a.birth, x.b.birth);
    const yOv = Math.min(y.a.death, y.b.death) - Math.max(y.a.birth, y.b.birth);
    return yOv - xOv;
  });

  /* ---- 输出 ---- */
  console.log('═══════════════════════════════════════════════════════════');
  console.log(' 📋 same-person 候选（同一姓名/别名在多个 atlas 出现，且生卒窗口重叠）');
  console.log('═══════════════════════════════════════════════════════════\n');
  if (samePersonCandidates.length === 0) {
    console.log('  （无候选）\n');
  } else {
    samePersonCandidates.forEach((c, i) => {
      console.log(`  [${i + 1}] ${c.overlap ? '⭐ 强候选' : '⚠️  姓名同，生卒不重叠'}：${c.key}`);
      c.entries.forEach(e => {
        console.log(`        ${e.atlasName.padEnd(12)} ${e.personName}（${e.birth}–${e.death}）  ${e.atlasId}/${e.personId}`);
      });
      console.log('');
    });
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log(' 🤝 interaction 候选（前 15 条 · 跨文明同时代名人，按共处时长排序）');
  console.log('═══════════════════════════════════════════════════════════\n');
  interactionCandidates.slice(0, 15).forEach((c, i) => {
    const ov = Math.min(c.a.death, c.b.death) - Math.max(c.a.birth, c.b.birth);
    console.log(`  [${i + 1}] 共处 ${ov} 年`);
    console.log(`        ${c.a.atlasName.padEnd(12)} ${c.a.personName}（${c.a.birth}–${c.a.death}）`);
    console.log(`        ${c.b.atlasName.padEnd(12)} ${c.b.personName}（${c.b.birth}–${c.b.death}）`);
    console.log('');
  });

  console.log(`\n共 ${samePersonCandidates.length} 条 same-person 候选，${interactionCandidates.length} 条 interaction 候选。`);
  console.log('→ 人工筛选后填入 js/data/cross-links.js。');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
