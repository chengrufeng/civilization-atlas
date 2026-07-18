/* =========================================================================
 * 单元测试：核心纯逻辑（state.js 的年份格式化、关系类型归一化）
 *   运行：node --test tools/state.test.mjs
 * ========================================================================= */

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import {
  formatYear, formatYearShort,
  RELATION_TYPES, normalizeRelationType, relationStyle, relationLabel,
  setDomains, DOMAINS, DOMAIN_COLOR,
} from '../js/core/state.js';
import { setLang, currentLang } from '../js/core/i18n.js';

/* ---------- 年份格式化 ---------- */

test('formatYear / formatYearShort: 正数年份', () => {
  assert.equal(formatYear(221), '221年');
  assert.equal(formatYearShort(221), '221');
});

test('formatYear: 公元前（负数）', () => {
  assert.equal(formatYear(-221), '前221年');
  assert.equal(formatYearShort(-2070), '前2070');
});

test('formatYear: 边界值', () => {
  assert.equal(formatYear(0), '0年');
  assert.equal(formatYearShort(0), '0');
  assert.equal(formatYear(-1), '前1年');
  assert.equal(formatYear(-3500), '前3500年');
});

/* ---------- 关系类型归一化 ---------- */

test('normalizeRelationType: 规范类型直通', () => {
  for (const t of Object.keys(RELATION_TYPES)) {
    assert.equal(normalizeRelationType(t), t);
  }
});

test('normalizeRelationType: 别名归一化', () => {
  assert.equal(normalizeRelationType('父子'), '亲属');
  assert.equal(normalizeRelationType('兄弟'), '亲属');
  assert.equal(normalizeRelationType('夫妻'), '亲属');
  assert.equal(normalizeRelationType('师徒'), '师承');
  assert.equal(normalizeRelationType('师生'), '师承');
  assert.equal(normalizeRelationType('同僚'), '同时代');
  assert.equal(normalizeRelationType('同朝'), '同时代');
});

test('normalizeRelationType: 未知类型归为"其他"', () => {
  assert.equal(normalizeRelationType('莫名其妙'), '其他');
  assert.equal(normalizeRelationType(''), '其他');
});

test('relationStyle: 返回颜色与线型', () => {
  const hostile = relationStyle('敌对');
  assert.equal(hostile.color, '#b23a2e');
  assert.equal(hostile.dashed, true);

  const kinship = relationStyle('父子'); // 别名→亲属
  assert.equal(kinship.color, '#b8893a');
  assert.equal(kinship.dashed, false);
});

test('relationLabel: 中英双语', () => {
  const before = currentLang();
  setLang('zh');
  assert.equal(relationLabel('敌对'), '敌对');
  assert.equal(relationLabel('父子'), '亲属');   // 别名归一
  setLang('en');
  assert.equal(relationLabel('敌对'), 'Rival');
  assert.equal(relationLabel('父子'), 'Kin');
  setLang('zh');
  assert.equal(relationLabel('师承'), '师承');
  // 恢复初始
  if (before && before !== 'zh') setLang(before);
});

/* ---------- 领域数据化（setDomains） ---------- */

test('setDomains: 自定义领域覆盖默认', () => {
  setDomains([{ name: '宗教', color: '#abc' }, { name: '航海', color: '#def' }]);
  assert.deepEqual([...DOMAINS], ['宗教', '航海']);
  assert.equal(DOMAIN_COLOR['宗教'], '#abc');
});

test('setDomains: 传空/非法值回退默认', () => {
  setDomains([]);
  assert.ok(DOMAINS.length >= 6, '默认领域至少 6 个');
  setDomains(null);
  assert.ok(DOMAINS.length >= 6);
});
