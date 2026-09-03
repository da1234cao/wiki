---
title: "Buildah 简介"
date: "2024-11-02 15:43:27"
tags:
  - docker
  - software
---
# 前言

日常工作中，我喜欢 [在 Docker 容器中运行 CI/CD 作业](https://gitlab.cn/docs/jh/ci/docker/using_docker_images.html) 。这免不了要构建项目需要的编译环境的镜像。这通常使用采用 [在Docker 构建 Docker 镜像](https://gitlab.cn/docs/jh/ci/docker/using_docker_build.html) ，其过程是在 `docker:stable` 镜像中，调用 [docker buildx build](https://docs.docker.com/reference/cli/docker/buildx/build/)   命令构建镜像。

最近在同事的推荐下，尝试使用 [Buildah](https://buildah.io/) 构建镜像。**可以认为 `buildah` 是 `docker buildx build` 的替代品。**

本文参考 [buildah tutorial](https://github.com/containers/buildah/tree/main/docs/tutorials) ，记录下 `buildah` 的使用过程。详细内容，自行参考官方文档。

# buildah的基本使用

## buildah的安装

参考：[buildah/install.md at main · containers/buildah](https://github.com/containers/buildah/blob/main/install.md)

我这里选择直接在本机上安装。

```
sudo apt-get -y install buildah

buildah --help
A tool that facilitates building OCI images
......
```

当然，也可以采用 docker-in-docker 的方式，在 [buildah/buildah](https://hub.docker.com/r/buildah/buildah) 镜像中使用 `buildah` 命令。

## 使用buildah构建镜像

参考：[buildah/docs/tutorials/01-intro.md at main · containers/buildah](https://github.com/containers/buildah/blob/main/docs/tutorials/01-intro.md)

把 `buildah` 当作 `docker build` 使用就好。还是通过习惯的 [Dockerfile reference](https://docs.docker.com/reference/dockerfile/) 构建我们的镜像。

这是一个简单的 Dockerfile 。

```
FROM rockylinux:9.3
CMD echo "Hello, World!"
```

构建镜像，并运行。

```
# 构建镜像
buildah build -f Dockerfile -t buildah-test:latest .

# 查看镜像
root@vultr ~/tmp# buildah images
REPOSITORY                     TAG      IMAGE ID       CREATED          SIZE
localhost/buildah-test         latest   123ae5b9fccf   56 seconds ago   181 MB
docker.io/library/rockylinux   9.3      9cc24f05f309   11 months ago    181 MB

# 但是使用docker是无法看到这个镜像的，因为存储位置不同
## 将该镜像复制到 Docker 守护进程存储其镜像的位置
buildah push localhost/buildah-test:latest docker-daemon:localhost/buildah-test:latest

# 使用docker命令查看这个镜像
root@vultr ~/tmp# docker images
REPOSITORY                  TAG       IMAGE ID       CREATED          SIZE
localhost/buildah-test      latest    123ae5b9fccf   10 minutes ago   176MB

# 使用这个镜像，创建容器
root@vultr ~/tmp# docker run localhost/buildah-test:latest
Hello, World!
root@vultr ~/tmp# docker ps -a
CONTAINER ID   IMAGE                              COMMAND                   CREATED         STATUS                     PORTS                                                     NAMES
09460f36ead0   localhost/buildah-test:latest      "/bin/sh -c 'echo \"H…"   7 seconds ago   Exited (0) 6 seconds ago                                                             frosty_curie
docker rm frosty_curie
docker image rm localhost/buildah-test
```

那能否直接通过 `buildah` 创建容器，而不是复制镜像到 `docker` 中使用。

```
# 当然可以。不够需要先创建容器，然后再进入容器
root@vultr ~/tmp# buildah run localhost/buildah-test:latest bash
Error: reading build container "localhost/buildah-test:latest": container not known

root@vultr ~/tmp [125]# buildah from localhost/buildah-test:latest
buildah-test-working-container

root@vultr ~/tmp# buildah containers
CONTAINER ID  BUILDER  IMAGE ID     IMAGE NAME                       CONTAINER NAME
5dc1bc69920c     *     123ae5b9fccf localhost/buildah-test:latest    buildah-test-working-container

root@vultr ~/tmp [125]# buildah run buildah-test-working-container bash
[root@5dc1bc69920c /]# 

root@vultr ~/tmp# buildah rm buildah-test-working-container
root@vultr ~/tmp# buildah rmi localhost/buildah-test
```

# 最后

简单了解了 `buildah` 后，日常使用中如果有其他问题，直接问 `chatgpt` 即可。

有个问题是，为什么我们尝试使用 `buildah` ? 因为在 docker-in-docker 中构建镜像时 ，会有报错。当然报错可以解决：[gitlab ci - Error during connect: Post "http://docker:2375/v1.24/auth": dial tcp: lookup docker on 172.30.0.2:53: no such host - Stack Overflow](https://stackoverflow.com/questions/78259953/error-during-connect-post-http-docker2375-v1-24-auth-dial-tcp-lookup-doc) 、[Error during connect: Post http://docker:2375/v1.40/auth: dial tcp: lookup docker on x.x.x.x:53: no such host - GitLab CI/CD - GitLab Forum](https://forum.gitlab.com/t/error-during-connect-post-http-docker-2375-v1-40-auth-dial-tcp-lookup-docker-on-x-x-x-x-no-such-host/99937)

所以啊，或许应该避免 docker-in-docker ，直接在主机上构建镜像即可。

或者可以尝试使用 `buildah` 。


This content is licensed under a [Creative Commons Attribution 4.0 International license.](https://creativecommons.org/licenses/by/4.0/)
