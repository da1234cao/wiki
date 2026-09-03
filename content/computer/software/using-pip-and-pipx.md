---
title: "pip与pipx的使用"
date: "2024-11-10 11:54:08"
tags:
  - python
---
# 前言

当我们在 ubuntu24 中执行 pip 命令安装一个程序或依赖时，会有下面的输出提示。

```
root@virtualbox ~ [1]# pip install pycowsay

error: externally-managed-environment

× This environment is externally managed
╰─> To install Python packages system-wide, try apt install
    python3-xyz, where xyz is the package you are trying to
    install.
    
    If you wish to install a non-Debian-packaged Python package,
    create a virtual environment using python3 -m venv path/to/venv.
    Then use path/to/venv/bin/python and path/to/venv/bin/pip. Make
    sure you have python3-full installed.
    
    If you wish to install a non-Debian packaged Python application,
    it may be easiest to use pipx install xyz, which will manage a
    virtual environment for you. Make sure you have pipx installed.
    
    See /usr/share/doc/python3.12/README.venv for more information.

note: If you believe this is a mistake, please contact your Python installation or OS distribution provider. You can override this, at the risk of breaking your Python installation or OS, by passing --break-system-packages.
hint: See PEP 668 for the detailed specification.
```

根据上面输出提示，我翻看了下 [PEP 668](https://peps.python.org/pep-0668/) 。老实说，没有都看明白。有时候，要理解一个做法是错误的可能比较难。但，这并不影响我们遵守正确的做法。根据上面的输出提示，正确的做法是这样的：

- 如果想在系统范围内，安装 xyz。我们可以尝试使用 apt install python3-xyz 。如果存在 python3-xyz，说明这个包是发行版中的一个包，不会破坏系统中包的依赖性。我们可以选择全局安装。
- 如果 xyz 不是发行版中的包，要避免全局安装。可以在 venv 中安装使用。
- 如果 xyz 是一个 应用(命令)，可以使用 pipx ，它会将命令放在自己的 venv 中执行。

下面我们去官网看看，pip 和 pipx 到底是什么。

# 名词解释

## pip

[pip](https://pip.pypa.io/en/stable/) 是Python的软件包安装程序。你可以使用它安装Python包。

它的使用可以参考官方文档，或者问下chatgpt。

```
# install a package
python -m pip install sampleproject
```

## pipx

[pipx](https://pipx.pypa.io/stable/) 可以在独立环境中安装和运行Python应用程序。

```
apt install pipx
pipx ensurepath
sudo pipx ensurepath --global # optional to allow pipx actions with --global argument
# Consider adding shell completions for pipx. Run 'pipx completions' for instructions.

pipx run cowsay -t mooo
  ____
| mooo |
  ====
    \
     \
       ^__^
       (oo)\_______
       (__)\       )\/\
           ||----w |
           ||     ||
```

# 一些比较

## pip vs pipx

参考：[Comparison to Other Tools - pipx](https://pipx.pypa.io/stable/comparisons/) 、[python - What is the difference between pipx and using pip install inside a virtual environment? - Stack Overflow](https://stackoverflow.com/questions/78229687/what-is-the-difference-between-pipx-and-using-pip-install-inside-a-virtual-envir)

- 在一个全局的环境中安装一个 application，推荐使用 pipx。
- 安装库，或者在 venv 中安装任何东西，推荐使用 pip。

## "pip install" and "python -m pip install"

参考：[What's the difference between "pip install" and "python -m pip install"? - Stack Overflow](https://stackoverflow.com/questions/25749621/whats-the-difference-between-pip-install-and-python-m-pip-install) 、[Why you should use `python -m pip`](https://snarky.ca/why-you-should-use-python-m-pip/)

- 推荐一律使用 `python -m pip iinstall` ，这能保证 pip 对应的 python 版本，是我们想要的 python 版本。
- 在 venv 中，它们都一样。

# 一些其他问题

## 使用不同的python版本

`venv` 中的 python 版本，是创建 venv 的 python 版本。想要有不同 python 版本的 venv，首先是需要安装不同版本的python。

如果是以前，我可能会选择使用 [python版本管理 - pyenv - da1234cao](python-version-management-with-pyenv.md) 。

但是在国内的网络环境下，我似乎更喜欢先安装不同版本的 python ，然后再创建需要的 venv 。

### ubuntu 中安装不同版本的python

参考：[apt - Installing python: who is deadsnakes and why should I trust them? - Ask Ubuntu](https://askubuntu.com/questions/1398568/installing-python-who-is-deadsnakes-and-why-should-i-trust-them)

```
sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt install python3.9
```

### rocky 中安装不同版本的python

默认的仓库中有这些包，可以直接使用包管理器安装：[Python3.12 Download (DEB, RPM)](https://pkgs.org/download/python3.12)

```
root@localhost ~# cat /etc/os-release
NAME="Rocky Linux"
VERSION="8.10 (Green Obsidian)"
...

上次元数据过期检查：1:57:21 前，执行于 2024年11月10日 星期日 09时50分58秒。
已安装的软件包
名称         : python3.12
版本         : 3.12.6
...
...
来自仓库     : appstream
概况         : Version 3.12 of the Python interpreter
```


This content is licensed under a [Creative Commons Attribution 4.0 International license.](https://creativecommons.org/licenses/by/4.0/)
