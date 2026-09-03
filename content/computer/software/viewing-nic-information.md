---
title: "网卡信息查看"
date: "2024-11-10 21:55:00"
tags:
  - linux
---
# 摘要

在网络相关的开发过程中，接入一台机器的时候，我们需要知道：

- 当前有哪些网卡
- 每个网卡的信息：这些网卡是哪家的产品。使用了什么驱动。传输速率10G/100G等信息。

| 问题 | 命令 |
| --- | --- |
| 当前系统整体的网卡信息 | `ip a` |
| 一个网卡使用的驱动; 一个网卡对应的PCI地址。 | `ethtool -i <devname>` |
| 所有网卡名和PCI地址的对应 | `lshw -c network -businfo` |
| 网卡的厂商；网卡的传输速率等； | `lshw -c network` |
| 一个网卡所在的numa | `lspci -vvv -s <slot>` |

# 一些和网络相关的命令

## ip

```
# 查看系统总共有哪些网卡
ip a
```

```
# 查看指定网卡的信息
root@localhost ~# ip address show enp1s0f0np0
6: enp1s0f0np0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP group default qlen 1000
    link/ether 10:70:fd:2b:df:68 brd ff:ff:ff:ff:ff:ff
```

问了下 `chatgpt` ，上面每个参数的含义如下。

- **`6`**：网络接口的索引号，用于标识系统中的网络接口。每个网卡在系统中都有一个唯一的索引号。
- **`enp1s0f0np0`**：网卡的名称，系统自动分配。以 `en` 开头表示以太网接口，后面的部分表示接口在主板上的物理位置，例如 `p1s0f0` 表示插在主板第一个插槽上的第一个功能网卡。
- **`<BROADCAST,MULTICAST,UP,LOWER_UP>`** 这些是接口的标志，表示接口的当前状态：
`BROADCAST`: 该接口支持广播（通常适用于以太网设备）。
`MULTICAST`: 该接口支持多播（Multicast）。
`UP`: 接口已被激活（即已启用）。
`LOWER_UP`: 表示接口的物理链路状态为连接状态（接口已连接到网络）（这个挺有用的。登陆一个机器后，可以快速知道哪些网卡是接了线的）。
- **`mtu 1500`**：MTU（Maximum Transmission Unit），表示该接口的最大传输单元，单位为字节。`1500` 是标准的以太网 MTU。
- **`qdisc mq`**：qdisc（队列调度器）用于管理数据包的发送顺序。`mq` 表示多队列（multi-queue），一般适用于多核 CPU 系统，以提高网络吞吐量。
- **`state UP`**：表示接口的操作状态，此处 `UP` 意味着该接口已启用并处于工作状态。如果是 `DOWN` 则表示接口被禁用。
- **`group default`**：该接口所在的设备组，通常是 `default`，可以在网络管理中将设备分组进行不同的管理和限制。
- **`qlen 1000`**：队列长度，表示该接口的发送队列最大允许有 1000 个数据包待发送。若队列满了，新来的数据包可能会被丢弃。

## nmcli

通常使用 `nmcli` 来配网络信息，倒不怎么用来查看网卡网卡信息。

