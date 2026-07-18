# 文明图鉴 · 扩展计划 v6

> v5 计划 P0/P1 主体已落地。v6 标记 M9/M10/M11/M12 四个里程碑并梳理剩余项。

> v3 的大多数事项已落地。v4 主要做两件事：①把当前实际状态对齐到文档；②列出下一阶段可落地的优化清单，按"投入产出比"分层。

---

## ✅ 已完成里程碑

| 里程碑 | 内容 |
|---|---|
| **M0** | 架构补强（缩放/底图/领域/懒加载数据化）+ validate + smoke 工具 |
| **M1** | 中华文明 12 数据集（夏商周 → 近现代） |
| **M2** | 世界文明 11 数据集（两河 / 埃及 / 希腊 / 罗马 / 中世纪 / 文艺复兴 / 前哥伦布 / 日本 / 波斯 / 印度 / 近代） |
| **M3** | UX 增强：切换器浮层、全局跨数据集搜索、时代对照面板、README |
| **M4** | 数据集徽章、键盘快捷键、关系类型语义化（7 种）、URL 深链、Git、单元测试、CI、暗色模式、播放速度自适应 |
| **M5** | 新增 5 数据集（俄罗斯 / 朝鲜半岛 / 东南亚 / 非洲 / 现代世界）；女性人物补充；移动端响应式 |
| **M6** | 跨数据集领域浏览浮层（B2）+ 跨数据集人物关联（A1）+ 同时代浏览模式（B1） |
| **M7** | i18n 框架 + 关系线点击（E5）+ smoke 重试机制 + Wikimedia 肖像脚本 |
| **M8** | i18n 全量覆盖：动态 DOM（详情/事件/对照/领域/快捷键/toast）+ 数据集 name/subtitle/group 三字段双语 + 切换语言时重建动态 UI |
| **M9** | P0 五连：F1 跨集关联自动检测（`detect-cross-links.mjs` + 15 条新关联）/ F2 数据集预加载 / F3 关系类型 i18n / F4 Timeline hover 预览 / F5 搜索相关度+关键字高亮 |
| **M10** | 人生回放模式（Life Journey）：独立模块，按生平事件顺序自动推进，镜头跟随 + 关系同期高亮 + 顶部胶囊浮层（暂停/继续/退出） |
| **M11** | P1/P2 多项：F7 图片懒加载 / F8 收藏+最近 / F9 设置面板 / F10 PWA 离线 / F11 faction 颜色检测 / F13 领域搜索 / F14 事件热力图层 / F15 人物并排对比 / F18 历史上的今天 / F19 Life Journey 跨集串联 |
| **M12** | 工程化与导出：E1 ESLint + Prettier / E2 JSDoc + ts-check / E3 schema 版本化 / F17 打印与导出 PDF |

**当前规模**：28 数据集 / 约 488 人物 / 510 事件 / **14 视图模块** / **8 工具脚本** / 30+ 跨集关联 / 公元前 3500 年 – 公元 2025 年 / validate 全 PASS / 0 error 0 warn / 单元测试 10/10 PASS / smoke 28/28 PASS（含重试）。

---

## 📊 项目现状速览

| 项 | 数据 |
|---|---|
| 视图层模块 | **14 个**（state / atlas / map / render / controls / timeline / event-list / detail / compare / domain-browser / url-state / i18n / life-journey / **favorites / today-in-history / heat-layer / compare-figures / settings**，外挂 5 个） |
| 数据集文件 | 28 个（中华 12 + 世界 16），全部走 lazy `import()` + 空闲预加载（受设置开关控制） |
| 工具脚本 | **9 个**（validate / smoke / state.test / refresh-stats / export-stats / check-images / fetch-wikimedia / detect-cross-links / **check-factions**） |
| 跨集关联 | 30+ 条（手工 + detect 工具辅助产出） |
| PWA | `manifest.json` + Service Worker（同源 SWR + CDN cache-first） |
| 偏好持久化 | localStorage：收藏 / 最近 / 设置（含播放速度、默认图层、预加载开关） |
| CI | GitHub Actions：state.test + validate + check-factions + 可选 lint |

---

## 🎯 下一阶段优化清单（按投入产出比分层）

> M9 已完成 P0 全部（F1–F5），M10 完成 Life Journey。下列为 P1/P2 + 工程化。

### 🔥 P0 · 高收益、低投入（已完成 M9）

