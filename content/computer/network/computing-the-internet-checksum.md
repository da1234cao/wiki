---
title: "Computing the Internet Checksum"
date: "2026-02-19 19:28:42"
tags:
  - network
---
# 前言

checksum（校验和）是一种错误检测机制。它确保，数据包在传输过程中，没有被意外篡改或损坏。

IP、TCP、UDP 等互联网协议，依赖校验和来保证数据的完整性。

日常应用层的开发过程中，不关心，也看不到，checksum 字段。

但是，一旦我们想修改/构造 raw packet，checksum 的计算和校验，就是一个绕不开的问题。

本文分为四部分：

- checkcum 的算法
- IP/TCP/UDP 校验的数据范围
- checksum 开源的实现
- 自行实现一遍 checksum

# checksum 的算法

## 名词解释

### 原码，反码，补码

知道这三者如何计算即可。计算方式，见链接：[二进制的原码、反码、补码 - 知乎](https://zhuanlan.zhihu.com/p/99082236) 、[一文读懂二进制补码 - 从计数原理开始说起 - 知乎](https://zhuanlan.zhihu.com/p/565233057)

至于，为什么要有补码，我没看懂。（要搞懂，可能得翻一翻《计算机组成原理》

本文重点关注，这三个名词，对应的英文表示。

1. 原码：Sign-Magnitude Representation
Sign（符号）：指最高位的符号位，用于表示正负（0为正，1为负）。
Magnitude（数值）：指剩余的位数所表示的绝对值。
直译：就是“符号-数值表示法”。这个名称最直观，因为它完整描述了这种编码的构成方式：一个单独的符号位 + 数值的绝对大小。
2. 反码：Ones' Complement
Complement（补数）：这是一个数学概念，指两个数加起来能等于一个特定基数（如10、2）的关系。
Ones' （全1的）：这里的 `Ones'`是复数所有格形式，指的是“由多个1组成的数”。对于一个n位二进制数来说，`Ones'`指的就是n个1，即 `111...111`（例如8位下的 `1111 1111`）。
正数的反码与其原码相同；负数的反码是将其原码的符号位不变，数值位按位取反（0变1，1变0）。之所以叫 Ones' Complement，是因为求一个负数的这种编码，等同于用全1的数去减它的绝对值，得到的“补数”。
3. 补码：Two's Complement
Two's（2的）：这里的 `Two's`指的是“2的幂”，具体是 2^n （n为位数）。
正数的补码与其原码相同；负数的补码是其反码加1。更本质的定义是：一个负数的补码，等于模（2^n，n为位数）减去该负数的绝对值。

### 反码和（Ones' Complement Sum）

相关链接：[binary - What is 1's complement addition? - Stack Overflow](https://stackoverflow.com/questions/66449588/what-is-1s-complement-addition)

Ones' Complement Sum 的定义，或者说计算过程如下：

第一步：将一系列二进制数（通常是16位字）相加，但所有产生的进位（Carry）都要循环加回到结果的最低位。

```
  F000
 + 1009
-------
   0009
 + 0001 // add carry
-------
   000A
```

第二步：对最后的结果取反，~000A = FFF5

注：我们会看到，"1's complement sum" 、"ones' complement of the ones' complement sum" ，都认为是上面意思即可。我没看出来，"Ones' Complement sum"，和 "Ones' Complement" 有什么关系。

## checksum 算法

详见文档：[RFC 1071 - Computing the Internet checksum](https://datatracker.ietf.org/doc/html/rfc1071)

~~（在英文文档中，RFC 文档，通常不好读，看了个大概，没完全看明白。~~

**本备忘录介绍的 checksum 算法，不是标准，而是一组有用的实现技术**。

**本备忘录讨论了，用于高效计算 IP、UDP 和 TCP 校验和，所使用的方法。**

### 基本步骤

checksum 算法必须有良好的性能。因为它在底层，每个包节省点性能，总体就能有不错的性能收益。

本备忘录的 checksum 计算描述如下：

1. 将要进行校验的相邻字节配对形成 16 位整数，并计算这些 16 位整数的 1's complement sum
2. 为了生成校验和，首先将校验和字段清零，然后计算相关字节的 16 位 1's complement sum，并将该结果放入校验和字段中。
3. 要校验校验和，需要在相同的字节集上（包括校验和字段），计算 1's complement sum。如果结果全是 1 则校验成功。

假设要对一系列八位字节，A, B, C, D, ... , Y, Z 计算校验和。使用表示法 [a,b] 表示 16 位整数 a*256+b，其中 a 和 b 是字节，则这些字节的 16 位 1 的补码和由以下之一给出：

```
#  +' 表示 1's complement addition.

# 偶数个八位字节
[A,B] +' [C,D] +' ... +' [Y,Z]

# 奇数个八位字节，补零
[A,B] +' [C,D] +' ... +' [Z,0]
```

### 算法特性

**交换律和结合律**

只要尊重字节的奇偶分配，求和可以按任意顺序进行，并且可以任意分组。

```
[A,B] +' [C,D] +' ... +' [Y,Z]

# 等效于
( [A,B] +' [C,D] +' ... +' [J,0] ) +' ( [0,K] +' ... +' [Y,Z] ) 
```

**字节序无关**

一致地交换字节，且不改变它们的内部顺序时，结果不变。

因此，无论底层硬件的字节顺序（“大端”或“小端”）如何，求和都可以以完全相同的方式进行计算。

```
[A,B] +' [C,D] +' ... +' [Y,Z]
# 等效于
[B,A] +' [D,C] +' ... +' [Z,Y] 
```

**算法加速**

**并行求和**。由于加法具有结合性，我们不必按照消息中整数出现的顺序进行求和。相反，我们可以通过利用更大的字长来“并行”地进行加法运算。例如，在 32 位机器上，我们可以一次加 4 个字节：[A,B,C,D]+'... 当总和计算完成后，我们通过将长总和的 16 位段相加来将其“折叠”为 16 位。

**延迟进位**。将进位加法，推迟到求和循环结束后，可能更高效。

**展开循环**。该算法，便于循环展开。

**增量更新。**当更新一个头部字段时，有时可以避免重新计算整个校验和。最著名的例子是网关更改 IP 头部的 TTL 字段，但还有其他例子（例如，更新源路由时）。在这些情况下，可以在不扫描消息或数据报的情况下更新校验和。([RFC 1141 - Incremental updating of the Internet checksum](https://datatracker.ietf.org/doc/html/rfc1141))

至于，为什么该算法具有这些特性。这是一个数学问题。我就母鸡了。

### C 语言实现

```
    {
      /* Compute Internet Checksum for "count" bytes
       *         beginning at location "addr".
       */
       register long sum = 0;

        while( count > 1 )  {
           /*  This is the inner loop */
               sum += * (unsigned short) addr++;
               count -= 2;
       }

           /*  Add left-over byte, if any */
       if( count > 0 )
               sum += * (unsigned char *) addr;

           /*  Fold 32-bit sum to 16 bits */
       while (sum>>16)
           sum = (sum & 0xffff) + (sum >> 16);

       checksum = ~sum;
   }
```

**上面这个算法实现是 RFC 文档中给出。个人感觉，这个实现只适用于小端机器。**

文档的算法描述是，奇数情况下，在低位补零。奇数这个值(在高八位)要乘以 256。

```
[A,B] +' [C,D] +' ... +' [Z,0]
= A*256 + B + C*256 + D + Z*256 + 0
```

上面的算法实现，如果在小端机器上，则真实的计算如下：

```
[B,A] +' [D,C] +' ... +' [0,Z]
# = [A,B] +' [C,D] +' ... +' [Z,0]
# 小端机器上，所以，Z 不需要256
```

### 更多细节

Q to AI ：校验和算法，为什么数据包即使看着是对的（校验和通过了），也有 2**(-C) 的概率，可能是错误的。

**校验和算法存在漏检概率，核心原因在于它本质是一个哈希函数：将任意长度的数据映射到固定长度的校验值**（如16位）。由于输出空间有限（2^C种可能值），不同的输入数据可能产生相同的输出（即“碰撞”）。因此，当传输发生错误时，错误数据仍有可能凑巧生成与原数据相同的校验和，导致接收方无法发现错误。

在错误模式完全随机的理想假设下，一个随机错误模式恰好通过校验的概率约为 1/(2^C)，即 2^(-C)。对于互联网常用的16位校验和（C=16），这个概率约为 1/65536。

需要注意的是，实际网络错误并非完全随机（例如突发错误、特定比特翻转），某些错误模式可能更容易被检测（如单比特错误），而另一些（如多个错误相互抵消）则可能更难被发现。但2^(-C) 通常被视为其理论上的最小漏检概率，解释了为什么校验和适用于轻量级检错，而非高安全性场景。

# ip/tcp/udp 校验的数据范围

checksum 是协议中的一个字段。关于协议中字段的解析，可参考：[MAC首部 IP首部 TCP首部介绍-CSDN博客](https://blog.csdn.net/sinat_38816924/article/details/107558223)

使用checksum字段，校验更大范围内的数据有没有传输错误。

本节是一个简单的汇总。具体可以参考后文的代码实现。有时候，代码比文字更好读。

## ipv4 checksum

详见： [RFC 791 - Internet Protocol](https://datatracker.ietf.org/doc/html/rfc791)

仅头部的校验和。由于某些头部字段会变化（例如，TTL），因此在处理 internet 头部的每个节点，都会重新计算并验证。

计算方式，为上一节所使用的算法。这是一种易于计算的校验和，实验证据表明它是足够的，但它是临时性的，根据进一步的经验可能会被 CRC 程序取代。（我个人认为，它不会被取代。一旦被大面积使用，就很难更换）

头部校验和，用于验证 ipv4 的数据包信息，是否正确传输。如果头部校验和失败，检测到错误的实体，应立即丢弃该互联网数据报。

ipv4 协议不提供可靠的通信设施。没有端到端或逐跳的确认。数据没有错误控制，只有头部校验和。没有重传机制。没有流量控制。

## ipv6 checksum

详见：[RFC 8200 - Internet Protocol, Version 6 (IPv6) Specification](https://datatracker.ietf.org/doc/html/rfc8200)

好消息，ipv6 协议层，没有 checksum 字段，无需计算校验和。

## tcp 和 udp checksum

详见：[RFC 9293 - Transmission Control Protocol (TCP)](https://datatracker.ietf.org/doc/html/rfc9293)、[RFC 768 - User Datagram Protocol](https://datatracker.ietf.org/doc/html/rfc768)

tcp 和 udp 校验的数据范围：伪首部 + [tcp|udp] header + date(负载)

如果是 ipv4/[tcp|udp]，伪首部是：

```
                +--------+--------+--------+--------+
                |           Source Address          |
                +--------+--------+--------+--------+
                |         Destination Address       |
                +--------+--------+--------+--------+
                |  zero  |  PTCL  |    TCP Length   |
                +--------+--------+--------+--------+
```

- Source Address: the IPv4 source address in network byte order
- Destination Address: the IPv4 destination address in network byte order
- PTCL：the protocol number from the IP header
- TCP Length: the TCP header length plus the data length in octets (this is not an explicitly transmitted quantity but is computed)

如果是 ipv6/[tcp|udp]，伪首部是：

```
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |                                                               |
   +                                                               +
   |                                                               |
   +                         Source Address                        +
   |                                                               |
   +                                                               +
   |                                                               |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |                                                               |
   +                                                               +
   |                                                               |
   +                      Destination Address                      +
   |                                                               |
   +                                                               +
   |                                                               |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |                   Upper-Layer Packet Length                   |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |                      zero                     |  Next Header  |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

- Upper-Layer Packet Length 是上层头部和数据的长度（例如，TCP 头部加上 TCP 数据）。
- 与 IPv4 不同，当 UDP 数据包由 IPv6 节点生成时，默认行为是 UDP 校验和不是可选的。也就是说，每当生成一个 UDP 数据包时，IPv6 节点必须计算该数据包及其伪头部的 UDP 校验和，并且如果计算结果为零，则必须将其更改为十六进制 FFFF 并放置在 UDP 头部中。IPv6 接收方必须丢弃包含零校验和的 UDP 数据包，并应记录错误。

# checksum 开源的实现

理想的情况下，checksum 最好有一些良好的开源库。开发者无需关心 checksum 的实现细节，直接调用 api 计算和校验 checksum 即可。

但，现实是“残酷”的。有时候，我们不得不自行实现 checksum 过程，这增加了代码的维护负担。

下面是一些 checksum 的开源实现。

| 链接 | 评价 |
| --- | --- |
| [dpdk/app/test/test_cksum.c at main · DPDK/dpdk](https://github.com/DPDK/dpdk/blob/main/app/test/test_cksum.c) | 代码可读性挺好 ^_^ |
|  |  |

# 自行实现一遍 checksum

下面的 checksum 实现，模仿/移植了 dpdk 中 checksum 的实现。

- 我原本是找 AI 帮我实现一个的。但是 Trae 中生成的 checksum 代码不对。改了几版，还是不行。我不得不接管代码。
- 下面代码，仅仅适用小端机器。大端机器如何实现？母鸡。我还没在大端机器上运行过代码。

```
#include <arpa/inet.h>
#include <cstdint>
#include <cstring>
#include <iostream>
#include <netinet/if_ether.h>
#include <netinet/in.h>
#include <netinet/ip.h>
#include <netinet/ip6.h>
#include <netinet/tcp.h>
#include <netinet/udp.h>

static inline uint16_t raw_cksum_reduce(uint32_t cksum) {
  while (cksum >> 16) {
    cksum = (cksum & 0xffff) + (cksum >> 16);
  }
  return (uint16_t)cksum;
}

static inline uint16_t raw_cksum(const void *addr, size_t len) {
  const uint16_t *buf = (const uint16_t *)addr;
  uint32_t cksum = 0;

  while (len > 1) {
    cksum += *buf++;
    len -= 2;
  }

  if (len > 0) {
    cksum += *(const uint8_t *)buf;
  }

  return raw_cksum_reduce(cksum);
}

static inline uint16_t ip4_header_cheraw_cksum_inline(struct iphdr *iph) {
  size_t len = iph->ihl * 4;
  uint16_t cksum = raw_cksum(iph, len);
  return cksum;
}

static inline uint16_t ip4_header_cheraw_cksum(struct iphdr *iph) {
  uint16_t cksum = ip4_header_cheraw_cksum_inline(iph);
  return ~cksum;
}

static inline bool ip4_header_cheraw_cksum_verify(struct iphdr *iph) {
  uint16_t cksum = ip4_header_cheraw_cksum_inline(iph);
  return cksum == 0xFFFF;
}

uint16_t ipv4_udptcp_raw_cksum_inline(struct iphdr *iph, void *transport_hdr) {
  struct ipv4_psd_header {
    uint32_t saddr;
    uint32_t daddr;
    uint8_t zero;
    uint8_t protocol;
    uint16_t len;
  } psd_hdr;

  memset(&psd_hdr, 0, sizeof(psd_hdr));
  psd_hdr.saddr = iph->saddr;
  psd_hdr.daddr = iph->daddr;
  psd_hdr.zero = 0;
  psd_hdr.protocol = iph->protocol;
  uint16_t l4_len = ntohs(iph->tot_len) - iph->ihl * 4;
  psd_hdr.len = htons(l4_len);

  uint16_t cksum = raw_cksum(&psd_hdr, sizeof(psd_hdr));
  cksum += raw_cksum(transport_hdr, l4_len);
  cksum = raw_cksum_reduce(cksum);

  return cksum;
}

uint16_t ipv4_udptcp_raw_cksum(struct iphdr *iph, void *transport_hdr) {
  uint16_t cksum = ipv4_udptcp_raw_cksum_inline(iph, transport_hdr);

  cksum = ~cksum;

  /*
   * Per RFC 768: If the computed cheraw_cksum is zero for UDP,
   * it is transmitted as all ones
   */
  if (cksum == 0 && iph->protocol == IPPROTO_UDP)
    cksum = 0xffff;

  return cksum;
}

uint16_t ipv4_udptcp_raw_cksum_verify(struct iphdr *iph, void *transport_hdr) {
  uint16_t cksum = ipv4_udptcp_raw_cksum_inline(iph, transport_hdr);
  return cksum == 0xFFFF;
}

uint16_t ipv6_udptcp_raw_cksum_inline(struct ip6_hdr *ip6h,
                                      void *transport_hdr) {
  uint32_t cksum = 0;

  /**
   * IPv6 pseudo-header is 320 bits.
   * It contains the source and destination IPv6 addresses,
   * the next header protocol, and the L4 length.
   */

  struct ipv6_psd_header {
    uint32_t len;   /* L4 length. */
    uint32_t proto; /* L4 protocol - top 3 bytes must be zero */
  };

  struct ipv6_psd_header psd_hdr = {};
  psd_hdr.proto = (uint32_t)(ip6h->ip6_nxt << 24); // little endian
  psd_hdr.len = ip6h->ip6_ctlun.ip6_un1.ip6_un1_plen;

  cksum =
      raw_cksum(&ip6h->ip6_src, sizeof(ip6h->ip6_src) + sizeof(ip6h->ip6_dst));
  cksum += raw_cksum(&psd_hdr, sizeof(psd_hdr));

  cksum += raw_cksum(transport_hdr, ntohs(psd_hdr.len));

  return raw_cksum_reduce(cksum);
}

uint16_t ipv6_udptcp_raw_cksum(struct ip6_hdr *ip6h, void *transport_hdr) {
  uint16_t cksum = ipv6_udptcp_raw_cksum_inline(ip6h, transport_hdr);

  cksum = ~cksum;

  /*
   * Per RFC 2460: If the computed checksum is zero for UDP,
   * it is transmitted as all ones
   */
  if (cksum == 0 && ip6h->ip6_nxt == IPPROTO_UDP)
    cksum = 0xffff;

  return cksum;
}

uint16_t ipv6_udptcp_raw_cksum_verify(struct ip6_hdr *ip6h,
                                      void *transport_hdr) {
  uint16_t cksum = ipv6_udptcp_raw_cksum_inline(ip6h, transport_hdr);
  return cksum == 0xFFFF;
}

void test_scapy_ipv4_tcp() {
  /* generated in scapy with Ether()/IP()/TCP() */
  uint8_t test_cksum_ipv4_tcp[] = {
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x08, 0x00, 0x45, 0x00, 0x00, 0x28, 0x00, 0x01, 0x00, 0x00,
      0x40, 0x06, 0x7c, 0xcd, 0x7f, 0x00, 0x00, 0x01, 0x7f, 0x00, 0x00,
      0x01, 0x00, 0x14, 0x00, 0x50, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x50, 0x02, 0x20, 0x00, 0x91, 0x7c, 0x00, 0x00,
  };

  const uint8_t *pkt = (const uint8_t *)test_cksum_ipv4_tcp;
  // size_t pkt_len = sizeof(test_cksum_ipv4_tcp);

  // struct ethhdr *eth = (struct ethhdr *)pkt;
  struct iphdr *iph = (struct iphdr *)(pkt + sizeof(struct ethhdr));
  struct tcphdr *tcph =
      (struct tcphdr *)(pkt + sizeof(struct ethhdr) + iph->ihl * 4);

  uint16_t expected_cksum = tcph->check;
  tcph->check = 0;
  uint16_t calc_cksum = ipv4_udptcp_raw_cksum(iph, tcph);
  bool valid = (calc_cksum == expected_cksum);

  std::cout << "=== Scapy IPv4 TCP Test ===" << std::endl;
  std::cout << "Expected: 0x" << std::hex << ntohs(expected_cksum) << std::dec
            << std::endl;
  std::cout << "Calculated: 0x" << std::hex << ntohs(calc_cksum) << std::dec
            << std::endl;
  std::cout << "Validation: " << (valid ? "PASS" : "FAIL") << std::endl;
  std::cout << std::endl;
}

void test_scapy_ipv6_tcp() {
  /* generated in scapy with Ether()/IPv6()/TCP()) */
  uint8_t test_cksum_ipv6_tcp[] = {
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x08, 0x00, 0x60, 0x00, 0x00, 0x00, 0x00, 0x14, 0x06, 0x40,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00,
      0x14, 0x00, 0x50, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x50, 0x02, 0x20, 0x00, 0x8f, 0x7d, 0x00, 0x00,
  };

  const uint8_t *pkt = (const uint8_t *)test_cksum_ipv6_tcp;
  // struct ethhdr *eth = (struct ethhdr *)pkt;
  struct ip6_hdr *ip6h = (struct ip6_hdr *)(pkt + sizeof(struct ethhdr));
  struct tcphdr *tcph =
      (struct tcphdr *)(pkt + sizeof(struct ethhdr) + sizeof(struct ip6_hdr));

  uint16_t expected_cksum = tcph->check;
  tcph->check = 0;
  uint16_t calc_cksum = ipv6_udptcp_raw_cksum(ip6h, tcph);
  bool valid = (calc_cksum == expected_cksum);

  std::cout << "=== Scapy IPv6 TCP Test ===" << std::endl;
  std::cout << "Expected: 0x" << std::hex << ntohs(expected_cksum) << std::dec
            << std::endl;
  std::cout << "Calculated: 0x" << std::hex << ntohs(calc_cksum) << std::dec
            << std::endl;
  std::cout << "Validation: " << (valid ? "PASS" : "FAIL") << std::endl;
  std::cout << std::endl;
}

void test_scapy_ipv4_udp() {
  /* generated in scapy with Ether()/IP()/UDP()/Raw('x')) */
  uint8_t test_cksum_ipv4_udp[] = {
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x08, 0x00, 0x45, 0x00, 0x00, 0x1d, 0x00, 0x01, 0x00, 0x00,
      0x40, 0x11, 0x7c, 0xcd, 0x7f, 0x00, 0x00, 0x01, 0x7f, 0x00, 0x00,
      0x01, 0x00, 0x35, 0x00, 0x35, 0x00, 0x09, 0x89, 0x6f, 0x78,
  };

  const uint8_t *pkt = (const uint8_t *)test_cksum_ipv4_udp;
  // struct ethhdr *eth = (struct ethhdr *)pkt;
  struct iphdr *iph = (struct iphdr *)(pkt + sizeof(struct ethhdr));
  struct udphdr *udph =
      (struct udphdr *)(pkt + sizeof(struct ethhdr) + iph->ihl * 4);

  uint16_t expected_cksum = udph->check;
  udph->check = 0;
  uint16_t calc_cksum = ipv4_udptcp_raw_cksum(iph, udph);
  bool valid = (calc_cksum == expected_cksum);

  std::cout << "=== Scapy IPv4 UDP Test ===" << std::endl;
  std::cout << "Expected: 0x" << std::hex << ntohs(expected_cksum) << std::dec
            << std::endl;
  std::cout << "Calculated: 0x" << std::hex << ntohs(calc_cksum) << std::dec
            << std::endl;
  std::cout << "Validation: " << (valid ? "PASS" : "FAIL") << std::endl;
  std::cout << std::endl;
}

void test_scapy_ipv6_udp() {
  /* generated in scapy with Ether()/IPv6()/UDP()/Raw('x')) */
  uint8_t test_cksum_ipv6_udp[] = {
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x86, 0xdd, 0x60, 0x00, 0x00, 0x00, 0x00, 0x09, 0x11, 0x40,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00,
      0x35, 0x00, 0x35, 0x00, 0x09, 0x87, 0x70, 0x78,
  };

  const uint8_t *pkt = (const uint8_t *)test_cksum_ipv6_udp;
  // struct ethhdr *eth = (struct ethhdr *)pkt;
  struct ip6_hdr *ip6h = (struct ip6_hdr *)(pkt + sizeof(struct ethhdr));
  struct udphdr *udph =
      (struct udphdr *)(pkt + sizeof(struct ethhdr) + sizeof(struct ip6_hdr));

  uint16_t expected_cksum = udph->check;
  udph->check = 0;
  uint16_t calc_cksum = ipv6_udptcp_raw_cksum(ip6h, udph);
  bool valid = (calc_cksum == expected_cksum);

  std::cout << "=== Scapy IPv6 UDP Test ===" << std::endl;
  std::cout << "Expected: 0x" << std::hex << ntohs(expected_cksum) << std::dec
            << std::endl;
  std::cout << "Calculated: 0x" << std::hex << ntohs(calc_cksum) << std::dec
            << std::endl;
  std::cout << "Validation: " << (valid ? "PASS" : "FAIL") << std::endl;
  std::cout << std::endl;
}

void test_scapy_ipv4_opts_udp() {
  /* generated in scapy with Ether()/IP(options='\x00')/UDP()/Raw('x')) */
  uint8_t test_cksum_ipv4_opts_udp[] = {
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x08, 0x00, 0x46, 0x00, 0x00, 0x21, 0x00, 0x01, 0x00, 0x00, 0x40, 0x11,
      0x7b, 0xc9, 0x7f, 0x00, 0x00, 0x01, 0x7f, 0x00, 0x00, 0x01, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x35, 0x00, 0x35, 0x00, 0x09, 0x89, 0x6f, 0x78,
  };

  const uint8_t *pkt = (const uint8_t *)test_cksum_ipv4_opts_udp;
  // struct ethhdr *eth = (struct ethhdr *)pkt;
  struct iphdr *iph = (struct iphdr *)(pkt + sizeof(struct ethhdr));
  struct udphdr *udph =
      (struct udphdr *)(pkt + sizeof(struct ethhdr) + iph->ihl * 4);

  uint16_t expected_cksum = udph->check;
  udph->check = 0;
  uint16_t calc_cksum = ipv4_udptcp_raw_cksum(iph, udph);
  bool valid = (calc_cksum == expected_cksum);

  std::cout << "=== Scapy IPv4 Options UDP Test ===" << std::endl;
  std::cout << "Expected: 0x" << std::hex << ntohs(expected_cksum) << std::dec
            << std::endl;
  std::cout << "Calculated: 0x" << std::hex << ntohs(calc_cksum) << std::dec
            << std::endl;
  std::cout << "Validation: " << (valid ? "PASS" : "FAIL") << std::endl;
  std::cout << std::endl;
}

int main() {
  std::cout << "Internet Checksum Examples" << std::endl;
  std::cout << "==========================" << std::endl;
  std::cout << std::endl;

  test_scapy_ipv4_tcp();
  test_scapy_ipv6_tcp();
  test_scapy_ipv4_udp();
  test_scapy_ipv6_udp();
  test_scapy_ipv4_opts_udp();

  std::cout << "All tests completed!" << std::endl;

  return 0;
}
```
