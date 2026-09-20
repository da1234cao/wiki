---
title: "在 PVE 中安装 openwrt"
date: "2026-09-20 21:40:40"
description: "记录在 PVE 中安装 OpenWrt 虚拟机、配置 OpenClash，并将其作为其他虚拟机网关的过程。"
tags:
  - software
---

## 前言

我之前买了一个小主机([小主机的购买与初始化](../../life/buying-and-setting-up-a-mini-pc.md))。前段时间，找工作期间，无聊，给它刷上了 PVE。

我在 vultr 上有个服务器，每个月10刀。考虑到以后的失业，节省点花钱，我把这个服务给停了。有的服务，我现在部署在我的小主机上。为了外部可以访问，使用了 cloudflare tunnel 穿透到内网，内网使用 1panel 上的 openresty 反向代理多个服务。

PVE 上有多个虚拟机。有的虚拟机是看代码专用的虚拟机。看代码需要使用codex，而 codex 又需要翻墙才能使用。

我不想为每个虚拟机安装翻墙软件。我也不想买个好的路由器，然后[刷固件](https://blog.csdn.net/sinat_38816924/article/details/128977680)， 再在上面安装翻墙软件。

我选择在 PVE 中，安装一个 openwrt 虚拟机。在 openwrt 中安装 openclash。然后，其他需要翻墙机器的默认网关指向 openwrt 即可。

## openwrt 的安装和配置

### openwrt 的安装

参考视频: [第二节 All in one pve+安装OPENwrt 小白跟着做！\_哔哩哔哩\_bilibili](https://www.bilibili.com/video/BV1ri421Y7MM/)

更换下 openwrt 的软件仓库源: [Openwrt | 镜像站使用帮助 | 清华大学开源软件镜像站 | Tsinghua Open Source Mirror](https://mirrors.tuna.tsinghua.edu.cn/help/openwrt/)

### openwrt 的配置

安装 argon 主题

```
wget -O luci-theme-argon.apk https://github.com/jerrykuku/luci-theme-argon/releases/download/v2.4.7/luci-theme-argon-2.4.7-r1.apk

wget -O luci-app-argon-config.apk https://github.com/jerrykuku/luci-theme-argon/releases/download/v2.4.7/luci-app-argon-config-2.4.7-r1.apk

apk add --allow-untrusted ./luci-theme-argon.apk ./luci-app-argon-config.apk
```

磁盘扩容：https://openwrt.org/docs/guide-user/advanced/expand_root

安装中文语言包

```
apk add luci-i18n-base-zh-cn
```

openclash 安装：https://openclash.net/

安装 sftp 服务

```
apk add openssh-sftp-server
```
