---
layout: post
title: 深入了解 Spring Security (2)
subtitle: 无证程序员带你深入了解 Spring Security
---

欢迎收看[废柴大叔小课堂的Spring Security教程系列](https://space.bilibili.com/8265121/channel/detail?cid=68498)。

### 3. 鉴权

我们来看看Spring Security的鉴权过程到底是怎么样的。

#### 3.1 抽象鉴权流程

考虑以下抽象鉴权场景：

1. 系统提示用户输入用户名、密码，用户输入完成后提交回系统。
2. 成功验证用户输入的用户名密码与系统内保存的相符合，当前用户鉴权成功。
3. 从持久层中取得当前用户的详细信息（如角色、账户是否过期等）。
4. 将上述信息构建成安全上下文（Security Context）保存在内存中以供后续使用。
5. 进入到下一步，通过某种访问控制检查机，审查当前用户的安全上下文（Security Context）中是否含有执行当前操作所需要的权限。（授权）

前三步构成了Spring Security的鉴权过程，我们来看看前文所提到的基础构件是如何在这些过程中互相写作的：

1. 用户提交回系统的用户名、密码被包装成`UsernamePasswordAuthenticationToken`对象，该对象是一个`Authentication`的具体实现。
2. 将上述对象传入`AuthenticationManager`进行用户名密码验证
3. 如果验证成功，`AuthenticationManager`将会把该用户相应的用户详细信息（`UserDetails`）、所拥有的权限/角色（`GrantedAuthority`）等信息设入`Authentication`对象并返回。
4. 将上述返回的`Authentication`对象使用`SecurityContextHolder.getContext().setAuthentication(...)`来设入安全上下文（Security Context），该用户所属的安全上下文设置完毕。

从这里开始，我们说用户已经鉴权成功，可以精确地知道当前的用户是谁了。

大致的流程如下图所示：

![Spring_Security_Authentication_Process.png](/img/Spring_Security_Authentication_Process.png)
*图1 Spring Security鉴权过程（简化图）*


*内容参考自[官方文档](http://docs.spring.io/spring-security/site/docs/current/reference/htmlsingle/#what-is-authentication-in-spring-security)*

#### 3.2 考虑以下Web登录的场景

上面是一个很抽象的鉴权过程，下面我们来把上述过程放到Web环境下，看看在常见的Web请求的流程中，Spring Security的鉴权过程到底是怎么样的。

1. 用户访问网站的首页，在首页上点击一个连接。
2. 访问请求发送至服务器，服务器发现用户请求了一个受保护的链接。
3. 由于当前用户未鉴权（身份不明），服务器返回一个响应，要求当前用户鉴权（鉴明身份）。返回的响应可以是一个HTTP协议状态码（Http Response Code），或者一个跳转URL（跳转到登录页面）。
4. 根据服务器返回的响应，用户的浏览器跳转到指定的URL登录页面让用户登录。或者通过某种方式取得当前用户的身份信息，譬如HTTP基本认证登录对话框、某个Cookie值或者X.509证书等。
5. 浏览器将用户鉴权信息（通常是用户名和密码）发送到服务器。用户的鉴权信息可能是包含在HTTP POST请求内容中；或者在HTTP头信息中。
6. 服务器检查浏览器发送过来的用户鉴权信息（用户名和密码）。如果鉴权信息无效（用户名密码错误），通常情况下服务器会返回一个响应让浏览器重试（返回到第3步）；如果有效，则继续下一步。
7. 服务器会重试第二步时用户发送过来的访问请求，如果当前用户有足够的权限访问，则访问成功；如果权限不够，则会返回HTTP协议状态码403——禁止访问（forbidden）。

我们主要关注上述流程中服务器端的几个行为和Spring Security中负责这些行为的类。

在第2步中，服务器发现用户访问的是受保护链接时起作用的是`FilterSecurityInterceptor`，它是一个`javax.servlet.Filter`，扩展自`AbstractSecurityInterceptor`，正是这个`AbstractSecurityInterceptor`封装了Spring Security的主要鉴权、授权的算法，我们稍后再对其做详细讨论。

当`FilterSecurityInterceptor`发现当前用户访问的是一个受保护的链接，并且用户还未鉴权的时候，它并不直接向客户端返回响应，而是抛出异常。这时，在`FilterChain`中排在`FilterSecurityInterceptor`之前的`ExceptionTranslationFilter`捕获到`FilterSecurityInterceptor`抛出的异常，发现当前用户鉴权不够，身份不明，这时它会调用事先配置的`AuthenticationEntryPoint`的`AuthenticationEntryPoint.commence(..)`方法向浏览器返回响应。

在第3步中，真正负责向浏览器发送登录请求/Http状态码401/跳转向登录页面的响应是由事先配置在`ExceptionTranslationFilter`中的`AuthenticationEntryPoint`的实现所负责的。Spring Security提供了好几种常用的实践，可以分别应用于不同的场景。譬如常见的有

* `LoginUrlAuthenticationEntryPoint`负责向浏览器发送跳转到指定登录页面的响应；
* `BasicAuthenticationEntryPoint`负责向浏览器发送显示HTTP基本认证对话框的响应；
* `Http403ForbiddenEntryPoint`向浏览器发送HTTP状态码403——禁止访问响应。

在第6步中，负责将用户提交过来的鉴权信息打包并执行鉴权的，是一系列叫做“鉴权装置（Authentication Mechansim）”的过滤器（`javax.servlet.Filter`）。这些“鉴权装置”过滤器一般扩展自`AbstractAuthenticationProcessingFilter`类，常见的有

* `org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter`
* `org.springframework.security.cas.web.CasAuthenticationFilter`
* `org.springframework.security.openid.OpenIDAuthenticationFilter`

其中最常用的即`UsernamePasswordAuthenticationFilter`过滤器，它负责将用户提交的用户名密码打包成`UsernamePasswordAuthenticationToken`（`Authentication`）对象并递交给`AuthenticationManager`进行验证。从持久层取得用户信息并比较用户提交的密码是否有效等这些逻辑是由`AuthenticationManager`来负责的。

在Spring Security中，正真的用户名密码检验逻辑并不在`AuthenticationManager`接口的实现中的，而是在`AuthenticationProvider`接口的实现中的。一般情况下，Spring Security会自动配置`ProviderManager`作为默认的`AuthenticationManager`，而在`ProviderManager`中则配置了一连串的`AuthenticationProvider`。

`ProviderManager`会挨个询问列表中的`AuthenticationProvider`能否处理传递过来的`Authentication`对象，如果可以则将`Filter`中打包的`Authentication`对象传递给该`AuthenticationProvider`进行鉴权逻辑处理；如果不行则询问下一个`AuthenticationProvider`直到全部都被询问过。如果所有`AuthenticationProvider`都不能处理则抛出鉴权失败的异常（`ProviderNotFoundException`，该异常扩展自`AuthenticationException`）。

Spring Security同样提供了很多常用的`AuthenticationProvider`，譬如

* `DaoAuthenticationProvider`——负责从持久层调取用户详细信息并验证密码，它通过调用`UserDetailsService`来从持久层读取用户的信息，因此与持久层的具体实现完全解耦，即持久层可以是RMDBS、NoSQL等，完全有`UserDetailsService`的实现来决定。
* `LdapAuthenticationProvider`——用户详情的来源不一定是持久层，也可能是LDAP等第三方系统，这个实现正是负责从LDAP中读取用户详情。
* `RememberMeAuthenticationProvider`——当然没有人说过一定要用户名密码才能鉴权，通过“记住我”机制同样可以，因为“记住我”可以用来识别用户身份。
* `CasAuthenticationProvider`——同样用户详情也没有说过一定要在本机保存，这个实现可以通过中央鉴权服务进行鉴权
* `GoogleAccountsAuthenticationProvider`——还可以通过谷歌账户进行鉴权
* `OpenIDAuthenticationProvider`——OpenId也可以
* …… 还有很多其他实现，这里就不一一举例了。

其中我们最常用的就是`DaoAuthenticationProvider`了，前面已经说过它使用`UserDetailsService`的实现来调取用户的详情。除了`UserDetailsService`之外，它还调用了`PasswordEncoder`的实现来对密码进行哈希；`SaltSource`来取得哈希密码时的盐值。

当`AuthenticationProvider`在前文第6步中鉴权完成后，“鉴权装置”（`AbstractAuthenticationProcessingFilter`）会分别调用`AuthenticationSuccessHandler`或`AuthenticationFailureHandler`来处理鉴权成功或失败的情况。

譬如在第6步中，鉴权失败，`AuthenticationFailureHandler`的一个默认实现`SimpleUrlAuthenticationFailureHandler`会被触发，服务器会发送一个跳转到登录页面的响应给浏览器，用户会被带回登录页面进行重试。

在第7步中，服务器重试用户第二步时的请求则是有`AuthenticationSuccessHandler`的一个实现`SavedRequestAwareAuthenticationSuccessHandler`来实现的。该类会尝试从用户会话（Session）中获取在第3步时由`ExceptionTranslationFilter`负责保存的用户原始请求并进行重试。

自此，Spring Security的鉴权过程就算完成了，下一步会进入授权的过程，即判断用户是否有权限访问该链接。

大致的流程如下图所示：

![Spring_Security Authentication_Process_for_Web_Application.png](/img/Spring_Security Authentication_Process_for_Web_Application.png)
*图2 Web登录的Spring Security鉴权过程（简化图）*

我们将会在后面的文章中继续介绍Spring Security的授权过程。

*内容参考自[官方文档](http://docs.spring.io/spring-security/site/docs/current/reference/htmlsingle/#tech-intro-web-authentication)*
