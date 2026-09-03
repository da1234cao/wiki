---
title: "[trex篇] Trex Platform 配置文件"
date: "2025-04-22 19:25:26"
tags:
  - network
---
# 前言

在 [\[trex篇\] trex的hello world 使用 – da1234cao](trex-hello-world.md) 中，我们了解的trex的基本启动流程。

trex 启动依赖两个配置文件。

- 第一个配置文件是 Traffic YAML，它被用来描述我们的流量模型是什么样的： [\[trex篇\] trex 的流量模板配置 – da1234cao](trex-traffic-template-configuration.md)
- 第二个配置文件是 Platform YAML，它被用来描述 Trex 的行为。

注 ：本文内容截取自 [TRex](https://trex-tgn.cisco.com/trex/doc/trex_manual.html#_platform_yaml_cfg_argument) 。详细内容见官方链接。

# Trex Platform 配置文件

我们可以使用 `./dpdk_setup_ports.py -i` 命令，交互式的生成一个基本的配置文件。

之后根据需要，修改这个配置文件即可。

## 基础的配置

```
     - port_limit    : 2    #mandatory 
       version       : 2    #mandatory  
       interfaces    : ['03:00.0', '03:00.1']   #mandatory 
       #dpdk_devargs : ['txq_inline_min=1','txq_inline_max=700'] # optional devargs 
       #ext_dpdk_opt: ['--vdev=net_vdev_netvsc0,iface=eth1', '--vdev=net_vdev_netvsc1,iface=eth2']  
       #limit_memory    : 1024 # optional  
       #rx_desc         : 1024 # optional  
       #tx_desc         : 1024 # optional  
       c               : 4 # optional  
       port_bandwidth_gb : 10 # optional 
       port_info       :  # set eh mac addr  mandatory
            - default_gw : 1.1.1.1   # port 0  
              dest_mac   : '00:00:00:01:00:00' # Either default_gw or dest_mac is mandatory 11
              src_mac    : '00:00:00:02:00:00' # optional 
              ip         : 2.2.2.2 # optional 
              vlan       : 15 # optional 14
            - dest_mac   : '00:00:00:03:00:00'  # port  1
              src_mac    : '00:00:00:04:00:00'
            - dest_mac   : '00:00:00:05:00:00'  # port 2
              src_mac    : '00:00:00:06:00:00'
            - dest_mac   :   [0x0,0x0,0x0,0x7,0x0,0x01] # port 3 
              src_mac    :   [0x0,0x0,0x0,0x8,0x0,0x02]
```

- `limit_memory` ：限制使用的数据包内存数量。（作为 -m 参数传递给 dpdk）（单位是MB）
- `port_bandwidth_gb` ：每个接口的带宽（以 Gbs 为单位）。在这个例子中，我们有 10Gbs 的接口。对于虚拟机，请输入 1。用于调整 TRex 分配的内存量。
- 当未指定 `dest_mac` 的时候，通过 ARP 查询 `default_gw` 对应的mac地址。
`src_mac` ：发送数据包时使用的源 MAC 地址。如果未指定，将使用端口的 MAC 地址。
`ip` : 是发送端口的ip。
`vlan` ：该端口上的所有流量都将带有此 VLAN 标签发送。

## **Platform section configuration**

这部分可选。它用于调整性能并将核心分配到正确的 NUMA 。

```
- version       : 2
  interfaces    : ["03:00.0","03:00.1"]
  port_limit    : 2
....
  platform :                                                     
        master_thread_id  : 0                                   
        latency_thread_id : 5                                    
        dual_if   :                                             
             - socket   : 0                                      
               threads  : [1,2,3,4]                              
```

- `master_thread_id` ： trex 主线程所在核。
- `latency_thread_id` : 计算延迟线程所在核。
- `dual_if`部分定义了接口对的信息（根据“interfaces”列表中的顺序）
所在的槽；流量线程使用的核。
