---
title: "虚拟机的搭建"
date: "2024-10-16 16:40:00"
tags:
  - software
---
# 前言

需要多个虚拟机来进行网络实验。

尝试安装了PVE：[Install Proxmox VE on Debian 12 Bookworm - Proxmox VE](https://pve.proxmox.com/wiki/Install_Proxmox_VE_on_Debian_12_Bookworm) 、[在Debian12下安装Proxmox ve 8.0_debian 安装pve-CSDN博客](https://blog.csdn.net/qq_46821036/article/details/138504017)

我的机器是 GMK 的小主机。公司的网线插在它的网口上，没有网络。我不知道是网口硬件的问题，还是所处网络的问题。

PVE 一定是需要网线的。所以，当前我不得不放弃这种方案。日后，若PVE允许桥接无线网卡，我一定会再来尝试尝试PVE。

在只有无线网络的情况下，我似乎没有找到比 PVE 更合适的虚拟机管理软件了。

得，用回我的老朋友 virtualbox。只是我无法在 web 页面操作虚拟机，必须登陆系统的用户UI界面。

# virtualbox

## debian上virtualbox的安装

相关链接：[如何在 Debian 12 上逐步安装 VirtualBox](https://www.linuxtechi.com/how-to-install-virtualbox-on-debian/) 、[Linux_Downloads – Oracle VirtualBox --- Linux_Downloads – Oracle VirtualBox](https://www.virtualbox.org/wiki/Linux_Downloads) 、[How to Install VirtualBox 7.1 on Ubuntu 24.04 LTS](https://linuxiac.com/how-to-install-virtualbox-on-ubuntu-24-04-lts/)

```
sudo apt install curl wget gnupg2 lsb-release -y
curl -fsSL https://www.virtualbox.org/download/oracle_vbox_2016.asc|sudo gpg --dearmor -o /etc/apt/trusted.gpg.d/vbox.gpg
curl -fsSL https://www.virtualbox.org/download/oracle_vbox.asc|sudo gpg --dearmor -o /etc/apt/trusted.gpg.d/oracle_vbox.gpg

echo "deb [arch=amd64] http://download.virtualbox.org/virtualbox/debian $(lsb_release -cs) contrib" | sudo tee /etc/apt/sources.list.d/virtualbox.list

sudo apt update
# sudo apt install linux-headers-$(uname -r) dkms -y
sudo apt install virtualbox-7.0 -y

sudo usermod -aG vboxusers $USER
reboot
```

## 没有UI的情况下，在guest上安装和卸载Additions

```
# 挂载扩展功能后，可以看到这个设备
ls -alh /dev/cdrom
mount /dev/cdrom /mnt/Additions/

# 安装扩展功能
./VBoxLinuxAdditions.run

# 下载扩展功能
./VBoxLinuxAdditions.run uninstall
```

# ubuntu24管理

## 交换分区扩大

内存不够-交换空间来凑。

```
# ubuntu 查看是否出发了oom
dmesg | grep -i oom

# 查看swap交换分区信息
swapon --show
NAME      TYPE SIZE   USED PRIO
/swap.img file   2G 271.4M   -2

# 扩大交换分区
sudo swapoff /swap.img
dd if=/dev/zero of=/swap.img bs=1G count=10
mkswap /swap.img
swapon /swap.img
swapon --show
```

## 禁止密码登录

参考：[ubuntu - SSH - PasswordAuthentication no has no effect - Super User](https://superuser.com/questions/1022637/ssh-passwordauthentication-no-has-no-effect)

```
# 验证当前环境是否允许密码登录
sshd -T | grep passwordauthentication       

# 禁止密码登录;重启服务后重新验证是否有效
rm /etc/ssh/sshd_config.d/*
```

# debian12管理

### 修改任务栏位置

默认的任务在底部。将其移动到左侧。参考：[Debian 12，像 Debian 11 一样将程序图标栏移到左侧？ - Debian 用户论坛](https://forums.debian.net/viewtopic.php?t=155401)

```
sudo apt install gnome-shell-extension-dashtodock
gnome-extensions list

# 要重启gnome才能在扩展中看到dashtodock
# 之后在扩展中修改即可。
```
