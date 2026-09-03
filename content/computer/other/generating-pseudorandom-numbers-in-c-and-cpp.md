---
title: "C/C++ 中伪随机数的生成"
date: "2024-12-14 16:02:35"
tags:
  - c
  - c++
---
# 前言

有时，在写测试代码的时候，需要生成随机数。

但是软件层面，无法实现正在的随机数。计算机密码学中，随机数是一个基础，可见： [Dan Boneh的密码学](https://www.bilibili.com/video/BV1yx411T78i/)。

本文简单归总下，日常如何在C/C++中生成伪随机数。

# 在C中生成伪随机数

相关链接：[Generating Random Numbers in a Range in C - GeeksforGeeks](https://www.geeksforgeeks.org/generating-random-number-range-c/)、[rand和srand_srand 和rand-CSDN博客](https://blog.csdn.net/sinat_38816924/article/details/82826941)

## rand() 函数

相关链接：[rand(3): pseudo-random number generator - Linux man page](https://linux.die.net/man/3/rand)

下面代码随机生成 `[min,max)` 的随机数。使用 srand(time(NULL)) 初始化随机数生成器种子。这将确保每次运行程序时都能产生不同的随机序列。time(NULL) 返回当前时间，以秒为单位，作为随机数生成器的种子。

但是我通常不使用 rand() 函数生成随机数。因为这个函数不是可重入函数。它使用的隐藏状态在每次调用时都会被修改。其实，从函数的调用接口即可看出，srand() 可能是通过一个全局变量将初始化种子传递给 rand() 函数的。

那 rand() 函数是否线程安全？这个从接口和文档看不出来，因为这个传递种子的变量可能使用 `__thread` 修饰了。不清楚是否线程安全，不用就好，或者去看它的源码。

另外需要注意得是，rand() 生成的随机数范围, 在0和RAN_DMAX之间。我测了下，我当前机器的 RAN_DMAX 为 2147483647(7FFF FFFF, INT_MAX)

```
#include <stdio.h>
#include <stdlib.h>
#include <time.h>

void random_generator(int min, int max, int *result, int size) {
  // Generate a random number in the range [min,max)
  srand(time(NULL));
  for (int i = 0; i < size; i++) {
    result[i] = rand() % (max - min) + min;
  }
}

int main(int argc, char *argv) {
  int size = 50;
  int array[size];
  random_generator(100, 200, array, size);

  printf("RAND_MAX: %d\n", RAND_MAX);
  for (int i = 0; i < size; i++) {
    printf("%d ", array[i]);
  }
}
```

## rand_r() 函数

rand() 函数想要可重入，得把隐藏状态作为参数传递。rand_r() 是可重入函数。

```
#include <stdio.h>
#include <stdlib.h>
#include <threads.h>
#include <time.h>

void random_generator(int min, int max, int *result, int size) {
  // Generate a random number in the range [min,max)
  unsigned int seed = time(NULL);
  for (int i = 0; i < size; i++) {
    result[i] = rand_r(&seed) % (max - min) + min;
  }
}

int main(int argc, char *argv) {
  int size = 50;
  int array[size];
  random_generator(100, 200, array, size);

  for (int i = 0; i < size; i++) {
    printf("%d ", array[i]);
  }
}
```

# 在C++中生成伪随机数

相关链接：[伪随机数生成 - cppreference.com](https://zh.cppreference.com/w/cpp/numeric/random) 、[How to generate a random number in C++? - Stack Overflow](https://stackoverflow.com/questions/13445688/how-to-generate-a-random-number-in-c)

C++ 中生成伪随机数似乎看着复杂些。我没有完全明白。但是，因为以前学过点《概率论与数理统计》，所以大概能猜出来这些接口调用顺序的逻辑。

为了便于看明白后面的代码，我们简单了解下概率论的几个基本概念，参考：[概率分布与泊松分布、正态分布 — 源代码](https://lrita.github.io/2018/12/28/poisson-normal-distribution/)

- 随机变量：样本空间中的随机值。
- 概率分布：随机变量的概率性质，每个变量出现的概率，可以使用一个函数表达。

下面的代码估计也是做的这两步：

- 生成随机变量：
`std::random_device rd;` 是构造了一个对象。
`rd()` 调用这个对象的 `()` 运算符，返回一个随机数。
`std::mt19937 gn(rd());` 使用随机数初始化一个随机数生成器。
`std::random_device` 和 `std::mt19937` 都是随机数生成器，为啥要多来一步？母鸡。可能`std::mt19937` 比 `std::random_device` 好吧。
- 概率分布
`std::uniform_int_distribution<T> dis(min, max);` 构造了一个概率分布的对象。
`dis(gn);` 我猜测 `std::uniform_int_distribution` 的 `operator()` 函数，本质是将 `std::mt19937` 生成的随机数喂给一个数学函数。而这个数学函数的输出，满足均匀分布。

```
#include <iostream>
#include <random>
#include <vector>

template <typename T>
void random_generator(T min, T max, std::vector<T> &result) {
  // Generate a random number in the range [min,max)
  std::random_device rd;
  std::mt19937 gn(rd());
  std::uniform_int_distribution<T> dis(min, max);

  for (int i = 0; i < result.size(); i++) {
    result[i] = dis(gn);
  }
}

int main(int argc, char *argv[]) {
  std::vector<int> result(50);
  random_generator(0, 100, result);

  for (const int &value : result) {
    std::cout << value << " ";
  }
}
```


This content is licensed under a [Creative Commons Attribution 4.0 International license.](https://creativecommons.org/licenses/by/4.0/)
