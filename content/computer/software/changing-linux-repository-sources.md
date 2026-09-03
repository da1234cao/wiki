---
title: "Linux 更换仓库源"
date: "2025-06-20 19:31:00"
tags:
  - linux
---
# Rocky

## Rocky9

### 使用阿里源

参考：

- [rockylinux镜像_rockylinux下载地址_rockylinux安装教程-阿里巴巴开源镜像站](https://developer.aliyun.com/mirror/rockylinux/)
- [Rocky Linux yum/dnf repo/mirrors 国内镜像列表及更换方法 - sysin - 博客园](https://www.cnblogs.com/sysin/p/18256194)

```
cp -a /etc/yum.repos.d /etc/yum.repos.d.bak/

sed -i 's|^mirrorlist=|#mirrorlist=|g' /etc/yum.repos.d/rocky*.repo
sed -i 's|^#baseurl=http://dl.rockylinux.org/$contentdir|baseurl=https://mirrors.aliyun.com/rockylinux|g' /etc/yum.repos.d/rocky*.repo

sed -i 's|^metalink|#metalink|g' /etc/yum.repos.d/epel*.repo
sed -i 's|^#baseurl=https://download.example/pub|baseurl=https://mirrors.aliyun.com/|g' /etc/yum.repos.d/epel*.repo

# rocky9.5版本多了一个 epel-cisco-openh264.repo 无镜像，将其过滤
# sed -i 's|^#baseurl=https://download.example/pub|baseurl=https://mirrors.aliyun.com/|g' /etc/yum.repos.d/epel{,-testing}.repo
```

# ubuntu

## ubuntu24

### 使用清华源

参考：

- [ubuntu | 镜像站使用帮助 | 清华大学开源软件镜像站 | Tsinghua Open Source Mirror](https://mirrors.tuna.tsinghua.edu.cn/help/ubuntu/)
- [Ubuntu24.04换源方法（新版源更换方式，包含Arm64）-CSDN博客](https://blog.csdn.net/qq_37344125/article/details/138841559)

先备份下配置文件。

```
cp /etc/apt/sources.list.d/ubuntu.sources  /etc/apt/sources.list.d/ubuntu.sources.bak
```

然后替换 ubuntu.sources 中的内容。

```
vim /etc/apt/sources.list.d/ubuntu.sources

Types: deb
URIs: https://mirrors.tuna.tsinghua.edu.cn/ubuntu
Suites: noble noble-updates noble-backports
Components: main restricted universe multiverse
Signed-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg

Types: deb
URIs: http://security.ubuntu.com/ubuntu/
Suites: noble-security
Components: main restricted universe multiverse
Signed-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg
```
