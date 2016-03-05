---
layout: post
title: 理查德森成熟度模型
subtitle: 你说的RESTful是不是我说的RESTful
header-img: 'http://ww3.sinaimg.cn/large/51d3f408gw1eqrke6l8mqj21hc0u0gtf.jpg'
---

看到一篇好文，记录一下：

> [Justice Will Take Us Millions Of Intricate Moves](http://www.crummy.com/writing/speaking/2008-QCon/)
>
> <small>by Leonard Richardson, November 20, 2008</small>

文章分为3个Act和一个Conclusion。

Act One简述了Internet的历史，Act Two讲述了作者在实现Launchpad Web Service时遇到的一些问题以及使用的解决方案，Act Three提出了关于Restful风格的成熟度模型。最后结论叙述了Restful的局限性。

在Act Three中，作者将使用Restful风格的成熟度分为4个等级，分别为Level 0到3，其中Level越低，使用到的HTTP元素越少（主要指[RFC-2616](https://www.w3.org/Protocols/rfc2616/rfc2616.html)中定义的URI、HTTP method和Hypermedia。
<small>注：Hypermedia可以理解为超链接？另外RFC-2616已经在2014年被[FRC 723x](https://www.w3.org/Protocols/#rfc723x)替代了</small>
），Level越高则越多。

* Level 0 - 单个URI，单个HTTP method(verb)，譬如XML-RPC和大多数SOAP。作者把这个Level的服务比作内嵌Flash的网站。
* Level 1 - 多个URI划分资源，但仅仅使用单个或少数几个HTTP method，主要是GET和POST方法。并且作者认为现在（2008年）的大多数自称RESTful service的服务主要在这个Level。
* Level 2 - 多个URI划分资源，使用了多个HTTP method，并且将PUT、DELETE、PATCH等的语义从POST中划分出来。


<small>注：可以这么理解，以前POST涵盖了CRUD的所有操作，譬如可能POST的body里面有个字段如`action=delete`来表示客户端希望操作删除资源，但Level 2的服务应该是使用单独的`DELETE /path/to/resource`方法来删除资源而不是将删除操作的语义包含到POST里面去，简单来说就是遵循RFC-2616中定义的[Http method](https://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9)的语义。</small>


* Level 3 - 在Level 2的基础上再加上HATEOAS(Hypermedia As The Engine Of Application State)，即把客户端可操作的links嵌入到表现层内，以此来作为当前事务流的状态。客户端可以通过获取到的links来决定下一步的操作。


<small>注：可以把客户端理解为一个上网浏览的人、把表现层理解为服务器返回的HTML网页，譬如一个正在网购的人可以通过网页上的链接来决定一下步干什么——付款还是取消订单。表现层是什么形式并不重要，HTML是给人识别的，XML、JSON或者纯文本可以给机器识别，关键是可以用内嵌的链接来表示当前事务的状态，不管客户端是人还是机器。</small>

最后作者说明了Restful的局限性，Restful的服务是不可能帮你一键解决掉分布式系统的复杂性的，而是通过分治（使用URI）、重构（基于HTTP）和使用标准方法描述行为（嵌入Hypermedia）的方式来减少分布式系统的高复杂性所带来的痛苦。

任何技术再怎么火爆流行，它也是有局限性的。