- ~~**F1 跨集人物关联自动检测**~~ ✅ `tools/detect-cross-links.mjs` + 15 条 same-person 补全
- ~~**F2 数据集预加载**~~ ✅ `requestIdleCallback` 串行预拉
- ~~**F3 关系类型 i18n**~~ ✅ 7 类关系双语 + tooltip/chip 同步
- ~~**F4 Timeline hover 预览**~~ ✅ 鼠标悬停显示年份 + 当年事件数气泡
- ~~**F5 搜索相关度排序**~~ ✅ 评分排序 + `<mark>` 关键字高亮

### ⚡ P1 · 中收益、中投入（按需做）

- ~~**F6 render 差分更新（D8）**~~ ⏸️ 性能可接受，diff 复杂度高，暂不做
- ~~**F7 人物图像懒加载 + 占位骨架**~~ ✅ `loading="lazy" decoding="async"`
- ~~**F8 最近浏览 / 收藏**~~ ✅ `localStorage` + 切换器顶部 chip 行 + 详情 ☆ 按钮
- ~~**F9 设置面板**~~ ✅ 播放速度 / 默认图层 / 预加载开关 / 危险区重置
- ~~**F10 PWA 离线支持**~~ ✅ manifest + SW（SWR / cache-first / network-first）
- ~~**F11 Faction 颜色冲突检测**~~ ✅ `tools/check-factions.mjs` + CI，已修 qinhan 秦/西汉同色

### 🌱 P2 · 探索性 / 边际收益（想做但不急）

- **F12 大数据集按主题拆分（D7）**
  `tangsong.js` 866 行覆盖唐+宋+五代 660 年。可拆成 `tang.js` + `song.js`，但 M0 数据驱动架构下"合并"成本低于"拆分切换成本"，目前不推荐做。
- ~~**F13 事件 / 人物的领域权重搜索**~~ ✅ `domain:军事 刘` 语法
- ~~**F14 Heatmap / 密度图模式**~~ ✅ 纯 Canvas `heat-layer.js`
- ~~**F15 人物并排对比**~~ ✅ 名册多选 → 2-3 列对比浮层，最值高亮
- **F16 多语言扩到数据**
  把人物名/事件名/bio 也做双语。488 人物 × 3 字段，工作量大、收益与维护成本不成比例。可优先做"30 位世界级历史人物"的英文名（用于跨集搜索命中英文输入）。
- ~~**F17 录制 / 回放~~ ✅ 简化版：打印 / 导出 PDF（`window.print()` + 打印样式 + 横幅）
  - 完整版"录制 mp4"暂不做（涉及 canvas stream + 跨源 tile 限制）
- ~~**F18 历史上的今天**~~ ✅ 首屏右下角浮卡片
- ~~**F19 Life Journey 进阶~~ ✅ 跨数据集 same-person 缝合 + 自动 switchAtlas
  - 配音 / 字幕 / 导出 mp4 仍未做

### 🧪 工程化（建议在 P0-P1 完成后做一轮）

- ~~**E1 ESLint + Prettier**~~ ✅ `.eslintrc.json` + `.prettierrc.json` + CI 可选 lint 步骤
- ~~**E2 JSDoc 类型注解 + ts-check**~~ ✅ state.js 加 `@ts-check` + `AppState` typedef
- ~~**E3 Schema 版本化**~~ ✅ validate 检查 version 字段格式 + 白名单
- **E4 数据集快照测试**
  对每个 atlas 渲染一张 headless 截图，CI 里 diff 像素。比当前 smoke（只断言 persons>0）严格得多。需要 `pixelmatch` 之类依赖。

### 📚 内容补充（永远做不完，按需）

- **C1 Wikimedia 肖像批量**：`fetch-wikimedia.mjs` 已就绪，待联网环境跑一次。
- **C2 中华文明细分**：唐/宋、南北朝、南宋-金-西夏等，按需。
- **C3 区域补全**：北美印第安、豪萨城邦、波利尼西亚等。
- **C4 跨集关联扩充**：丝绸之路/大航海时代的跨文明互动是富矿。
- **C5 人物生卒年校订**：上古人物年份争议大（如夏代、荷马），可加 `birthCirca: true` 标记"约"字显示。

---

## 🚀 v7 展望与下一代演进 (Future Roadmap)

> 随着 v6 多个里程碑的达成，项目在功能完备度（Life Journey、Heatmap、Compare 等）、基础体验（PWA、i18n、性能）和工程化上已趋近成熟。为了打破当前的框架天花板，以下是针对未来大版本（v7 及以后）的头脑风暴与深度改进建议：

