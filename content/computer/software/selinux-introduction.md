---
title: "SELinux简介"
date: "2025-09-29 17:38:56"
tags:
  - linux
---
# 前言

SELinux 是强制访问控制（Mandatory Access Control, MAC）的一种实现，提供了额外的安全层。SELinux 策略定义了用户和进程如何与系统中的文件进行交互。

> SELinux fundamentally answers the question: *May <subject> do <action> to <object>?*, for example: *May a web server access files in users' home directories?*

# SELinux 的相关命令

## 查看 SELinux 的状态

```
root@localhost /e/selinux# sestatus 
SELinux status:                 enabled
SELinuxfs mount:                /sys/fs/selinux
SELinux root directory:         /etc/selinux
Loaded policy name:             targeted
Current mode:                   enforcing
Mode from config file:          enforcing
Policy MLS status:              enabled
Policy deny_unknown status:     allowed
Memory protection checking:     actual (secure)
Max kernel policy version:      33
```

## 查看 SELinux 的日志

ausearch 是 Linux 审计框架 (auditd) 中用于查询和检索审计日志的命令行工具，它帮助系统管理员根据特定条件筛选和分析系统事件。

```
# 先检查下服务是否开启了
systemctl status auditd.service

# 查找所有失败的登录尝试
ausearch -m USER_LOGIN -sv no -i

# 查找所有成功的登录尝试
ausearch -m USER_LOGIN -sv yes -i

# 查看 SELinux 拒绝的操作
ausearch -m AVC,USER_AVC,SELINUX_ERR,USER_SELINUX_ERR -ts today
```

`sealert`是 SELinux 的策略诊断工具，用于分析和解释 SELinux 审计日志，帮助用户识别安全事件、检查权限问题并提供解决方案建议。

`sealert`的核心功能是解析 `/var/log/audit/audit.log`中的 SELinux 拒绝消息（通常是 `avc: denied`类事件），并以更友好、易懂的方式输出分析结果

```
root@localhost ~# dnf install setroubleshoot-server^C
root@localhost ~# sealert -l "*"
```

# 自定义 SELinux 策略

## 策略简介

来自：[Quick start to write a custom SELinux policy - Red Hat Customer Portal](https://access.redhat.com/articles/6999267)

SELinux 安全策略是一组 SELinux 规则的集合。策略是 SELinux 的核心组件，由 SELinux 用户空间工具加载到内核中。内核通过使用 SELinux 策略来评估系统中的访问请求。默认情况下，SELinux 会拒绝所有请求，除非这些请求与已加载策略中指定的规则相对应。

每个 SELinux 策略规则描述了一个主体和目标资源之间的交互。

策略规则的一般形式为：

```
<rule type> <subject> <object>:<object class> <permissions>;
```

- Subject - label of the process
- Object - label of the resource being accessed
- Object class - for example, a directory or a file
- Permissions - the access being granted (for example, read, write)

要使用标准语言自定义 SELinux 策略，请使用以下文件：

- <mypolicy>.te - 定义策略规则以及您的应用程序使用的新类型和域
- <mypolicy>.fc - 包含文件上下文定义，换句话说，是为应用程序相关文件打标签的指令
- <mypolicy>.if - 包含接口，这些接口是其他策略模块用于与此策略交互的策略宏

## 示例

我们找网上实际的参考示例，看看。

- [vpp/extras/selinux at master · FDio/vpp](https://github.com/FDio/vpp/tree/master/extras/selinux)
- [georou/grafana-selinux: Grafana SELinux policy module for CentOS 7 & RHEL 7](https://github.com/georou/grafana-selinux)

我们看下 vpp 的 selinux 吧。grafana 的 selinux，看的脑袋疼，就不看了。

```
/etc/vpp(/.*)? gen_context(system_u:object_r:vpp_config_rw_t,s0)
```

- `/etc/vpp`目录及其所有内容都会被标记为`vpp_config_rw_t`类型
- `system_u` - SELinux用户标识
- `object_r` - 角色标识
- `vpp_config_rw_t` - 类型标识，表示这些文件是VPP配置文件，具有读写权限
- `s0` - MLS（Multi-Level Security）级别

```
type vpp_config_rw_t;
files_config_file(vpp_config_rw_t)
read_files_pattern(vpp_t, vpp_config_rw_t, vpp_config_rw_t)
```

- 义了一个新的SELinux类型（type），名为`vpp_config_rw_t`
- 调用了一个SELinux策略宏，将`vpp_config_rw_t`类型声明为配置文件类型。这个宏会自动为该类型分配一些基本的配置文件属性和权限。
- 定义了VPP进程（`vpp_t`类型）对`vpp_config_rw_t`类型文件的读写权限。

# 最后

远远看着 SELinux ，就知道它不是“善茬”。

所以，不到万不得已的时候，就不要使用SELinux。

这里时一些参考链接：

- [Quick start to write a custom SELinux policy - Red Hat Customer Portal](https://access.redhat.com/articles/6999267)
- [使用 SELinux | Red Hat Enterprise Linux | 9 | Red Hat Documentation](https://docs.redhat.com/zh-cn/documentation/red_hat_enterprise_linux/9/html-single/using_selinux/index)
- [SELinuxProject/selinux-notebook: The SELinux Notebook](https://github.com/SELinuxProject/selinux-notebook)
