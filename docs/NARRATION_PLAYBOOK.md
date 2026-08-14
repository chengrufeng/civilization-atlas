# 人物生平解说制作 Playbook

> 以「刘备 · 从涿郡到白帝城」为首个完整案例，沉淀可复用的方法论。
> 后续给任意历史人物做视频化解说，按此 Playbook 执行即可。

---

## 一、整体架构

```
脚本 JSON  ──┐
             ├──→ build-narration.mjs ──→ 音频 m4a + 校准时间戳
TTS 后端  ──┘                                      │
                                                   ↓
本地图片  ──→ fetch-narration-images.mjs        data/narrations/<id>.json
                  ↓                              （含 image/effect/imageMode）
            localize-narration-images.mjs            │
                  ↓                                  ↓
            audio/narrations/images/<id>/      js/core/narration.js
                                                   ↓
                                          浏览器播放（音频驱动 + 字幕 + 地图 + 特效）
```

**核心思想**：音频是时间轴，脚本 JSON 是数据源，前端按 `audio.currentTime` 切段，每段同步推进字幕 / 地图 / 轨迹 / 图片 / 特效。

---

## 二、脚本 Schema

文件路径：`data/narrations/<personId>.json`

```json
{
  "personId": "liubei",
  "atlasId": "sanguo",
  "title": "刘备 · 从卖鞋皇叔到开国帝王",
  "subtitle": "约 2 分钟浓缩昭烈皇帝的破局一生",
  "lang": "zh",
  "voice": "zh-CN-XiaoxiaoNeural",
  "totalDurationSec": 173.7,           // 由 build-narration 自动写入
  "audio": "audio/narrations/liubei.m4a",
  "segments": [
    {
      "t": 0,                          // 段开始时间（秒），由工具自动校准
      "year": 184,                     // 该段对应年份（null 表示非年份段）
      "place": "涿郡",                 // 该段对应地点（null 表示无地点）
      "step": 0,                       // 对应 person.events 数组的索引（按 year 升序，过滤无坐标后）
      "caption": "公元 184 年...",     // 解说文案
      "keywords": ["桃园三结义"],      // 抓图关键词（数组按优先级）
      "image": "audio/narrations/images/liubei/seg-02.jpg",  // 本地图片路径
      "imageCaption": "桃园三结义",
      "imageMode": "hero",             // 可选：side（默认）/ hero（大图）/ corner-tl / corner-bl
      "effect": "blossom"              // 可选：fire（火焰）/ blossom（桃花）/ null
    }
  ],
  "ttsBackend": "edge",                // edge | say
  "rate": "+15%",
  "builtAt": "2026-07-18T..."
}
```

### 字段优先级
- `step` 是事件索引，**与 person.events 严格对齐**（注意跨年份合并的段要跳过中间索引）
- `keywords` 数组按优先级，抓图工具按顺序尝试
- `image` 推荐用本地相对路径（避免 hotlink）
- `imageMode` 不指定时按段 idx 轮换（side/side/corner-tl/corner-bl）
- `effect` 仅在重大事件段使用（火攻 → fire，桃园结义 → blossom）

---

## 三、工具链

### 1. `tools/build-narration.mjs` — TTS 生成音频 + 校准时间戳
```bash
node tools/build-narration.mjs data/narrations/<personId>.json
# 可选参数：
#   --backend edge|say   默认 edge（微软晓晓神经网络音色，免费）
#   --voice zh-CN-XXX    默认 zh-CN-XiaoxiaoNeural
#   --rate +15%          默认 +15%
```

**流程**：
1. 按 segment.caption 分段调用 TTS
2. `afinfo` 测量每段精确时长
3. 累加（含 0.3s 段间隔）→ 写回 `segment.t`
4. 合并为单一 m4a（afconvert + Python wave）

### 2. `tools/fetch-narration-images.mjs` — 按 keywords 抓图
```bash
node tools/fetch-narration-images.mjs data/narrations/<personId>.json
#   --backend bing|wiki   默认 bing（国内可达）
#   --clear               清除已配置图片
```

### 3. `tools/localize-narration-images.mjs` — 本地化（强烈推荐）
```bash
node tools/localize-narration-images.mjs data/narrations/<personId>.json
```
**必做**：把所有外链图下载到 `audio/narrations/images/<personId>/`，避免 hotlink 防护 / 域名失效。

### 4. `tools/render-narration-video.mjs` — 无头渲染成视频（免录屏）
```bash
node tools/render-narration-video.mjs data/narrations/<personId>.json  # 单人
node tools/render-narration-video.mjs --all                            # 批量（跳过已存在）
node tools/render-narration-video.mjs --all --force                    # 全部重渲
#   --width 1920 --height 1080   分辨率（默认 1080p）
```
**产物**：`video/narrations/<personId>.mp4`（H.264 + AAC，B站直传）。

**原理**：内置静态服务器 → 无头 Chrome（复用系统 Chrome）打开页面 → 自动 `startNarration` → CDP Screencast 逐帧捕获（带真实时间戳）→ ffmpeg 按时间戳合成 CFR 25fps + 原 m4a 音轨。

