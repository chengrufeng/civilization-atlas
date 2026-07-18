/* =========================================================================
 * 跨数据集人物关联（cross-links）
 *
 * 用于呈现跨文明的人物关系，弥补 relations 只能在单数据集内的限制。
 * 两种 kind：
 *   - same-person：同一历史人物出现在多个数据集
 *   - interaction：不同人物之间的跨文明互动（如马可波罗与忽必烈、利玛窦与徐光启）
 *
 * 在人物详情面板显示「跨数据集关联」区块。
 * ========================================================================= */

export const CROSS_LINKS = [
  /* ----- 同一人物跨数据集 ----- */
  {
    kind: 'same-person',
    label: '朱元璋：由元末红巾军领袖成为明太祖',
    persons: [
      { atlas: 'yuan', id: 'zhu_yuan_zhang' },
      { atlas: 'ming', id: 'zhu_yuan_zhang' },
    ],
  },
  {
    kind: 'same-person',
    label: '努尔哈赤：明末建州女真首领→后金建立者',
    persons: [
      { atlas: 'ming', id: 'nu_er_ha_chi' },
      { atlas: 'qing', id: 'nurhaci' },
    ],
  },
  {
    kind: 'same-person',
    label: '皇太极：明末对手→清太宗',
    persons: [
      { atlas: 'ming', id: 'huang_tai_ji' },
      { atlas: 'qing', id: 'huangtaiji' },
    ],
  },

  /* ----- 跨文明互动 ----- */
  {
    kind: 'interaction',
    label: '马可波罗仕元十七年，其游记深刻影响欧洲对东方的想象',
    persons: [
      { atlas: 'yuan', id: 'ma_ke' },
      { atlas: 'medieval_eu', id: 'marco_polo' },
    ],
  },
  {
    kind: 'interaction',
    label: '利玛窦与徐光启合译《几何原本》，开启西学东渐',
    persons: [
      { atlas: 'ming', id: 'li_ma_dou' },
      { atlas: 'ming', id: 'xu_guangqi' },
    ],
  },
  {
    kind: 'interaction',
    label: '亚里士多德教导亚历山大大帝，希腊文明随东征抵达两河与波斯',
    persons: [
      { atlas: 'greece', id: 'aristotle' },
      { atlas: 'greece', id: 'alexander' },
    ],
  },
  {
    kind: 'interaction',
    label: '亚历山大在高加米拉击败大流士三世，终结阿契美尼德波斯',
    persons: [
      { atlas: 'greece', id: 'alexander' },
      { atlas: 'persia', id: 'darius_i' },
    ],
  },
  {
    kind: 'interaction',
    label: '穆罕默德二世攻陷君士坦丁堡，丝路阻断催生大航海',
    persons: [
      { atlas: 'medieval_eu', id: 'mehmed_ii' },
      { atlas: 'renaissance', id: 'columbus' },
    ],
  },
  {
    kind: 'interaction',
    label: '阿育王弘法南传，与同时代的希腊化王国互通使节',
    persons: [
      { atlas: 'india', id: 'ashoka' },
      { atlas: 'greece', id: 'alexander' },
    ],
  },
  {
    kind: 'interaction',
    label: '哥伦布与麦哲伦：大航海时代东西方直连',
    persons: [
      { atlas: 'renaissance', id: 'columbus' },
      { atlas: 'renaissance', id: 'magellan' },
    ],
  },
  {
    kind: 'interaction',
    label: '哥白尼与伽利略：日心说的提出与捍卫',
    persons: [
      { atlas: 'renaissance', id: 'copernicus' },
      { atlas: 'enlightenment', id: 'galileo' },
    ],
  },
];

/** 给定 (atlasId, personId)，返回所有相关的 cross-links（不含自身） */
export function findCrossLinks(atlasId, personId) {
  const result = [];
  for (const link of CROSS_LINKS) {
    const selfIdx = link.persons.findIndex(p => p.atlas === atlasId && p.id === personId);
    if (selfIdx < 0) continue;
    const others = link.persons.filter((_, i) => i !== selfIdx);
    result.push({ label: link.label, kind: link.kind, others });
  }
  return result;
}
