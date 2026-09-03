---
title: "Vagrant 使用"
date: "2024-11-03 10:44:57"
tags:
  - linux
  - software
---
# 前言

当我们需要一个隔离的文件系统时，我们会使用 `docker`。当我们需要一个包含内核的测试环境时，我们可能会使用 `virtualbox` 之类的软件安装下虚拟机。

最近我在 [Progressive VPP Tutorial -- Setting up your environment](https://fd.io/docs/vpp/v2101/gettingstarted/progressivevpp/settingupenvironment) 中看到了 [Vagrant](https://www.vagrantup.com/) 。它可以用来简单快速的创建虚拟化环境。有些意思，遂了解了解。

# Vagrant的基本使用

参考：[Quick Start | Vagrant | HashiCorp Developer](https://developer.hashicorp.com/vagrant/tutorials/getting-started) 、[保姆级教程：Vagrant 从入门到超神玩法-CSDN博客](https://blog.csdn.net/m0_50546016/article/details/119176009)

## 安装

参考： [Install Vagrant | Vagrant | HashiCorp Developer](https://developer.hashicorp.com/vagrant/docs/installation)

### 安装virtualbox

相关链接：[如何在 Debian 12 上逐步安装 VirtualBox](https://www.linuxtechi.com/how-to-install-virtualbox-on-debian/) 、[Linux_Downloads – Oracle VirtualBox — Linux_Downloads – Oracle VirtualBox](https://www.virtualbox.org/wiki/Linux_Downloads) 、[How to Install VirtualBox 7.1 on Ubuntu 24.04 LTS](https://linuxiac.com/how-to-install-virtualbox-on-ubuntu-24-04-lts/)

```
sudo apt install curl wget gnupg2 lsb-release -y
curl -fsSL <https://www.virtualbox.org/download/oracle_vbox_2016.asc|sudo> gpg --dearmor -o /etc/apt/trusted.gpg.d/vbox.gpg
curl -fsSL <https://www.virtualbox.org/download/oracle_vbox.asc|sudo> gpg --dearmor -o /etc/apt/trusted.gpg.d/oracle_vbox.gpg
 
echo "deb [arch=amd64] <http://download.virtualbox.org/virtualbox/debian> $(lsb_release -cs) contrib" | sudo tee /etc/apt/sources.list.d/virtualbox.list
 
sudo apt update
# sudo apt install linux-headers-$(uname -r) dkms -y
sudo apt install virtualbox-7.0 -y
```

### 安装vagrant

```
wget -O- <https://apt.releases.hashicorp.com/gpg> | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] <https://apt.releases.hashicorp.com> $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install vagrant

vagrant --version
Vagrant 2.4.1
```

## 初始化项目

与从头构建虚拟机(这将是一个缓慢而乏味的过程)不同，Vagrant 使用一个基本镜像快速克隆一个虚拟机。这些基本镜像在 Vagrant 中称为“ box”。

这里我们指定box为 `hashicorp/bionic64` ，也就是 Ubuntu 18.04 。具体使用哪个box，可以在这里查找： [HashiCorp's Vagrant Cloud box catalog](https://vagrantcloud.com/boxes/search)

```
vagrant init hashicorp/bionic64
==> vagrant: A new version of Vagrant is available: 2.4.2 (installed version: 2.4.1)!
==> vagrant: To upgrade visit: <https://www.vagrantup.com/downloads.html>

A `Vagrantfile` has been placed in this directory. You are now
ready to `vagrant up` your first virtual environment! Please read
the comments in the Vagrantfile as well as documentation on
`vagrantup.com` for more information on using Vagrant.
```

上面的命令会创建一个 `Vagrantfile` 文件。我们看下文件的内容。

```
root@virtualbox ~/w/vagrant_getting_started# cat Vagrantfile 
# -*- mode: ruby -*-
# vi: set ft=ruby :

# All Vagrant configuration is done below. The "2" in Vagrant.configure
# configures the configuration version (we support older styles for
# backwards compatibility). Please don't change it unless you know what
# you're doing.
Vagrant.configure("2") do |config|
  # The most common configuration options are documented and commented below.
  # For a complete reference, please see the online documentation at
  # <https://docs.vagrantup.com>.

  # Every Vagrant development environment requires a box. You can search for
  # boxes at <https://vagrantcloud.com/search>.
  config.vm.box = "hashicorp/bionic64"

  # Disable automatic box update checking. If you disable this, then
  # boxes will only be checked for updates when the user runs
  # `vagrant box outdated`. This is not recommended.
  # config.vm.box_check_update = false

  # Create a forwarded port mapping which allows access to a specific port
  # within the machine from a port on the host machine. In the example below,
  # accessing "localhost:8080" will access port 80 on the guest machine.
  # NOTE: This will enable public access to the opened port
  # config.vm.network "forwarded_port", guest: 80, host: 8080

  # Create a forwarded port mapping which allows access to a specific port
  # within the machine from a port on the host machine and only allow access
  # via 127.0.0.1 to disable public access
  # config.vm.network "forwarded_port", guest: 80, host: 8080, host_ip: "127.0.0.1"

  # Create a private network, which allows host-only access to the machine
  # using a specific IP.
  # config.vm.network "private_network", ip: "192.168.33.10"

  # Create a public network, which generally matched to bridged network.
  # Bridged networks make the machine appear as another physical device on
  # your network.
  # config.vm.network "public_network"

  # Share an additional folder to the guest VM. The first argument is
  # the path on the host to the actual folder. The second argument is
  # the path on the guest to mount the folder. And the optional third
  # argument is a set of non-required options.
  # config.vm.synced_folder "../data", "/vagrant_data"

  # Disable the default share of the current code directory. Doing this
  # provides improved isolation between the vagrant box and your host
  # by making sure your Vagrantfile isn't accessible to the vagrant box.
  # If you use this you may want to enable additional shared subfolders as
  # shown above.
  # config.vm.synced_folder ".", "/vagrant", disabled: true

  # Provider-specific configuration so you can fine-tune various
  # backing providers for Vagrant. These expose provider-specific options.
  # Example for VirtualBox:
  #
  # config.vm.provider "virtualbox" do |vb|
  #   # Display the VirtualBox GUI when booting the machine
  #   vb.gui = true
  #
  #   # Customize the amount of memory on the VM:
  #   vb.memory = "1024"
  # end
  #
  # View the documentation for the provider you are using for more
  # information on available options.

  # Enable provisioning with a shell script. Additional provisioners such as
  # Ansible, Chef, Docker, Puppet and Salt are also available. Please see the
  # documentation for more information about their specific syntax and use.
  # config.vm.provision "shell", inline: <<-SHELL
  #   apt-get update
  #   apt-get install -y apache2
  # SHELL
end
```

## 启动环境

```
root@virtualbox ~/w/vagrant-tutorial# vagrant up
Bringing machine 'default' up with 'virtualbox' provider...
==> default: Importing base box 'hashicorp/bionic64'...
==> default: Matching MAC address for NAT networking...
==> default: Checking if box 'hashicorp/bionic64' version '1.0.282' is up to date...
==> default: Setting the name of the VM: vagrant-tutorial_default_1730684914695_29360
==> default: Clearing any previously set network interfaces...
==> default: Preparing network interfaces based on configuration...
    default: Adapter 1: nat
==> default: Forwarding ports...
    default: 22 (guest) => 2222 (host) (adapter 1)
==> default: Booting VM...
==> default: Waiting for machine to boot. This may take a few minutes...
    default: SSH address: 127.0.0.1:2222
    default: SSH username: vagrant
    default: SSH auth method: private key
    default: Warning: Connection reset. Retrying...
    default: Warning: Remote connection disconnect. Retrying...
    default: 
    default: Vagrant insecure key detected. Vagrant will automatically replace
    default: this with a newly generated keypair for better security.
    default: 
    default: Inserting generated public key within guest...
    default: Removing insecure key from the guest if it's present...
    default: Key inserted! Disconnecting and reconnecting using new SSH key...
==> default: Machine booted and ready!
==> default: Checking for guest additions in VM...
    default: The guest additions on this VM do not match the installed version of
    default: VirtualBox! In most cases this is fine, but in rare cases it can
    default: prevent things such as shared folders from working properly. If you see
    default: shared folder errors, please make sure the guest additions within the
    default: virtual machine match the version of VirtualBox you have installed on
    default: your host and reload your VM.
    default: 
    default: Guest Additions Version: 6.0.10
    default: VirtualBox Version: 7.0
==> default: Mounting shared folders...
    default: /vagrant => /root/work/vagrant-tutorial
```

虚拟机起来了后，我们进入这个虚拟机。

```
# vagrant --help
# vagrant status
# vagrant ssh-config

# 这个要在当前工作目录下执行。
## 因为当前目录下有个 .vagrant/ 目录,里面存放着登陆地址,密钥等信息
vagrant ssh
```

## 其他操作

```
# 更多操作看下vagrant help

# 进入虚拟机后，退出虚拟机
## 或者 CTRL+D
logout

# 销毁虚拟机
vagrant destroy

# 列出 box
vagrant box list
```


This content is licensed under a [Creative Commons Attribution 4.0 International license.](https://creativecommons.org/licenses/by/4.0/)
