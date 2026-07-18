# 文明图鉴 · 扩展计划 v4

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

**当前规模**：28 数据集 / 约 488 人物 / 510 事件 / 13 视图模块 / 8 工具脚本 / 30+ 跨集关联 / 公元前 3500 年 – 公元 2025 年 / validate 全 PASS / 0 error 0 warn / 单元测试 10/10 PASS / smoke 28/28 PASS（含重试）。

---

## 📊 项目现状速览

| 项 | 数据 |
|---|---|
| 视图层模块 | **13 个**（state / atlas / map / render / controls / timeline / event-list / detail / compare / domain-browser / url-state / i18n / **life-journey**） |
| 数据集文件 | 28 个（中华 12 + 世界 16），全部走 lazy `import()` + 空闲预加载 |
| 工具脚本 | **8 个**（validate / smoke / state.test / refresh-stats / export-stats / check-images / fetch-wikimedia / **detect-cross-links**） |
| 跨集关联 | 30+ 条（手工 + detect 工具辅助产出） |
| 最大文件 | `tangsong.js` 866 行 / 72KB；`sanguo.js` 56KB |
| Git 提交 | 20+（含完整文档与里程碑） |
| CI | GitHub Actions：push / PR 自动跑 unit + validate + smoke |

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

- **F6 关系/事件图层差分更新（D8）**
  render() 仍是 `clearLayers + 重建`。改成 diff：未变的 marker/线 保留，只增删差异。tangsong 47 人物 + 95 place，scrub 时间轴时明显有掉帧空间。
- **F7 人物图像懒加载 + 占位骨架**
  `personImages` 用 `<img loading="lazy">`，加载失败回退到字符头像（已有 `onerror`，但可加骨架屏避免布局抖动）。
- **F8 最近浏览 / 收藏**
  `localStorage` 存最近 5 个 atlas + 收藏的人物列表，加在切换器浮层顶部一行 chip。
- **F9 设置面板**
  目前图层开关散落在左面板。集中到一个 settings overlay：默认图层 / 默认播放速度 / 默认语言 / 关系线粗细 / 标签密度。
- **F10 PWA 离线支持**
  Leaflet 已经 CDN 加载，加 `manifest.json` + 一个 service worker 缓存静态资源 + Leaflet JS/CSS，可离线浏览（数据也走缓存）。一次配置，长期受益。
- **F11 Faction 颜色冲突检测**
  不同 dataset 用了相同色（如多个数据集 `#b23a2e` 红色）。加 `tools/check-factions.mjs` 在同 atlas 内做颜色唯一性检查。

### 🌱 P2 · 探索性 / 边际收益（想做但不急）

- **F12 大数据集按主题拆分（D7）**
  `tangsong.js` 866 行覆盖唐+宋+五代 660 年。可拆成 `tang.js` + `song.js`，但 M0 数据驱动架构下"合并"成本低于"拆分切换成本"，目前不推荐做。
- **F13 事件 / 人物的领域权重搜索**
  支持 `domain:军事 liu` 这种语法，搜军事领域含 "liu" 的人物。低成本，效益小众。
- **F14 Heatmap / 密度图模式**
  切到"密度视图"，把事件密度做成热力图，一眼看清"哪段时间哪里事多"。需要引 leaflet.heat 插件，~10KB。
- **F15 人物并排对比**
  选中 2-3 个人物，详情面板变并排布局，方便对比生卒/官职/关系。要重构 detail.js，工作量大。
- **F16 多语言扩到数据**
  把人物名/事件名/bio 也做双语。488 人物 × 3 字段，工作量大、收益与维护成本不成比例，暂不推荐。但可优先做"30 位世界级历史人物"的英文名（用于跨集搜索命中英文输入）。
- **F17 录制 / 回放**
  把播放过程中地图视角变化录成可分享的 webm / gif。需要 `MediaRecorder` + canvas capture，技术可行。
- **F18 历史上的今天**
  入口页加一个"今天在历史"的小卡片，跳转到对应年份+人物。简单且有趣。
- **F19 Life Journey 进阶**
  当前 M10 是按生平事件推进。可扩：① 跨数据集人物（如朱元璋在元/明都出现）按真实时间线串起来回放；② 配音 / 字幕轨道；③ 慢/快速度档；④ 一键导出 mp4。

### 🧪 工程化（建议在 P0-P1 完成后做一轮）

- **E1 ESLint + Prettier**
  统一代码风格，CI 卡 lint。零 build 成本（`npx eslint`）。
