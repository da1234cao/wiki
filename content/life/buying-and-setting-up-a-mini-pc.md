---
title: "小主机的购买与初始化"
date: "2024-09-01 10:40:31"
tags:
  - software
---
# 前言

我在vultr上租了一个服务器，来搭建博客。但是这个服务器所在地，目前仍有战争。vultr提醒我注意备份数据。所以我弄了一个小主机来自动备份服务器上的内容。这样同样的数据，分处两地，安全的多。

另外，相当于我有了一个国内的服务器，爽歪歪。

# 远程公网访问小主机

主要思路：从路由器自动获取IPv6。然后配置DDNS -- 将动态IP地址映射到一个固定的域名上。

之后便可通过域名，直接访问小主机了。

## 内网主机获取公网IP

路由器要支持IPV6，然后配置下，可见：[家用路由器IPv6上网设置方法 - TP-LINK商用网络](https://smb.tp-link.com.cn/service/detail_article_4739.html)

配置后，主机便可以分配到公网IPv6。

## 配置DDNS

然后配置一个域名，让域名映射到分配的IPV6即可。当IP变化的时候，本地得上报这个变化。

### 方案一：noip

可以在noip申请了一个域名：[Free Dynamic DNS - Managed DNS - Managed Email - Domain Registration - No-IP](https://www.noip.com/) ，这里有个演示视频，[群晖DDNS配置全攻略：让你的数据随时随地可访问 - YouTube](https://www.youtube.com/watch?v=j0EeW27tJKA)

然后下载客户端，不断上传本机变化得IP即可：[Noip Update Clients](https://www.noip.com/support/knowledgebase/section/dynamic-dns-update-clients)

如果感觉noip分配的域名不好看，且自己有域名，可以配置下自己域名的 DNS CNAME([什么是 DNS CNAME 记录？ | Cloudflare](https://www.cloudflare.com/zh-cn/learning/dns/dns-records/dns-cname-record/))。

但是Noip DDNS免费版本，要每个月验证一次。我不想验证，所以没有采用该方案。

### 方案二：ddns-go

待尝试：[jeessy2/ddns-go: Simple and easy to use DDNS. Support Aliyun, Tencent Cloud, Dnspod, Cloudflare, Callback, Huawei Cloud, Baidu Cloud, Porkbun, GoDaddy, Namecheap, NameSilo…](https://github.com/jeessy2/ddns-go)

我使用docker来部署ddns-go服务。在这之前得配置下镜像加速，因为目前国内无法访问docker：[配置镜像加速器_容器镜像服务(ACR)-阿里云帮助中心](https://help.aliyun.com/zh/acr/user-guide/accelerate-the-pulls-of-docker-official-images) 。如果镜像加速不好使，那就配置下代理吧，前提是有代理，见：[Configure the daemon to use a proxy | Docker Docs](https://docs.docker.com/engine/daemon/proxy/#httphttps-proxy)

这个软件挺好。即使没用过，也会使用。

```
# 尝试之后，这种方式在ipv6时，无法获取网卡
# docker run -d --name ddns-go --restart=always -p 9876:9876 -v /opt/ddns-go:/root jeessy/ddns-go

# 看它的文档说明，要使用host模式：https://registry.hub.docker.com/r/jeessy/ddns-go
docker run -d --name ddns-go --restart=always --net=host -v /opt/ddns-go:/root jeessy/ddns-go
```

# 小主机的购买

打开京东排行版，看有哪些比较合适。

我的要求是：CPU要过的去；要有两个DDR5的内存条接口；两个PCIe 4 硬盘接口；价格可接受。

然后选购了GMK M6 迷你主机 准系统。它没有包含内存条和硬盘，自己加就好。

| 硬件 | 详细信息 | 价格 |
| --- | --- | --- |
| GMK M6 迷你主机 准系统 | CPU：R5-6600H | 1281.5 |
| 金士顿 PCIe 4.0 1T硬盘 | 读速：3500MB/s | 396 |
| 8G DDR5 内存条 | 以前升级游戏本内存拆下来的 | 0 |
| 32G DDR5 内存条 | 5600MHZ | 594 |
| HDMI 视频采集卡 |  | 33.5 |
| HDMI 线 |  | 5 |
| HDMI 显卡欺骗器 | 不接显示器的时候也可桌面 | 6.5 |
|  |  | 合计：2316.5 |

# BIOS的修改

## 减小显存的占用

我插入的是8G的内存条，但是 `free -m` 的时候，只有5G 。这个是因为那3G内存被CPU使用了，可见：[gpu - System Monitor in Ubuntu 18 shows only 5.8 GB RAM out of 8 GB installed - Unix & Linux Stack Exchange](https://unix.stackexchange.com/questions/562720/system-monitor-in-ubuntu-18-shows-only-5-8-gb-ram-out-of-8-gb-installed) 。问下客服即可拿到一个手册 -- 修改BIOS，设置CPU使用的内存。

## 上电自启

1. 开机按Esc键进入BIOS。
2. 设置来电开机：Advanced –> Auto Power On –> Power on

# 更多

因为我只有笔记本和鼠标，没有显示器和外接键盘，所以小主机刷系统有点麻烦。

- 我弄了一个视频采集卡，将笔记本屏幕作为主机的外接屏幕。
- 我以前一直用 [Ventoy](https://www.ventoy.net/cn/index.html) 来制作 启动盘，但是这里不行，因为不会自动进入系统安装。所以，改用了[Rufus - 轻松创建 USB 启动盘](https://rufus.ie/zh/)
- 安装系统的过程中，需要键盘时，由于此时已经可以在(ubuntu)系统中了，可以使用屏幕键盘：[使用屏幕键盘](https://people.ubuntu.com/~happyaron/ubuntu-docs/precise-html/keyboard-osk.html)
- 系统安装完成后，可以开启共享桌面。在局域网内，它的延迟非常低：[共享您的桌面](https://help.ubuntu.com/stable/ubuntu-help/sharing-desktop.html.zh-CN)
