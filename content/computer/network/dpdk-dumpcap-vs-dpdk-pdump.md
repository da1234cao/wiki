---
title: "dpdk-dumpcap vs dpdk-pdump"
date: "2026-01-15 16:05:02"
tags:
  - network
---
# 前言

最近看了 `dpdk-dumpcap`和 `dpdk-pdump`的实现过程。写篇文档总结下~

把大象放在冰箱里面分为三步：打开冰箱、放进大象，关上冰箱。

网络抓包的流程也是如下：

1. 先在数据包上执行 bpf filter，判断数据包匹配。
2. 将匹配的数据包，发送给应用层程序。
3. 应用层，将数据包保存到 pcap/pcapng 文件中。

# dpdk-dumpcap vs dpdk-pdump

相关链接：[5. dpdk-dumpcap](https://doc.dpdk.org/guides/tools/dumpcap.html)、[6. dpdk-pdump Application](https://doc.dpdk.org/guides/tools/pdump.html)

当网卡被 DPDK 接管后，tcpdump 这类工具，无法在这些网卡抓包了。

因为这些网卡收发的数据包，被 kernel bypass，不再经过内核，更不会经过内核里面，tcpdump 预设的 hook 点。

所以，dpdk 提供了两个抓包工具。

本质上，这两个工具区别，只有在保存数据包的方式上不同。（当然，在实现上，我们可能会说，dpdk-pdump 没有像 dpdk-dumpcap 一样，提供 bpf 功能。）

下面简介下它们的原理。

1. dumpcap/pdump 通过进程间通信的方式 ([Multi-process Support](https://doc.dpdk.org/guides-25.11/prog_guide/multi_proc_support.html))，在 dpdk 主进程上，开启抓包功能。
2. 这个抓包功能是，在 rx/tx 上调用 callback 函数 ([RX/TX Callbacks](https://doc.dpdk.org/guides-25.07/sample_app_ug/rxtx_callbacks.html))

1. dpdk 主进程中的， rx/txcallback 函数，将抓到的数据包，放入 ring 中。
2. dumpcap/pdump 从 ring 中提取数据包，并将数据包保存到 pcapng/pcap 包中。

1. dumpcap 是直接构造 [PcapNG Format](https://pcapng.com/) 格式的数据，写入文件。
2. pdump 是通过 vdev，将数据包写入文件。（dpdk vdev 的实现原理，我还不清楚。）

# tcpdump vs dumpcap

相关链接：[tcpdump(1) man page | TCPDUMP & LIBPCAP](https://www.tcpdump.org/manpages/tcpdump.1.html) 、[D.4. dumpcap: Capturing with “dumpcap” for viewing with Wireshark](https://www.wireshark.org/docs/wsug_html_chunked/AppToolsdumpcap.html)

我没有在网上找到，它们原理的对比。我也没看过它们的源码。

但是，可以合理推测下：也许它们的底层的抓包方式相同。只是应用层的数据包，保存和分析逻辑不同。

下面，简单推测下。

1. tcpdump/dumpcap 在 内核相应的 hook 上挂载 bpf。
2. 数据包经过 hook 函数的时候，判断是否与 bpf 匹配。匹配的话，则将数据包放入缓冲区中。
3. tcpdump/dumpcap 将数据包，从缓冲区取出，保存到 pcapng 中。

1. tcpdump 比 dumpcap 多的功能是，它可以分析数据包。
2. dumpcap 是 wireshark 功能的一部分。dumpcap 只负责抓包，本身没有分析功能。wireshark 提供了强大的分析功能。
3. 当然，日常，我们可能会使用 tcpdump 来抓取数据包，并通过 wireshark 来分析数据包。

# 其他

在 C 语言中，想要将数据包(packet raw)，保存成 pcapng 格式，是一个麻烦的事情。

[libpcap](https://www.tcpdump.org/manpages/pcap.3pcap.html) 只支持将数据包保存成 pcap 格式。但是，网上找不到 C 库，用来将数据包保存成 pcapng。如果真的有此需求，可以考虑移植 [dpdk/lib/pcapng at main · DPDK/dpdk](https://github.com/DPDK/dpdk/tree/main/lib/pcapng)

但是，如果是 C++里面，想保存成 pcapng 格式，还是有库的：[seladb/PcapPlusPlus](https://github.com/seladb/PcapPlusPlus) 。（我没有用过这个库，但是感觉这个库，非常的不错。它的协议解析过程，可能非常具有参考意义。DPDK 已经解决了快速收报过程了，如果 PcapPlusPlus 能再解决包解析问题，那很 amazing）
