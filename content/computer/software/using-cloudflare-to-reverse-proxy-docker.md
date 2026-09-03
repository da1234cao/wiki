---
title: "使用Cloudflare反向代理docker"
date: "2024-09-23 21:59:47"
tags:
  - docker
  - software
---
参考：[cmliu/CF-Workers-docker.io: 这个项目是一个基于 Cloudflare Workers 的 Docker 镜像代理工具。它能够中转对 Docker 官方镜像仓库的请求，解决一些访问限制和加速访问的问题。](https://github.com/cmliu/CF-Workers-docker.io?tab=readme-ov-file)

镜像地址为：`docker.da1234cao.space`

```
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["https://docker.da1234cao.space"]
}
EOF
sudo systemctl daemon-reload
sudo systemctl restart docker
```
