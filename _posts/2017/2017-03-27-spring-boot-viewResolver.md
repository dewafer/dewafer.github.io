---
layout: post
title: Spring boot 的 viewResolver 黑科技总结
subtitle: 啊，神秘的viewResolver
---

### Spring framework的`viewResolver`

当一个`Controller`返回一串`String`类型的`view name`之后，Spring是如何找到对应的`view`的？


答案就在`DispatcherServlet`的`resolveViewName`方法中，它循环一个`viewResolvers`列表，
然后调用`ViewResolver.resolveViewName(...)`方法，当列表中任意一个`viewResolver`返回不为`null`时，
`DispatcherServlet`就认为这个`view`解析完毕，并使用解析得到的`View`对象继续处理。


那么问题就来了，这个`viewResolvers`列表是如何来的呢？


答案在`DispatcherServlet`的`initViewResolver`方法中。在该方法中，首先根据`detectAllViewResolvers`标识来确定`viewResolver`的获取方式：
 * 如果`detectAllViewResolvers`为`true`（默认为`true`），则会从当前的`ApplicationContext`中获取所有实现`ViewResolver`包括其子类的对象，然后还会根据对象的`Order`进行排序。
 * 如果`detectAllViewResolvers`为`false`，则会从当前的`ApplicationContext`中获取Bean name为`viewResolver`的，类型为`ViewResolver`的单个对象，作为`viewResolvers`列表中的唯一对象。


然后，如果上述两种情况还没有获取到任何`viewResolvers`，`DispatcherServlet`会启用默认策略，
根据`DispatcherServlet.properties`的配置，获取并初始化键值为
`org.springframework.web.servlet.ViewResolver`的class作为`viewResolvers`列表成员。


### Spring Boot的`viewResolver`自动配置

在`WebMvcAutoConfiguration`中的`WebMvcAutoConfigurationAdapter`中可以看到，它根据条件自动注入了以下几个`viewResolver`：
 * 如果当前环境里没有`InternalResourceViewResolver`同类型的Bean，则自动注入类型为`InternalResourceViewResolver`、
   名称为`defaultViewResolver`的Bean。`InternalResourceViewResolver`为`UrlBasedViewResolver`的扩展，`Order`默认为`Integer.MAX_VALUE`。
 * 如果当前环境里有类型为`View`的Bean，并且没有注入过`BeanNameViewResolver`同类型的Bean，
   则自动注入类型为`BeanNameViewResolver`、名称为`beanNameViewResolver`的Bean。
   并且设置其`Order`为`Order.LOWEST_PRECEDENCE - 10`，其中`Order.LOWEST_PRECEDENCE`的值为`Integer.MAX_VALUE`。
 * 如果当前环境中已经存在类型为`ViewResolver`的Bean，并且没有类型为`ContentNegotiatingViewResolver`、
   名称为`viewResolver`的Bean，则自动注入同类型同名的Bean。并且设置其`Order`为`Order.HIGHEST_PRECEDENCE`，
   其中`Order.HIGHEST_PRECEDENCE`的值为`Integer.MIN_VALUE`。


这3个`ViewResolver`是`WebMvcAutoConfigurationAdapter`为我们默认配置的3个Bean，
但是你以为这样就完事儿了么？其实不然，Spring Boot还会配置一个`ViewResolverComposite`的`ViewResolver`，
这个`ViewResolver`包含了所有使用`WebMvcConfigurerAdapter#configureViewResolvers(ViewResolverRegistry)`方法配置的`viewResolver`。
并且该V`iewResolverComposite`的`Order`为`Order.LOWEST_PRECEDENCE`。


这个`ViewResolverComposite`由`EnableWebMvcConfiguration`类提供。`EnableWebMvcConfiguration`继承了`DelegatingWebMvcConfiguration`，
而`DelegatingWebMvcConfiguration`则继承了`WebMvcConfigurationSupport`。


在`WebMvcConfigurationSupport`中，提供了一个注册`ViewResolver`类型Bean的`mvcViewResolver`方法。
该方法先初始化了一个`ViewResolverRegistry`实例，然后将其传入并调用`configureViewResolvers`方法。
最后它根据在`configureViewResolvers`方法中配置的`ViewResolverRegistry`实例初始化并返回了一个`ViewResolverComposite`的实例。


而在`WebMvnConfigurationSupport`的子类，也是`EnableWebMvcConfiguration`的父类`DelegatingWebMvcConfiguration`中，
它首先注入了当前环境中所有的`WebMvcConfigurer`（`WebMvcConfigurationAdapter`实现了该接口）类型的Bean的列表，
并将该列表包装给`WebMvcConfigurerComposite`，最后将所有`configure*`和`add*`等方法代理给`WebMvcConfigurerComposite`。
这样就实现了将所有可配置的方法代理给外部`WebMvcConfigurer`的实现类的这样一个功能。


所以总结一下，在Spring boot自动配置的情况下，会有这样几个`viewResolver`（按优先度从高到低）：
 1. `ContentNegotiatingViewResolver`，该`ViewResolver`会根据前端传来的请求内容类型
   （譬如说由`accept`头指定、由`format`参数指定或者由url的后缀名指定等，根据`ContentNegotiatingManager`中配置的`strategies`来确定，
    可通过`WebMvcConfigurer#configureContentNegotiation`方法来配置）、并且轮询其他各个`ViewResolver`来返回相应的`View`。
 2. `BeanNameViewResolver`。如果没有配置其他的`ViewResolver`则该`viewResolver`仅次于`ContentNegotiatingViewResolver`。
    自动注入这个`viewResolver`的前提是当前环境中已经有类型为`View`的Bean，否则该`viewResolver`不会被注入到当前环境中。
    这个`ViewResolver`的职责是将`Controller`返回的`String` url当成bean name去环境中找相应的实现了`View`接口的Bean。
	3. `ViewResolverComposite`。所有通过`WebMvConfigurer#configureViewResolvers`方法配置的v`iewResolver`都会集中在这个composite里。
	4. `InternalResourceViewResolver`。该v`iewResolver`负责将`Controller`返回的`String`解析成为`InternalResourceView`（`servlet`、`JSP`等）。
     需要特别注意的是，该`ViewResolver`会尝试去解析所有view name，无论对应的资源文件（如J`SP`）是否存在，所以该`viewResolver`理论上要放在最后。