配置静态 `IP` 过程可参考： [https://www.da1234cao.space/linux-静态ip的配置/](configuring-a-static-ip-on-linux.md)

## lshw

`lshw`（List Hardware）是一个用于查看硬件详细信息的命令，可以显示系统中硬件的详细信息，包括 CPU、内存、存储设备、网络接口等。以下是使用 `lshw` 查看整体网络信息及特定网卡信息的方法。

```
# 查看整体的网络信息
lshw -C network
```

`lshw` 不支持查看指定的网卡信息，我们使用 `grep` 过滤下

```
root@localhost ~# lshw -C network | grep -C 9 enp1s0f0np0
  *-network:0               
       description: Ethernet interface
       product: MT42822 BlueField-2 integrated ConnectX-6 Dx network controller
       vendor: Mellanox Technologies
       physical id: 0
       bus info: pci@0000:01:00.0
       logical name: enp1s0f0np0
       logical name: /dev/fb0
       version: 01
       serial: 10:70:fd:2b:df:68
       capacity: 40Gbit/s
       width: 64 bits
       clock: 33MHz
       capabilities: pciexpress vpd msix pm bus_master cap_list rom ethernet physical fibre 1000bt-fd 1000bx-fd 10000bt-fd 10000bx-fd 25000bx-fd 40000bx-fd autonegotiation fb
       configuration: autonegotiation=on broadcast=yes depth=32 driver=mlx5_core driverversion=5.14.0-427.42.1.el9_4.aarch64 duplex=full firmware=24.41.1000 (MT_0000000375) latency=0 link=yes mode=1024x768 multicast=yes port=fibre visual=truecolor xres=1024 yres=768
       resources: iomemory:8000-7fff iomemory:8000-7fff irq:26 memory:80002000000-80003ffffff memory:80004800000-80004ffffff memory:e7700000-e77fffff memory:80007000000-80008ffffff
```

这个命令挺好，能看到详细的网卡信息。让 `chatgpt` 告诉我们每个参数的含义。

- **`-network:0`** 表示这是一个网络设备的条目（`` 表示这是一个硬件组件的集合），`0` 是该设备的实例编号。
- **`description`**: 网络设备的类型，此处为 `Ethernet interface`，即以太网接口。
- **`product`**: 网络设备的产品型号，表示这是一款 `MT42822 BlueField-2 integrated ConnectX-6 Dx` 网络控制器。
- **`vendor`**: 网络控制器的制造商，此处为 `Mellanox Technologies`。
- **`physical id`**: 网络设备的物理标识符。此处是 `0`，指示该设备的物理位置或编号。
- **`bus info`**: 设备连接的总线信息。此处表示设备通过 PCI 总线连接，并且位于 `0000:01:00.0` 地址。
- **`logical name`**: 操作系统中分配给设备的逻辑名称，此处为 `enp1s0f0np0`。这是一个基于接口位置的网络接口命名规则。
- **`logical name`**: 另一个逻辑名称，`/dev/fb0` 表示设备也可以用作帧缓冲设备，通常用于显示输出（尽管在这里显示了网络设备信息，可能是某些配置问题）。
- **`version`**: 网络设备的版本号，表示设备的硬件版本为 `01`。
- **`serial`**: 设备的唯一标识符，表示设备的 MAC 地址，即 `10:70:fd:2b:df:68`。
- **`capacity`**: 设备支持的最大传输速率，表示该网络设备支持最高 `40Gbit/s` 的传输速率。
- **`width`**: 设备的总线宽度，表示网络控制器的数据通道宽度是 `64 bits`。
- **`clock`**: 设备使用的时钟频率，表示 `33MHz` 时钟频率。
- **`capabilities`**: 设备支持的功能列表：
`pciexpress`: 支持 PCI Express 接口。
`vpd`: 支持可编程设备标识。
`msix`: 支持 MSI-X 中断。
`pm`: 支持电源管理。
`bus_master`: 支持总线主控制功能。
`ethernet`: 支持以太网。
`fibre`: 支持光纤连接。
其他支持的速率包括：`1000bt-fd`（千兆以太网全双工），`10000bt-fd`（10G 全双工），`25000bx-fd`（25G 全双工），`40000bx-fd`（40G 全双工）。
`autonegotiation`: 支持自动协商。
`fb`: 支持帧缓冲（可能是特定硬件功能）。
- **`configuration`**: 设备的当前配置：
`autonegotiation=on`: 自动协商启用。
`broadcast=yes`: 启用广播。
`depth=32`: 设备深度，可能指的是网络缓冲区的深度或其他硬件特性。
`driver=mlx5_core`: 使用的驱动程序为 `mlx5_core`。
`driverversion=5.14.0-427.42.1.el9_4.aarch64`: 驱动版本号。
`duplex=full`: 完全双工模式。
`firmware=24.41.1000`: 固件版本。
`latency=0`: 延迟为零。
`link=yes`: 链路已连接。
`mode=1024x768`: 设备配置的显示模式。
`multicast=yes`: 支持多播。
`port=fibre`: 使用光纤端口。
`visual=truecolor`: 使用真彩色。
`xres=1024 yres=768`: 分辨率为 `1024x768`（显示模式相关）。
- **`resources`**: 设备使用的内存和其他资源：
`iomemory:8000-7fff`: 分配的 I/O 内存范围。
`irq:26`: 分配的中断号为 `26`。
`memory:80002000000-80003ffffff`: 分配的物理内存范围。
其他内存和资源的分配范围。

这些参数提供了关于网络设备的详细硬件信息，包括其规格、连接信息、驱动和固件版本、支持的功能和配置等。

## lspci

`lspci` 是一个用于列出所有 PCI 总线上连接的设备的命令。它可以用来查看包括网卡在内的各种硬件设备。`lspci` 显示的信息包括设备类型、厂商、设备 ID 和更多硬件信息。

```
# 查看所有网卡信息
lspci | grep -i ethernet

# 查看网卡名对应的PCI地址
# lshw -C network | grep -C 9 enp1s0f0np0
root@localhost ~# ethtool -i enp1s0f0np0
driver: mlx5_core
version: 5.14.0-427.42.1.el9_4.aarch64
firmware-version: 24.41.1000 (MT_0000000375)
expansion-rom-version: 
bus-info: 0000:01:00.0
supports-statistics: yes
supports-test: yes
supports-eeprom-access: no
supports-register-dump: no
supports-priv-flags: yes
```

```
# 查看指定网卡的详细信息
root@localhost ~ [1]# lspci -vvv -s 01:00.0
01:00.0 Ethernet controller: Mellanox Technologies MT42822 BlueField-2 integrated ConnectX-6 Dx network controller (rev 01)
	Subsystem: Mellanox Technologies Device 0003
	Control: I/O- Mem+ BusMaster+ SpecCycle- MemWINV- VGASnoop- ParErr+ Stepping- SERR+ FastB2B- DisINTx+
	Status: Cap+ 66MHz- UDF- FastB2B- ParErr- DEVSEL=fast >TAbort- <TAbort- <MAbort- >SERR- <PERR- INTx-
	Latency: 0, Cache Line Size: 32 bytes
	Interrupt: pin A routed to IRQ 26
	NUMA node: 0
	Region 0: Memory at 80002000000 (64-bit, prefetchable) [size=32M]
	Region 2: Memory at 80004800000 (64-bit, prefetchable) [size=8M]
	Expansion ROM at e7700000 [disabled] [size=1M]
	Capabilities: [60] Express (v2) Endpoint, MSI 00
		DevCap:	MaxPayload 512 bytes, PhantFunc 0, Latency L0s unlimited, L1 unlimited
			ExtTag+ AttnBtn- AttnInd- PwrInd- RBE+ FLReset+ SlotPowerLimit 25.000W
		DevCtl:	CorrErr+ NonFatalErr+ FatalErr+ UnsupReq+
			RlxdOrd+ ExtTag+ PhantFunc- AuxPwr- NoSnoop+ FLReset-
			MaxPayload 512 bytes, MaxReadReq 512 bytes
		DevSta:	CorrErr- NonFatalErr- FatalErr- UnsupReq- AuxPwr- TransPend-
		LnkCap:	Port #0, Speed 16GT/s, Width x16, ASPM not supported
			ClockPM- Surprise- LLActRep- BwNot- ASPMOptComp+
		LnkCtl:	ASPM Disabled; RCB 128 bytes, Disabled- CommClk-
			ExtSynch- ClockPM- AutWidDis- BWInt- AutBWInt-
		LnkSta:	Speed 16GT/s (ok), Width x16 (ok)
			TrErr- Train- SlotClk+ DLActive- BWMgmt- ABWMgmt-
		DevCap2: Completion Timeout: Range ABC, TimeoutDis+ NROPrPrP- LTR-
			 10BitTagComp+ 10BitTagReq- OBFF Not Supported, ExtFmt- EETLPPrefix-
			 EmergencyPowerReduction Not Supported, EmergencyPowerReductionInit-
			 FRS- TPHComp- ExtTPHComp-
			 AtomicOpsCap: 32bit- 64bit- 128bitCAS-
		DevCtl2: Completion Timeout: 50us to 50ms, TimeoutDis- LTR- OBFF Disabled,
			 AtomicOpsCtl: ReqEn+
		LnkCap2: Supported Link Speeds: 2.5-16GT/s, Crosslink- Retimer+ 2Retimers+ DRS-
		LnkCtl2: Target Link Speed: 16GT/s, EnterCompliance- SpeedDis-
			 Transmit Margin: Normal Operating Range, EnterModifiedCompliance- ComplianceSOS-
			 Compliance De-emphasis: -6dB
		LnkSta2: Current De-emphasis Level: -6dB, EqualizationComplete+ EqualizationPhase1+
			 EqualizationPhase2+ EqualizationPhase3+ LinkEqualizationRequest-
			 Retimer- 2Retimers- CrosslinkRes: unsupported
	Capabilities: [48] Vital Product Data
		Product Name: BlueField-2 DPU 100GbE Dual-Port QSFP56, Crypto and Secure Boot Enabled, 16GB on-board DDR, 1GbE OOB management, Tall Bracket                                                         
		Read-only fields:
			[PN] Part number: MBF2M516A-CECOT          
			[EC] Engineering changes: B5
			[V2] Vendor specific: MBF2M516A-CECOT          
			[SN] Serial number: MT2206X07512   
			[V3] Vendor specific: 520c948e04afec1180001070fd2bdf68
			[VA] Vendor specific: MLX:MN=MLNX:CSKU=V2:UUID=V3:PCI=V0:MODL=BF2M516A       
			[V0] Vendor specific: PCIeGen4 x16 
			[VU] Vendor specific: MT2206X07512MLNXS0D0F0 
			[RV] Reserved: checksum good, 1 byte(s) reserved
		End
	Capabilities: [9c] MSI-X: Enable+ Count=64 Masked-
		Vector table: BAR=0 offset=00002000
		PBA: BAR=0 offset=00003000
	Capabilities: [c0] Vendor Specific Information: Len=18 <?>
	Capabilities: [40] Power Management version 3
		Flags: PMEClk- DSI- D1- D2- AuxCurrent=375mA PME(D0-,D1-,D2-,D3hot-,D3cold+)
		Status: D0 NoSoftRst+ PME-Enable- DSel=0 DScale=0 PME-
	Capabilities: [100 v1] Advanced Error Reporting
		UESta:	DLP- SDES- TLP- FCP- CmpltTO- CmpltAbrt- UnxCmplt- RxOF- MalfTLP- ECRC- UnsupReq- ACSViol-
		UEMsk:	DLP- SDES- TLP- FCP- CmpltTO- CmpltAbrt- UnxCmplt- RxOF- MalfTLP- ECRC- UnsupReq+ ACSViol-
		UESvrt:	DLP+ SDES- TLP- FCP+ CmpltTO- CmpltAbrt- UnxCmplt- RxOF+ MalfTLP+ ECRC- UnsupReq- ACSViol-
		CESta:	RxErr- BadTLP- BadDLLP- Rollover- Timeout- AdvNonFatalErr-
		CEMsk:	RxErr- BadTLP- BadDLLP- Rollover- Timeout- AdvNonFatalErr+
		AERCap:	First Error Pointer: 08, ECRCGenCap+ ECRCGenEn- ECRCChkCap+ ECRCChkEn-
			MultHdrRecCap- MultHdrRecEn- TLPPfxPres- HdrLogCap-
		HeaderLog: 00000000 00000000 00000000 00000000
	Capabilities: [150 v1] Alternative Routing-ID Interpretation (ARI)
		ARICap:	MFVC- ACS-, Next Function: 1
		ARICtl:	MFVC- ACS-, Function Group: 0
	Capabilities: [180 v1] Single Root I/O Virtualization (SR-IOV)
		IOVCap:	Migration-, Interrupt Message Number: 000
		IOVCtl:	Enable- Migration- Interrupt- MSE- ARIHierarchy+
		IOVSta:	Migration-
		Initial VFs: 16, Total VFs: 16, Number of VFs: 0, Function Dependency Link: 00
		VF offset: 3, stride: 1, Device ID: 101e
		Supported Page Size: 000007ff, System Page Size: 00000001
		Region 0: Memory at 0000080007000000 (64-bit, prefetchable)
		VF Migration: offset: 00000000, BIR: 0
	Capabilities: [1c0 v1] Secondary PCI Express
		LnkCtl3: LnkEquIntrruptEn- PerformEqu-
		LaneErrStat: 0
	Capabilities: [230 v1] Access Control Services
		ACSCap:	SrcValid- TransBlk- ReqRedir- CmpltRedir- UpstreamFwd- EgressCtrl- DirectTrans-
		ACSCtl:	SrcValid- TransBlk- ReqRedir- CmpltRedir- UpstreamFwd- EgressCtrl- DirectTrans-
	Capabilities: [320 v1] Lane Margining at the Receiver <?>
	Capabilities: [370 v1] Physical Layer 16.0 GT/s <?>
	Capabilities: [420 v1] Data Link Feature <?>
	Kernel driver in use: mlx5_core
	Kernel modules: mlx5_core
```

这段输出是使用 `lspci -vvv -s 01:00.0` 命令获取的，详细显示了 PCI 设备的信息，特别是关于 Mellanox MT42822 BlueField-2 集成的 ConnectX-6 Dx 网络控制器（网卡）的内容。以下是主要部分的解释：

1. **设备信息**：
**PCI 地址**：`01:00.0` 表示该设备的 PCI 地址。
**设备类型**：`Ethernet controller`，即该设备为以太网控制器。
**设备型号**：`Mellanox Technologies MT42822 BlueField-2 integrated ConnectX-6 Dx network controller (rev 01)`，表示这是一款 Mellanox 的网络控制器，型号为 MT42822，支持 BlueField-2 和 ConnectX-6 Dx。
**子系统**：`Mellanox Technologies Device 0003`，表示该设备的子系统信息。
2. **控制和状态**：
**Control**：显示了设备的控制标志，表示设备支持哪些功能。例如 `I/O- Mem+ BusMaster+`，表示该设备支持内存映射和总线主控等。
**Status**：显示设备的状态，如 `Cap+` 表示支持扩展功能，`66MHz-` 表示不支持 66 MHz 总线时钟。
**Latency**：设备延迟为 0，表示设备响应速度较快。
**Interrupt**：`pin A routed to IRQ 26` 表示该设备使用的中断线路为 26。
**NUMA node**：`0`，表示该设备连接到 NUMA 节点 0。
3. **内存区域**：
**Region 0** 和 **Region 2** 表示该设备映射的内存区域。它们提供了设备所需的内存空间，`size=32M` 和 `size=8M` 表示这些内存区域的大小。
**Expansion ROM**：`e7700000 [disabled] [size=1M]`，表示该设备的扩展 ROM 区域被禁用。
4. **功能扩展**：
**PCI Express (v2) Endpoint**：该设备支持 PCIe 2.0。
**Link capabilities**：`Port #0, Speed 16GT/s, Width x16` 表示该设备支持 16 GT/s 的传输速率和 16 通道宽度。
**Link status**：`Speed 16GT/s (ok), Width x16 (ok)`，表示当前链接速率和宽度正常。
5. **错误和状态监控**：
**Advanced Error Reporting**：显示了设备的错误报告功能，标明支持哪些错误检测和处理能力，如 `ECRCGenCap+`（生成 ECRC 的能力）和 `ECRCChkCap+`（检测 ECRC 的能力）。
**Power Management**：设备支持电源管理，可以进入不同的功耗模式，如 `D0 NoSoftRst+` 表示设备处于工作状态，没有软件重置。
6. **驱动和内核模块**：
**Kernel driver in use**：`mlx5_core`，表示该设备使用的内核驱动是 `mlx5_core`，这是 Mellanox 网络设备的官方驱动。
**Kernel modules**：`mlx5_core`，表示该驱动模块也被加载到内核中。

总的来说，这段输出详细列出了该 Mellanox 网络控制器的硬件、连接特性、错误报告、内存区域以及驱动信息。

## ethtool

`ethtool` 是一个用于显示和修改以太网设备配置的命令行工具。它可以帮助你获取网络接口的详细信息、修改接口的设置、启用或禁用某些功能等。它通常用于调试网络接口、查看链路状态、调整速度和双工模式等。

```
# 查看网卡使用的驱动信息
root@localhost ~# ethtool -i enp1s0f0np0
driver: mlx5_core
version: 5.14.0-427.42.1.el9_4.aarch64
firmware-version: 24.41.1000 (MT_0000000375)
expansion-rom-version: 
bus-info: 0000:01:00.0
supports-statistics: yes
supports-test: yes
supports-eeprom-access: no
supports-register-dump: 

# 查看指定网卡的详细信息
ethtool enp1s0f0np0
```
