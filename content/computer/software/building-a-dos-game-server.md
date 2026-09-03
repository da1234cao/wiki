---
title: "搭建dos-game服务"
date: "2024-09-27 14:15:00"
tags:
  - docker
  - software
---
参考：

- [【好玩儿的Docker项目】80、90回忆杀，10分钟搭建复古中文 DOS 游戏，最多畅玩1898款！-我不是咕咕鸽](https://blog.laoda.de/archives/docker-compose-install-chinese-dos-games)
- [rwv/chinese-dos-games: 🎮 Chinese DOS games collections.](https://github.com/rwv/chinese-dos-games)

创建 `docker-compose.yml` 文件

```
version: '3.9'
services:
    dosgame-web-docker:
        image: 'oldiy/dosgame-web-docker:latest'
        container_name: dosgame
        restart: unless-stopped
        ports:
            - '18090:262'
        #volumes:
        #  - '/root/software/dos_games/chinese-dos-games:/app/static/games'
```

拉取和启动容器。

```
docker-compose up -d
```
