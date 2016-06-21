---
layout: post
title: 家庭域名服务器搭建指南
subtitle: 教你如何玩转家庭智能网络
---

### 前言

随着这两年智能硬件的发展，家庭网络中的硬件越来越多了，如智能路由器、NAS、电视盒子、Home Server、甚至IoT等等等等……
使用ip地址譬如192.168.1.1这种又不容易记忆又很容易搞错的方式来管理这些硬件显得越来越困难了，
尤其是当家庭网络中的智能硬件达到一定数量时，想要回忆起某一台NAS或者树莓派的ip地址简直太让人痛苦了！

这个时候就需要一台域名服务器来解救我们。有了域名服务器，我们就可以使用域名来访问家庭中各个智能硬件啦，这可比强行记住ip地址简单多了。


### 期望的结果

不久前在首富家的云上花了几个钱买了几个域名，其中有个域名叫yinqiu.wang。对你来说这是一串无法理解的字符，但对我来说，这是我名字的拼音啊，哈哈哈，真是太方便了。现在这个域名暂时还没有绑定ip，我准备用它的二级域名home.yinqiu.wang作为家庭网络的域来使用。

你可能不太理解上面这句话什么意思，简单来说就是我希望

* 当我在浏览器地址栏里输入home.yinqiu.wang的时候，它能带我转到家庭的主路由器上
* 而当我输入mycloud.home.yinqiu.wang的时候，它能带我转到我的NAS服务器上
* 当输入pi.home.yinqiu.wang的时候，能转到我的树莓派上
* 当输入tvbox.home.yinqiu.wang的时候，能转到电视盒上

诸如此类。

可能有经验的同学会说，这不是很简单，你只要在首富云上的控制台上为上面几个二级、三级域名设置A记录不就行了？

不，生命在于折腾。我不要这么简单，我希望首富家的云能把home.yinqiu.wang的二级域名的管理权下放到我自己的服务器上，由我自己的服务器来管理这个二级域名（包括旗下的子域名）。

### 搭建及配置域名服务器

首先我在AWS上启用了一台ubuntu的服务器，aws提供了免费1年的试用期。我准备先把这个域名服务器放aws上，稍后再迁移到自己的树莓派上去。

有了这台服务器之后，首先安装域名服务。ubuntu上域名服务叫bind9，使用命令行安装：

{% highlight sh %}
$ sudo apt-get install bind9 bind9utils bind9-doc
{% endhighlight %}

安装完成后，首先配置`/etc/bind/named.conf.local`文件：

{% highlight text %}
//
// Do any local configuration here
//

// Consider adding the 1918 zones here, if they are not used in your
// organization
//include "/etc/bind/zones.rfc1918";

zone "home.yinqiu.wang" {
type master;
file "/etc/bind/zones/home.yinqiu.wang.db";
};

zone "31.168.192.in-addr.arpa" {
type master;
file "/etc/bind/zones/rev.31.168.192.in-addr.arpa";
};
{% endhighlight %}

其中

* `home.yinqiu.wang`是该服务器管理的二级域名
* `31.168.192.in-addr.arpa`是反向查询时使用的域名（通过ip查域名）

然后分别在`/etc/bind/zones`下创建`home.yinqiu.wang.db`和`rev.31.168.192.in-addr.arpa`两个文件。

其中`home.yinqiu.wang.db`:

{% highlight text %}
;
; BIND data file for local loopback interface
;
$TTL	604800
@	IN	SOA	home.yinqiu.wang. me.yinqiu.wang. ( // SOA记录指定管理的域名和管理员邮件地址
		     	     20		; Serial                  // 更新序列号，每次更新此文件必须更新此项
			 604800		; Refresh
			  86400		; Retry
			2419200		; Expire
			 604800 )	; Negative Cache TTL

	IN	NS	ns1.yinqiu.wang.                   // NS记录 指定本ns服务器

@	IN	A	192.168.31.1                         // A记录  范域名指定路由器的ip地址
mycloud 		IN	A	192.168.31.127             // A记录  mycloud指定NAS服务器地址
pi					IN	A	192.168.31.238             // A记录  树莓派的地址

// ...指定更多A或CNAME记录

{% endhighlight %}

在`rev.31.168.192.in-addr.arpa`文件中:

{% highlight text %}
;
; BIND reverse data file for local loopback interface
;
$TTL	604800
@	IN	SOA	home.yinqiu.wang. me.yinqiu.wang. (  // SOA记录，同上
		     	     20		; Serial                   // 更新序列号，同上
			 604800		; Refresh
			  86400		; Retry
			2419200		; Expire
			 604800 )	; Negative Cache TTL
;
	IN	NS	ns1.yinqiu.wang.                     // NS记录 同上

1	IN	PTR	home.yinqiu.wang.                    // PTR记录，逆向指定域名

127	IN	PTR mycloud                            // PTR记录，同上
238	IN	PTR	pi                                 // PTR记录，同上

// ...指定更多

{% endhighlight %}

创建完成后重启bind9服务器

{% highlight shell %}
$ sudo /etc/init.d/bind9 restart
{% endhighlight %}

或者

{% highlight shell %}
$ sudo service bind9 restart
{% endhighlight %}

### 配置阿里云DNS云解析

首先在阿里云中增加A记录，主机记录为ns1，记录值填写域名服务器所在ip地址。然后增加NS记录，主机记录填写需要下放管理权限的二级域名，在我们这边即`home`，记录值为ns服务器的域名（`ns1.yinqiu.wang`）。阿里云的配置还是很简单的，这边就不贴图了。

稍等一段时间后使用浏览器访问home.yinqiu.wang查看效果。

完成。

### 参考资料

* https://help.ubuntu.com/community/BIND9ServerHowto
* http://askubuntu.com/questions/330148/how-do-i-do-a-complete-bind9-dns-server-configuration-with-a-hostname
* https://www.digitalocean.com/community/tutorials/how-to-configure-bind-as-a-private-network-dns-server-on-ubuntu-14-04
