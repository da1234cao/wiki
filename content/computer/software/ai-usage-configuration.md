---
title: AI使用配置
description: 记录 ai 使用时候的相关配置
tags:
  - software
date: 2026-08-16
---

## 前言

受限于付款方式，国内无法直接使用 claude 和 chatgpt。

另外，它们的价格有点高，公司也不提供 AI 费用支持。

平时用 deepseek，因为它便宜。最近它涨价了。之前的价格太便宜了，涨价合理。

本文，记录，ai 使用时候的相关配置。做一个备忘录吧，虽然意义不大，因为直接问下 ai 就行了。

## claude

### claude cli

```
sudo apt install npm

# 如果 node 版本太低，安装 claude 会失败，需要升级下
# 添加 NodeSource 仓库（这里装 Node 22 LTS）
# curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
# sudo apt install -y nodejs

npm install -g @anthropic-ai/claude-code
```

### claude desktop

在 Claude Desktop 中开启 Developer Mode（开发者模式），配合修改base_url 与 api_key，可以直接使用 deepseek。

无需安装 cc switch。

## codex

deepseek 提供了接入 codex 的一键脚本：[接入 Codex | DeepSeek API Docs](https://api-docs.deepseek.com/zh-cn/quick_start/agent_integrations/codex/)

## opencode

没有网络和付款方式的限制，直接用就行：[OpenCode 上手 - 安装, 购买套餐 注意点 哔哩哔哩](https://www.bilibili.com/video/BV1AhTx6YERy)