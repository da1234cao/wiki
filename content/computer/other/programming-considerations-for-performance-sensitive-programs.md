---
title: "性能敏感程序的编程注意事项"
date: "2025-11-21 10:12:20"
tags:
  - network
---
# 前言

网络场景的代码，对性能，比较敏感。

在编写性能敏感的代码，还是要有所留意。

下面的内容参考自：[1. Performance Optimization Guidelines — Data Plane Development Kit 25.11](https://doc.dpdk.org/guides/prog_guide/perf_opt_guidelines.html)

# Writing Efficient Code

## 内存

1. 尽量不要在数据面，进行字符串的拷贝拼接。
字符串的拷贝拼接，我最喜欢用 `snprintf`函数。因为它能保证，即使在空间不足的情况下，目标缓冲区的末尾也包含 `\0`。但是在数据面中，应该尽量不要使用该函数。我用过，然后打出来的火焰图，能看到 `snprintf`有不少的性能损失。
[vpp trace](https://fd.io/docs/vpp/v2101/gettingstarted/progressivevpp/traces) 中，使用了回调函数的方式，避免了在数据面拼接字符串。好处是，在性能方面有所优化。但缺点同样明显，它使用 TLV 方式，进行存储管理。自定义的内存格式管理，总是得小心翼翼，万一不小心把内存写冒了，就完蛋了。
2. 尽量不要在数据面，使用 malloc/free 来申请和释放空间。
Linux 系统的堆使用，有性能问题？这个我不知道。不过，我知道，它肯定会进行系统调用。数据面中，还是少系统调用的比较好。一般来说，数据面需要堆空间时，会使用特定的用户空间内存池。
[vpp pool](https://fdio-vpp.readthedocs.io/en/latest/gettingstarted/developers/infrastructure.html#pools) 不好用，因为它是 per-thread 的数据结构。多线程使用起来，不好用。
mempool 经常和 ring 搭配来使用。Linux c 中，想找一个开源好用的 mempool 和 ring，那简直是费老鼻子劲。目前使用过：[MPSC lock-free ring buffer的使用与分析](using-and-analyzing-mpsc-lock-free-ring-buffers.md)
3. 多核场景下，不要对一块内存并发访问。
数据面场景，写日志是不太可能的事情。所以，基本只能靠计数统计来排查问题。多核对同一块内存的访问，会导致大量的 cache miss。大概是 2 年前，在 128 核的 CPU 上，我使用原子变量得方式写统计信息，结果性能卡卡掉。
[vpp Statistics](https://s3-docs.fd.io/vpp/25.10/developer/corefeatures/stats.html#statistics) 中，它的计数是 per-thread 方式计数的。在数据面场景中，这是一个必然的选择。但是，vpp 统计信息的输出非常的糟糕，[vpp_prometheus_export.c at master · FDio/vpp](https://github.com/FDio/vpp/blob/master/src/vpp/app/vpp_prometheus_export.c) 可维护性极差。虽然读取有另一套接口，[govpp/adapter/statsclient](https://github.com/FDio/govpp/tree/master/adapter/statsclient)，但是也只是相当于把糟糕的代码封装成接口罢了。
4. 不要跨 NUMA 访存。
从 NUMA 的物理结构上来说，这似乎是一个理所当然的事情。但是，真要说原因，我还真整不出一个一二三四五，即，不够清楚。不够清楚没关系，别那么做就行。
5. 数据面尽量不要使用锁结构。
这里感觉 vpp 处理的很好，控制面操作的时候，可以选择临时阻塞数据面。毕竟，大多数情况下，控制面修改的频率极低。[vpp 中 barrier 介绍 — 随笔](../software/vpp-barrier-introduction-notes.md)
另一个选择是使用 RCU。但是 RCU 写起来有点麻烦，而且它只能保护指针指向的空间。
[vpp-rwlock](https://github.com/FDio/vpp/blob/master/src/vppinfra/lock.h) 使用了原子变量实现了一个 rwlock。但是尽量不要使用。因为多个 CPU 共同读写一个原子变量，容易导致 cache miss。

## 其他注意事项

1. 多使用内联函数，这个可以减少函数栈帧之间的切换。
2. 情况合适的地方，多使用分支预测。
3. 编译的时候，可以指定 CPU 的类型，[x86 Options (Using the GNU Compiler Collection (GCC))](https://gcc.gnu.org/onlinedocs/gcc/x86-Options.html) 。因为不同 CPU 的指令集不完全相同。但是这有个缺点，编译出来的二进制，无法在没有相关指令集的 CPU 上运行。此时，我们不得不为不同的 CPU 分发不同的二进制程序，这不好维护。但是 VPP 可以一个二进制程序，里面包含了不同指令集，不知道它咋做到的，没研究过。
4. 编译的时候，开启LTO(Link Time Optimization)，它可以跨模块内联。
5. 使用 perf 查看代码的热点位置：[perf的简单使用 – da1234cao](../software/basic-use-of-perf.md) 、[vmware中的perf报错 – da1234cao](../software/vmware-perf-error.md)
6. 使用 ASan(AddressSanitizer) 检查内存错误。
不过 ASan 似乎不能检查内存泄漏。前两天，代码敲完了，流量打进来后，内存呼呼的泄漏。使用 ASan 没检查出来，只好手动解决了。感觉 ASan 可能确实也检查不出来。因为程序是以 service 的方式运行的。程序不退出，ASan 没法分辨出一段内存是申请了还要用，还是忘了释放。
