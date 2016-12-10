---
layout: post
title: Spring devtools 学习笔记
subtitle: 又是一篇学习笔记
---

### Spring devtools 使用方法：

Maven:

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-devtools</artifactId>
        <optional>true</optional>
    </dependency>
</dependencies>
```

Gradle:

```
dependencies {
    compile("org.springframework.boot:spring-boot-devtools")
}
```

注意，如果app是以打包完的形式运行的，devtools会自动失效。如果以`java -jar`的方式启动，Spring会认为它是运行在生产环境，所以devtools会自动失效。

### devtools 自动包含的properties：

查看`DevToolsPropertyDefaultsPostProcessor`

### devtools 自动重启

#### 使用方式

* 在Eclipse中保存更改的java文件便会自动重启。
* 在IDEA中需要build -> make project
* 在mvn spring-boot:run中，需要设置fork（仅maven, gradle不用）

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
            <configuration>
                <fork>true</fork>
            </configuration>
        </plugin>
    </plugins>
</build>
```

#### 额外配置

devtools自动重启是通过监视整个classpath实现的，通过设置`spring.devtools.restart.exclude`或者`spring.devtools.restart.additional-exclude`屏蔽监视的文件。或者设置`spring.devtools.restart.additional-paths`增加监视的路径。

设置`spring.devtools.restart.enabled=false`停用自动重启。

设置`spring.devtools.restart.trigger-file`指定触发文件，通过修改触发文件自动重启。

#### 实现方式

devtools通过将不变的class（jar包里的）加载到baseClassloader，将会变化的class（classpath下的）加载到childClassloader，重启的时候baseClassloader不动，通过抛弃并重新加载childClassloader实现热重启。

通过配置`META-INF/spring-devtools.properties`中的`restart.exclude.xxx`或`restart.include.xxx`可以更改加载到哪个classloader

### 浏览器自动刷新

从livereload.com安装插件即可。设置`spring.devtools.livereload.enabled=false`禁用。

### 全局设定

devtools可以有全局设定， 配置`~/.spring-boot-devtools.properties`文件即可。

### 远程调试

* 远端和本地配置`spring.devtools.remote.secret=xxx`，
* 本地端运行`org.springframework.boot.devtools.RemoteSpringApplication`，并指定远端url即可。
* 本地如果有更新class文件，会自动推送到远端。
* 如果远端是以debug模式启动的app（`-Xdebug -Xrunjdwp:server=y,transport=dt_socket,suspend=n`），可以在本地端调试远程端app。默认调试端口为`8000`，可以通过`spring.devtools.remtoe.debug.local-port`更改。
