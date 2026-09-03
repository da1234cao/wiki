---
title: "[trex篇] trex 的流量模板配置"
date: "2025-04-15 22:10:33"
tags:
  - network
---
# 前言

上一节，我们跟 trex 混了一个脸熟：[\[trex篇\] trex的hello world 使用 – da1234cao](trex-hello-world.md)

当时我们使用下面命令生成流量。

```
./t-rex-64 -f cap2/dns.yaml -c 1 -m 1 -d 10000000
```

其中：

- **-f <yaml file>**：指定要使用的流量 YAML 配置文件。这是有状态模式的必选项。
- **-c <num>**：每对接口对使用的线程数。
- **-m <num>**：速率乘数。TRex 将每个模板的 CPS 速率乘以 num。
- **-d <num>**：测试的持续时间（以秒为单位）。

**本文主要介绍这个 YAML 流量配置文件内容。这个配置文件内容，既决定了流量的内容，也决定了流量的模型。**

# 流量配置文件

## 流量配置文件的基本内容

以咱们的 `cap2/dns.yaml` 为例。

```
- duration : 10.0
  generator :  
          distribution : "seq"
          clients_start : "16.0.0.1"
          clients_end   : "16.0.1.255"
          servers_start : "48.0.0.1"
          servers_end   : "48.0.0.255"
          clients_per_gb : 201
          min_clients    : 101
          dual_port_mask : "1.0.0.0" 
          tcp_aging      : 1
          udp_aging      : 1
  cap_info : 
     - name: cap2/dns.pcap
       cps : 1.0
       ipg : 10000
       rtt : 10000
       w   : 1
```

其中的 duration 为测试过程中的流量持续时间。它可以被命令行参数中的 -d 参数覆盖。

## 流量的内容

TRex 模拟客户端和服务器。如上面的配置，trex 使用 `dns.pcap` 的数据包作为模板，替换数据包的 client_ip、client_port 和 server_ip，server_port 将保持不变。

- distribution：seq 表示数据包的ip是顺序变化。也可以使用random，表示随机变化。
- clients_start 和 clients_end ：客户端的ip范围。
- servers_start 和 servers_end：服务端的ip范围。
- clients_per_gb 和 min_clients ：Deprecated. not used
- dual_port_mask ：每对网卡的偏移量。比如trex中配置使用了四个网卡 -- 两对网卡。
那么，第一对网卡使用ip范围是： **C** (16.0.0.1-16.0.0.128 ) <-> **S**( 48.0.0.1 - 48.0.0.128)
第二对网卡使用ip范围是：**C** (17.0.0.129-17.0.0.255 ) <-> **S**( 49.0.0.129 - 49.0.0.255)
总的 client 和 server 数 都还是 255 个，没有变化。
这样的好处是，不同的网卡对使用不同的网段，便于路由。
- tcp_aging 和 udp_aging ：用来延长套接字的释放时间。
因为如果套接字利用率非常高的话，可能会导致不同流，使用相同的套接字。
具体，我也没经验。一般来说，保持默认值即可。

通过上面这些参数组合，我们可以知道流量中，每个数据包三层及以上的组成了：IP层通过上面配置生成，IP层以上的内容继续使用pcap数据包的中的内容。(注， client_port 在使用一个客户端的情况下变)

至于mac层是如何填充？这个由 `trex_cfg.yaml` 配置文件决定。TODO。

## 流量的模型

- name：模板 pcap 文件的名称。可以是相对于 t-rex-64 镜像目录的相对路径，也可以是绝对路径。pcap 文件应只包含一个流。
- cps：每秒连接数。如果命令行使用了 -m参数，则实际的连接数 为 `m*cps`
- ipg: 数据包间间隔（以微秒为单位）
- rtt: 应设置为与 ipg（微秒）相同的值?
- w：等于1是默认值。如果w=2，感觉是，流中的每个包都发两次？不清楚这个参数。

所以，总的流量大小： `PPS =`  `m * (cps ** flow_pkts*)`。

注：假定，pcap文件只包含一个流的。cps表示每秒建立的连接数。每个连接就是一个流。 每个连接中四元组(client_ip/client_port/server_ip/server_port)都是相同的。其中 `flow_pkts` 表每个流中有多少个包。因为我们假定了，pcap文件只包含一个流，所以 `flow_pkts` 也可以表示pcap文件包报的个数。

这个图形象的表示了流量大小(来自官网)：


# 最后

更多示例和参数解释见官方文档： [trex_basic_usage](https://trex-tgn.cisco.com/trex/doc/trex_manual.html#_basic_usage) 。

emm，具体细节我不是很清楚。因为日常使用的时候，没复杂的用法。
