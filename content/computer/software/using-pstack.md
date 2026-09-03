---
title: "pstack的使用"
date: "2025-07-09 19:18:23"
tags:
  - linux
---
# 前言

昨天看到同事用了下 [pstack(1): print stack trace of running process - Linux man page](https://linux.die.net/man/1/pstack) 命令。

感觉这个命令有点意思。它名字起的好，用法简单，在特定的场景下有点作用。

时间不着急，我尝试了下。

# pstack

## 命令介绍

`pstack`是 `gstack`的软连接。

```
root@localhost ~# whereis pstack
pstack: /usr/bin/pstack /usr/share/man/man1/pstack.1.gz
root@localhost ~# ls -alh /usr/bin/pstack
lrwxrwxrwx. 1 root root 6 Apr 24 04:31 /usr/bin/pstack -> gstack
```

`gstack`会附加到命令行中指定的活动进程 pid，并打印出执行堆栈。如果二进制文件 包含调试符号信息，则还会打印符号地址。

`pstack`的使用非常简单。只需要指定 `pid`即可。

```
root@localhost ~# pstack 
Usage: pstack <process-id>
# root@localhost ~ [1]# man pstack
```

如果这个 `pid`是进程的 id，则会打印每个线程的堆栈。如果指定的是 线程的 id 值，则可以仅仅打印对应的线程堆栈。

## 使用示例

我启动了一个 `dpdk-testpmd`。

```
root@localhost ~# pidof dpdk-testpmd
55879
```

使用 `pstack`可以快速的查看当前程序的运行堆栈情况。

```
root@localhost ~# pstack 55879
Thread 7 (Thread 0x7f4a359f9640 (LWP 55885) "dpdk-telemet-v2"):
#0  0x00007f4a3a30f9df in accept () from /lib64/libc.so.6
#1  0x0000000000b3ea19 in socket_listener (socket=0x2d320c0 <v2_socket>) at ../subprojects/dpdk-25.03/lib/telemetry/telemetry.c:446
#2  0x00007f4a3a28a19a in start_thread () from /lib64/libc.so.6
#3  0x00007f4a3a30f210 in clone3 () from /lib64/libc.so.6
Thread 6 (Thread 0x7f4a361fa640 (LWP 55884) "dpdk-worker3"):
#0  0x00007f4a3a2fdfcc in read () from /lib64/libc.so.6
#1  0x0000000000b253df in eal_thread_wait_command () at ../subprojects/dpdk-25.03/lib/eal/unix/eal_unix_thread.c:44
#2  0x0000000000b0c119 in eal_thread_loop (arg=0x3) at ../subprojects/dpdk-25.03/lib/eal/common/eal_common_thread.c:189
#3  0x0000000000b276d9 in eal_worker_thread_loop (arg=0x3) at ../subprojects/dpdk-25.03/lib/eal/linux/eal.c:867
#4  0x00007f4a3a28a19a in start_thread () from /lib64/libc.so.6
#5  0x00007f4a3a30f210 in clone3 () from /lib64/libc.so.6
Thread 5 (Thread 0x7f4a369fb640 (LWP 55883) "dpdk-worker2"):
#0  0x00007f4a3a2fdfcc in read () from /lib64/libc.so.6
#1  0x0000000000b253df in eal_thread_wait_command () at ../subprojects/dpdk-25.03/lib/eal/unix/eal_unix_thread.c:44
#2  0x0000000000b0c119 in eal_thread_loop (arg=0x2) at ../subprojects/dpdk-25.03/lib/eal/common/eal_common_thread.c:189
#3  0x0000000000b276d9 in eal_worker_thread_loop (arg=0x2) at ../subprojects/dpdk-25.03/lib/eal/linux/eal.c:867
#4  0x00007f4a3a28a19a in start_thread () from /lib64/libc.so.6
#5  0x00007f4a3a30f210 in clone3 () from /lib64/libc.so.6
Thread 4 (Thread 0x7f4a371fc640 (LWP 55882) "dpdk-worker1"):
#0  0x00007f4a3a2fdfcc in read () from /lib64/libc.so.6
#1  0x0000000000b253df in eal_thread_wait_command () at ../subprojects/dpdk-25.03/lib/eal/unix/eal_unix_thread.c:44
#2  0x0000000000b0c119 in eal_thread_loop (arg=0x1) at ../subprojects/dpdk-25.03/lib/eal/common/eal_common_thread.c:189
#3  0x0000000000b276d9 in eal_worker_thread_loop (arg=0x1) at ../subprojects/dpdk-25.03/lib/eal/linux/eal.c:867
#4  0x00007f4a3a28a19a in start_thread () from /lib64/libc.so.6
#5  0x00007f4a3a30f210 in clone3 () from /lib64/libc.so.6
Thread 3 (Thread 0x7f4a399fe640 (LWP 55881) "dpdk-mp-msg"):
#0  0x00007f4a3a30fdbf in recvmsg () from /lib64/libc.so.6
#1  0x0000000000b1bdfd in read_msg (fd=9, m=0x7f4a399fc700, s=0x7f4a399fc690) at ../subprojects/dpdk-25.03/lib/eal/common/eal_common_proc.c:284
#2  0x0000000000b1c323 in mp_handle (arg=0x0) at ../subprojects/dpdk-25.03/lib/eal/common/eal_common_proc.c:410
#3  0x0000000000b0c7d4 in control_thread_start (arg=0x4c08a10) at ../subprojects/dpdk-25.03/lib/eal/common/eal_common_thread.c:282
#4  0x00007f4a3a28a19a in start_thread () from /lib64/libc.so.6
#5  0x00007f4a3a30f210 in clone3 () from /lib64/libc.so.6
Thread 2 (Thread 0x7f4a3a1ff640 (LWP 55880) "dpdk-intr"):
#0  0x00007f4a3a30e84e in epoll_wait () from /lib64/libc.so.6
#1  0x0000000000b2e2ea in eal_intr_handle_interrupts (pfd=6, totalfds=5) at ../subprojects/dpdk-25.03/lib/eal/linux/eal_interrupts.c:1079
#2  0x0000000000b2e51d in eal_intr_thread_main (arg=0x0) at ../subprojects/dpdk-25.03/lib/eal/linux/eal_interrupts.c:1165
#3  0x0000000000b0c7d4 in control_thread_start (arg=0x4c08a10) at ../subprojects/dpdk-25.03/lib/eal/common/eal_common_thread.c:282
#4  0x00007f4a3a28a19a in start_thread () from /lib64/libc.so.6
#5  0x00007f4a3a30f210 in clone3 () from /lib64/libc.so.6
Thread 1 (Thread 0x7f4a3a501900 (LWP 55879) "dpdk-testpmd"):
#0  0x00007f4a3a2fdfcc in read () from /lib64/libc.so.6
#1  0x0000000000a3710e in cmdline_read_char (cl=0x4c86000, c=0x7fff173d50ef "\377") at ../subprojects/dpdk-25.03/lib/cmdline/cmdline_os_unix.c:34
#2  0x0000000000a31edc in cmdline_interact (cl=0x4c86000) at ../subprojects/dpdk-25.03/lib/cmdline/cmdline.c:190
#3  0x00000000004f6561 in prompt () at ../subprojects/dpdk-25.03/app/test-pmd/cmdline.c:14048
#4  0x000000000057164e in main (argc=2, argv=0x7fff173d5340) at ../subprojects/dpdk-25.03/app/test-pmd/testpmd.c:4527
```

## 基本原理

`gstack` 是一个调用了 `gdb` 的 `shell` 脚本。上面打印的堆栈信息，是通过 `gdb`附加到进程，然后执行 `thread apply all bt`获取到的。

```
root@localhost ~# cat /usr/bin/gstack
...

backtrace="thread apply all bt"

$GDB --quiet -nx $GDBARGS /proc/$1/exe $1 <<EOF 2>&1 |
set width 0
set height 0
set pagination no
$backtrace
EOF
/bin/sed -n \
    -e 's/^\((gdb) \)*//' \
    -e '/^#/p' \
    -e '/^Thread/p'
```

# 更多阅读

(我没读，只是列下)

- [Debug 利器：pstack & strace - 陈心朔 - 博客园](https://www.cnblogs.com/chenxinshuo/p/11986858.html)
- [peadar/pstack: Print stack traces from running processes, or core files. Supports aarch64, x86_64, and i386](https://github.com/peadar/pstack)
