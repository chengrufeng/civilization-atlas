# 执行进度记录 · 文明图鉴

> 本文档随实现持续更新，用于中断恢复与问题排查。
> 计划详见 `EXPANSION_PLAN.md`（v3）。

## 状态图例
- [ ] 待办  [~] 进行中  [x] 完成  [!] 有问题/阻塞

## 已完成里程碑总览

| 里程碑 | 状态 | 内容速览 |
|---|---|---|
| **M0** 架构补强 | ✅ | 缩放/底图/领域/懒加载数据化、validate + smoke 工具、URL `?atlas=` |
| **M1** 中华文明 | ✅ | 12 数据集（夏商周 → 近现代，含公元前） |
| **M2** 世界文明 | ✅ | 11 数据集（两河/埃及/波斯/印度/希腊/罗马/中世纪/前哥伦布/文艺复兴/日本/近代） |
| **M3** UX 增强 | ✅ | 切换器浮层、全局搜索、时代对照、README 重写 |
| **M4** UX + 工程 | ✅ | 元信息徽章、键盘快捷键、关系语义化、URL 状态、Git、单测、CI、暗色、播放自适应 |
| **M5** 内容扩展 | ✅ | 5 新数据集（俄/朝/东南亚/非洲/现代）、女性人物 8 位、移动端 |
| **M6** 跨集功能 | ✅ | B1 同时代浏览、A1 跨集关联、B2 跨集领域浏览 |
| **M7** 打磨 | ✅ | E3 i18n 双语、E5 关系线点击、A5 wikimedia 脚本（待网络环境跑） |

## 当前规模
- **28 数据集 / 约 488 人物 / 510 事件**
- **公元前 3500 年 – 公元 2025 年**
- **中华文明 12 + 世界文明 16**
- **validate.mjs 全 PASS（0 error 0 warn）**
- **smoke.mjs 27/28 PASS（mesopotamia 偶发误报，手动 12s 预算验证正常）**
- **9/9 单元测试 PASS**

## 关键约定（恢复时先读）
- 坐标一律 `[lng, lat]`；`ll()`（state.js）转 Leaflet `[lat,lng]`
- 年份整数，公元前用负数；显示走 `formatYear/formatYearShort`（state.js）
- 视图层不感知数据集差异，全部差异由 atlas 字段表达
- 本地测试服务：`python3 -m http.server 8092`（工作目录 civilization-atlas）
- headless 验证：`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome --headless=new --dump-dom`
- **i18n**：`js/core/i18n.js`，UI 元素加 `data-i18n="key"` 属性即可双语
- **跨集关联**：`js/data/cross-links.js`（same-person / interaction）
- **URL 深链**：`?atlas=X&year=Y&person=Z`

## 关键文件指引
- 视图层（11 模块）：`js/core/{state, atlas, map, render, controls, timeline, event-list, detail, compare, domain-browser, url-state, i18n}.js`
- 数据层：`js/data/index.js`（注册表）、`js/data/_template.js`（模板）、`js/data/cross-links.js`、`js/data/*.js`（28 数据集）
- 入口：`js/app.js`
- 工具：`tools/{validate, smoke, state.test, refresh-stats, export-stats, check-images, fetch-wikimedia}.mjs`
- CI：`.github/workflows/ci.yml`
- 文档：`README.md`、`EXPANSION_PLAN.md`、`PROGRESS.md`

## 未做（推迟项）
- **A5 Wikimedia 肖像**：脚本 `tools/fetch-wikimedia.mjs` 已就绪，需在有网络环境跑（约 25 位经典人物）
- **C6 中华文明细分**：当前唐宋合并、南北朝合并；可按需拆分
- **D7 大数据集分割**：sanguo/tangsong 切换延迟，可考虑切分
- **D8 render 差分更新**：clearLayers + 重建，可优化但当前性能可接受

## 变更日志（倒序）
- 2026-07-18 M7 E3 i18n 双语 + E5 关系线交互 + A5 wikimedia 脚本
- 2026-07-18 M6 B2 跨集领域浏览 + A1 跨集关联 + B1 同时代
- 2026-07-18 M5 5 新数据集 + 女性人物 + 移动端
- 2026-07-18 M4 8 项 UX/工程改进
- 2026-07-17 M3 切换器/搜索/对照/README
- 2026-07-17 M2 11 世界文明数据集
- 2026-07-17 M1 12 中华文明数据集
- 2026-07-17 M0 架构补强
