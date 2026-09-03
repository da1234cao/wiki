---
title: "路由问题排查记录"
date: "2026-05-14 21:34:16"
tags:
  - network
---
## 问题概述

日常，在 vmware 的 Linux 虚拟机中开发。虚拟机采用桥接的方式（虚拟机网卡和物理网卡，在一个广播域中），连接网络。而虚拟机里面的网络，有点复杂。

- 公司的仓库地址，是私有地址，需要通过 VPN 才能访问。所以，统一安装了 NetBird VPN。
- 编程的过程中，使用了 codex。而 codex ，在大陆不提供服务。所以，我安装了 v2raya，将流量代理出去。v2raya 创建和启用了一个 tun 卡。
- 编码的程序，运行调试的时候，需要创建 tap 卡。。。

好家伙，我的程序一运行，整个机器就没法访问外部网络了。根据提示，可以看到，DNS 解析没问题，三次握手没问题，但是请求和响应不通。

```
root@localhost ~/tmp# wget www.baidu.com
Resolving www.baidu.com (www.baidu.com)... 110.242.69.21, 110.242.70.57, 2408:871a:2100:1b23:0:ff:b07a:7ebc, ...
Connecting to www.baidu.com (www.baidu.com)|110.242.69.21|:80... connected.
HTTP request sent, awaiting response... No data received.
Retrying.
```

咋整？排查下呗。

## 名词解释

### 策略路由规则(Policy Routing Rules )

传统路由（destination-based routing）只看目标 IP， 只有目标地址参与决策。

现代的路由过程，更高级好用些。一个系统中，包含了多个路由表。比如多个网卡，每个网卡有自己的路由表。

这就涉及到一个问题，一个数据包需要路由的时候，选择哪个路由表？

所以，有了“策略路由规则”。数据包， 根据“策略”决定查哪张路由表。

```
packet
   ↓
ip rule       ← 策略规则（先匹配）
   ↓
routing table ← 路由表（再查路由，根据dst ip, 找next hop）
   ↓
next hop
```

PS: 策略路由是“先按规则选择路由表，再在该路由表里按目标地址查 next hop；如果当前表查不到路由，就继续匹配下一条策略规则”。

## 当前的环境

当前的策略路由规则。（最左边的数字，是优先级。数字越小，优先级越高。

```
root@localhost ~# ip rule
0:	from all lookup local
105:	from all lookup main suppress_prefixlength 0
110:	not from all fwmark 0x1bd00 lookup 7120
9000:	from all to 172.19.0.0/30 lookup 2022
9001:	from all ipproto icmp goto 9010
9002:	not from all dport 53 lookup main suppress_prefixlength 0
9002:	not from all iif lo lookup 2022
9002:	from 0.0.0.0 iif lo lookup 2022
9002:	from 172.19.0.0/30 iif lo lookup 2022
9010:	from all nop
32766:	from all lookup main
32767:	from all lookup default
```

我们一条一条看。

`0: from all lookup local` ：

- 优先级为 0
- 匹配条件是`from all`，表示所有源地址。即匹配所有的包。
- 执行的动作是 `lookup local`, 表示 查 `local` 路由表。

我们再来看看 `local` 路由表中的内容。

```
local 100.115.46.57 dev wt0 proto kernel scope host src 100.115.46.57 
broadcast 100.115.255.255 dev wt0 proto kernel scope link src 100.115.46.57 
local 127.0.0.0/8 dev lo proto kernel scope host src 127.0.0.1 
local 127.0.0.1 dev lo proto kernel scope host src 127.0.0.1 
broadcast 127.255.255.255 dev lo proto kernel scope link src 127.0.0.1 
local 172.19.0.1 dev tun0 proto kernel scope host src 172.19.0.1 
broadcast 172.19.0.3 dev tun0 proto kernel scope link src 172.19.0.1 
local 172.20.10.2 dev lstack proto kernel scope host src 172.20.10.2 
broadcast 172.20.10.255 dev lstack proto kernel scope link src 172.20.10.2 
local 192.168.100.161 dev ens160 proto kernel scope host src 192.168.100.161 
broadcast 192.168.100.255 dev ens160 proto kernel scope link src 192.168.100.161
```

`local` 表用于标识，“哪些 IP 是本机自己的” ， 哪些是广播地址。

为了避免本地流量被 `route` 出去，查询 `local`表的策略路由规则，优先级最高。本地流量不参与转发。下面解释下这个路由表中的内容。

- `local`, 表示 这是本地地址 。
- `192.168.100.161` ，是匹配条件。即 `dst ip` 为该地址时，匹配上。
- `dev ens160`， 属于 ens160 网卡
- `proto kernel`, 内核自动生成
- `scope host`,仅本机有效, 不会发到二层网络。
- `scope link`, 在当前二层广播域有效。
- `src 192.168.100.161`, 应用层发包的时候，通常是不指定 `src ip`。内核查完路由后，使用这里的地址，构建 IP 头。
- `broadcast 192.168.100.255` ，告诉内核，这个 `dst ip` 不要 ARP，而是使用广播 MAC

