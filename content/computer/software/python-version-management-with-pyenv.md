---
title: "python版本管理 -- pyenv"
date: "2024-08-27 19:33:09"
tags:
  - python
---
## 前言

python平时用的少，主要是用来写一点脚本，测试用。

python是不向前兼容的，挺好。但是，有时候，需要在不同python版本之间切换有点麻烦。

使用python有两个地方的版本需要注意。其一是，不同python版本之前的切换。其二是，相同python版本，依赖包不同版本之前的切换。

我找了找，感觉pyenv最好用。

## 想要不同版本的python -- pyenv

参考连接：

- [pyenv/pyenv: Simple Python version management](https://github.com/pyenv/pyenv)
- [Python多环境管理神器（pyenv） - doublexi - 博客园](https://www.cnblogs.com/doublexi/p/15786911.html)

### 安装 pyenv

```
curl https://pyenv.run | bash

WARNING: seems you still have not added 'pyenv' to the load path.

# Load pyenv automatically by appending
# the following to 
# ~/.bash_profile if it exists, otherwise ~/.profile (for login shells)
# and ~/.bashrc (for interactive shells) :

export PYENV_ROOT="$HOME/.pyenv"
[[ -d $PYENV_ROOT/bin ]] && export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init -)"

# Restart your shell for the changes to take effect.

# Load pyenv-virtualenv automatically by adding
# the following to ~/.bashrc:

eval "$(pyenv virtualenv-init -)"
```

### 配置bashrc

```
# 根据上面的输出提示，如果使用的是bash，将下内容加入~/.bashrc
# 然后重新加载bash
export PYENV_ROOT="$HOME/.pyenv"
[[ -d $PYENV_ROOT/bin ]] && export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init -)"
eval "$(pyenv virtualenv-init -)"
```

### pyenv使用

```
pyenv -h

# 列出可安装的python版本
pyenv install --list

# 安装指定的3.6.8版本
## 不要禁用ipv6,要不然后面使用可能会遇到问题
## https://github.com/pyenv/pyenv/issues/430
## PYTHON_CONFIGURE_OPTS="--disable-ipv6" proxychains pyenv install 3.6.8
## https://github.com/pyenv/pyenv/issues/2141
## CC=clang PYTHON_CONFIGURE_OPTS="--disable-ipv6" proxychains pyenv install 3.6.8
## 安装一些编译python需要的依赖库
## apt install -y git openssl libssl-dev libbz2-dev libreadline-dev libsqlite3-dev libffi-dev liblzma-dev
## dnf install libsqlite3x-devel libffi-devel bzip2-devel ncurses-devel readline-devel
CC=clang pyenv install 3.6.8

# 列出当前所有可用的python版本
pyenv versions
* system (set by /root/.pyenv/version)
  3.6.8

# 切换python版本
pyenv shell 3.6.8

# 创建虚拟环境
pyenv help virtualenv
pyenv virtualenv 3.6.8 python36

# 列出当前的虚拟环境
pyenv virtualenvs
  3.6.8/envs/python36 (created from /root/.pyenv/versions/3.6.8)
  python36 (created from /root/.pyenv/versions/3.6.8)

## 可以看到pip版本也切换了
pip --version
pip 18.1 from /root/.pyenv/versions/3.6.8/envs/python36/lib/python3.6/site-packages/pip (python 3.6)

## 安装包
pip install scapy

## 查看包的位置
pip show scapy
Name: scapy
Version: 2.5.0
Summary: Scapy: interactive packet manipulation tool
Home-page: https://scapy.net
Author: Philippe BIONDI
Author-email: guillaume@valadon.net
License: GPL-2.0-only
Location: /root/.pyenv/versions/3.6.8/envs/python36/lib/python3.6/site-packages
Requires: 
Required-by: 

# 激活虚拟环境
pyenv activate python36

# 退出虚拟环境
pyenv deactivate

# 删除虚拟环境
pyenv virtualenv-delete python36
```

## 更多阅读

分不清这些。pyenv已经挺好用的了。

- [12. 虚拟环境和包 — Python 3.12.5 文档](https://docs.python.org/zh-cn/3/tutorial/venv.html)
- [virtualenv](https://virtualenv.pypa.io/en/latest/)
- [Pipenv: Python Dev Workflow for Humans — pipenv 2023.11.16.dev0 documentation](https://pipenv.pypa.io/en/latest/)
- [python - What is the difference between venv, pyvenv, pyenv, virtualenv, virtualenvwrapper, pipenv, etc? - Stack Overflow](https://stackoverflow.com/questions/41573587/what-is-the-difference-between-venv-pyvenv-pyenv-virtualenv-virtualenvwrappe)
- [pipx](https://pipx.pypa.io/stable/)、[pipx - 为 Python 应用构建独立的安装与运行环境 - 少数派](https://sspai.com/post/82002)
- [python - How to open a virtual environment created with pyenv with VSCode editor? - Stack Overflow](https://stackoverflow.com/questions/72954047/how-to-open-a-virtual-environment-created-with-pyenv-with-vscode-editor)
