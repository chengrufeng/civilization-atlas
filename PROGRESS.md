# PROGRESS · 工程师 Cheat Sheet

> 这份文档定位：**中断后 5 分钟内恢复工作状态**。
> 项目全景看 [EXPANSION_PLAN.md](./EXPANSION_PLAN.md)；用户视角看 [README.md](./README.md)。

## 当前快照

- **规模**：28 数据集 / ~488 人物 / 510 事件 / 公元前 3500 – 公元 2025 年
- **代码**：`js/core/` 14 个视图模块 + 7 个外挂模块（life-journey / favorites / today-in-history / heat-layer / compare-figures / settings / **narration** / **local-atlas**）；`js/data/` 28 个数据集 + cross-links + index
- **工具**：`tools/` **12 个脚本**（含 build-narration / fetch-narration-images / localize-narration-images 解说三件套）
- **解说案例**：刘备 17 段 / 173s / 16 张本地图 / 5 hero 段 / 3 特效段 ✅
- **测试**：unit 10/10 PASS · validate 28/28 PASS（0 error 0 warn）· smoke 28/28 PASS（含重试）· check-factions 0 error / 8 warn
- **里程碑**：M0–M12 全部完成（详见 EXPANSION_PLAN）；解说专题见 `docs/NARRATION_PLAYBOOK.md` + `docs/NARRATION_TODO.md`

## 5 分钟恢复

```bash
cd civilization-atlas
python3 -m http.server 8092 &     # 本地服务
open http://localhost:8092/        # 浏览器验证

# 验证三连
node tools/validate.mjs            # 全数据集静态校验
node --test tools/state.test.mjs   # 单元测试
node tools/smoke.mjs sanguo        # 单数据集 headless 冒烟（最快）

# 全套 smoke 比较慢（28 个数据集串行 + 重试，约 15 分钟）
node tools/smoke.mjs
```

Chrome 路径默认 `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`；Linux/CI 用 `CHROME=/usr/bin/google-chrome` 覆盖。

## 写代码时的硬约定

| 约定 | 说明 |
|---|---|
| 坐标 | 数据里写 `[lng, lat]`；state.js 的 `ll()` 转 Leaflet 的 `[lat, lng]` |
| 年份 | 整数；公元前用负数（如 `-221` = 前221年）；显示走 `formatYear/formatYearShort` |
| 数据 schema | 见 `js/data/_template.js`；version 字段当前白名单 `1.0.0` |
| 视图层零改动 | 跨数据集差异 100% 通过字段表达；新加功能前先想能不能数据化 |
| i18n | 静态 DOM 加 `data-i18n="key"`；动态 DOM 用 `t()`/`tf()`；切语言时 `onLangChange` 重建 |
| 关系类型 | 7 种规范类型 + 别名归一（`RELATION_ALIASES`）；显示走 `relationLabel()` |
| 跨集关联 | `js/data/cross-links.js` 注册；候选挖掘用 `node tools/detect-cross-links.mjs` |
| URL 深链 | `?atlas=X&year=Y&person=Z`；走 `js/core/url-state.js` |

## 常见调试

| 现象 | 排查 |
|---|---|
| 切换数据集白屏 | F12 看 console；多半是数据文件语法错（`node tools/validate.mjs <id>`）|
| 人物/事件不显示在地图上 | validate warn 会列出；通常是 place 没注册或 coord 缺失 |
| smoke 误报 | lazy load 慢；smoke 已有 20s → 35s 重试，仍失败用手动 12s budget 验证 |
| i18n 切换有遗漏 | 静态找 `[data-i18n]`；动态找硬编码中文，改用 `t()`；`onLangChange` 里加重建 |
| Life Journey 切 atlas 卡住 | 检查 `switchingAtlas` 守卫；onSwitch 不该误杀 journey 触发的切换 |
| 字段添加后老数据集 warn | validate 检查 version 字段；新增必填字段时 bump schema 版本 |

## 文件指引（速查）

```
js/app.js                          入口 + boot + onLangChange + 顶栏按钮绑定
js/core/state.js                   全局 state（@ts-check + AppState typedef）
js/core/atlas.js                   manifest + lazy load + switchAtlas + global index + preload
js/core/render.js                  主渲染管线（persons/events/capitals/heat/relations/trajectory）
js/core/controls.js                搜索（含 domain 语法 + 相关度 + 高亮）+ shortcuts + slider hover
js/core/timeline.js                播放（受 settings 速度 pref 控）+ ticks + toast
js/core/i18n.js                    STRINGS + t/tf/localized/applyToDOM/onLangChange
js/core/life-journey.js            人生回放（含跨集 same-person 缝合）
js/data/index.js                   ATLAS_MANIFEST（含 nameEn/subtitleEn/groupEn/stats）
js/data/cross-links.js             30+ same-person / interaction
js/data/_template.js               新数据集模板
tools/validate.mjs                 静态校验（含 version 白名单）
tools/smoke.mjs                    headless Chrome（dumpDomWithRetry）
tools/check-factions.mjs           同/跨集 faction 颜色 + id 冲突检测
tools/detect-cross-links.mjs       跨集 same-person / interaction 候选挖掘
tools/state.test.mjs               state.js 单元测试（node:test）
```

## Git 历史（最近）

`git log --oneline -20` 看最近变更。重要里程碑 commit：

- M0–M7：`6aefb2c` 初始化 → `b7ec02a` M7 E5+A5
- M8：`6ac2d44` i18n 全量覆盖
- M9：`b998a4b` P0 五连 F1–F5
- M10：`a1fe621` Life Journey
- M11：`ee7310c` + `042f794` + `66d7e49` 多批 P1/P2 + 工程化
- M12：`aa21811` F17 打印 + EXPANSION_PLAN v6 + README 同步

## 下一步候选（按价值排序）

1. **内容扩充**：C1 Wikimedia 肖像 / C2 中华细分（唐/宋拆分）/ C3 区域补全（北美印第安、豪萨城邦）/ C4 跨集关联扩充
2. **E4 渲染快照测试**（需引入 pixelmatch，CI 复杂度上升）
3. **F16 数据双语**（30 位世界级人物英文名，用于跨集搜索命中英文）
4. **F6 render diff**（性能优化，复杂度高，当前 perf 可接受）
5. **跨集 faction id 治理**（8 条 warning：houjin/america/science/geming/other/chen/wu/chu 同 id 不同含义；工作量大价值小）