如果流量，没有被上一条策略路由截胡，就接着往下匹配。

我们再来看下一条策略路由规则。

`105: from all lookup main suppress_prefixlength 0`

- 优先级为 105
- 匹配条件是`from all`，表示所有源地址。即匹配所有的包。
- 执行的动作是 `lookup main`, 表示 查 `main` 路由表。
- `suppress_prefixlength 0`，表示 在查询 `main` 表时，抑制/忽略前缀长度小于等于 0 的路由。 默认路由(`0.0.0.0/0`) 的 prefix length 就是 0。这里，则表示，查询 `main` 表时，不要使用其中的默认路由。**这条规则常见于 VPN 等场景。它保留本地局域网、直连网段等具体路由，但避免流量直接走系统默认网关**。

我们再来看看 `main` 路由表中的内容。

```
root@localhost ~/tmp# ip route show table main
default via 172.20.10.1 dev lstack proto unspec 
default via 192.168.100.1 dev ens160 proto dhcp src 192.168.100.161 metric 100 
100.115.0.0/16 dev wt0 proto kernel scope link src 100.115.46.57 
172.19.0.0/30 dev tun0 proto kernel scope link src 172.19.0.1 
172.20.10.0/24 dev lstack proto kernel scope link src 172.20.10.2 
192.168.100.0/24 dev ens160 proto kernel scope link src 192.168.100.161 metric 100 
```

- 当前有四个网卡，每个网卡有一个 IP。IP 段互不冲突。
- 有两条默认路由(默认网关)。`metric` 表示优先级，缺省则为 0。数字越小，优先级越高。`proto unspec`，表明这是程序插入的。（如果 IP 是通过 DHCP 分配的话，DHCP option 中，会下发默认网关。）
- `main`表中的默认路由，这样配置，可能会导致无法访问外玩，因为 `lstack`插入的默认网关的优先级更高。但是，巧的是，我们这里的策略路由中，忽略了默认网关的匹配。

接着看下一条路由规则。

`110: not from all fwmark 0x1bd00 lookup 7120`

- 优先级为 110
- `fwmark 0x1bd00`，是 skb mark 为 0x1bd00。
- `not`，是对匹配条件取反。 匹配条件是 `from all fwmark 0x1bd00`
- 这条规则含义： 对于所有数据包 ， 如果 `fwmark != 0x1bd00`, 则查路由表 7120

~~Linux 中，一般是通过~~`~~nftables~~`~~来给数据包打 mark。我们来查看下 mark 是怎么打上的。~~`~~nftables~~`~~有~~`~~table~~`~~,~~`~~chain~~`~~,~~`~~rule~~`~~, 这三个概念。~~`~~table~~`~~（表）：按协议族和用途组织规则。~~`~~chain~~`~~（链）：规则执行入口 。~~`~~rule~~`~~（规则）：真正的匹配与动作~~。

我们来看下，7120 这个路由表。

```
root@localhost ~/tmp# ip route show table 7120
10.52.0.0/16 dev wt0 
10.56.0.0/16 dev wt0 
10.58.0.0/16 dev wt0
```

上面那条规则的作用就很明显了。它是 NetBird 用来避免自己的流量被自己重新路由的标记。

接着看下一条路由规则。

`9000: from all to 172.19.0.0/30 lookup 2022`

- 优先级为 9000
- 匹配条件是 `from all to 172.19.0.0/30`
- 动作是 `lookup 2022`

我们看下，2022 这个路由表。

```
root@localhost ~# ip route show table 2022
default dev tun0
```

这是我 v2raya 创建的 tun 卡。

接着看下一条路由规则。

`9001: from all ipproto icmp goto 9010`

- 优先级为 9001 。 所有 ICMP 流量，不继续按当前顺序匹配，而是直接跳到 priority=9010 的规则继续处理。
- `9010: from all nop`。`nop` 是 No Operation，表示什么都不做。继续后面的规则。
- `32766: from all lookup main` 查找 `main` 表。
- 这个设计很常见，避免 VPN 等，干扰到 ping

`9002: not from all dport 53 lookup main suppress_prefixlength`

- 除 DNS ( `dport 53`)外，优先使用 main 表中的直连路由，但不要使用默认路由。
- 可能是我当前系统运行了两个 VNP，规则插入有点重复了。这条规则，是之前高优先级规则的子集了。

`9002: not from all iif lo lookup 2022`