### 🎨 1. 交互与可视化进阶 (Advanced UX & Visuals)
- **F20 人物关系图谱 (Knowledge Graph)**
  - **现状痛点**：目前人物关系（君臣、亲属等）依附于地图标记上，难以一眼看清盘根错节的跨代交际圈。
  - **改进方案**：引入轻量级图表（如 D3.js Force Graph），支持点击人物时弹出独立于地理坐标的"社交网络力导向图"，可视化人物的师承、政敌等圈层结构。
- **F21 动态地理轨迹线 (Trajectory Paths)**
  - **现状痛点**：Life Journey 模式展示了事件点和地点，但缺乏连贯的移动感。
  - **改进方案**：用带箭头的虚线或流动粒子效果（如 Leaflet.AntPath）将人物一生中的事件地理坐标按时间串联，一览人物的迁徙、流放或出征路线。
- **F22 时间轴非线性与微观缩放 (Timeline Zooming)**
  - **现状痛点**：上古史时间跨度极大（几百年无事件），近现代史极密（精确到天），线性的 `<input type="range">` 难以兼顾。
  - **改进方案**：改造 Timeline，引入类似股票 K 线图的可缩放时间轴组件；在滑动特定区域时，自动放大展示其微观刻度（月/日）。

### ⚡ 2. 架构与性能深水区 (Architecture & Performance)
- **E5 Web Worker 全局检索优化**
  - **现状痛点**：随着数据集扩大，构建全局跨集索引（`getGlobalPersonIndex`）和执行带正则的多字段评分检索，可能引发低端机主线程掉帧。
  - **改进方案**：将搜索计算、跨集索引合并、关系图谱数据准备等繁重任务剥离到 `worker.js`，确保主线程 UI（特别是地图操作）的绝对丝滑。
- **E6 IndexedDB 本地结构化数据**
  - **现状痛点**：目前的纯对象/数组遍历模式，在应对上万条级事件或人物时，存在内存峰值问题。
  - **改进方案**：依托 PWA 的 Service Worker 环境，在空闲时将 JSON 解析后打入本地的 IndexedDB。未来不仅支持"断网浏览"，更能执行秒级的本地聚合查询（类似 SQL 查询），无需加载所有源文件入内存。
- **E7 深度状态分享路由 (Deep URL Sync)**
  - **现状痛点**：当前 URL `?atlas&year&person` 已跑通，但未能深度下钻到复杂视图。
  - **改进方案**：扩充 `url-state.js`，使其支持分享复杂应用状态。例如 `?compare=曹操,刘备,孙权`（直接拉起三人对比浮层）、`?search=政治&layer=heat`（直接复原热力图与特定搜索结果）、`?journey=王安石`（打开即播人生回放）。

### 🌍 3. 生态与平台扩展 (Ecosystem)
- **C6 本地用户数据集导入 (UGC / Local Mode)**
  - **现状痛点**：很多用户、教师想自制小说地图（如《冰与火之歌》）或专属课件地图，必须提 PR 到源码仓库。
  - **改进方案**：在 UI 增设"本地导入"沙盒入口。用户将符合 Schema 规范的 JSON 文件拖拽进浏览器，完全通过纯前端解析渲染。将该项目转变为一个通用的地理历史编辑/展示器。
- **C7 原生多端打包 (Tauri / Capacitor)**
  - **现状痛点**：Web 体验虽好，但部分场景（特别是教学展示、独立分发）依然需要客户端。
  - **改进方案**：得益于项目现有的"无构建、纯前端 ES Modules"极简架构，能完美且零成本地通过 Tauri 打包为极小体积的桌面端（Win/Mac/Linux），或用 Capacitor 打包分发到 App Store / Google Play。

---

## 🛠️ 工具链一览

```bash
# 校验
node tools/validate.mjs              # 全部数据集
node tools/validate.mjs sanguo       # 单个

# 冒烟（含重试机制，慢加载自动延长 budget）
node tools/smoke.mjs                 # 全部，自动起 8199 端口
node tools/smoke.mjs sanguo          # 单个

# 单元测试
node --test tools/state.test.mjs

# 维护
node tools/refresh-stats.mjs         # 刷新 manifest stats
node tools/export-stats.mjs          # 导出 Markdown 统计表
node tools/check-images.mjs          # personImages 404 检查
node tools/fetch-wikimedia.mjs       # Wikimedia 肖像批量（需网络）
node tools/detect-cross-links.mjs    # 跨集人物关联候选检测
```

