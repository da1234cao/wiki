---
title: "linux 静态ip的配置"
date: "2024-09-16 22:11:44"
tags:
  - linux
  - network
---
# 前言

如果安装的是linux desktop 版本，我们可以直接在 “设置” 中配置静态IP 地址。

如果我们正在使用linux server 版本。该如何配置静态 IP 呢？古老的常见的方法是直接修改 `/etc/interface` 这样的配置文件。但是，一旦考虑到可能会在不同系统的不同版本的 linux 上配置静态IP，而它们的配置文件位置和格式**可能**各不相同，配置网络是件头疼的事情。

本文是一个经验贴，记录在 ubuntu 和 rocky 上配置静态IP的方式。

# 软件配置修改的一般方式

在介绍配置静态IP之前，有必要简单说明下，软件配置修改的一般方式。这是一个更通用层次的视角。

首先软件为什么需要配置。因为不同用户对同一个软件，有不同的使用方式。配置让软件更加灵活。

配置通常存储在配置文件中。软件可以通过重启，接收信号，定时扫描等方式，加载应用配置文件中的配置。配置文件一般采用 `ini` , `json` , `toml`, `xml` 等格式。(`ini` 和 `json` 之间，我一定会推荐使用 `json` 。因为 `ini` 在结构上只有两层，非常不利于拓展。而 `json` 结构可以嵌套多层，也没有什么学习成本，配置文件也人类可读。)

我们可以通过直接修改配置文件的方式，对软件进行配置。优点是，这样的配置粒度最细。缺点是，当软件升级时，配置文件中的字段也可能会跟着改变。而用户在更新版本后，不得不去了解配置文件字段的变化，这加重了用户的负担。

为了避免直接修改配置文件。软件通常提供了一个命令行工具，用于管理自身。通过命令行工具去修改配置文件。这样便可避免用户陷入配置文件的细节泥潭中，提高了软件的易用性。

用户使用命令行工具，需要看它的帮助文档。这个过程还是有点麻烦。通过UI界面进行配置的修改，是最简单的方式。比如软件包含一个http页面。用户可以通过前端，调用服务器上的命令行工具，以修改配置文件(或者更多的功能)。UI是使用软件最直观的方式之一。但是UI的开发成本也很高，特别是对于哪些非UI开发的个体程序员而言。

总的来说，配置的修改的易用性方面，UI > 命令行工作 > 直接修改配置文件。

静态IP的配置，也是修改配置。所以也存在上面三种(UI、命令行工具、直接修改配置文件)方式，来设置静态IP。

# ubuntu中静态IP的配置

## 基本的概念介绍

