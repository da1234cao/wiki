---
title: "__builtin_prefetch 函数简介"
date: "2025-12-09 20:21:13"
tags:
  - network
---
# 前言

在高性能的网络转发中，比如 vpp/dpdk，通常对数据包采用批处理。批处理有很多好处：上下文的切换成本，会分摊给每一个数据包；CPU能一次性，将多个数据包所需的数据，加载到高速缓存中处理，减少了等待数据从主内存读取的次数，从而极大提升效率。

本文介绍，预取函数 [__builtin_prefetch](https://gcc.gnu.org/onlinedocs/gcc/Other-Builtins.html) 。介绍它的使用和作用机理。

然后，做一个预取实验，查看预取，对性能的实际影响情况。

# __builtin_prefetch 函数介绍

## 基本介绍

`__builtin_prefetch` 是 GCC 编译器提供的一个内置函数，用于通过手动提示CPU提前将数据从主内存加载到缓存中，从而减少缓存缺失（cache miss）带来的访问延迟，以提升程序性能。`__builtin_prefetch` 函数的原型如下：

```
void __builtin_prefetch (const void *addr, ...)
```

它接受一到三个参数：

- addr，要预取的数据的内存地址（必须提供）
- rw，访问类型（可选，默认为0）。 0: 预取数据用于读操作；1: 预取数据用于写操作；
- locality，数据的时间局部性（可选，默认为3）。0: 无局部性，访问后即可从缓存中移除；1: 低局部性；2: 中等局部性；3: 高局部性，应尽可能保留在缓存中；
- `__builtin_prefetch`并不直接指定目标缓存级别，而是通过提示性的参数，与CPU协同决定，最终目标通常是尽可能靠近核心的高速缓存（如L1或L2）。比如 locality 为 3，编译器会尝试将数据预取到最接近CPU的高速缓存（如L1数据缓存）中，以期获得最快的访问速度。

`__builtin_prefetch` 通常预取一个完整的缓存行，其大小取决于具体的处理器，而 64 字节是现代常见处理器架构的典型值。

使用该函数时，需要考虑以下几点：

- 正确性优先：该函数不会验证地址有效性。如果传入非法地址（如`NULL`），它通常不会导致程序崩溃，但预取操作本身是无效的。必须确保地址表达式是合法的。
- 预取时机：预取指令需要提前足够的时间发出，以确保数据在被使用前能完成加载。预取过早可能挤占缓存中有用的数据；预取过晚则可能数据还未到位，无法起到加速作用。
- 避免过度预取：盲目预取可能会污染缓存，将真正需要的数据挤出去，反而降低性能。
- 编译器优化的影响：在高优化级别（如 `-O3`）下，编译器可能已经自动生成了高效的预取指令，此时手动添加的 `__builtin_prefetch`可能收效甚微甚至适得其反。
- 平台相关性：这是一个编译器扩展，并非标准C/C++的一部分。虽然GCC和Clang都支持，但其行为和效果会因处理器架构的不同而存在差异。

## 作用机理

考虑一个问题，如果程序总是顺序运行。即，先访存取数据，然后再执行。那预取没有任何意义，因为它总是要消耗一定的时间。

预取之所以有效，在于 CPU 的流水线技术。流水线技术，在一定程度上，使得不同指令的访存和执行，可以并行。

关于 CPU 流水线的内容，我还是上学那会，从《计算机体系结构》课上知道的点。具体关于流水线的介绍，请参考其他资料。

# 实验

这个实验参考自：[VPP/Missing Prefetches - fd.io](https://wiki.fd.io/view/VPP/Missing_Prefetches)

不过实验对象是：[Sample plugin for VPP — The Vector Packet Processor](https://s3-docs.fd.io/vpp/25.10/developer/plugindoc/sample_plugin_doc.html)

```
# 使用连个网卡，两个网卡使用xconnet方式连接
set interface state ens161 up
set interface state ens224 up
set interface l2 xconnect ens161 ens224
set interface l2 xconnect ens224 ens161

# 编译 sample plugin
SAMPLE_PLUGIN=yes make build
cp ./build-root/build-vpp_debug-native/sample-plugin/lib/vpp_plugins/sample_plugin.so ./build-root/build-vpp_debug-native/vpp/lib
64/vpp_plugins/

# 使用trex给上面连个网卡打流量
```

默认情况下，sample plugin 使用了预取函数。sample node，执行一次，耗时约 2.33e2 时钟周期。

```
Thread 2 vpp_wk_1 (lcore 3)
Time 96.8, 10 sec internal node vector rate 14.85 loops/sec 1453675.30
  vector rates in 3.9435e4, out 3.9435e4, drop 0.0000e0, punt 0.0000e0
             Name                 State         Calls          Vectors        Suspends         Clocks       Vectors/Call  
dpdk-input                       polling         215610621         3817733               0          2.98e4             .02
ens224-output                    active             259829         3817733               0          2.25e2           14.69
ens224-tx                        active             259829         3817733               0          1.42e4           14.69
interface-output                 active             259829         3817733               0          3.74e2           14.69
sample                           active             259829         3817733               0          2.33e2           14.69
```

把预取函数移除后，sample node，执行一次，耗时约 2.73e2 时钟周期。

```
Thread 2 vpp_wk_1 (lcore 3)
Time 204.6, 10 sec internal node vector rate 14.61 loops/sec 1587833.16
  vector rates in 1.7476e4, out 1.7476e4, drop 0.0000e0, punt 0.0000e0
             Name                 State         Calls          Vectors        Suspends         Clocks       Vectors/Call  
dpdk-input                       polling         537679641         3575261               0          7.63e4             .01
ens224-output                    active             256434         3575261               0          2.26e2           13.94
ens224-tx                        active             256434         3575261               0          1.33e4           13.94
interface-output                 active             256434         3575261               0          3.74e2           13.94
sample                           active             256434         3575261               0          2.73e2           13.94
```

也就是说，预取函数带来了 (2.73e2 -2.33e2 )/2.73e2 = 15%的性能提升。

当然，在实际网络场景中，我们还是得看 cache miss 是不是性能瓶颈。是瓶颈的情况下，我们再考虑是否使用预取函数。

# 其他

上面 [sample-plugin](https://github.com/FDio/vpp/blob/master/src/examples/sample-plugin/sample/node.c#L347C15-L347C29) 有个比较有意思的地方。

```
	  src_dst0 = ((u8x16 *) en0)[0];
	  src_dst1 = ((u8x16 *) en1)[0];
	  src_dst0 = u8x16_shuffle (src_dst0, 6, 7, 8, 9, 10, 11, 0, 1, 2, 3,
				    4, 5, 12, 13, 14, 15);
	  src_dst1 = u8x16_shuffle (src_dst1, 6, 7, 8, 9, 10, 11, 0, 1, 2, 3,
				    4, 5, 12, 13, 14, 15);
	  ((u8x16 *) en0)[0] = src_dst0;
	  ((u8x16 *) en1)[0] = src_dst1;

typedef __attribute((vector_size(16))) u8 u8x16

#if defined(__GNUC__) && !defined(__clang__)
#define __builtin_shufflevector(v1, v2, ...)                                  \
  __builtin_shuffle ((v1), (v2), (__typeof__ (v1)){ __VA_ARGS__ })
#endif

#define u8x16_shuffle(v1, ...)                                                \
  (u8x16) __builtin_shufflevector ((u8x16) (v1), (u8x16) (v1), __VA_ARGS__)
```

关于 `__builtin_shuffle `的介绍，可参考 [Vector Extensions (Using the GNU Compiler Collection (GCC))](https://gcc.gnu.org/onlinedocs/gcc/Vector-Extensions.html)

`__builtin_shuffle`允许在编译时直接对向量类型中的元素进行重新排列或“洗牌”。与在运行时使用循环进行元素重排相比，`__builtin_shuffle` 是在编译时完成所有重排逻辑的。编译器会直接将其优化为极少数甚至一条特定的 SIMD 指令，因此效率非常高。

我的建议是，不使用这类内置函数。写起来费脑子，维护起来还麻烦。软件层面上，性能丢一点就丢一点。
