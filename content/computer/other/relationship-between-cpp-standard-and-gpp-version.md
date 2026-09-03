---
title: "C++标准和g++版本之间的关系"
date: "2026-02-12 19:50:09"
tags:
  - c++
---
# 前言

最近，在编译 [CS144/minnow](https://github.com/CS144/minnow) 的时候，遇到了一个报错。

```
cs144/util/debug.hh:3:10: fatal error: format: No such file or directory
    3 | #include <format>
```

在 AI 的帮助下，这个问题非常好解决。切换下 gcc 版本即可。

```
# 当前的 g++ 版本
g++ --version
g++ (GCC) 11.5.0 20240719 (Red Hat 11.5.0-11)

# 切换下 g++ 版本
scl enable gcc-toolset-14 bash
g++ --version
g++ (GCC) 14.2.1 20250110 (Red Hat 14.2.1-7)
```

为什么，切换下 g++ 版本就行了呢？

这是本文要探讨的问题。

# C++标准和g++版本之间的关系

好记性不如烂笔头，以前记录的内容，翻出来看看：[C++中__cplusplus宏介绍_c++编译阶段输出宏的值](https://blog.csdn.net/sinat_38816924/article/details/119577090)

> C++是一门编程语言，它有其[标准](https://isocpp.org/std)。而[编译C++代码的编译器](https://isocpp.org/get-started)有多种，如常见的[Gnu Compiler Collection](http://gcc.gnu.org/)、[Clang](http://clang.llvm.org/get_started.html)、[Visual C++ 2017 Community](https://www.visualstudio.com/vs/cplusplus/)。不同的C++编译器需要遵守/支持C++的标准。

我当前的环境下，g++11 和 g++14 , 虽然它们的版本不同，但是它们默认使用的 C++标准是相同的。

```
# 11版本的g++, 默认的C++标准是17
root@localhost ~/w/s/cs144 (main)# g++ --version
g++ (GCC) 11.5.0 20240719 (Red Hat 11.5.0-11)
...

root@localhost ~/w/s/cs144 (main)# g++ -dM -E -x c++  /dev/null | grep -F __cplusplus
#define __cplusplus 201703L

# 14版本的g++, 默认的C++标准还是是17
root@localhost ~/w/s/c/build (main)# scl enable gcc-toolset-14 fish
root@localhost ~/w/s/c/build (main)# g++ --version
g++ (GCC) 14.2.1 20250110 (Red Hat 14.2.1-7)
...

root@localhost ~/w/s/c/build (main)# g++ -dM -E -x c++  /dev/null | grep -F __cplusplus
#define __cplusplus 201703L
```

上面代码的编译过程中，我们显示的指定了 C++的标准版本。

```
set (CMAKE_CXX_STANDARD 23)
```

那为什么，升级了 g++后，就能编译过了呢？

答案在这篇链接中 [c++ - Format no such file or directory - Stack Overflow](https://stackoverflow.com/questions/65083544/format-no-such-file-or-directory)

1. [Formatting library (since C++20) - cppreference.com](https://en.cppreference.com/w/cpp/utility/format.html) ，是 C++20 标准引入的。所以，不管我们的编译器是什么版本，C++的标准，必须至少是 C++20。
2. [C++ compiler support - cppreference.com](https://en.cppreference.com/w/cpp/compiler_support.html) ，GCC libstdc++ 13 开始 支持的 P0645R10 (format) 特性。（libstdc++是 C++库的实现，format library 是实现在这里面。所以，我们的 g++版本至少得是 13。

所以，现在我们可以得出结论：

- g++ 版本 和 C++标准版本之间，不存在明确的映射关系。g++在不断的升级，不断的去实现 C++中的标准。
- 一个 C++标准的版本，由多个特性组成。g++在不断升级中，不断的去实现不同的特性。
- 代码使用新特性的时候，既要满足 C++的标准要求，又要 g++的版本支持该特性。

# 长久切换 GCC 的版本

```
# rocky9
# vim ~/.bashrc
source /opt/rh/gcc-toolset-14/enable
```

GCC 的功能拆分在不同的模块中，有时候，我们可能需要下面的模块，按需安装即可。

```
root@localhost ~/w/s/cs144 (main) [1]# dnf search gcc-toolset-14
Last metadata expiration check: 1:46:37 ago on Sat Feb 14 09:14:04 2026.
========================= Name & Summary Matched: gcc-toolset-14 =========================
gcc-toolset-14.x86_64 : Package that installs gcc-toolset-14
gcc-toolset-14-runtime.x86_64 : Package that handles gcc-toolset-14 Software Collection.
============================== Name Matched: gcc-toolset-14 ==============================
gcc-toolset-14-annobin-annocheck.x86_64 : A tool for checking the security hardening
                                        : status of binaries
gcc-toolset-14-annobin-docs.noarch : Documentation and shell scripts for use with annobin
gcc-toolset-14-annobin-plugin-gcc.x86_64 : annobin gcc plugin
gcc-toolset-14-binutils.x86_64 : A GNU collection of binary utilities
gcc-toolset-14-binutils-devel.i686 : BFD and opcodes static and dynamic libraries and
                                   : header files
gcc-toolset-14-binutils-devel.x86_64 : BFD and opcodes static and dynamic libraries and
                                     : header files
gcc-toolset-14-binutils-gold.x86_64 : The GOLD linker, a faster alternative to the BFD
                                    : linker
gcc-toolset-14-binutils-gprofng.x86_64 : Next Generating code profiling tool
gcc-toolset-14-dwz.x86_64 : DWARF optimization and duplicate removal tool
gcc-toolset-14-gcc.x86_64 : GCC version 14
gcc-toolset-14-gcc-c++.x86_64 : C++ support for GCC version 14
gcc-toolset-14-gcc-gfortran.x86_64 : Fortran support for GCC 14
gcc-toolset-14-gcc-plugin-annobin.x86_64 : The annobin plugin for gcc, built by the
                                         : installed version of gcc
gcc-toolset-14-gcc-plugin-devel.i686 : Support for compiling GCC plugins
gcc-toolset-14-gcc-plugin-devel.x86_64 : Support for compiling GCC plugins
gcc-toolset-14-libasan-devel.x86_64 : The Address Sanitizer static library
gcc-toolset-14-libasan-devel.i686 : The Address Sanitizer static library
gcc-toolset-14-libatomic-devel.i686 : The GNU Atomic static library
gcc-toolset-14-libatomic-devel.x86_64 : The GNU Atomic static library
gcc-toolset-14-libgccjit.i686 : Library for embedding GCC inside programs and libraries
gcc-toolset-14-libgccjit.x86_64 : Library for embedding GCC inside programs and libraries
gcc-toolset-14-libgccjit-devel.i686 : Support for embedding GCC inside programs and
                                    : libraries
gcc-toolset-14-libgccjit-devel.x86_64 : Support for embedding GCC inside programs and
                                      : libraries
gcc-toolset-14-libitm-devel.i686 : The GNU Transactional Memory support
gcc-toolset-14-libitm-devel.x86_64 : The GNU Transactional Memory support
gcc-toolset-14-liblsan-devel.x86_64 : The Leak Sanitizer static library
gcc-toolset-14-libquadmath-devel.i686 : GCC 14 __float128 support
gcc-toolset-14-libquadmath-devel.x86_64 : GCC 14 __float128 support
gcc-toolset-14-libstdc++-devel.i686 : Header files and libraries for C++ development
gcc-toolset-14-libstdc++-devel.x86_64 : Header files and libraries for C++ development
gcc-toolset-14-libstdc++-docs.x86_64 : Documentation for the GNU standard C++ library
gcc-toolset-14-libtsan-devel.x86_64 : The Thread Sanitizer static library
gcc-toolset-14-libubsan-devel.x86_64 : The Undefined Behavior Sanitizer static library
gcc-toolset-14-libubsan-devel.i686 : The Undefined Behavior Sanitizer static library
gcc-toolset-14-offload-nvptx.x86_64 : Offloading compiler to NVPTX
root@localhost ~/w/s/cs144 (main)# 
```
