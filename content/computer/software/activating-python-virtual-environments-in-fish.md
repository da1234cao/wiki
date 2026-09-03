---
title: "fish 中激活 python 虚拟环境"
date: "2026-03-01 11:11:23"
tags: []
---
# 前言

## 问题描述与解决

今天上午，我准备敲一个 `python` 程序。

因为要使用 `pip` 安装一些包，所以我先创建和激活一个 `python venv`。

```
[root@rocky-02 using-ai]# fish
Welcome to fish, the friendly interactive shell
Type help for instructions on how to use fish
root@rocky-02 ~/w/s/using-ai (laboratory)# python3 -m venv venv

root@rocky-02 ~/w/s/using-ai (laboratory)# source venv/bin/activate
venv/bin/activate (line 40): Unsupported use of '='. In fish, please use 'set VIRTUAL_ENV /root/work/self/using-ai/venv'.
from sourcing file venv/bin/activate
source: Error while reading file 'venv/bin/activate'
```

把报错信息喂给 AI 。

哦。原来 `venv/bin/activate` 是一个 `bash` 脚本，不能在 `fish`中执行。

解决方法也很简单。`venv`也提供了 `fish`的脚本命令。

```
root@rocky-02 ~/w/s/using-ai (laboratory)# source venv/bin/activate.fish
(venv) root@rocky-02 ~/w/s/using-ai (laboratory)# 
```

## 有点奇怪

按理来说，`source venv/bin/activate.fish` 已经解决了我的问题。

但是，好奇了下：

- `activate.fish`脚本的作用是什么
- `source`这个命令的背后是什么

# 探究下

找 AI 问问。

## activate.fish 脚本的作用

activate.fish 脚本，激活 python venv 的 fish 脚本。

它通过修改环境变量和 shell 提示符，使 Fish shell 用户能够方便地使用 Python 虚拟环境。

搜嘎。

那我这样激活虚拟环境，行不行。

```
root@rocky-02 ~/w/s/using-ai (laboratory)# fish venv/bin/activate.fish
root@rocky-02 ~/w/s/using-ai (laboratory)# 
```

不行哦。

要理解这个背后的原因，得了解 父子进程中，环境变量得传递，可以参考：[Attacks_Through_Environment_Variables_attacks through environment variables-CSDN博客](https://blog.csdn.net/sinat_38816924/article/details/105354621)

简单来说，就是 fish 进程，启动了一个新的 fish 进程，去执行上面的脚本。脚本中的环境变量，设置在子进程中。环境变量没法给父进程设置，所以子进程退出后，啥也没有影响。

那为啥 source 命令可以？

有点意思。

## source 并不是一个二进制的命令

source 并不是一个二进制的命令，而是一个 build-in 命令。用于在 当前 shell 环境中 执行指定文件中的命令。它的作用是读取并执行文件中的命令，就像在命令行中直接输入这些命令一样。

```
root@rocky-02 ~/w/s/using-ai (laboratory)# whereis source
source: /usr/share/man/man1/source.1.gz
```

打个比喻。我们生活的地球上。向下，我们能看到大地。向上，我们能看到天空。但是，如果把我的视野拉远点，拉到太空。我们会看到，地球是“悬浮”在太空中的。自然真的很神奇。

在 shell 中也是类似。我们在 shell 中敲的每个字符串，都是需要 shell 这个进程的输入。当解析这个"source" 这个字符串的时候，shell 直接调用对应的函数即可，无需创建新的进程。比如，fish 的 source 函数定义在 [fish-shell/src/builtins/source.rs at master · fish-shell/fish-shell](https://github.com/fish-shell/fish-shell/blob/master/src/builtins/source.rs)

## 终端交互程序

**build-in 命令这种实现方式，非常类似终端交互程序中命令**。

比如 [Getting Started with the debug CLI — The Vector Packet Processor v26.06-rc0-203-gb0420c166 documentation](https://s3-docs.fd.io/vpp/26.02/cli-reference/gettingstarted/index.html) 、[2. Command-line Library — Data Plane Development Kit 26.03.0-rc1 documentation](https://doc.dpdk.org/guides/prog_guide/cmdline.html)

它们的实现方式好嘛。要我说，都不好，我看不懂，哈哈。

它们的架构不好。好的架构应该是这样：CLI + RPC + process。

一个项目，管好自己就行了，别维护自己的 CLI，累赘。

找个开源的 CLI，调用相应进程的 RPC 就行。
