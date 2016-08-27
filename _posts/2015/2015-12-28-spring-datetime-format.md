---
layout: post
title: '@DateTimeFormat格式化JSON日期时间(Date或timestamp)无效的原因 / Spring格式化json日期时间(Date或timestamp)的方法'
subtitle: 从我的大象笔记中导出的内容
---

## @DateTimeFormat格式化JSON日期时间(Date或timestamp)无效的原因

Spring Core默认使用JavaBean的`PropertyEditor`来为Spring中得各个Bean转换格式，包括xml中配置值的转换等。Spring 3以后引入了`Formatter`来提通用的格式化服务，`@DateTimeFormat`便是属于该`Formatter`服务之一。但是，Spring框架默认使用的是Jackson的JSON序列化服务，Jackson并不属于Spring，所以`@DateTimeFormat`注释不能用来在jsonBean中格式化时间，解决方式有2种。

## Spring格式化json日期时间(Date或timestamp)的方法

如果是你百度的Spring格式化json日期时间的问题，特别注意你用的Spring配置中`MappingJackson2HttpMessageConverter`当中是否有2！！！网上你百度到的很多答案是针对Spring 3.1.2之前的就版本的解决方案，特别注意检查版本！！！

1. 使用Jackson的`@JsonFormat`注解来格式化日期时间。请注意你正在使用的Spring和Jackson的版本，这个注释是从jackson 2.0才有的，如果你没有使用Jackson2但却用了该注释将报错！（检查`MappingJackson2HttpMessageConverter`是否有2！）

2. 全局修改配置格式化日期时间。方法很简单，就是为Jackson的`ObjectMapper`增设`dateFormat`属性，在spring的xml配置中你可以像下面这样配置。特别注意这个配置是针对Spring 3.1.2后使用了Jackson2的，请检查自己的版本！！！
```xml
   <mvc:annotation-driven>
        <!-- 配置converters，带上默认的converters -->
        <mvc:message-converters register-defaults="true">
            <bean class="org.springframework.http.converter.json.MappingJackson2HttpMessageConverter">
                <property name="objectMapper">
                    <bean class="com.fasterxml.jackson.databind.ObjectMapper">
                        <!-- 格式化时间 -->
                        <property name="dateFormat">
                            <bean class="java.text.SimpleDateFormat">
                                <constructor-arg type="java.lang.String" value="yyyy/MM/dd HH:mm"/>
                            </bean>
                        </property>
                    </bean>
                </property>
            </bean>
        </mvc:message-converters>
    </mvc:annotation-driven>
```
