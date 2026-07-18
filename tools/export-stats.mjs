/* =========================================================================
 * 导出数据集统计表（Markdown）：扫描所有数据集，输出一张表可直接粘贴到
 * README。运行：node tools/export-stats.mjs
 * ========================================================================= */

import { ATLAS_MANIFEST } from '../js/data/index.js';
import { formatYearShort } from '../js/core/state.js';

async function main() {
  const rows = [];
  for (const meta of ATLAS_MANIFEST) {
    const a = await meta.load();
    rows.push({
      group: meta.group,
      name: a.name,
      era: `${formatYearShort(a.startYear ?? meta.startYear)}–${formatYearShort(a.endYear ?? meta.endYear)}`,
      persons: a.persons.length,
      events: a.events.length,
      factions: a.factions.length,
      places: a.places.length,
      relations: a.relations.length,
    });
  }

  // 按 group 输出两张表
  const groups = [...new Set(rows.map(r => r.group))];
  let md = '';
  for (const g of groups) {
    md += `\n**${g}**\n\n`;
    md += '| 数据集 | 年代 | 人物 | 事件 | 势力 | 地点 | 关系 |\n';
    md += '|---|---|---|---|---|---|---|\n';
    for (const r of rows.filter(x => x.group === g)) {
      md += `| ${r.name} | ${r.era} | ${r.persons} | ${r.events} | ${r.factions} | ${r.places} | ${r.relations} |\n`;
    }
  }

  // 汇总
  const total = rows.reduce((acc, r) => ({
    persons: acc.persons + r.persons,
    events: acc.events + r.events,
    factions: acc.factions + r.factions,
    places: acc.places + r.places,
    relations: acc.relations + r.relations,
  }), { persons: 0, events: 0, factions: 0, places: 0, relations: 0 });
  md += `\n**汇总**：${rows.length} 个数据集 · ${total.persons} 人物 · ${total.events} 事件 · ${total.factions} 势力 · ${total.places} 地点 · ${total.relations} 关系\n`;

  console.log(md);
}

main();
