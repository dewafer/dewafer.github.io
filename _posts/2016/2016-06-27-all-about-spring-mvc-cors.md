---
layout: post
title: Spring MVC的跨域资源共享（CORS）的使用方法及实现机制
subtitle: CORS防坑指南
publish: false
---

## Spring MVC的CORS配置方式

参考：[http://docs.spring.io/spring/docs/current/spring-framework-reference/htmlsingle/#cors](http://docs.spring.io/spring/docs/current/spring-framework-reference/htmlsingle/#cors)

### 方式一：针对Controller或者RequestMapping的注解方式

可以使用`@CorssOrigin`进行配置，可以针对RequestMapping：

{% highlight java %}
@RestController
@RequestMapping("/account")
public class AccountController {

	@CrossOrigin
	@RequestMapping("/{id}")
	public Account retrieve(@PathVariable Long id) {
		// ...
	}

	@RequestMapping(method = RequestMethod.DELETE, path = "/{id}")
	public void remove(@PathVariable Long id) {
		// ...
	}
}
{% endhighlight %}

也可以针对Controller：

{% highlight java %}
@CrossOrigin(origins = "http://domain2.com", maxAge = 3600)
@RestController
@RequestMapping("/account")
public class AccountController {

	@RequestMapping("/{id}")
	public Account retrieve(@PathVariable Long id) {
		// ...
	}

	@RequestMapping(method = RequestMethod.DELETE, path = "/{id}")
	public void remove(@PathVariable Long id) {
		// ...
	}
}
{% endhighlight %}

双层控制：

{% highlight java %}
@CrossOrigin(maxAge = 3600)
@RestController
@RequestMapping("/account")
public class AccountController {

	@CrossOrigin("http://domain2.com")
	@RequestMapping("/{id}")
	public Account retrieve(@PathVariable Long id) {
		// ...
	}

	@RequestMapping(method = RequestMethod.DELETE, path = "/{id}")
	public void remove(@PathVariable Long id) {
		// ...
	}
}
{% endhighlight %}

### 方式二：javaConfig全局配置

{% highlight java %}
@Configuration
@EnableWebMvc
public class WebConfig extends WebMvcConfigurerAdapter {

	@Override
	public void addCorsMappings(CorsRegistry registry) {
		registry.addMapping("/api/**")
			.allowedOrigins("http://domain2.com")
			.allowedMethods("PUT", "DELETE")
			.allowedHeaders("header1", "header2", "header3")
			.exposedHeaders("header1", "header2")
			.allowCredentials(false).maxAge(3600);
	}
}
{% endhighlight %}

### 方式三：xml全局配置

{% highlight xml %}
<mvc:cors>

	<mvc:mapping path="/api/**"
		allowed-origins="http://domain1.com, http://domain2.com"
		allowed-methods="GET, PUT"
		allowed-headers="header1, header2, header3"
		exposed-headers="header1, header2" allow-credentials="false"
		max-age="123" />

	<mvc:mapping path="/resources/**"
		allowed-origins="http://domain1.com" />

</mvc:cors>
{% endhighlight %}

## Spring MVC CORS的实现机制

### 实现机制

在`DispatcherServlet`的`doDispatch`方法中，代码会调用`getHandler`方法，这个方法迭代`handlerMappings`列表并分别调用列表中各个HandlerMapping的`HandlerMapping.getHandler`方法。

在`AbstractHandlerMapping#getHandler#getHandler`方法中可以看到，它使用了`CorsUtils#isCorsRequest`判断当前request是否为跨域请求，如果是的话，会调用自己的`getCorsHandlerExecutionChain`方法：

{% highlight java %}
/**
 * Look up a handler for the given request, falling back to the default
 * handler if no specific one is found.
 * @param request current HTTP request
 * @return the corresponding handler instance, or the default handler
 * @see #getHandlerInternal
 */
@Override
public final HandlerExecutionChain getHandler(HttpServletRequest request) throws Exception {
    // ...省略...

    HandlerExecutionChain executionChain = getHandlerExecutionChain(handler, request);
    if (CorsUtils.isCorsRequest(request)) {
        CorsConfiguration globalConfig = this.corsConfigSource.getCorsConfiguration(request);
        CorsConfiguration handlerConfig = getCorsConfiguration(handler, request);
        CorsConfiguration config = (globalConfig != null ? globalConfig.combine(handlerConfig) : handlerConfig);
        executionChain = getCorsHandlerExecutionChain(request, executionChain, config);
    }
    return executionChain;
}
{% endhighlight %}

而在`getCorsHandlerExecutionChain`中可以看到，它首先判断当前请求是否为[Http Pre-Flight请求](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS#Preflighted_requests)，如果不是，则向executionChain中增加拦截器`CorsInterceptor`：

{% highlight java %}
/**
 * Update the HandlerExecutionChain for CORS-related handling.
 * <p>For pre-flight requests, the default implementation replaces the selected
 * handler with a simple HttpRequestHandler that invokes the configured
 * {@link #setCorsProcessor}.
 * <p>For actual requests, the default implementation inserts a
 * HandlerInterceptor that makes CORS-related checks and adds CORS headers.
 * @param request the current request
 * @param chain the handler chain
 * @param config the applicable CORS configuration, possibly {@code null}
 * @since 4.2
 */
protected HandlerExecutionChain getCorsHandlerExecutionChain(HttpServletRequest request,
        HandlerExecutionChain chain, CorsConfiguration config) {

    if (CorsUtils.isPreFlightRequest(request)) {
        HandlerInterceptor[] interceptors = chain.getInterceptors();
        chain = new HandlerExecutionChain(new PreFlightHandler(config), interceptors);
    }
    else {
        chain.addInterceptor(new CorsInterceptor(config));
    }
    return chain;
}
{% endhighlight %}

我们可以在同文件中（`AbstractHandlerMapping`）看到`CorsInterceptor`为private的class。它的唯一任务就是调用`corsProcessor.processRequest`来为request注入跨域头：

{% highlight java %}
private class CorsInterceptor extends HandlerInterceptorAdapter {

    private final CorsConfiguration config;

    public CorsInterceptor(CorsConfiguration config) {
        this.config = config;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response,
            Object handler) throws Exception {

        return corsProcessor.processRequest(this.config, request, response);
    }
}
{% endhighlight %}

关于`DefaultCorsProcessor`的源代码就不贴了，请自行阅读。

### 坑

特别注意！


这个`CorsInterceptor`拦截器是动态追加在整个拦截器列表的最后的！


这个`CorsInterceptor`拦截器是动态追加在整个拦截器列表的最后的！


这个`CorsInterceptor`拦截器是动态追加在整个拦截器列表的最后的！


重要的事情说3遍。所以如果你在拦截器里面抛出Exception的话，就别希望它来帮你加跨域的头了！！！
