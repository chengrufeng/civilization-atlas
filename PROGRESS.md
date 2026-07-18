# 执行进度记录 · 文明图鉴扩展

> 本文档随实现持续更新，用于中断恢复与问题排查。
> 计划详见 `EXPANSION_PLAN.md`。当前里程碑：**M0（Phase 0 架构补强 + Phase 1 模板）**。

## 状态图例
- [ ] 待办  [~] 进行中  [x] 完成  [!] 有问题/阻塞

## 当前进度（M0）

- [x] Phase 0.1 缩放阈值数据化（map.js labelZoom；render.js importanceZoom/cityZoom）
- [x] Phase 0.3 底图按数据集选择（mapView.baseLayer）
- [x] Phase 0.2 切换懒加载态 + 0.5 URL 参数选初始数据集（app.js doSwitchAtlas / ?atlas=）
- [x] Phase 0.4 tools/validate.mjs 数据校验脚本（sanguo/tangsong 全 PASS）
- [x] Phase 0.5 tools/smoke.mjs 冒烟测试脚本（sanguo/tangsong PASS，62s）
- [x] Phase 1.2 makeImportance 工厂下沉（data/index.js）
- [x] Phase 1.1 js/data/_template.js 数据模板（自检通过）
- [x] **M0 完成**：validate + smoke 对 sanguo/tangsong 全绿

## 当前进度（M2 · 世界文明数据集）
- [x] mesopotamia 两河文明（前3500–前539，14人/15事件）
- [x] egypt 古埃及（前3100–前30，14人/15事件）
- [x] greece 古希腊（前800–前146，15人/14事件）
- [x] rome 古罗马（前753–476，18人/23事件）
- [x] medieval_eu 中世纪欧洲（476–1453，17人/18事件）
- [x] renaissance 文艺复兴与大航海（1400–1600，17人/18事件）
- [x] enlightenment 近代（1600–1900，18人/21事件）

> 17/17 validate PASS（0 error）。剩余 warn 为个别人物轨迹地点或势力都城占位「—」，不影响功能。
> smoke 后台运行中（task zhk871）。

## 已完成总结
- M0：架构补强 + 校验/冒烟脚本（sanguo/tangsong 全绿）
- M1：中华文明 10 数据集（夏商周 → 近现代，含公元前负数年份）
- M2：世界文明 7 数据集（两河、埃及、希腊、罗马、中世纪欧洲、文艺复兴、近代）
- 共 17 个数据集、约 200+ 人物、约 250+ 事件；ATLAS_MANIFEST 按 group 分两组。
- **最终回归**：`node tools/validate.mjs` 17/17 PASS（0 error）；`node tools/smoke.mjs` 17/17 PASS（无 JS 错误，人物数 14–47 不等）。

## 高优先级补强（M3）已完成
- [x] 切换器重设计（下拉浮层）
- [x] README 完善
- [x] 全局跨数据集搜索
- [x] 时代对照面板
- [x] 0 warn
- [x] 6 个缺口数据集（隋/五代/波斯/印度/日本/美洲）

## M4 持续优化（按 EXPANSION_PLAN v2）
- [x] D1 Git 初始化（45 文件入库）
- [x] A2 数据集元信息浮层（人物/事件/势力徽章 + tools/refresh-stats.mjs 自动维护）
- [x] B5 键盘快捷键（Space/←→/Home/End/L/C/?/Esc，含帮助浮层）
- [x] A4 关系类型语义化（state.js 统一 RELATION_TYPES + 视觉区分）
- [x] B3 URL 状态完整保存（?atlas=&year=&person= 分享直达）
- [x] D6 统计表导出 + D5 personImages 404 检查（tools/export-stats.mjs、tools/check-images.mjs）
- [~] 回归：validate PASS / smoke 后台运行中（task gn33te）

## 当前总计规模
**23 数据集 · 441 人物 · 448 事件 · 112 势力 · 484 地点 · 272 关系**
（公元前 3500 年 – 公元 1949 年，全球分布）

## 当前数据集清单（共 23）
**中华文明（12）**：夏商周、春秋战国、秦汉、三国、两晋南北朝、隋、唐宋、五代十国、元、明、清、近现代
**世界文明（11）**：两河、古埃及、波斯、印度、古希腊、古罗马、中世纪欧洲、文艺复兴与大航海、前哥伦布美洲、日本、近代

## 新增文件
- `js/core/compare.js`（时代对照面板）
- `README.md` 完善
- 顶栏新增「对照」按钮、数据集切换器按钮；CSS 重构

## 新增/变更文件（M0）
- `package.json`（新增，type:module，供 node 运行 .mjs 工具）
- `js/core/map.js`：mapView 增 labelZoom/importanceZoom/cityZoom/baseLayer；导出 mapView、updateLabelVisibility
- `js/core/render.js`：importanceZoom/cityZoom 读 mapView
- `js/core/atlas.js`：initAtlas(preferredId)
- `js/app.js`：doSwitchAtlas 加载态、?atlas= 初始数据集、切换后 updateLabelVisibility
- `tools/validate.mjs`、`tools/smoke.mjs`（新增）

## 关键约定（恢复时先读）
- 坐标一律 `[lng, lat]`；`ll()`（state.js）转 Leaflet `[lat,lng]`。
- 年份整数，公元前用负数；显示走 `formatYear/formatYearShort`（state.js）。
- 视图层不感知数据集差异，全部差异由 atlas 字段表达。
- 本地测试服务：`python3 -m http.server 8092`（工作目录 civilization-atlas）。
- headless 验证：`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome --headless=new --dump-dom`。

## 变更日志（倒序）
- (init) 创建本进度文档，开始 M0。
