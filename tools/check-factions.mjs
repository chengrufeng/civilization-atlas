/* =========================================================================
 * F11 Faction 颜色冲突检测
 *
 * 检查每个 atlas 内 factions 的颜色是否唯一，以及跨 atlas 是否存在
 * 相同 id 但颜色/名称不一致的情况。
 *
 * 运行：node tools/check-factions.mjs
 * ========================================================================= */

import { ATLAS_MANIFEST } from '../js/data/index.js';

function normalizeColor(c) {
  if (!c) return '';
  return c.toLowerCase().trim();
}

async function main() {
  let problems = 0;
  let warnings = 0;

  console.log('═══════════════════════════════════════════════════════════');
  console.log(' 🎨 Faction 颜色冲突检测');
  console.log('═══════════════════════════════════════════════════════════\n');

  for (const meta of ATLAS_MANIFEST) {
    const atlas = await meta.load();
    const factions = atlas.factions || [];

    // 同 atlas 内颜色唯一性
    const byColor = new Map();
    for (const f of factions) {
      const key = normalizeColor(f.color);
      if (!byColor.has(key)) byColor.set(key, []);
      byColor.get(key).push(f);
    }
    const dupes = [...byColor.entries()].filter(([_, list]) => list.length > 1);

    if (dupes.length > 0) {
      problems++;
      console.log(`❌ [${meta.id}] ${meta.name} — 同数据集内颜色冲突`);
      for (const [color, list] of dupes) {
        console.log(`     色值 ${color}：${list.map(f => `${f.name}(${f.id})`).join(' · ')}`);
      }
    }

    // 同 atlas 内 id 唯一性
    const ids = new Map();
    for (const f of factions) {
      if (!ids.has(f.id)) ids.set(f.id, []);
      ids.get(f.id).push(f);
    }
    const idDupes = [...ids.entries()].filter(([_, list]) => list.length > 1);
    if (idDupes.length > 0) {
      problems++;
      console.log(`❌ [${meta.id}] ${meta.name} — faction id 重复`);
      for (const [id, list] of idDupes) {
        console.log(`     id="${id}"：${list.map(f => f.name).join(' · ')}`);
      }
    }
  }

  /* ---- 跨 atlas：同 id 不同色/名 ---- */
  const globalById = new Map();
  for (const meta of ATLAS_MANIFEST) {
    const atlas = await meta.load();
    for (const f of atlas.factions || []) {
      if (!globalById.has(f.id)) globalById.set(f.id, []);
      globalById.get(f.id).push({ atlasId: atlas.id, atlasName: meta.name, f });
    }
  }
  const crossConflicts = [...globalById.entries()]
    .filter(([_, list]) => {
      if (list.length < 2) return false;
      const colors = new Set(list.map(x => normalizeColor(x.f.color)));
      const names = new Set(list.map(x => x.f.name));
      return colors.size > 1 || names.size > 1;
    });

  console.log('═══════════════════════════════════════════════════════════');
  console.log(' 🌐 跨数据集：相同 faction id 但颜色/名称不一致');
  console.log('═══════════════════════════════════════════════════════════\n');
  if (crossConflicts.length === 0) {
    console.log('  （无）\n');
  } else {
    for (const [id, list] of crossConflicts) {
      warnings++;
      console.log(`  ⚠️  id="${id}"`);
      list.forEach(x => {
        console.log(`        ${x.atlasName.padEnd(12)} ${x.f.name.padEnd(10)} ${x.f.color}`);
      });
      console.log('');
    }
  }

  console.log('───────────────────────────────────────────────────────────');
  console.log(`  ❌ 错误：${problems}    ⚠️  警告：${warnings}`);
  if (problems === 0 && warnings === 0) {
    console.log('  ✅ 28 个数据集 faction 配色全部健康。');
  }
  console.log('───────────────────────────────────────────────────────────');

  process.exit(problems > 0 ? 1 : 0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
