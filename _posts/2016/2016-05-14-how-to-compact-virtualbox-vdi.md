---
layout: post
title: VirtualBox压缩虚拟硬盘文件
subtitle: 珍爱硬盘空间，远离<s>大姐姐</s>(划掉)虚拟机们……
---

长期使用Mac的同学，一定对虚拟机占用硬盘空间不断扩大感到非常头疼吧，尤其是硬盘空间比较小的同学。
今天我们就来聊聊如何压缩VirtualBox的虚拟硬盘vdi文件。

根据VirtualBox手册的[8.23 VBoxManage modifyhd](https://www.virtualbox.org/manual/ch08.html#vboxmanage-modifyvdi)一节的说明，使用该命令并带上`--compact`即可压缩vdi文件，但光使用该命令是不够的，必须要先zero out虚拟机硬盘上空的硬盘空间，根据不同的系统，做法如下：

### Windows 系统

Windows系统上需要使用[sdelete](https://technet.microsoft.com/en-us/sysinternals/sdelete.aspx)工具，可以在[微软官方网站](https://technet.microsoft.com/en-us/sysinternals/sdelete.aspx)下载到。

下载解压缩后，把exe文件复制黏贴到`C:\windows\system32`下，然后使用`Win + R`快捷键打开CMD，使用下列命令压缩c盘，当然，压缩前先清空硬盘最好。

{% highlight bat %}
  C:\> sdelete -z C:
{% endhighlight %}

等待命令执行完成后关闭虚拟机即可开始压缩硬盘了。

### Ubuntu 系统

Ubuntu上可以使用zerofree工具来清理硬盘。首先通过apt安装：

{% highlight bash %}
  $ sudo apt-get install zerofree -y
{% endhighlight %}

安装完成后，通过`man zerofree`可以看到使用说明。根据使用说明，zerofree处理的对象filesystem必须未被挂载或者挂载为只读。如果要处理根系统，你可以使用`telinit 1`命令切换到单用户模式下运行。

我尝试使用了`telinit 1`切换到单用户模式，结果虚拟机黑屏死机了。后经过谷歌发现，这是一个未解决的非常老的Ubuntu的[碧油鸡](https://bugs.launchpad.net/ubuntu/+source/plymouth/+bug/705150)……

后来，尝试使用修复模式进入Ubuntu就可以了，操作如下：

首先，使用`sudo passwd root`给`root`根管理员加一个密码，并记住这个密码。

然后，重启系统，在系统启动时按住`Shift`键进入GRUB的选择界面，选择`Advanced options for Ubuntu`，然后再选择`Ubuntu, with Linux x.xx.x-xx-generic (recover mode)`进入修复模式。如果你看到很多recover mode的话，一般选择从上至下第二个即可。

进入Recovery Menu之后，选择`root - Drop to root shell prompt`选项，然后输入前面修改的根管理员密码。

进入root shell之后，输入`zerofree -v /dev/sda1`既可开始清理。注意这里的`/dev/sda1`换成你系统的filesystem。如果不知道是哪个可以用`mount`命令查看。

等待命令执行完成后关闭虚拟机即可开始压缩硬盘了。

### 压缩虚拟机硬盘

在虚拟机中清理完硬盘之后，我们就可以用`VBoxManage modifyhd --compact`命令来压缩虚拟硬盘了。

可以直接使用

{% highlight bash %}
  $ VBoxManage modifyhd <filename> --compact
{% endhighlight %}

命令来压缩，其中`<filename>`指的是vdi文件所在位置。

当然可以用先用

{% highlight bash %}
  $ VBoxManage list hdds
{% endhighlight %}

来查看在VirtualBox中注册的所有虚拟硬盘，然后用

{% highlight bash %}
  $ VBoxManage modifyhd <UUID> --compact
{% endhighlight %}

命令来压缩注册的硬盘，其中`<UUID>`指的是在list命令中列出的虚拟硬盘的uuid。

等待命令执行完成即可。

去看看虚拟硬盘文件是不是缩小点了？硬盘空间是不是多出来了？
