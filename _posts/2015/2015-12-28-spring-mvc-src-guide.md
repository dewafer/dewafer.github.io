---
layout: post
title: Spring MVC源代码入门，查看mvc的默认配置。
subtitle: 从我的大象笔记中导出的内容
---

1. `DispatcherServlet`的默认配置可以从同包下的`DispatcherServlet.properties`中看到。（`spring-webmvc-x.x.x.jar/org/springframework/web/servlet/DispatcherServlet.properties`）

2. xml中，mvc命名空间下的各种配置可以从
     1. `spring-webmvc-xxx.jar/org/springframework/web/servlet/config/spring-mvc-x.x.xsd`（xml配置的定义描述文件）
     2. `spring-webmvc-xxx.jar/org/springframework/web/servlet/config/MvcNamespaceHandler.java`（xml配种中mvc命名空间下各种配置的`Handler`）
     3. `spring-webmvc-xxx.jar/org/springframework/web/servlet/config/annotation/WebMvcConfigurationSupport.java` (javaConfig下mvc的默认配置可以在这里看到）
