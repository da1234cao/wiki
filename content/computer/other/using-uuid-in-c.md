---
title: "c语言中使用uuid"
date: "2024-12-07 11:39:15"
tags:
  - c
---
# 前言

[UUID(Universally Unique Identifier)](https://zh.wikipedia.org/wiki/%E9%80%9A%E7%94%A8%E5%94%AF%E4%B8%80%E8%AF%86%E5%88%AB%E7%A0%81) 是一个128位标识符。

前段时间，隔壁组要求我这边上传的数据包含uuid，并且是 uuidv7 版本。在 C 语言中，生成 uuid 比较常见的库是 [libuuid(3)](https://linux.die.net/man/3/libuuid) ，这个库支持uuidv1 和 uuidv4，不支持生成 uuidv7。网上找了下，也没看见比较知名的 生成 uuidv7 的 C 库。这玩意，我也不想自己实现。得，两边商量下，用uuidv4 。

下面简单介绍下，在C中，uuid 的使用。

# uuid的基本使用

主要是uuidv4的使用。

## uuid 介绍

来源：[通用唯一识别码 - 维基百科，自由的百科全书](https://zh.wikipedia.org/wiki/%E9%80%9A%E7%94%A8%E5%94%AF%E4%B8%80%E8%AF%86%E5%88%AB%E7%A0%81)

通用唯一识别码（英语：Universally Unique Identifier，缩写：UUID）是用于计算机体系中以识别信息的一个128位标识符。

在其规范的文本表示中，UUID 的 16 个 8 位字节表示为 32 个十六进制数字，由连字符 '-' 分隔成五组显示。例如：`123e4567-e89b-12d3-a456-426655440000` 。通用的表示方法是 `xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx` 。`M` 表示 UUID 版本，占 4 个 bit 。`N` 表示UUID 变体，占 1到3个bit。

## libuuid的简单使用

这年头有 chatgpt，需要使用的时候，找它抄个答案就行。 libuuid 的 API 总共也没几个。比较常见的功能是，生成一个uuid -- 将这个uuid转换成字符串 -- 从字符串中读取uuid。下面是一个示例。

```
#include <stdio.h>
#include <uuid/uuid.h>

int main(int argc, char *argv[]) {
  {
    uuid_t uuid;
    char uuid_str[37];
    int type;
    uuid_generate(uuid);
    uuid_unparse(uuid, uuid_str);
    type = uuid_type(uuid);
    printf("uuid: %s; type is:%d\n", uuid_str, type);
  }

  {
    uuid_t uuid;
    char uuid_str[37];
    int type;
    uuid_generate_time(uuid);
    uuid_unparse(uuid, uuid_str);
    type = uuid_type(uuid);
    printf("uuid: %s; type is:%d\n", uuid_str, type);
  }
}
```

运行下输出如下。

```
uuid: 6111b17f-e2fe-4f86-a57d-91a01fd8ba96; type is:4
uuid: 9c254a6c-b441-11ef-8ce2-080027be71f8; type is:1
```

# 生成 uuidv7

如果有天不得不在 C 中 生成 uuidv7。那没办法，只好硬上了。

需要去阅读 下 [RFC 9562: Universally Unique IDentifiers (UUIDs)](https://www.rfc-editor.org/rfc/rfc9562.html#variant_field) ，然后从一些C++ uuid开源库中抄作业，比如 [boostorg/uuid: Boost.org uuid module](https://github.com/boostorg/uuid) 。

如果不是特别重要的地方，时间又比较着急，可以先随便找一个对付对付：[UUIDv7 in 33 languages](https://antonz.org/uuidv7/#c) 。

我是不想去看这玩意的内部实现。
