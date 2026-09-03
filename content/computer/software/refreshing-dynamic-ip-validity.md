---
title: "刷新动态IP的有效时长"
date: "2025-04-16 22:22:12"
tags:
  - network
---
# 前言

我办公桌上有一个 mini主机。mini 主机里面刷的是 debian 系统。平时，通过网络连接使用这个 mini 主机。

最近一周，我每天早上去的时候，笔记本都无法连接 mini主机。 通过笔记本也无法ping通mini主机。重启下 mini 主机的系统后，mini 主机的网络就又正常了。

连续几天，每个早上花十多分钟，重启机器，重启环境，我忍不了。得解决这个问题。

# 问题描述

每天早上的mini主机无法通过网络访问。重启后，mini主机的网络回复正常。

我无法登录公司的路由器。所以，我无法从路由器的配置找到问题灵感。

我只能从我的主机上，排查这个问题。然后，一不小心，就看到问题位置了。

```
4: wlp3s0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default qlen 1000
    link/ether 04:f4:d8:17:fa:03 brd ff:ff:ff:ff:ff:ff
    inet 192.168.39.92/23 brd 192.168.39.255 scope global dynamic noprefixroute wlp3s0
       valid_lft 85296sec preferred_lft 85296sec
```

路由器通过dhcp，给主机分配的IP生命周期是 85296秒 = 1421.6 分钟 = 23.69 小时。

破案了。我平常9:30上班。 之前，我早上9:30 的时候重启过主机。经过23.69小时后，由于主机夜晚无网络通信， 到早上9:30 之前，恰好IP过期。我重启主机后，重新通过dhcp获取了之前的ip，网络恢复正常。

# 问题解决

既然问题是 动态 ip 过期导致的，那别让 ip 失效即可。

有个限制条件是，不能通过路由器页面控制。因为，没有公司路由器的登录权限。

## 思路一：延长到期时间

修改IP的到期时间。但是我不确定这个修改，是否足够的有效。

1. 如果这个修改，是本地的dhcp client 与 路由器 的 dhcp server 通信，协商一致同意修改ip到期时间，那没有问题。
2. 但是吧，直觉上来说，这个修改仅仅本地有效。那就意味着，IP到期后，路由器会把这个ip拿去重新分配。这就不妙了。即，本地修改到期时间，也没啥作用。

```
ip address change 192.168.39.92/23 dev wlp3s0 valid_lft forever preferred_lft forever

ip addr show dev wlp3s0
4: wlp3s0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default qlen 1000
    link/ether 04:f4:d8:17:fa:03 brd ff:ff:ff:ff:ff:ff
    inet 192.168.39.92/23 brd 192.168.39.255 scope global noprefixroute wlp3s0
       valid_lft forever preferred_lft forever
```

## 思路二：刷新到期时间

实现每 6 小时自动刷新 DHCP 租约时间而不更改 IP 地址，可以通过编写一个定时任务（cron job）来完成。

首先创建一个可以刷新ip到期时间的脚本。（但是这个刷新，在未过期时，似乎没有作用。但真的过期时，刷新下，应该就有效了。）

```
nano /usr/local/bin/refresh_dhcp_lease.sh
chmod +x /usr/local/bin/refresh_dhcp_lease.sh

# 脚本内容如下

#!/bin/bash

INTERFACE="wlp3s0"

echo "Refreshing DHCP lease for $INTERFACE..."
sudo dhclient -v $INTERFACE
```

通过 `cron` 定时执行这个脚本。

```
# 开当前用户的 cron 配置
crontab -e

# 每6个小时，执行一次
0 */6 * * * /usr/local/bin/refresh_dhcp_lease.sh >> /var/log/dhcp_refresh.log 2>&1

# 查看服务是否运行
sudo systemctl status cron

# 确认定时任务已正确
crontab -l
```

## 思路三：配置静态IP

静态IP不会失效：[linux 静态ip的配置](configuring-a-static-ip-on-linux.md)
