---
name: bilibili-narration-copy
description: 为文明星图解说视频生成 B站投稿文案（标题+简介+时间轴）。凡是解说视频渲染完成后（render-narration-video.mjs 出片）、或用户提到"B站投稿/上传B站/写标题/写简介/配文案/投稿文档"且对象是解说视频时，必须使用本 skill。核心铁律：文案中所有数字（时长、年龄、时间轴）必须取自实际成片与解说脚本，严禁凭印象编造。
---

# B站解说视频投稿文案生成

## 为什么有这个 skill

用户曾指出"3分钟看完诸葛亮"但成片实际只有 1:28——发布文案与内容不符属于事故级错误。
本 skill 的唯一目标是：**每次出片后自动配一份可直接复制的投稿文案，且每个数字都有出处。**

## 何时运行

1. `tools/render-narration-video.mjs` 渲染完成一个或一批视频后（主动跟进，无需用户提醒）
2. 用户要求为解说视频写 B站 标题/简介/文案

## 工作流程（按序执行）

### 1. 取真实数据（一切数字的唯一来源）

```bash
# 脚本数据：标题、分段、每段 t / year / place / caption、总时长
node -e "
const j = require('./data/narrations/<personId>.json');
console.log('时长:', j.totalDurationSec, '标题:', j.title);
j.segments.forEach(s => {
  const mm = String(Math.floor(s.t/60)).padStart(2,'0');
  const ss = String(Math.floor(s.t%60)).padStart(2,'0');
  console.log(mm+':'+ss, s.year ?? '——', s.place ?? '（无地点）', (s.caption||'').slice(0,30));
});
"
```

若成片已存在，用 ffprobe 复核实际时长（含 2.5s 收尾）：
```bash
node -e "const{spawnSync}=require('child_process');const r=spawnSync(require('ffmpeg-static'),['-i','video/narrations/<id>.mp4'],{encoding:'utf8'});console.log(r.stderr.match(/Duration: \S+/)[0])"
```

### 2. 数字换算规则

| 实测时长 | 标题里的说法 |
|---|---|
| ≤ 95s | "90秒" 或 "一分半" |
| 96–110s | "100秒" |
| ≥ 165s | "3分钟" |
| 其他 | 四舍五入到最近的 10 秒档 |

年龄、事件年份：**只允许使用解说词（caption）原文中出现过的数字**（如 caption 写"47 岁的刘备"才能用 47 岁）。caption 没说的，不写。

### 3. 时间轴

直接用 segment.t 换算 `mm:ss`，选 6–8 个关键段（出生、转折、高潮、结局）。
每行格式：`MM:SS XXX年 · 事件短语`。事件短语从 caption 提炼，不得新增事实。

### 4. 标题公式（B站 80 字限）

`反差钩子（含真实数字）｜<时长>看完<人名>的一生`

- 前半句：从 caption 里挑最有戏剧性的反差（卖过草鞋/47岁才…/装病躲曹操）
- 争议型结尾适合枭雄（"奸雄还是英雄？"）；励志型结尾适合创业者
- 严禁出现成片中没有的事件

### 5. 落盘格式

写到 `video/narrations/<personId>.md`（与 mp4 同名）：

```markdown
# <人物名> · <系列标题> — B站投稿文案

> 成片：<personId>.mp4 · 实测时长 <M:SS>（<N>s）· 1080p 24fps

## 标题

<一行标题>

## 简介

```
<2-3 行情绪铺垫，事实来自 caption>

【时间轴】
MM:SS XXX年 · 事件
…（6-8 行）

系列持续更新：<同系列其他人物>已上线。

GitHub 开源：https://github.com/chengrufeng/civilization-atlas

#标签 #标签 #标签 #标签 #标签
```
```

参考成品：`video/narrations/liubei.md`、`zhugeliang.md` 等 6 份三国文案。

### 6. 批量渲染后的动作

`--all` 跑完后，对每个**新增**的 mp4（没有同名 .md 的）逐个生成；跳过已有 .md 的。
简介末尾"系列持续更新"一行列出**已出片**的人物（查 video/narrations/*.mp4），不要列还没渲染的。
