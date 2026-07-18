# 文明图鉴 · 扩展计划 v3

> v2 计划中绝大多数事项已落地。本版仅保留少量未做项和推迟项。

---

## ✅ 已完成里程碑

| 里程碑 | 内容 |
|---|---|
| **M0** | 架构补强（缩放/底图/领域/懒加载数据化）+ validate + smoke 工具 |
| **M1** | 中华文明 12 数据集（夏商周 → 近现代） |
| **M2** | 世界文明 11 数据集（两河 / 埃及 / 希腊 / 罗马 / 中世纪 / 文艺复兴 / 前哥伦布 / 日本 / 波斯 / 印度 / 近代） |
| **M3** | UX 增强：切换器浮层、全局跨数据集搜索、时代对照面板、README |
| **M4** | 6 数据集元信息徽章、键盘快捷键、关系类型语义化、URL 状态保存、Git、单元测试、CI、暗色模式、播放速度自适应 |
| **M5** | 新增 5 数据集（俄罗斯 / 朝鲜半岛 / 东南亚 / 非洲 / 现代世界）；女性人物补充 8 位；移动端响应式 |
| **M6** | 跨数据集领域浏览浮层（B2）+ 跨数据集人物关联（A1）+ 同时代浏览模式（B1） |
| **M7** | i18n 框架 + 关系线点击 + smoke 重试机制 + Wikimedia 肖像脚本 |
| **M8** | i18n 全量覆盖：动态 DOM（详情/事件/对照/领域/快捷键）+ 数据集 name/subtitle/group 三字段双语 + 切换语言时重建动态 UI |

**当前规模**：28 数据集 / 约 488 人物 / 510 事件 / 公元前 3500 年 – 公元 2025 年 / validate 全 PASS / 0 error 0 warn。

---

## 📋 未完成（推迟项）

### 可选优化（边际收益递减）

- **A5 Wikimedia 人物肖像批量补全**：`tools/fetch-wikimedia.mjs` 脚本已就绪，当前环境无网络访问权限，待有外网环境时执行。当前用字符头像占位。
- **D7 大数据集分割**：sanguo（45KB）/ tangsong（70KB）切换延迟可感知，可考虑按主题再切。
- **D8 render 差分更新**：render() 仍是 clearLayers+重建，事件/关系层无 diff。中低优先。

### i18n 后续可补（M8 已完成主路径，下列为锦上添花）

- 数据集内的人物名/事件名/势力名仍保持原文（多为专有名词，翻译意义有限）
- 关系类型标签（亲属/师承 等 7 种）的可选翻译
- `bio`/`desc` 字段的双语（工作量大，收益与维护成本不成正比）

### 新增数据集（按需）

- **C6 中华文明内部细分**：南北朝拆南北、唐宋拆唐/宋、南宋-金-西夏独立。当前合并避免过细。
- 撒哈拉以南非洲已涵盖主要文明，但西非城邦（如豪萨城邦）可补。
- 美洲文明可补北美印第安（易洛魁/苏族等）。

---

## 🛠️ 工具链一览

```bash
# 校验
node tools/validate.mjs              # 全部数据集
node tools/validate.mjs sanguo       # 单个

# 冒烟
node tools/smoke.mjs                 # 全部，自动起 8199 端口

# 单元测试
node --test tools/state.test.mjs

# 维护
node tools/refresh-stats.mjs         # 刷新 manifest stats
node tools/export-stats.mjs          # 导出 Markdown 统计表
node tools/check-images.mjs          # personImages 404 检查
```

CI（GitHub Actions）：每次 push / PR 自动跑 `state.test.mjs` + `validate.mjs` + `smoke.mjs`。

---

## 🔑 结构性原则（给后续接手者）

1. **视图层零改动**：`js/core/` 8 个模块完全通用，跨数据集差异全由数据字段表达
2. **数据 schema**：见 `js/data/_template.js`；新增数据集流程见 `README.md`
3. **跨数据集连接**：`js/data/cross-links.js` 注册 same-person / interaction
4. **URL 深链**：`?atlas=X&year=Y&person=Z`，分享直达任意视图
5. **键盘快捷键**：按 `?` 弹出帮助
6. **三个浮层**：切换器 / 时代对照 / 跨数据集领域浏览；均可用 `Esc` 关闭

---

## 📁 关键文件指引

| 类别 | 文件 |
|---|---|
| 视图层 | `js/core/{state,atlas,map,render,controls,timeline,event-list,detail,compare,domain-browser,url-state}.js` |
| 数据层 | `js/data/index.js`（注册表）、`js/data/_template.js`（模板）、`js/data/cross-links.js`（跨集关联）、`js/data/*.js`（28 数据集） |
| 入口 | `js/app.js` |
| 工具 | `tools/{validate,smoke,state.test,refresh-stats,export-stats,check-images}.mjs` |
| 文档 | `README.md`、`EXPANSION_PLAN.md`（本文）、`PROGRESS.md` |
| CI | `.github/workflows/ci.yml` |
