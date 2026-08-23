---
title: 使用 AI 制作视频
description: "使用 AI 制作视频: 写文本, 将文本转换成口播稿, 将口播稿转换音频, 从音频生成字幕, 将所有材料总和起来生成视频"
tags:
  - software
date: 2026-08-23
---

## 前言

制作一个精致的视频，还是需要花时间找素材，做剪辑的。

一个视频，最最重要的是它的文本内容。当然了，视觉部分也很重要。

如果，不要求制作一个精良的视频，而，仅仅希望视频可以作为文字的载体，传播文字的信息，那使用 AI 可以比较轻松的制作视频。

本文的视频制作思路，来自这个视频:

<iframe src="https://player.bilibili.com/player.html?bvid=BV1skR2BkEke&autoplay=0"
        class="external-embed bilibili"
        allowfullscreen>
</iframe>

使用 AI 制作视频分为这几步：
- 写文本
- 将文本转换成口播稿
- 将口播稿转换音频
- 从音频生成字幕
- 将所有材料总和起来生成视频

## 使用 AI 制作视频

(注：本节的所有操作，使用豆包就能完成了，不需要任何技术。codex 和 claude 应该更不在话下。)

视频的背后的文本是灵魂。

通常来说，文本不需要转换成口播稿。如果需要转换，说明文本写的不行。

文本写完后，使用 AI 生成音频。为什么要先制作音频？因为先制作出来的音频，是后面整个视频的尺子，控制着 AI 生成视频的进度。

现在，已经完全可以使用 AI , 克隆自己的声音了。但是，我没有克隆自己的声音，因为我的声音不好听。也不应该，未经授权，克隆别人的声音，有版权问题。所以，我直接使用 AI 软件中，自己提供的声音。

但是 AI 不方便直接从音频，获取到时间尺度。所以，使用 AI , 从音频中提取 SRT 字幕文件。字幕文件中的每句话都有时间。

最后，让 AI 使用 remotion , 使用上面材料制作视频即可。

## 相关链接

- [RVC-Boss/GPT-SoVITS](https://github.com/RVC-Boss/GPT-SoVITS) : 克隆自己的声音(我试了下，挺有意思的)
- [TTS(Text-to-Speech, 文本转语音)-火山引擎](https://www.volcengine.com/product/tts): 提供了TTS API。但是现在还没有一款合适的MCP/SKILL 来接入
- [chidiwilliams/buzz:](https://github.com/chidiwilliams/buzz) : 从音频里面提取 SRT 字幕，我安装了，不知道为啥运行会闪退。(剪映也集成了提取字幕的功能，但是收费) (后来，直接把音频扔个豆包，让豆包自己先办法提取字幕，也能提取，就是时间稍微有一点点偏)
- [Gemini Notebook](https://notebook.google.com/) : 文字生音频/视频，可以试试
- [remotion-dev/remotion](https://github.com/remotion-dev/remotion) : 每一帧都是一个 React 组件,每一个动画都是一个 JS 函数


## 最后

我还是得想办法，充值下 codex ，兼顾下日常使用和编码。

日常场景下，使用 opencode，简直在浪费我的时间。编码场景下，使用豆包又不足。

deepseek 加油呀~