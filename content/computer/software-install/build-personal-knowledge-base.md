---
title: 个人知识库的搭建
description: 使用 quartz 搭建个人的公开知识库
tags:
  - software
date: 2026-07-25
---
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

## quartz 评估

- 使用文件名作为 URL 的组成部分
    - 无法自定义URL
    - 可以接受。文件名使用全因为也好，避免windows/linux之间的编码问题。
- 搜索框支持中英文搜索。
- 开启评论区
- 默认支持RSS。地址是 https://${baseUrl}/index.xml

