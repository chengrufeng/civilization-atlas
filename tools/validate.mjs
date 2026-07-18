/* =========================================================================
 * 数据集静态校验脚本
 *   运行：node tools/validate.mjs          （校验全部）
 *        node tools/validate.mjs sanguo    （只校验指定 id）
 *
 * 校验每个 atlas 的内部一致性，作为新数据集的准入门槛。
 * ========================================================================= */

import { ATLAS_MANIFEST, getPersonCoord, getEventCoord } from '../js/data/index.js';

const DEFAULT_DOMAINS = ['军事', '政治', '文学', '科技', '外交', '文化'];

function eraRange(atlas) {
  if (typeof atlas.startYear === 'number' && typeof atlas.endYear === 'number') {
    return [atlas.startYear, atlas.endYear];
  }
  if (typeof atlas.era === 'string') {
    const [s, e] = atlas.era.split(/[–—-]/);
    const p = str => {
      const neg = /^前/.test(str.trim()) || /BCE|BC/i.test(str);
      const n = parseInt(str.replace(/[^0-9]/g, ''), 10);
      return neg ? -n : n;
    };
    return [p(s), p(e)];
  }
  return [null, null];
}

function validateAtlas(atlas) {
  const errors = [];
  const warns = [];
  const err = m => errors.push(m);
  const warn = m => warns.push(m);

  // 基本字段
  if (!atlas.id) err('缺少 id');
  if (!atlas.name) err('缺少 name');
  if (!atlas.version) warn('建议添加 version 字段（如 "1.0.0"），便于后续 schema 兼容性检测');

  const [start, end] = eraRange(atlas);
  if (start === null || end === null || Number.isNaN(start) || Number.isNaN(end)) {
    err('无法解析年代（需 startYear/endYear 或 era）');
  } else if (start >= end) {
    err(`startYear(${start}) 必须小于 endYear(${end})`);
  }

  // 领域
  const domainNames = Array.isArray(atlas.domains) && atlas.domains.length
    ? atlas.domains.map(d => d.name)
    : DEFAULT_DOMAINS;
  if (new Set(domainNames).size !== domainNames.length) err('domains 名称有重复');
  const domainSet = new Set(domainNames);

  // 集合与索引
  const factions = atlas.factions || [];
  const persons = atlas.persons || [];
  const places = atlas.places || [];
  const events = atlas.events || [];
  const relations = atlas.relations || [];

  const factionIds = new Set(factions.map(f => f.id));
  const personIds = new Set(persons.map(p => p.id));
  const placeNames = new Set(places.map(p => p.name));

  if (factionIds.size !== factions.length) err('faction id 有重复');
  if (personIds.size !== persons.length) err('person id 有重复');

  // 势力都城可解析
  for (const f of factions) {
    if (f.capital && f.capital !== '—' && !placeNames.has(f.capital)) {
      warn(`势力「${f.name}」都城「${f.capital}」不在 places 中，地图上不显示`);
    }
  }

  // 人物
  for (const p of persons) {
    if (!factionIds.has(p.faction)) err(`人物「${p.name}」的 faction「${p.faction}」不存在`);
    if (typeof p.birth === 'number' && typeof p.death === 'number' && p.birth > p.death) {
      err(`人物「${p.name}」birth(${p.birth}) > death(${p.death})`);
    }
    if (!getPersonCoord(p, atlas)) {
      warn(`人物「${p.name}」无法解析坐标（birthPlace=${p.birthPlace}），地图上不显示`);
    }
    for (const ev of (p.events || [])) {
      if (ev.place && !placeNames.has(ev.place)) {
        warn(`人物「${p.name}」轨迹地点「${ev.place}」不在 places 中`);
      }
    }
  }

  // 事件
  for (const e of events) {
    if (!domainSet.has(e.domain)) err(`事件「${e.name}」domain「${e.domain}」不在领域列表中`);
    for (const pid of (e.participants || [])) {
      if (!personIds.has(pid)) err(`事件「${e.name}」参与者「${pid}」不存在于 persons`);
    }
    if (!getEventCoord(e, atlas)) {
      warn(`事件「${e.name}」location「${e.location}」无法解析坐标，地图上不显示`);
    }
  }

  // 关系
  for (const r of relations) {
    if (!personIds.has(r.source)) err(`关系 source「${r.source}」不存在`);
    if (!personIds.has(r.target)) err(`关系 target「${r.target}」不存在`);
  }

  // 时间轴刻度
  for (const t of (atlas.timelineTicks || [])) {
    if (start !== null && (t < start || t > end)) {
      warn(`timelineTick ${t} 超出年代范围 [${start}, ${end}]`);
    }
  }

  return { errors, warns };
}

async function main() {
  const only = process.argv[2];
  const metas = only ? ATLAS_MANIFEST.filter(m => m.id === only) : ATLAS_MANIFEST;
  if (only && metas.length === 0) {
    console.error(`未找到数据集：${only}`);
    process.exit(2);
  }

  let failed = 0;
  for (const meta of metas) {
    let atlas;
    try {
      atlas = await meta.load();
    } catch (e) {
      console.log(`\n[FAIL] ${meta.id} 加载失败：${e.message}`);
      failed++;
      continue;
    }
    const { errors, warns } = validateAtlas(atlas);
    const tag = errors.length ? 'FAIL' : 'PASS';
    if (errors.length) failed++;
    console.log(`\n[${tag}] ${meta.id}（${atlas.name}） — ${errors.length} error, ${warns.length} warn`);
    errors.forEach(m => console.log(`   ✗ ${m}`));
    warns.forEach(m => console.log(`   · ${m}`));
  }

  console.log(`\n汇总：${metas.length} 个数据集，${failed} 个有错误。`);
  process.exit(failed ? 1 : 0);
}

main();
