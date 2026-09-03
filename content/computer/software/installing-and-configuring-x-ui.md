---
title: "x-ui 的安装与配置"
date: "2024-09-01 11:36:48"
tags:
  - docker
  - software
---
# x-ui的安装

参考： [GitHub - vaxilu/x-ui: 支持多协议多用户的 xray 面板](https://github.com/vaxilu/x-ui) 、[enwaiax/x-ui - Docker Image | Docker Hub](https://hub.docker.com/r/enwaiax/x-ui)

```
mkdir x-ui && cd x-ui
wget https://raw.githubusercontent.com//chasing66/x-ui/main/docker-compose.yml
docker-compose up -d
```

# x-ui的使用

网上有很多教程。软件做得挺好，鼠标点一点，基本知道如何使用。

# 附录

## docker-compose的安装

ubuntu24 包管理器安装的docker-compose，依赖一些python 包，直接运行会报错。它应该是没有制作成二进制。咱们手动装下吧。

参考：[Docker Compose 安装概述 | Docker 文档](https://docs.docker.com/compose/install/)

```
curl -SL https://github.com/docker/compose/releases/download/v2.29.2/docker-compose-linux-x86_64 -o /usr/local/bin/docker-compose

chmod u+x /usr/local/bin/docker-compose
```
