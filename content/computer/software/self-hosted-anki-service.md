---
title: "自建anki服务"
date: "2024-09-04 17:34:57"
tags:
  - docker
  - software
---
# 软件安装

## anki服务的搭建

参考：[https://hub.docker.com/r/johngong/anki-sync-server](https://hub.docker.com/r/johngong/anki-sync-server)

```
docker run -d\
    --name=anki \
    -p 18080:18080 \
    -v /root/software/anki/data:/ankisyncdir \
    -e SYNC_USER1=da1234cao:3VbU9Q1qdu\
    -e SYNC_PORT=18080 \
    --restart unless-stopped \
    johngong/anki-sync-server:latest
```

## anki客户端的安装

下载地址: [Anki - powerful, intelligent flashcards](https://apps.ankiweb.net/)

## anki 浏览器插件

我目前唯一用的舒服的是：[在线词典助手ODH(划词助手在线版) — 老黄老巢](https://www.laohuang.net/20180213/online-dictionary-helper/)

安装完插件后，有一份已经制作好的模板。

我这里也上传一份附件。

ODH_Template
下载

# 附录

```

```
