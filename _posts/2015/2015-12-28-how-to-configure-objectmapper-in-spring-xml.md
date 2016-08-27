---
layout: post
title: 配置Jackson的ObjectMapper
subtitle: 从我的大象笔记中导出的内容
---

可以在xml中配置`Jackson的ObjectMapper`来启用或禁用某些功能。配置方法与3.2相同。

3.2:
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
