---
title: "内网穿透服务搭建-frp"
date: "2024-09-13 08:58:31"
tags:
  - software
---
# 前言

建议直接下载安装frp的二进制包 : [fatedier/frp: A fast reverse proxy to help you expose a local server behind a NAT or firewall to the internet.](https://github.com/fatedier/frp)

不建议使用 docker 的方式 安装 frp ：[snowdreamtech/frps - Docker Image | Docker Hub](https://hub.docker.com/r/snowdreamtech/frps)

因为配置文件写错的话，容器不容易排查问题。而直接执行二进制，可以直接看到报错信息。

搭建过程参考 : [frp](https://gofrp.org/zh-cn/)

# frp的安装与配置

## frps的安装与配置

首先是获取二进制程序。

```
cd /opt/ && mkdir frp && cd frp/
wget https://github.com/fatedier/frp/releases/download/v0.60.0/frp_0.60.0_linux_amd64.tar.gz
tar -zxvf frp_0.60.0_linux_amd64.tar.gz
cp frp_0.60.0_linux_amd64/frps .
```

准备配置文件。

```
da1234cao@da1234cao-NucBox-M6:~$ cat /etc/frp/frps.toml 
# 监听端口
bindPort = 7000
# 面板端口
webServer.addr = "0.0.0.0"
webServer.port = 7500
# 登录面板账号设置
webServer.user = "xxxx"
webServer.password = "xxxxx"

# 身份验证
auth.method = "token"
auth.token = "xxxx"
```

使用 systemd 来管理 frps 服务。

```
da1234cao@da1234cao-NucBox-M6:~$ cat /etc/systemd/system/frps.service
[Unit]
# 服务名称，可自定义
Description = frp server
After = network.target syslog.target
Wants = network.target

[Service]
Type = simple
# 启动frps的命令，需修改为您的frps的安装路径
ExecStart = /opt/frp/frps -c /etc/frp/frps.toml

[Install]
WantedBy = multi-user.target
```

## frpc的安装与配置

首先是获取二进制程序。

```
cd /opt/ && mkdir frp && cd frp/
wget https://github.com/fatedier/frp/releases/download/v0.60.0/frp_0.60.0_linux_amd64.tar.gz
tar -zxvf frp_0.60.0_linux_amd64.tar.gz
cp frp_0.60.0_linux_amd64/frpc .
```

准备配置文件。

```
root@da1234cao-Standard-PC-i440FX-PIIX-1996 /e/frp# cat /etc/frp/frpc.toml 
serverAddr = "xxxx"
serverPort = 7000

auth.method = "token"
auth.token = "xxxxx"

[[proxies]]
name = "ssh"
type = "tcp"
localIP = "127.0.0.1"
localPort = 22
remotePort = xxxx
```

使用 systemd 来管理 frpc 服务。

```
da1234cao@da1234cao-NucBox-M6:~$ cat /etc/systemd/system/frpc.service
[Unit]
# 服务名称，可自定义
Description = frpc server
After = network-online.target syslog.target
Wants = network-online.target

[Service]
Type = simple
ExecStart = /opt/frp/frpc -c /etc/frp/frpc.toml
# 执行域名查找的时候失败。需要在网络启动后再起来。保险起见，也可以失败后自行尝试。
# Restart=on-failure  # 当服务失败时重启
# RestartSec=10       # 失败后等待10秒再尝试重启
# StartLimitInterval=30  # 在30秒内...
# StartLimitBurst=5   # 允许服务最多重启5次

[Install]
WantedBy = multi-user.target
```
