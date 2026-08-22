---
title: AI的使用
description: 好用的 MCP 和 skill
tags:
  - software
date: 2026-08-22
---

## 环境准备

- 安装 python（pip 换成国内源）
- 安装 Node.js/npm/npx

## markitdown

[microsoft/markitdown: Python tool for converting files and office documents to Markdown.](https://github.com/microsoft/markitdown)

接手一个项目的时候，这个项目的文档可能没有被管理过。项目文档是一些零散的doc/docx/pdf/excel/pdf。

咋说呢，有文档就算不错的了。

使用 AI 把这些文档转换成 markdown 格式。然后代码和转换后的文档，放在一个目录下。之后，逮着 AI 使劲问。

上面的这个 MCP 可以很好的将各种格式的文档，转换成 markdown。

## ssh-mcp

- [tufantunc/ssh-mcp: MCP server exposing SSH control for Linux servers via Model Context Protocol.](https://github.com/tufantunc/ssh-mcp)
- [classfang/ssh-mcp-server: 基于 SSH 的 MCP 服务 🧙‍♀️。已被MCP官方收录 🎉。 SSH MCP Server 🧙‍♀️. It has been included in the community MCP repository 🎉.](https://github.com/classfang/ssh-mcp-server)

有些项目是软硬件相结合的项目。这些代码可能在不通公司之间流转，可能没有很好的git管理。看的代码版本和硬件上实际跑的代码的版本，可能也对不上。

这时候，只能让 AI 一边看本地的代码，一边连接远程的机器，两者交叉对比。

上面的这两个 MCP 可以通过 ssh 连接的远程的机器上，执行人类口语描述的任务。

## wenyan-mcp

[caol64/wenyan-mcp: 文颜 MCP Server 可以让 AI 自动将 Markdown 文章排版后发布至微信公众号。](https://github.com/caol64/wenyan-mcp)

总感觉哪天就不得不转行。得提前规划下退路？

试试公众号。毕竟，自媒体的试错成本很低。

让 AI 写内容。然后，让 AI 自动发布到微信公众号。