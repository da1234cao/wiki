---
title: "书签导航栏服务的搭建：onenav"
date: "2024-09-20 17:39:23"
tags:
  - software
---
# 前言

网上搜索了下书签导航栏的相关软件，最会选择了 onenav。相关博客可见：

- [10分钟搭建一个轻巧、美观、隐私优先的导航书签页面 - Flare - MAKI分享](https://makifx.com/1240.html)
- [https://github.com/soulteary/docker-flare](https://github.com/soulteary/docker-flare)
- [https://www.huluohu.com/posts/1085/](https://www.huluohu.com/posts/1085/)
- [https://github.com/helloxz/onenav?tab=readme-ov-file](https://github.com/helloxz/onenav?tab=readme-ov-file)

# onenav 的搭建过程

```
docker image pull helloz/onenav:latest
```

使用 `docker-compose` 启动。

```
version: '3.9'
services:
  onenav:
    image: helloz/onenav:latest
    restart: unless-stopped
    container_name: onenav
    volumes:
      - /root/software/onenav/data:/data/wwwroot/default/data
    ports:
      - 5005:80
```
