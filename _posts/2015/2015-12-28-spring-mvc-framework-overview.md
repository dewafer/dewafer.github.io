---
layout: post
title: Spring MVC框架总览
subtitle: 从我的大象笔记中导出的内容
---

Spring MVC框架的大致结构如下：
![spring-mvc-high-level-request-flow](/img/spring-mvc-high-level-request-flow.png)
（图片来自Spring Framework Reference Documentation 4.2.0.RELEASE）

使用Spring MVC实现Restful服务，简单来说就是去掉View层，通过为Controller注释上`@RestController`或者`@ResponseBody`来使用`HttpMessageConverter`来序列化JSON并返回至前台。

另外，`HttpMessageConverter`的转换操作是在View层之前进行的，所以如果有配置`Interceptor`，是无法在`postHandler`中拦截并修改有`@RestController`或者`@ResponseBody`注释的`Controller`的返回值的，因为此时`response`已经`close`。

注意4.2.0中使用的是`MappingJackson2HttpMessageConverter`，而之前版本是`MappingJacksonHttpMessageConverter`。如版本升级时遇报错，注意检查pom中jackson相关包版本以及`spring-mvc.xml`中相应的`MappingJackson2HttpMessageConverter`是否漏掉了2。