- `iif`是 incoming interface
- `iif lo`, 从 loopback （回环接口） 接入的流量
- 除 lo（本地回环）接口进入的流量外，其它流量都使用 2022 路由表。
- 本机直接发包的时候，它没有 `iif`

`9002: from 0.0.0.0 iif lo lookup 2022`

- `loopback`接入的流量、源地址为 0.0.0.0 的包，使用 table 2022

`9002: from 172.19.0.0/30 iif lo lookup 2022`

- `loopback`接入的流量、源地址属于 172.19.0.0/30 的流量，使用 table 2022 路由。

## 问题排查

上面的内容看完后，问题一目了然了。

我的程序，创建的`lstack tap`，它插入的默认路由优先级最高，把流量劫走了。

- 路由匹配过程，一路下滑，在 32766 这条 策略路由下，匹配上了 `main table`中的 默认路由。

```
root@localhost ~/tmp# ip rule 
0:	from all lookup local
105:	from all lookup main suppress_prefixlength 0
110:	not from all fwmark 0x1bd00 lookup 7120
9000:	from all to 172.19.0.0/30 lookup 2022
9001:	from all ipproto icmp goto 9010
9002:	not from all dport 53 lookup main suppress_prefixlength 0
9002:	not from all iif lo lookup 2022
9002:	from 0.0.0.0 iif lo lookup 2022
9002:	from 172.19.0.0/30 iif lo lookup 2022
9010:	from all nop
32766:	from all lookup main
32767:	from all lookup default

root@localhost ~/tmp# ip route
default via 172.20.10.1 dev lstack proto unspec 
default via 192.168.100.1 dev ens160 proto dhcp src 192.168.100.161 metric 100 
100.115.0.0/16 dev wt0 proto kernel scope link src 100.115.46.57 
172.19.0.0/30 dev tun0 proto kernel scope link src 172.19.0.1 
172.20.10.0/24 dev lstack proto kernel scope link src 172.20.10.2 
192.168.100.0/24 dev ens160 proto kernel scope link src 192.168.100.161 metric 100 
```

## 其他

### 为什么 v2raya 的 tun0 ，可以劫持我的系统流量

```
# 所有非loopback 接入的流量(包含本机发出的流量)， 查 2022 路由表
9002:	not from all iif lo lookup 2022

# 默认使用 tun0
root@localhost ~/tmp# ip route show table 2022
default dev tun0 
```

### 为什么 DNS 是通的

```
# 确实，dns 过程，似乎没问题
root@localhost ~/tmp# dig +short www.baidu.com
www.a.shifen.com.
110.242.69.21
110.242.70.57

# 查询dns, 直接访问的 100.115.46.57
root@localhost ~/tmp# systemctl status systemd-resolved
○ systemd-resolved.service - Network Name Resolution
     Loaded: loaded (/usr/lib/systemd/system/systemd-resolved.service; disabled; preset: disabled)
     Active: inactive (dead)
       Docs: man:systemd-resolved.service(8)
             man:org.freedesktop.resolve1(5)
             https://www.freedesktop.org/wiki/Software/systemd/writing-network-configuration-managers
             https://www.freedesktop.org/wiki/Software/systemd/writing-resolver-clients
root@localhost ~/tmp [3]# cat /etc/resolv.conf
# Generated by NetBird
# The original file can be restored from /etc/resolv.conf.original.netbird

search netbird.selfhosted lan
nameserver 100.115.46.57

# 这个地址是我自己的NetBird IP
10: wt0: <POINTOPOINT,NOARP,UP,LOWER_UP> mtu 1280 qdisc noqueue state UNKNOWN group default qlen 1000
    link/none 
    inet 100.115.46.57/16 brd 100.115.255.255 scope global wt0
       valid_lft forever preferred_lft forever

# 再根据策略路由这条精确匹配，dns的流量，被netbird劫持了。。
## 我是服了。一个系统上，启用多个vpn，脑子疼
105:	from all lookup main suppress_prefixlength 0
```

### 为什么三次握手看着是成功的