**两个关键坑**（调试半天换来的）：
1. **不能用 Playwright 的 `recordVideo`**：它/CDP screencast 之外的组合问题已排除，但 `recordVideo` 会与音轨产生快进（12s 播完 169s），必须自己用 CDP `Page.startScreencast` 收帧。
2. **`waitForFunction` 里不要 `import()` 业务模块**：Playwright 注入上下文会重新实例化 ES 模块，`session` 为 null → 第一轮 poll 就误判"解说结束"。用 DOM 信号（如 `narration-focus` class 移除）判断结束。
3. **`waitForFunction(fn, arg, options)` 三参数签名**：options 必须是第三个参数，传成第二个会被当成 arg → 默认 30s 超时。

---

## 四、标准制作流程（7 步）

### Step 1 · 选人物 + 检查数据集
- 确认 `js/data/<atlas>.js` 中 `person.events` 完整（关键事件别遗漏）
- 如有遗漏，**先补 events 再写脚本**（脚本 step 索引严格依赖）
- 用 `node tools/validate.mjs <atlas>` 验证数据 0 error 0 warn

### Step 2 · 写脚本 JSON
按时间顺序列 segments：
- **第 0 段**：hook（3-5 秒抓住眼球，可用金句/反问/反差）
- **第 1 段**：引入（出生背景）
- **中间段**：生平事件（每段对应一个 person.events 索引）
- **最后段**：启示/金句（积极正能量，避免说教）

**文案原则**：
1. 每段 caption **以"公元 YYYY 年"开头**（音画同步字幕 meta 需要）
2. 但段内句式要多样化（加悬念/对比/比喻/动作细节），避免套路
3. 避免生僻典故（"髀肉复生" → "闲得大腿长出肥肉"）
4. 避免多音字错读（"望风而降" → "献州归顺"）
5. 长度 7-12 秒 / 段（约 30-50 字）

### Step 3 · 生成音频
```bash
node tools/build-narration.mjs data/narrations/<personId>.json
```
检查输出，每段实际时长应在 5-12 秒之间。

### Step 4 · 配置 keywords + 抓图
给每段加 `keywords` 数组，跑：
```bash
node tools/fetch-narration-images.mjs data/narrations/<personId>.json
```

### Step 5 · 本地化图片（**必做**）
```bash
node tools/localize-narration-images.mjs data/narrations/<personId>.json
```
**没做这步，浏览器中大概率黑屏**（百度百科、qulishi 等图床都有 hotlink 防护）。

### Step 6 · 标记关键段（可选）
- **hero 模式**：重大转折段加 `"imageMode": "hero"`（5-6 个，不超过总段数 1/3）
- **特效**：火攻段加 `"effect": "fire"`，结义/相聚段加 `"effect": "blossom"`

### Step 7 · 浏览器实测
1. `python3 -m http.server 8199`
2. 打开 `http://localhost:8199/?atlas=<atlas>&person=<personId>`
3. 详情面板点「🎧 解说播放」
4. 全程跟看一遍，重点检查：
   - 字幕与音频是否同步
   - 图片是否都加载成功（F12 控制台不应有 404）
   - 地图 flyTo 是否到位
   - 特效是否触发

---

## 五、视觉特效矩阵

| 元素 | 样式 | 触发 |
|---|---|---|
| 字幕（双行） | 底部居中，meta（年份·地点）+ body | 每段自动 |
| 大字年份水印 | 屏幕中央 42%，2.2s 弹入弹出 | year != null 时 |
| 主角名章 | 左下浮动卡片，头像+姓名+生卒+官职 | 启动时 |
| 轨迹线 | 橙色虚线，按已访问步骤累计 | step 推进 |
| 脉冲波纹 | 当前 step 地点 marker 双圈脉冲 | step 推进 |
| 控制浮窗 | 左上角，默认收缩露出 56px，hover 展开 | 播放中 |
| **图片卡（side）** | 右侧 420×315，4 种入场动画轮换 | 默认 |
| **图片卡（hero）** | 右侧 520×390 大图 + Ken Burns | imageMode: "hero" |
| **图片卡（corner）** | 左上/左下 320×240 | imageMode: "corner-tl/bl" |
| **火焰特效** | 底部 35vh 红橙辉光 + 18 粒子上飘 | effect: "fire" |
| **桃花特效** | 顶部 30vh 粉色辉光 + 24 花瓣下落 | effect: "blossom" |

---

## 六、同步策略（关键技术细节）

### 1. 音频驱动 + rAF 高频轮询
- 用 `requestAnimationFrame` 60Hz 轮询 `audio.currentTime`，**不用 timeupdate**（约 4Hz 滞后）
- play/pause/seeked 启停 rAF

### 2. 字幕提前 200ms 切换
```js
const t0 = session.audio.currentTime + 0.2;  // 提前 200ms
```
补偿三层延迟：
- `audio.currentTime` 浏览器底层 buffer 延迟（50-100ms）
- rAF tick 16ms 抖动
- **人眼视觉处理比听觉快 100-200ms**

