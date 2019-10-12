---
layout: post
title: 什么是JPA
subtitle: 估计是由于缺乏中文资料，个人感觉很多同学对JPA可能有什么误解...
---

1.前言

估计是由于缺乏中文资料，个人感觉很多同学对JPA可能有什么误解，一说到JPA首先第一件事情就是拿它和MyBatis做比较，然后举出很多例子来说明JPA怎么怎么难用。甚至有的同学连JPA、hibernate、ORM是什么都还没搞懂，操起所谓的经验就往JPA身上泼脏水来博取别人的好感。

愚以为这样的做法很极端，不可取。我们常说人无完人，技术也是有其局限性的，而任何技术选型的前提，都必须基于对可选技术有一个深入的了解。这里我们就借这一系列《你所不知道的JPA》来带各位同学深入了解一下我们常说的JPA技术。

2.什么是JPA、Hibernate和ORM？

JPA的全称叫Java Persistence API，它是EJB 3.0标准的一部分，所以简单来说JPA是一种标准规范，而Hibernate则是JPA的一种实现，它实现了所有JPA标准中规定的映射、查询和各种接口。

> 参考来源：Java Persistence with Hibernate, Part I, Chapter 1. Understanding object/relational persistence

关于ORM，尽管ORM有很长的历史（最早的关于ORM的论文发表于20世纪80年代末期），不同人对于ORM则有不同的定义，有的叫它对象映射（object mapping），有的则叫它对象/关系数据库映射（Object/relational mapping），而我们这里讨论的则是指后者。

它的出现，简单来说是因为赶上了面向对象编程的潮流；由于面向对象编程所使用的数据结构（对象与引用）与传统的关系型数据库所能存储的数据结构（表与关系）的不一致而形成的，来弥补两者之间间隙的一种非侵入式编程风格。

在这里我说它是一种风格而不是标准是因为，ORM并非是Java特有的，[很多其他面向对象语言也有ORM的框架][1]，并且[ORM也不一定是只能映射到传统的关系型数据库][2]，但它一定是面相对象的。它并没有很严谨的规范定义，因此我把它称作一种风格。

如果各位同学有兴趣的话，历史上曾经出现过一种面相对象型数据库（不是指nosql），各位可以尝试谷歌[Object-oriented database][3]，我相信大多数你们都没有听说过，只可惜这些数据库近些年来被历史所淘汰了。

> 参考来源：Java Persistence with Hibernate, Part I, Chapter 1.2.THE PARADIGM MISMATCH 和 Chapter 1.4.OBJECT/RELATIONAL MAPPING

我相信刚接触JPA的同学肯定有：为什么要这么干？为什么这么蠢？的疑虑。

首先你要记住这一点：JPA的根本目标是实现将面向对象的存储与底层所提供的持久化机构解耦；也就是说，从面向对象程序开发者的角度来说，我不需要知道你底层的数据库是什么,Oracle也好、MySQL也好、DB2也好，我不关心，不需要知道底层的数据库是什么类型，传统的关系型数据库也好，面向对象数据库也好，nosql也好，我也不关心，我只需要你（JPA）帮我将我需要的对象数据（Object）持久化（写入存储）或反序列化（读出存储）即可。

了解了这一点后，就能更容易地理解JPA为什么要这样那样做一些不可思议的设计了。

[1]: https://en.wikipedia.org/wiki/List_of_object-relational_mapping_software "List of object-relational mapping software"
[2]: https://en.wikipedia.org/wiki/Object-relational_mapping#Object-oriented_databases "Object-relational mapping"
[3]: https://en.wikipedia.org/wiki/Object_database "Object database"
