---
layout: post
title: Spring中解决跨域问题
subtitle: 从我的大象笔记中导出的内容
---

## xml中跨域配置方法：
```xml
<!-- 全局跨域 -->
<mvc:cors>
  <mvc:mapping path="/**" allowed-origins="*" allowed-methods="*" allowed-headers="*" />
</mvc:cors>
```

## 跨域options问题：
1.为什么会有跨域options？

根据https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS 解释，当符合以下条件时就会出现options请求（Preflighted requests）：

> Preflighted requests
> ---------------------
>
> Unlike simple requests (discussed above), "preflighted" requests first send an HTTP request by theOPTIONS method to the resource on the other domain, in order to determine whether the actual request is safe to send.  Cross-site requests are preflighted like this since they may have implications to user data.  In particular, a request is preflighted if:
>
> * It uses methods other than GET, HEAD or POST.  Also, if POST is used to send request data with a Content-Type other than application/x-www-form-urlencoded, multipart/form-data, ortext/plain, e.g. if the POST request sends an XML payload to the server usingapplication/xml or text/xml, then the request is preflighted.
> * It sets custom headers in the request (e.g. the request uses a header such as X-PINGOTHER)

2.如何解决interceptor拦截到options问题？

在interceptor中，通过以下方法放过preflighted requests即可
```java
if(CorsUtils.isPreFlightRequest(request))
  return true;
```
preflighted requests不会跑到controller里面去的。

参考以下类中的源代码：

`org.springframework.web.servlet.handler.AbstractHandlerMapping.getHandler(HttpServletRequest)`


`org.springframework.web.servlet.handler.AbstractHandlerMapping.getCorsHandlerExecutionChain(HttpServletRequest, HandlerExecutionChain, CorsConfiguration)`


> For pre-flight requests, the default implementation replaces the selected
> handler with a simple HttpRequestHandler that invokes the configured
> {@link #setCorsProcessor}.


3. 另外一种解决方案？

http://git.newnil.com/dewafer/simpleApi/blob/master/simpleApi/src/main/java/com/newnil/interceptors/CorsPreflightRequestInterceptor.java
将CorsRreflightRequestInterceptor放到interceptors的最前面。