CI（GitHub Actions）：每次 push / PR 自动跑 `state.test.mjs` + `validate.mjs` + `smoke.mjs`。

---

## 🔑 结构性原则（给后续接手者）

1. **视图层零改动**：`js/core/` **14 + 5 个**模块完全通用，跨数据集差异全由数据字段表达
2. **数据 schema**：见 `js/data/_template.js`；新增数据集流程见 `README.md`
3. **跨数据集连接**：`js/data/cross-links.js` 注册 same-person / interaction；`tools/detect-cross-links.mjs` 可自动产出候选
4. **URL 深链**：`?atlas=X&year=Y&person=Z`，分享直达任意视图
5. **键盘快捷键**：按 `?` 弹出帮助
6. **多个浮层**：切换器 / 时代对照 / 跨数据集领域 / 同时代 / 设置 / 对比 / 历史上的今天；均可用 `Esc` 关闭
7. **i18n**：`data-i18n` 覆盖静态 DOM；动态 DOM 走 `t()`/`tf()`；切换语言时 `onLangChange` 重建浮层；关系类型走 `relationLabel()`
8. **跨集索引**：`getGlobalPersonIndex()` 首次调用遍历 28 数据集构建扁平索引并缓存，供搜索 / 同时代 / 关联面板复用；索引项含 `domains` 字段供 F13 过滤
9. **空闲预加载**：首屏后 `requestIdleCallback` 串行预拉所有 atlas（受设置开关控制），秒切
10. **人生回放**：`startLifeJourney(personId)`，按生平事件推进；与 timeline play 互斥；F19 支持跨 atlas same-person 缝合
11. **偏好持久化**：收藏/最近/设置（播放速度、默认图层、预加载）均走 localStorage，单一命名空间
12. **PWA 离线**：`manifest.json` + `sw.js`，离线后首次访问的 atlas 仍可用

---

## 📁 关键文件指引

| 类别 | 文件 |
|---|---|
| 视图层 | `js/core/{state,atlas,map,render,controls,timeline,event-list,detail,compare,domain-browser,url-state,i18n,life-journey,favorites,today-in-history,heat-layer,compare-figures,settings}.js` |
| 数据层 | `js/data/index.js`（注册表）、`js/data/_template.js`（模板）、`js/data/cross-links.js`（跨集关联）、`js/data/*.js`（28 数据集） |
| 入口 | `js/app.js` |
| 工具 | `tools/{validate,smoke,state.test,refresh-stats,export-stats,check-images,fetch-wikimedia,detect-cross-links,check-factions}.mjs` |
| PWA | `manifest.json`、`sw.js` |
| 文档 | `README.md`、`EXPANSION_PLAN.md`（本文）、`PROGRESS.md` |
| CI | `.github/workflows/ci.yml` |
| 工程化 | `.eslintrc.json`、`.prettierrc.json` |
| 文档 | `README.md`、`EXPANSION_PLAN.md`（本文）、`PROGRESS.md` |
| CI | `.github/workflows/ci.yml` |

---

## 📌 v3 → v4 变更说明

- **数据对齐**：视图层模块数 8 → 12（含 compare / domain-browser / url-state / i18n）
- **里程碑**：补 M7（i18n 框架 + 关系线点击 + smoke 重试 + Wikimedia 脚本）与 M8（i18n 全量覆盖）
- **推迟项重排**：原 A5 / D7 / D8 / C6 仍保留，归到 P1/P2
- **新增 18 条优化点子**（F1–F18），按"投入产出比"分 P0/P1/P2，便于按需选做
- **工程化建议**：单独列 E1–E4（lint / 类型 / schema 版本 / 快照测试）

## 📌 v5 → v6 变更说明

- **新增 M11 里程碑**：F7 / F8 / F9 / F10 / F11 / F13 / F14 / F15 / F18 / F19 共 10 项
- **新增 M12 里程碑**：E1 / E2 / E3 + F17 打印导出
- **模块数**：13 → 14 + 5 外挂模块（favorites / today-in-history / heat-layer / compare-figures / settings）
- **工具数**：8 → 9（新增 `check-factions.mjs`）
- **结构性原则**：补 11（偏好持久化）、12（PWA 离线）
- **P1 全部 ✅ / ⏸️（F6 显式延后）**
- **P2 完成 6/7（F13/F14/F15/F17/F18/F19，仅 F16 数据双语暂不做）**
- **工程化完成 3/4（E1/E2/E3，E4 快照测试仍开）**
