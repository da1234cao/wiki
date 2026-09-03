---
title: "vpp 中 barrier 介绍 -- 随笔"
date: "2025-11-10 20:28:41"
tags:
  - network
---
# 前言

vpp 的线程类型，可以分为控制面线程(vpp_main)，和数据面线程(vpp_wk)

```
root@localhost ~/w/3/vpp-upstream (master)# pidof vpp
2284230
root@localhost ~/w/3/vpp-upstream (master)# pidstat -t -p 2284230
Linux 5.14.0-570.42.2.el9_6.x86_64 (localhost.localdomain)      11/10/25        _x86_64_        (8 CPU)

UID      TGID       TID    %usr %system  %guest   %wait    %CPU   CPU  Command
  0   2284230         -    0.00    0.00    0.00    0.00    0.00     1  vpp_main
  0         -   2284230    0.00    0.00    0.00    0.00    0.00     1  |__vpp_main
  0         -   2284440    0.00    0.00    0.00    0.00    0.00     1  |__dpdk-intr
  0         -   2284447    0.00    0.00    0.00    0.00    0.00     2  |__vpp_wk_0
  0         -   2284448    0.00    0.00    0.00    0.00    0.00     3  |__vpp_wk_1
```

数据面线程，和控制面线程，可能会操作同一块内存。在高速网络场景下，对共享资源的访问，似乎只能通过 RCU 的方式来实现了。（RCU 适用于读多写少的场景。问，读少写多，该怎么处理，这个就比较难整了）

但是，使用 RCU 的一个缺点是，代码变得复杂了，而且 RCU 以指针的方式保护共享资源。

vpp 提供了 cli 和 api 的方式，在 vpp_main 线程中，操作这块共享内存。操作的时候，可以选择，是否阻塞所有的 vpp_wk 线程。控制面线程操作完共享内存后，再允许数据面线程读取。

我最近碰到的一个疑问是：通过 CLI 的方式，给 feature arc 挂一个新的 node 时，安全吗？

结论是安全的。因为 vpp cli 中，阻塞 worker 线程的时候，是以 graph 为单位进行阻塞，而不是以 node 为单位进行阻塞的。

# vpp barrier 分析

在 `VLIB_CLI_COMMAND`中，我们可以通过指定`is_mp_safe`是否为 1，来决定这个 RPC 的调用过程，是否线程安全。

通常来说，我习惯于指定 `is_mp_safe`为 0，表示该操作会阻塞下所有的 vpp_wk 线程。

那问题是，这个阻塞过程是一个 node 结束后阻塞，还是 graph 遍历一次后阻塞呢？

结论是，所有数据面线程，graph 遍历一次后，被阻塞。

```
# 控制面，阻塞所有 vpp_wk 线程的函数
vlib_worker_thread_barrier_sync

# 控制面，释放所有 vpp_wk 线程的函数
vlib_worker_thread_barrier_release

# 控制线程，通过设置 vlib_worker_threads->wait_at_barrier 标志位，来阻塞数据面线程

# vpp 每次重新遍历graph的时候，检查是否设置了标志位
vlib_main_or_worker_loop() ->  vlib_worker_thread_barrier_check()
```

vpp barrier 这块代码逻辑，其实和 `pthread_barrier_wait`是反过来的。

- vpp 控制面线程，barrier 所有的数据面线程。等所有数据面线程都被阻塞后，控制面操作内存，操作完后，释放数据面线程。
- `pthread_barrier_wait` 是阻塞着，等所有线程到齐后，所有线程再接着往下走。
- 所以，vpp barrier 这块似乎只能自己造轮子，以实现 barrier，glibc 库中没有类似功能的函数。