这里有篇博客，介绍了ubuntu上，使用 `netplan` , `nmcli` , `nmtui` , `GNOME Desktop` 这些不同方式来配置静态IP：[How To Configure Static IP Address In Ubuntu 22.04 (Easy Guide) - OSTechNix](https://ostechnix.com/configure-static-ip-address-ubuntu/)

看完上面上面的链接，肯定回想，怎么会有这么多方式，又有什么区别呢？

可以参考这些内容：

- [networking - How exactly are NetworkManager, networkd, netplan, ifupdown2, and iproute2 interacting? - Unix & Linux Stack Exchange](https://unix.stackexchange.com/questions/475146/how-exactly-are-networkmanager-networkd-netplan-ifupdown2-and-iproute2-inter)
- [NetworkManager and netplan | Ubuntu](https://ubuntu.com/core/docs/networkmanager/networkmanager-and-netplan)
- [Netplan brings consistent network configuration across Desktop, Server, Cloud and IoT | Ubuntu](https://ubuntu.com/blog/netplan-configuration-across-desktop-server-cloud-and-iot)
- [**Canonical Netplan**](https://netplan.io/)

我简单总结下：

- 上面配置方式中， `NetworkManager` 是最早出现的一个，它主要用于 桌面情况下的网络配置。`nmcli` 和 `nmtui` 是它的两个命令行工具。 （但是我最近一直使用 `nmcli` 在没有桌面的时候配置网络。。）
- `networkd` 是在  `NetworkManager` 后出现的，我没有用过，也没见过。它可用于服务端配置网络。
- `netplan` 是一个渲染器。它可以选择   `NetworkManager` 或者 `networkd` 管理网络。 `netplan` 可以将配置渲染成   `NetworkManager` 的配置，或者 `networkd` 的配置。`netplan` 在配置网络上形成了统一。

## 使用netplan配置静态ip

参考自：[Netplan tutorial - Netplan documentation](https://netplan.readthedocs.io/en/stable/netplan-tutorial/)、[How to configure a static IP address on an interface - Netplan documentation](https://netplan.readthedocs.io/en/stable/examples/#how-to-configure-a-static-ip-address-on-an-interface) 、[How to use static IP addresses - Netplan documentation](https://netplan.readthedocs.io/en/stable/using-static-ip-addresses/)

查看当前的网卡信息，有两张网卡没有配置。

```
# 使用ip命令，
# 或者，我们也可以使用netplan 命令查看
netplan status
     Online state: online
    DNS Addresses: 127.0.0.53 (stub)
       DNS Search: .

●  1: lo ethernet UNKNOWN/UP (unmanaged)
      MAC Address: 00:00:00:00:00:00
        Addresses: 127.0.0.1/8
                   ::1/128

●  2: ens18 ethernet UP (NetworkManager: ens18)
      MAC Address: 76:56:e5:3f:ac:8e (Red Hat, Inc.)
        Addresses: 192.168.41.71/24
    DNS Addresses: 114.114.114.114
                   8.8.8.8
           Routes: default via 192.168.41.1 metric 100 (static)
                   192.168.41.0/24 from 192.168.41.71 metric 100 (link)

●  3: ens19 ethernet UP (NetworkManager: NM-000d98a7-d0c3-39f0-9d1b-01eb2ad1e9d1)
      MAC Address: 16:ab:7f:e7:20:0b (Red Hat, Inc.)
        Addresses: 10.0.1.15/24
                   fe80::97db:b482:eed:6da5/64 (link)
           Routes: 10.0.1.0/24 from 10.0.1.15 metric 101 (link)
                   fe80::/64 metric 1024

●  4: ens20 ethernet UP (NetworkManager: NM-2ac710fa-f09c-319f-821b-8a915bd93a2b)
      MAC Address: aa:a8:cc:00:20:e7 (Red Hat, Inc.)
        Addresses: 10.0.2.15/24
                   fe80::382:87af:c4ed:3e49/64 (link)
           Routes: 10.0.2.0/24 from 10.0.2.15 metric 102 (link)
                   fe80::/64 metric 1024

●  5: ens21 ethernet UP (unmanaged)
      MAC Address: aa:d1:f4:41:43:c0 (Red Hat, Inc.)

●  6: ens22 ethernet UP (unmanaged)
      MAC Address: 76:9f:e4:56:0c:d1 (Red Hat, Inc.)
```

现在我们来配置静态IP。我们使用命令行的方式，创建出基本的文件结构。之后可以手动编辑文件。

我比较喜欢看着配置文件的字段，使用命令的方式配置。避免因为格式问题，导致配置失败。

```
# 将会创建一个/etc/netplan/ens21-interface.yaml 文件
netplan set --origin-hint ens21-interface ethernets.ens21.addresses=["10.0.3.15/24"]

# 查看配置
cat /etc/netplan/ens21-interface.yaml
network:
  version: 2
  ethernets:
    ens21:
      addresses:
      - "10.0.3.15/24"

# 查看所有配置
netplan get

# 测试配置
netplan try

# 应用配置
netplan apply

# 更多配置
## 禁止dhcp
netplan set ethernets.ens21.dhcp4=false
netplan set ethernets.ens21.dhcp6=false

## 配置DNS
netplan set ethernets.ens21.nameservers.addresses=["114.114.114.114","8.8.8.8"]
```

总的来说，对于用户而言，`netplan` 文档齐全，使用起来也很顺手。但是估计，目前它内部的代码可能不是很优雅。因为它需要将一份配置渲染给两个使用不同配置的不同的软件。

## 使用nmcli/nmtui配置静态ip

上面我们使用了 `netplan` 配置了静态IP。这里我们再使用 `nmcli` 或者 `nmtui` 配置静态IP。

`nmtui` 可以在命令行界面，通过图形的方式配置ip。它比 `nmcli` 要好用一些。

查看帮助文档，问问chatgpt，摸索下，问题不大。另外可参考：[NetworkManager - ArchWiki](https://wiki.archlinux.org/title/NetworkManager)

```
# 查看这些网卡
nmcli device status
DEVICE  TYPE      STATE         CONNECTION         
ens18   ethernet  已连接        netplan-ens18      
ens19   ethernet  已连接        Wired connection 1 
ens20   ethernet  已连接        Wired connection 2 
ens21   ethernet  已连接        netplan-ens21      
lo      loopback  连接（外部）  lo                 
ens22   ethernet  已断开        --                 
```

接下来，我们给网卡创建要给 `connection` 。这个 `connection` 是一份配置，指定网卡使用该配置。

```

nmcli connection add --help

# 链接为有线连接；连接的名称为ens22; 这个连接指定给ens22网卡使用；开机自动连接
nmcli connection add type ethernet con-name ens22 ifname ens22 autoconnect yes
# ifconfig ens22 10.0.4.15
# nmcli connection modify ens22 connection.autoconnect yes

# 之后 使用nmtui进行配置。继续使用nmcli也行。
# 关闭dhcp,配置静态ip
nmcli connection modify ens22 ipv4.method manual
nmcli connection modify ens22 ipv4.addresses "10.0.4.15/24"

# 重新加载；ubuntu中不需要，会自动重新加载；
# nmcli connection reload
```

# 其他linux操作系统

其他linux操作系统没有 `netplan` ，通常是 使用 `nmcli` / `nmtui` 进行配置。
