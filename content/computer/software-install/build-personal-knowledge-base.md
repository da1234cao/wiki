---
title: 个人知识库的搭建
description: 使用 quartz 搭建个人的公开知识库
tags:
  - software
date: 2026-07-25
---

## 前言

我一直有写博客的习惯。

最开始，我在 CSDN 写博客。但是，后来，感觉它渐渐变的封闭了。比如，如果我现在不登录我的账号，我冲 VIP 才能看到我之前的一些文章。虽然，我从来没有做过这些限制。

后来，我搭建自己的 wordpress 写内容，现在很自由了。管理面板，从宝塔切换到 1panel。博客前面再套一层 Cloudflare。总体上来说，比较舒服了。

但是，最近几个月，我又感到不舒服了，因为 AI 来了。我放弃了语雀，因为不方便我直接使用 AI 生成内容。我采用了 obsidian 来写文档，然后通过它的插件，一键发布到 wordpress 。但这，还是需要到 wordpress 后台微调下内容。

我想更简单粗暴点的方案。

我找到了 wikijs 。它的理念是不错的。它可以本地编辑，然后推动到git仓库中。wikijs 拉取 git 中的内容，渲染显示。wikijs 页面也提供了编辑功能，编辑后也会自动提交到 git 上。但是 wikijs 有些缺点，不支持自动生成子页面索引，不支持 RSS，还不够好看。

我又试了 quartz, 它的本质还是渲染 git 上的 markdown 内容。但是用起来还不错。

最重要的是，这个 quartz 的源码 和 发布内容在一个仓库中。有任何，我想要改动的地方，我可以直接找 AI 动手改。

我试试这个 quartz 。

## quartz 的使用

详间官方文档：[Welcome to Quartz 5](https://quartz.jzhao.xyz/)

### 安装

官方文档：[安装](https://quartz.jzhao.xyz/getting-started/installation)

首先是，克隆它的官方模板。

然后是安装依赖。

```
npm i
```

初始化网站。

```
npx quartz create
```

本地预览。

```
npx quartz build --serve
```

### 内容创作

官方文档: [Authoring Content](https://quartz.jzhao.xyz/getting-started/authoring-content)

在 `/content` 目录下写内容即可。

### 部署

官方文档：[Hosting](https://quartz.jzhao.xyz/hosting#cloudflare-pages)

我在 Cloudflare 上部署的，非常的快捷。

Clouldflare 真是大善人。

### 微调

微调 [Configuration](https://quartz.jzhao.xyz/configuration)

- 修改 pageTitle
- locale 修改为 zh-CN
- baseUrl 指定为自己的域名
- 开启 comments plugin
  - 需要配置 giscus

## quartz 评估

- 使用文件名作为 URL 的组成部分
  - 无法自定义URL
  - 可以接受。文件名使用全因为也好，避免windows/linux之间的编码问题。
- 搜索框支持中英文搜索。
- 开启评论区
- 默认支持RSS。地址是 https://${baseUrl}/index.xml

