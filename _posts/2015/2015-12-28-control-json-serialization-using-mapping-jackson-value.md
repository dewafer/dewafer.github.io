---
layout: post
title: 让Controller返回MappingJacksonValue来控制Jackson序列化JSON
subtitle: 从我的大象笔记中导出的内容
---

在`@RestController`中（同`@ResponseBody`），让`@RequestMapping`返回`MappingJacksonValue`对象来控制Jackson的高级序列化功能。

可以在
`spring-webmvc-xxx.jar/org.springframework.http.converter.json.AbstractJackson2HttpMessageConverter.writeInternal(Object, Type, HttpOutputMessage)`
中看到针对MappingJacksonValue的处理。
