---
layout: post
title: 在spring中配置Swagger2
subtitle: 从我的大象笔记中导出的内容
---

POM配置：

* Spring MVC标准配置：
    * Spring-core
    * Spring-web
    * Spring-webmvc
    * Jackson-core
    * Jackson-databind
    * 其他等

2.springfox配置：
```xml
<dependency>
  <groupId>io.springfox</groupId>
  <artifactId>springfox-swagger2</artifactId>
  <version>2.2.2</version>
</dependency>
<dependency>
  <groupId>io.springfox</groupId>
  <artifactId>springfox-swagger-ui</artifactId>
  <version>2.2.2</version>
</dependency>
<dependency>
  <groupId>io.springfox</groupId>
  <artifactId>springfox-staticdocs</artifactId>
  <version>2.2.2</version>
</dependency>
<dependency>
  <groupId>com.fasterxml</groupId>
  <artifactId>classmate</artifactId>
  <version>1.2.0</version>
</dependency>
```

Spring MVC配置：
```xml
    <!-- Enables swgger ui-->
    <mvc:resources mapping="swagger-ui.html" location="classpath:/META-INF/resources/"/>
    <mvc:resources mapping="/webjars/**" location="classpath:/META-INF/resources/webjars/"/>

    <!-- Include a swagger configuration-->
    <bean name="/applicationSwaggerConfig" class="cn.medlog.oms.swagger.ApplicationSwaggerConfig"/>
```

```java
package cn.medlog.oms.swagger;

import springfox.documentation.swagger2.annotations.EnableSwagger2;

@EnableSwagger2
public class ApplicationSwaggerConfig {

}
```

启动服务器，访问`http://localhost:8080/{you-app-path}/swagger-ui.html`
