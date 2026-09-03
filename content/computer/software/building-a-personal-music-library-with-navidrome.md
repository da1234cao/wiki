---
title: "搭建个人音乐库-navidrome"
date: "2024-09-01 17:38:41"
tags:
  - docker
  - software
---
# navidrome 服务搭建

见： [navidrome - Installing with Docker](https://www.navidrome.org/docs/installation/docker/)

创建 `docker-compose.yml` 文件，写入以下内容。

```
version: "3"
services:
  navidrome:
    image: deluan/navidrome:latest
    user: 0:0 # should be owner of volumes
    ports:
      - "4533:4533"
    restart: unless-stopped
    environment:
      # Optional: put your config options customization here. Examples:
      ND_SCANSCHEDULE: 1h
      ND_LOGLEVEL: error  
      ND_SESSIONTIMEOUT: 720h
      ND_BASEURL: ""
      ND_ENABLESHARING: true
      ND_LASTFM_LANGUAGE: "zh"
      ND_LASTFM_APIKEY: xxx
      ND_LASTFM_SECRET: xxx
      ND_UIWELCOMEMESSAGE: "username/password:guest/guest"
    volumes:
      - "/root/software/navidrome/data:/data" # your path
      - "/root/software/navidrome/music:/music:ro" # your path
```

拉取镜像，创建容器。

```
docker-compose up -d
```

# 准备音乐材料

## 音乐查找

可以在这些地方查找，下载音乐：

- [音乐搜索器 - 多站合一音乐搜索,音乐在线试听](http://www.xmsj.org/)
- [MyFreeMP3](https://tool.liumingye.cn/music/#/)
- [歌曲宝-找歌就用歌曲宝-MP3音乐高品质在线免费下载](https://www.gequbao.com/)

## 音乐刮削

本地 [音乐标签pc版 - vinlxc - 博客园](https://www.cnblogs.com/vinlxc/p/11347744.html)

## 上传音乐

将服务器上存放音乐的目录，作为syncthing的同步文件夹即可。见：[Linux服务器同步Windows目录同步-syncthing](https://da1234cao.blog.csdn.net/article/details/131426621)

# 客户端

我用的是android手机，所以只找了android的app。可选的app可在该页面查看：[navidrome](https://www.navidrome.org/docs/overview/)

[tempo](https://github.com/CappielloAntonio/tempo#readme): 挺好，我挺喜欢