```
# 发起一个请求
wget www.baidu.com

# 抓包看看
## 确实三次握手成功了
## 这应该是 v2raya 这里代理程序伪造的SYN ACK。因为 172.19.0.1 是 tun 的 ip
## 至于 v2raya tun 这套内部逻辑，暂时就不清楚了
root@localhost ~/tmp# tcpdump -i any -nn -vvv "host www.baidu.com"
tcpdump: data link type LINUX_SLL2
dropped privs to tcpdump
tcpdump: listening on any, link-type LINUX_SLL2 (Linux cooked v2), snapshot length 262144 bytes
11:56:07.278099 tun0  Out IP (tos 0x0, ttl 64, id 26654, offset 0, flags [DF], proto TCP (6), length 60)
    172.19.0.1.44458 > 110.242.69.21.80: Flags [S], cksum 0x7901 (correct), seq 4095754489, win 62720, options [mss 8960,sackOK,TS val 3342119500 ecr 0,nop,wscale 7], length 0
11:56:07.278230 tun0  In  IP (tos 0x0, ttl 64, id 0, offset 0, flags [DF], proto TCP (6), length 60)
    110.242.69.21.80 > 172.19.0.1.44458: Flags [S.], cksum 0xdf9a (correct), seq 4170107659, ack 4095754490, win 62636, options [mss 8960,sackOK,TS val 943365588 ecr 3342119500,nop,wscale 7], length 0
11:56:07.278261 tun0  Out IP (tos 0x0, ttl 64, id 26655, offset 0, flags [DF], proto TCP (6), length 52)
    172.19.0.1.44458 > 110.242.69.21.80: Flags [.], cksum 0x1e76 (correct), seq 1, ack 1, win 490, options [nop,nop,TS val 3342119500 ecr 943365588], length 0
11:56:07.278332 tun0  Out IP (tos 0x0, ttl 64, id 26656, offset 0, flags [DF], proto TCP (6), length 180)
    172.19.0.1.44458 > 110.242.69.21.80: Flags [P.], cksum 0x3823 (correct), seq 1:129, ack 1, win 490, options [nop,nop,TS val 3342119500 ecr 943365588], length 128: HTTP, length: 128
	GET / HTTP/1.1
	User-Agent: Wget/1.21.1
	Accept: */*
	Accept-Encoding: identity
	Host: www.baidu.com
	Connection: Keep-Alive
	
11:56:07.278417 tun0  In  IP (tos 0x0, ttl 64, id 35507, offset 0, flags [DF], proto TCP (6), length 52)
    110.242.69.21.80 > 172.19.0.1.44458: Flags [.], cksum 0x1df7 (correct), seq 1, ack 129, win 489, options [nop,nop,TS val 943365588 ecr 3342119500], length 0
11:56:10.382857 tun0  Out IP (tos 0x0, ttl 64, id 26657, offset 0, flags [DF], proto TCP (6), length 52)
    172.19.0.1.44458 > 110.242.69.21.80: Flags [F.], cksum 0x11d4 (correct), seq 129, ack 1, win 490, options [nop,nop,TS val 3342122605 ecr 943365588], length 0
11:56:10.423624 tun0  In  IP (tos 0x0, ttl 64, id 35508, offset 0, flags [DF], proto TCP (6), length 52)
    110.242.69.21.80 > 172.19.0.1.44458: Flags [.], cksum 0x058b (correct), seq 1, ack 130, win 489, options [nop,nop,TS val 943368734 ecr 3342122605], length 0
11:56:11.383872 tun0  In  IP (tos 0x0, ttl 64, id 35509, offset 0, flags [DF], proto TCP (6), length 52)
    110.242.69.21.80 > 172.19.0.1.44458: Flags [F.], cksum 0x01ca (correct), seq 1, ack 130, win 489, options [nop,nop,TS val 943369694 ecr 3342122605], length 0
11:56:11.383904 tun0  Out IP (tos 0x0, ttl 64, id 0, offset 0, flags [DF], proto TCP (6), length 52)
    172.19.0.1.44458 > 110.242.69.21.80: Flags [.], cksum 0xfddf (correct), seq 130, ack 2, win 490, options [nop,nop,TS val 3342123606 ecr 943369694], length 0
```

### 为什么 v2raya proxy 的流量，没有再次进入自己的 tun

从上面的信息来看，它肯定不是依靠策略路由，来避免流量回环的。因为策略路由中，根本没有包含 v2ray mark 相关的规则。（`nft list ruleset`中也没有）

v2raya 是怎样避免流量回环的？

不知道，抓 AI 问问。这是它的答复，我不知道对不对。

```
root@localhost ~/tmp# ps -ef | grep -E 'sing-box|xray|v2ray'
root        1130       1  0 May12 ?        00:01:47 /usr/local/bin/v2raya
root        1546    1130  0 May12 ?        00:03:29 /usr/local/bin/v2ray run --config=/usr/local/etc/v2raya/config.json
root       58712   40412  0 14:42 pts/1    00:00:00 grep --color=auto -E sing-box|xray|v2ray
```

在 v2ray 中有个配置是。 即 v2ray outbound 绑定源地址是 ens160 的网卡。

```
sendThrough: 192.168.100.161
```

模拟 v2ray 的 `sendThrough`：

```
root@localhost ~/tmp# ip route get 110.242.70.57 from 192.168.100.161
110.242.70.57 from 192.168.100.161 via 192.168.100.1 dev ens160 uid 0 
    cache 
```

可以看到，访问百度，会直接从 ens160 出去，而不是再次进入 tun0

我咋感觉这是胡扯呢？

我也不知道 v2raya 是怎么避免流量回环的。
