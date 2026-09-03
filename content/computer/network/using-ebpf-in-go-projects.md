---
title: "GO项目中使用ebpf"
date: "2025-06-08 09:05:13"
tags:
  - ebpf
  - network
---
# 前言

有时候 ebpf 程序不好写。因为想要写好ebpf，需要对内核中的处理流程有些了解。

照葫芦画瓢是程序员的强项。可是有时候没有合适的葫芦参考，不好画瓢。比如，在 nftables 的 output 链 上，挂载 hook 函数，提取四元组。这并不好做，至少我还没写出来。写 ebpf 是一个痛苦的过程：程序可能会加载到内核失败；加载成功了，运行不及预期时，疏于对内核的了解，我们也不知道为什么。

**本文假定我们有写过C ebpf 的经历。在 go 中使用ebpf 的过程，非常类似于 [libbpf/libbpf-bootstrap](https://github.com/libbpf/libbpf-bootstrap)**。**建议写写 C ebpf，再来写go ebpf 会比较顺**。**本文的内容比较简单，不涉及具体的 ebpf 功能实现，主要关注如何在go项目中，使用ebpf**。

**在go项目中使用ebpf难点有二。其一是如何编译ebpf程序。其二是如何加载、附加、移除 ebpf 程序，如何操作map**。

# hello world

本节参考自：

- [ebpf/docs/ebpf/guides/getting-started.md at main · cilium/ebpf](https://github.com/cilium/ebpf/blob/main/docs/ebpf/guides/getting-started.md)
- [bpf2go原理和使用介绍 | Spoock](https://blog.spoock.com/2023/09/02/eBPF-bpf2go/)

本节的完整示例代码：[ebpf-tutorial/go-hello at laboratory · da1234cao/ebpf-tutorial](https://github.com/da1234cao/ebpf-tutorial/tree/laboratory/go-hello)

因为工作上一直没写过go，所以不咋看go语言的一些写法规则。好在现在AI比较给力，边写边问，写出来的程序可能不好，倒也能跑。本文会偏向于关注go，而不关注ebpf。

## go 项目的创建与构建过程

首先时项目的构建。`go mod init` 在项目根目录生成 `go.mod` 文件，定义模块路径和 Go 版本。模块路径（如 `github.com/da1234cao/ebpf-tutorial/go-hello`）需全局唯一，通常与代码仓库 URL 一致，确保其他项目可正确导入。

```
# go help mod
go mod init github.com/da1234cao/ebpf-tutorial/go-hello
```

构建过程，AI 帮我写了一个 Makefile，还蛮好用的。不用手写Makefile，真是太好了。

```
PROJECT_DIR := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))

VMLINUX_H := $(PROJECT_DIR)/vmlinux.h
VMLINUX_BTF := /sys/kernel/btf/vmlinux
BPFTOOL := sudo bpftool
CLANG := clang
LLC := llc

HAS_VMLINUX_BTF := $(wildcard $(VMLINUX_BTF))

help:
	@echo "Available targets:"
	@echo "  generate         - Run go generate to generate eBPF code"
	@echo "  build            - Build the Go application"
	@echo "  gen-vmlinux      - Generate vmlinux.h from kernel BTF"
	@echo "  clean            - Clean generated files"

gen-vmlinux:
ifeq ($(HAS_VMLINUX_BTF),)
	$(error "/sys/kernel/btf/vmlinux not found, please ensure CONFIG_DEBUG_INFO_BTF=y and bpftool is installed")
endif
	$(BPFTOOL) btf dump file $(VMLINUX_BTF) format c > $(VMLINUX_H)
	@echo "Generated vmlinux.h at $(VMLINUX_H)"

$(VMLINUX_H): gen-vmlinux

generate: $(VMLINUX_H)
	go generate ./...

build: generate
	go build -o hello .

clean:
	rm -f $(VMLINUX_H)
	rm -f *.go *.ebpf.go
```

`go generate`：代码自动化生成工具。通过扫描源代码中的 `//go:generate` 特殊注释，执行注释后指定的命令（如脚本、代码生成工具），在编译前动态生成代码。

`go build`：源代码编译工具。将 Go 源码及依赖编译为可执行文件或静态库，自动解析 import 依赖关系。

## ebpf 的编译

[bpf2go](https://pkg.go.dev/github.com/cilium/ebpf/cmd/bpf2go) 将 C 源文件编译成 eBPF 字节码，然后生成一个包含 eBPF 的 Go 文件。目标是避免在运行时从磁盘加载 eBPF，并尽量减少与 eBPF 程序交互所需的手动工作。它借鉴了 `bpftool gen skeleton` 的设计。

使用 go generate 调用程序：

```
//go:generate go run github.com/cilium/ebpf/cmd/bpf2go -tags linux -target native counter counter.c -- -I./
```

- **`//go:generate`** : Go 语言的预处理指令，用于声明代码生成命令。需显式运行 `go generate` 触发，不会在编译/测试时自动执行。
- `go run github.com/cilium/ebpf/cmd/bpf2go` : 运行 cilium/ebpf 项目提供的 bpf2go 工具，将 C 语言编写的 eBPF 程序转换为 Go 代码。
- `-tags linux` : 指定构建标签（Build Tags），限制代码仅在 linux 平台生成。
- `-target native` : 指定目标平台为当前机器的 CPU 架构（如 amd64、arm64）。例如 native 架构会生成 counter_bpfel.go（小端序）。
- `counter` : 生成 Go 结构体的前缀名。例如 eBPF 程序会封装为 counterObjects 结构体。
- `counter.c` : 待编译的 eBPF C 源码文件，包含内核态 eBPF 程序逻辑。
- `--` ：分隔符。后面的参数传递给底层编译器（如 Clang）
- ​​`-I./` ​​：添加头文件搜索路径（当前目录），解决本地头文件引用问题

## go中ebpf程序的加载与map的使用

首先是运行在内核中的ebpf的C 代码。

注意这里的 `//go:build ignore` 。用于指示编译器在构建过程中完全忽略当前文件。必须位于文件​​顶部​​，且在 package 声明​​之前。 因为我将 c 文件 和go文件放在同一个目录里面，需要需要这个。 `//` 和 `go` 之间不能有空格，为了避免被 clang-format 自动加入空格，这行我禁用了clang-format。

```
// clang-format off
// (1)!
//go:build ignore
// clang-format on

#include "vmlinux.h"

#include <bpf/bpf_helpers.h> // (2)!

struct {
  __uint(type, BPF_MAP_TYPE_ARRAY); // (3)!
  __type(key, __u32);
  __type(value, __u64);
  __uint(max_entries, 1);
} pkt_count SEC(".maps"); // (4)!

// count_packets atomically increases a packet counter on every invocation.
SEC("xdp") // (5)!
int count_packets() {
  __u32 key = 0;                                        // (6)!
  __u64 *count = bpf_map_lookup_elem(&pkt_count, &key); // (7)!
  if (count) {                                          // (8)!
    __sync_fetch_and_add(count, 1);                     // (9)!
  }

  return XDP_PASS; // (10)!
}

char __license[] SEC("license") = "Dual MIT/GPL"; // (11)!

// }
```

然后是在go中，加载ebpf程序，并使用map。

```
//go:build linux

package main

import (
	"flag"
	"log"
	"net"
	"os"
	"os/signal"
	"time"

	"github.com/cilium/ebpf/link"
	"github.com/cilium/ebpf/rlimit"
)

//go:generate go run github.com/cilium/ebpf/cmd/bpf2go -tags linux -target native counter counter.c -- -I./

func main() {
	var ifname string
	flag.StringVar(&ifname, "interface", "", "interface to attach to")
	flag.Parse()

	if ifname == "" {
		log.Fatal("The - interface parameter must be specified")
	}

	// Remove resource limits for kernels <5.11.
	if err := rlimit.RemoveMemlock(); err != nil { // (1)!
		log.Fatal("Removing memlock:", err)
	}

	// Load the compiled eBPF ELF and load it into the kernel.
	var objs counterObjects // (2)!
	if err := loadCounterObjects(&objs, nil); err != nil {
		log.Fatal("Loading eBPF objects:", err)
	}
	defer objs.Close() // (3)!

	iface, err := net.InterfaceByName(ifname)
	if err != nil {
		log.Fatalf("Getting interface %s: %s", ifname, err)
	}

	// Attach count_packets to the network interface.
	link, err := link.AttachXDP(link.XDPOptions{ // (4)!
		Program:   objs.CountPackets,
		Interface: iface.Index,
	})
	if err != nil {
		log.Fatal("Attaching XDP:", err)
	}
	defer link.Close() // (5)!

	log.Printf("Counting incoming packets on %s..", ifname)

	// Periodically fetch the packet counter from PktCount,
	// exit the program when interrupted.
	tick := time.Tick(time.Second)
	stop := make(chan os.Signal, 5)
	signal.Notify(stop, os.Interrupt)
	for {
		select {
		case <-tick:
			var count uint64
			err := objs.PktCount.Lookup(uint32(0), &count) // (6)!
			if err != nil {
				log.Fatal("Map lookup:", err)
			}
			log.Printf("Received %d packets", count)
		case <-stop:
			log.Print("Received signal, exiting..")
			return
		}
	}
}
```

## 项目的编译与运行

```
root@ubuntu24-1 ~/w/s/e/go-hello (laboratory)# make build
sudo bpftool btf dump file /sys/kernel/btf/vmlinux format c > /root/work/self/ebpf-tutorial/go-hello//vmlinux.h
Generated vmlinux.h at /root/work/self/ebpf-tutorial/go-hello//vmlinux.h
go generate ./...
go build -o hello .

root@ubuntu24-1 ~/w/s/e/go-hello (laboratory)# ./hello --interface=ens33
2025/06/08 08:57:37 Counting incoming packets on ens33..
2025/06/08 08:57:38 Received 12 packets
2025/06/08 08:57:39 Received 28 packets
2025/06/08 08:57:40 Received 35 packets
2025/06/08 08:57:41 Received 40 packets
^C2025/06/08 08:57:41 Received signal, exiting..
```

# 最后

知道 go 中大概如何使用ebpf即可。具体的细节，可以工作中打磨。平时用不到的话，学了也没啥用。

上面这个示例还是比较简单的。所以，我尝试了一个稍微复杂点的。这个示例，可以跟踪TCP的生命周期。代码见：[ebpf-tutorial/tracers](https://github.com/da1234cao/ebpf-tutorial/tree/laboratory/tracers)
