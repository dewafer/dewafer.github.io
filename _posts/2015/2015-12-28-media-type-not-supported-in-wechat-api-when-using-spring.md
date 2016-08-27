---
layout: post
title: 解决RestTemplate操作狗日的腾讯微信接口返回json的contentType为text/plain报错(Media Type Not Supported)的问题的方法
subtitle: 从我的大象笔记中导出的内容
---

手动为`RestTemplate`配置`messageConverters`，并且在配置时，为`MappingJackson2HttpMessageConverter`的`supportedMediaType`属性增加`text/plain`。

bean的配置方法参考如下：
```xml
            <bean class="org.springframework.web.client.RestTemplate" >
                <property name="messageConverters">
                    <list>
                        <bean class="org.springframework.http.converter.json.MappingJackson2HttpMessageConverter">
                            <property name="supportedMediaTypes">
                                <list>
                                    <value>text/plain</value>
                                    <value>application/json</value>
                                </list>
                            </property>
                        </bean>
                    </list>
                </property>
            </bean>
```