- **E2 JSDoc 类型注解 + ts-check**
  在 `// @ts-check` 模式下用 JSDoc 给核心模块加类型，VSCode 直接出类型提示，不需要 build。
- **E3 Schema 版本化**
  `_template.js` 加 `version: '1.0.0'`，validate 按 version 走不同分支，为未来 schema 升级留口子（已经有占位但未实际使用）。
- **E4 数据集快照测试**
  对每个 atlas 渲染一张 headless 截图，CI 里 diff 像素。比当前 smoke（只断言 persons>0）严格得多。

### 📚 内容补充（永远做不完，按需）

- **C1 Wikimedia 肖像批量**：`fetch-wikimedia.mjs` 已就绪，待联网环境跑一次。
- **C2 中华文明细分**：唐/宋、南北朝、南宋-金-西夏等，按需。
- **C3 区域补全**：北美印第安、豪萨城邦、波利尼西亚等。
- **C4 跨集关联扩充**：丝绸之路/大航海时代的跨文明互动是富矿。
- **C5 人物生卒年校订**：上古人物年份争议大（如夏代、荷马），可加 `birthCirca: true` 标记"约"字显示。

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

1. **视图层零改动**：`js/core/` **13 个**模块完全通用，跨数据集差异全由数据字段表达
2. **数据 schema**：见 `js/data/_template.js`；新增数据集流程见 `README.md`
3. **跨数据集连接**：`js/data/cross-links.js` 注册 same-person / interaction；`tools/detect-cross-links.mjs` 可自动产出候选
4. **URL 深链**：`?atlas=X&year=Y&person=Z`，分享直达任意视图
5. **键盘快捷键**：按 `?` 弹出帮助
6. **四个浮层**：切换器 / 时代对照 / 跨数据集领域 / 同时代；均可用 `Esc` 关闭
7. **i18n**：`data-i18n` 覆盖静态 DOM；动态 DOM 走 `t()`/`tf()`；切换语言时 `onLangChange` 重建浮层；关系类型走 `relationLabel()`
8. **跨集索引**：`getGlobalPersonIndex()` 首次调用遍历 28 数据集构建扁平索引并缓存，供搜索 / 同时代 / 关联面板复用
9. **空闲预加载**：首屏后 `requestIdleCallback` 串行预拉所有 atlas，秒切
10. **人生回放**：`startLifeJourney(personId)`，按生平事件推进；与 timeline play 互斥

---

## 📁 关键文件指引

| 类别 | 文件 |
|---|---|
| 视图层 | `js/core/{state,atlas,map,render,controls,timeline,event-list,detail,compare,domain-browser,url-state,i18n,life-journey}.js` |
| 数据层 | `js/data/index.js`（注册表）、`js/data/_template.js`（模板）、`js/data/cross-links.js`（跨集关联）、`js/data/*.js`（28 数据集） |
| 入口 | `js/app.js` |
| 工具 | `tools/{validate,smoke,state.test,refresh-stats,export-stats,check-images,fetch-wikimedia,detect-cross-links}.mjs` |
| 文档 | `README.md`、`EXPANSION_PLAN.md`（本文）、`PROGRESS.md` |
| CI | `.github/workflows/ci.yml` |

---

## 📌 v3 → v4 变更说明

- **数据对齐**：视图层模块数 8 → 12（含 compare / domain-browser / url-state / i18n）
- **里程碑**：补 M7（i18n 框架 + 关系线点击 + smoke 重试 + Wikimedia 脚本）与 M8（i18n 全量覆盖）
- **推迟项重排**：原 A5 / D7 / D8 / C6 仍保留，归到 P1/P2
- **新增 18 条优化点子**（F1–F18），按"投入产出比"分 P0/P1/P2，便于按需选做
- **工程化建议**：单独列 E1–E4（lint / 类型 / schema 版本 / 快照测试）

## 📌 v4 → v5 变更说明（M9/M10 后）

- **里程碑补 M9**：P0 五连（F1 跨集检测 + F2 预加载 + F3 关系 i18n + F4 timeline hover + F5 搜索高亮）
- **里程碑补 M10**：人生回放模式（Life Journey）
- **模块数**：12 → 13（新增 `life-journey.js`）
- **工具数**：7 → 8（新增 `detect-cross-links.mjs`）
- **跨集关联**：12 → 30+（detect 工具辅助产出 15 条 same-person）
- **结构性原则**：补 9（空闲预加载）、10（人生回放）
- **F1–F5 全部标记 ✅ 完成**；新增 F19（Life Journey 进阶方向）
