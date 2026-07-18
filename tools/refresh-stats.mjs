/* =========================================================================
 * 刷新数据集统计：扫描所有数据文件，把人物/事件/势力/地点数写回
 * 到 ATLAS_MANIFEST 的 stats 字段。运行：
 *   node tools/refresh-stats.mjs
 * 数据集内容变更后跑一次即可同步。
 * ========================================================================= */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { ATLAS_MANIFEST } from '../js/data/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const INDEX_PATH = resolve(__dirname, '..', 'js', 'data', 'index.js');

async function main() {
  // 1) 取实际统计
  const stats = {};
  for (const meta of ATLAS_MANIFEST) {
    const a = await meta.load();
    stats[meta.id] = {
      persons: a.persons.length,
      events: a.events.length,
      factions: a.factions.length,
      places: a.places.length,
    };
  }

  // 2) 读 index.js，按行重写 manifest，给每条目补/更新 stats
  let src = readFileSync(INDEX_PATH, 'utf8');
  const lines = src.split('\n');
  const out = [];
  let inManifest = false;
  let curId = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // 检测进入 manifest
    if (/export\s+const\s+ATLAS_MANIFEST\s*=/.test(line)) inManifest = true;
    if (inManifest && line.trim() === '];') inManifest = false;

    if (inManifest) {
      const idMatch = line.match(/id:\s*'([^']+)'/);
      if (idMatch) curId = idMatch[1];

      // 行尾是 } 或 },（条目结束）
      if (curId && /},?\s*$/.test(line) && /load:/.test(lines[i])) {
        // 移除既有 stats（及其前导逗号）
        let cleaned = line.replace(/,\s*stats:\s*\{[^}]*\}/, '');
        // 确保最后一个 load 字段后跟逗号
        // 找到行末的 ` }` 或 ` },`，在该 `}` 前插入 `, stats: {…}`
        const s = stats[curId];
        const statsStr = `stats: { persons: ${s.persons}, events: ${s.events}, factions: ${s.factions}, places: ${s.places} }`;
        cleaned = cleaned.replace(/(\s*)(\},?\s*)$/, `, ${statsStr}$1$2`);
        out.push(cleaned);
        curId = null;
        continue;
      }
    }
    out.push(line);
  }

  writeFileSync(INDEX_PATH, out.join('\n'));
  console.log('已更新 stats：');
  for (const [id, s] of Object.entries(stats)) {
    console.log(`  ${id.padEnd(14)} 人${s.persons} 事${s.events} 势${s.factions} 地${s.places}`);
  }
}

main();