### 3. 段切换瞬间同步执行
**字幕 + state + flyTo + 轨迹线 + 图片** 全部在同一个 `applySegment` 函数内同步切换，**不要分层 rAF 推迟**（曾因此导致累积漂移 500ms+）。

### 4. render / buildEventList 防抖
重量级 DOM 重建推迟到下一帧，且**取消未执行的 rAF**（避免连续段切换堆积）：
```js
if (renderRafId) cancelAnimationFrame(renderRafId);
renderRafId = requestAnimationFrame(() => { render(); ... });
```

### 5. 轨迹线增量更新
不要每次全量 `setLatLngs`，用 `addLatLng` 增量追加（避免段多时性能退化）。

---

## 七、踩过的坑（前车之鉴）

### 数据层
1. **`person.events` 与脚本 `step` 索引偏移**
   - 如果脚本中合并叙述了多个 event（如 200+201），后续段 step 要 +1
   - 案例：刘备 214 成都 step=9 实际指向 209 江陵 → flyTo 错位
2. **史实错误**
   - 「161 年出生 → 织席贩履」逻辑漏洞（婴儿不可能织席）
   - 写文案时核对人物生平年份

### 文案层
3. **多音字 TTS 错读**
   - "望风而降(xiáng)" 被读成 "jiàng"
   - 解决：换无多音字的同义词（"献州归顺"）
4. **句式套路**
   - 每段「公元 XXXX 年 + 平铺直叙」很枯燥
   - 加悬念 / 对比 / 比喻 / 动作细节

### TTS 层
5. **macOS say 机械感重**
   - 换 edge-tts（微软晓晓 zh-CN-XiaoxiaoNeural）质量飞跃
6. **edge-tts 网络抖动**
   - 偶尔会 timeout，retry 一次即可

### 图片层
7. **hotlink 防护**
   - bkimg.cdn.bcebos.com（百度百科）、qulishi.com 等检查 Referer
   - 浏览器从 localhost 请求 → 403 → 黑屏
   - **解决**：`localize-narration-images.mjs` 一次性下载本地
8. **CSS url() 相对路径解析**
   - `--blur-bg: url("audio/...")` 被浏览器按 CSS 文件位置解析为 `/css/audio/...` → 404
   - **解决**：用 `new URL(seg.image, location.href).href` 转绝对路径
9. **图片被裁头（cover 模式）**
   - 人物肖像头部在上半部被裁
   - **解决**：`object-fit: contain` + 同图模糊放大副本填充空白
10. **PNG 透明背景在深色卡片上不可见**
    - 用 `sips -s format jpeg` 转 JPG（自动加白底）

### 前端架构层
11. **模块循环引用导致 SyntaxError**
    - narration.js 静态 import detail.js，detail.js 动态 import narration.js
    - **解决**：detail.js 用动态 import，narration.js 静态 import 没问题（live binding）
12. **重复函数声明**
    - 重构 applySegment 时旧版忘删，整个模块加载失败
    - **解决**：headless chrome + CDP 抓 console error 精准定位
13. **字幕切换 vs 慢操作延迟**
    - applySegment 拆快慢路径 → 累积漂移 500ms+
    - **解决**：同步切换 + render 防抖

### 视觉层
14. **图片遮挡地图中央**
    - hero 模式居中显示挡 flyTo 动画
    - **解决**：所有模式都不放屏幕中央，hero 改为右侧大图
15. **特效粒子飘到屏幕底部**
    - 遮挡字幕和地图下半部
    - **解决**：粒子飘动范围限制在屏幕中部（火焰 -45vh，桃花 55vh）

---

## 八、复用到新人物的 Checklist

- [ ] 选人物 + 所属 atlas
- [ ] 补全 `person.events`（关键事件不漏）→ validate 0 error 0 warn
- [ ] 写 13-17 段 caption（hook + 引入 + 11-15 事件 + 结尾）
- [ ] 跑 `build-narration.mjs` 生成音频（约 2-3 分钟）
- [ ] 加 keywords（13-17 段每段 1-2 个关键词）
- [ ] 跑 `fetch-narration-images.mjs --backend bing` 抓图
- [ ] 跑 `localize-narration-images.mjs` 本地化（**必做**）
- [ ] 给 3-5 个关键转折段标 `imageMode: "hero"`
- [ ] 给火攻/相聚段标 `effect: "fire" / "blossom"`
- [ ] 浏览器实测全流程
- [ ] F12 检查无 404 / 无 console error
- [ ] 录屏（OBS / QuickTime）+ 上传 B 站

---

## 九、参考案例

- `data/narrations/liubei.json` — 17 段 / 173s / 16 张本地图 / 5 个 hero 段 / 3 个特效段
- `audio/narrations/liubei.m4a` — edge-tts 晓晓音色 173.7s
- `audio/narrations/images/liubei/seg-XX.jpg` — 16 张图片（约 2.3MB）
