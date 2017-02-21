---
layout: post
title: spring-data-jpa源码阅读笔记：Repository方法名查询推导(Query Derivation From Method Names)的实现原理 3
subtitle: 总结
header-img: http://ww4.sinaimg.cn/large/51d3f408gw1etizhx8aslj21hc0zctel.jpg
---

上两次讲了spring-data-jpa的源码，有同学跟我反映看不懂。

好吧，我们来用一张UML图总结一下。

要注意的是，这张UML图只包含了部分SPRING DATA JPA的源代码，并非全部。

包含的那部分是我们上两篇文章所讲到过的。

看图

![spring-data-jpa源码总结图](/uploads/2017/2017-02-21-JpaRepoUML.png)

下载[本图的源文件](/uploads/2017/2017-02-21-JpaRepoUML.mdj)

上两篇文章的链接在这里：

* [spring-data-jpa源码阅读笔记：Repository方法名查询推导(Query Derivation From Method Names)的实现原理](http://www.dewafer.com/2016/05/09/reading-src-of-spring-data-jpa/)
* [spring-data-jpa源码阅读笔记：Repository方法名查询推导(Query Derivation From Method Names)的实现原理 2](http://www.dewafer.com/2017/02/18/reading-src-of-spring-data-jpa-2/)