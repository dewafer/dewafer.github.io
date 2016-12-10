---
layout: post
title: Maven学习笔记
subtitle: 又是一篇学习笔记
---

* 所有`pom.xml`（如果没有指定parent的话）默认继承Super pom中定义的内容。Super pom 在`$MAVEN_HOME/lib/maven-mobel-builder-x.x.x.jar:org/apache/maven/model/pom-4.0.0.xml`
* 使用 `mvn help:effective-pom` 查看当前项目有效的pom定义。
* maven plugin不用指定`groupId`是因为在`settings.xml`中有默认的两个全局`<pluginGroup/>`，分别为`org.apache.maven.plugins`, `org.codehaus.mojo`
* pom可以从parent的pom中继承内容。`<dependencyManagement/>`是用来管理继承的依赖包的，更确切的说是用来管理子pom继承依赖包的版本的。
* maven坐标 `groupId:artifiactId[:type][:classifier]:version` ：maven通过`groupId`、`artifactId`和`version`三位一体来精确定位某一个依赖或插件。
* maven坐标` groupId:artifiactId[:type][:classifier]:version `中的`classifier`非常少见，通常是用在同一个pom不同目标环境的情况下的。
*  maven坐标`groupId:artifiactId[:type][:classifier]:version`中的`type`通过pom中的`<packaging/>`指定，如不指定默认为`jar`，除`jar`以外常见的还有：`ear`、`war`、`pom`、`rar`、`par`、`ejb`、`ejb3`以及通过plugin扩展的各种type等。
* 使用 `mvn dependency:analyze` 检查transitive dependencies。既在代码中用到的依赖jar包，这些jar包没有直接在pom中定义，而是靠其他依赖的jar包带进来的。 譬如pom中定义了`org.springframework:spring-core`，spring-core依赖了`org.apache.commons:commons-core`，而代码中却直接使用了`org.apache.commons:commons-core`包中的内容，即为transitive dependencies。transitive dependencies的危害是，当当前项目中pom直接依赖的包所依赖的第三方包发生改变时，当前项目如果使用了第三方包，将会导致依赖的第三方版本不一致或编译无法通过等问题。
* parent中的`<relativePath/>`默认是 上一级目录的pom，即`../pom.xml`
* dependency scopes:
`compile`：默认scope，将会在所有的classpath中有效，并且会被打包到最终产物中。
`provided`：该scope的依赖应该会由运行期JDK或容器提供，如servlet API等。在编译期有效，但不会被打包到最终产物中。
`runtime`：该scope的依赖仅在运行期有效，不会被包含到编译期，但会被打包到最终产物中。常见的如MySQL数据库驱动等。
`test`：仅在test编译期有效，不会被打包到最终产物中。
`system`：与provided类似，仅有的区别是必须使用`<systemPath/>`来告诉maven改依赖所在的绝对路径。强烈不推荐使用。
`import`：仅限于用在被导入的pom中，定义在`<dependencyManagement/>`节点下的并且`<packaging/>`的值是`pom`的依赖。
* 可选依赖（Optional dependencies）是用在那些编译期必须的，但运行期不一定要的依赖上的（通常是2选一的情况）。当其他项目引用本项目时，必须明确指定需要用到的但在本项目中被指定为optional的依赖。
* 依赖排除（Dependency exclusion）指引用其他依赖包时，可以排除其他依赖包所依赖的包。可以参考[springframework排除commons-loggins](http://docs.spring.io/spring/docs/current/spring-framework-reference/htmlsingle/#overview-not-using-commons-logging)的用法。
* maven所使用的传输协议（http, ftp, ssh等）是靠[maven wagon](http://maven.apache.org/wagon/) 实现的。
* 在settings.xml文件中，使用下面的 配置服务器的用户名密码。（明文密码）
```xml
    <server>
        <id>server-id/repo-id/url-host</id>
        <username>my_username</username>
        <password>my_password</password>
    </server>
```
* 加密settings中的明文密码：（[官方教程](http://maven.apache.org/guides/mini/guide-encryption.html)）
  1. 使用`mvn -emp my_master_password`生成主密码秘钥
  2. 在`settings-security.xml`中添加：（如果没有则创建，同`settings.xml`所在位置）
  ```xml
  <settingsSecurity>
      <master>
      {上一步生成的key，包括外面的花括号}花括号外可以写注释会被忽略
      <master>
  </settingsSecurity>
  ```
  3. 使用`mvn -ep my_password`获得加密的服务器密码。
  4. 修改`settings.xml`
  ```xml
  <server>
      <id>server-id/repo-id/url-host</id>
      <username>my_username</username>
      <password>
          {上一步生成的key，包括外面的花括号}
     </password>
  </server>
  ```
  5. 如果要指定其他位置的`settings-security.xml`，在`settings.xml`同位置下的`settings-security.xml`中配置：
  ```xml
  <settingsSecurity>
      <relocation>
          /path/to/other/settings-security.xml
      </relocation>
  </settingsSecurity>
  ```
* maven scm插件可以通过版本管理系统如svn、git、cvs等来管理代码，参考[官方教程](http://maven.apache.org/scm/maven-scm-plugin/)
* Local repo location：通过`settings.xml`中的`<localRepository/>`指定，默认`~/.m2/repository`
* 通过`settings.xml`中的`<mirror>`类指定镜像服务器。镜像服务器镜像指定的repo仓库，而不是增加repo。通过指定`<mirrorOf>repo-id/*/!repo-id/repo1,repo2/external:*/...</mirrorOf>`指定要镜像的仓库。[官方参考](https://maven.apache.org/guides/mini/guide-mirror-settings.html#Advanced_Mirror_Specification)
* deploy artifact：通过pom中配置`<distributionManagement/>`节点指定artifact的分发。[官方参考](https://maven.apache.org/pom.html#Distribution_Management)
* maven logging：`mvn clean install -X`启用debug level的logging，修改`$MAVEN_HOME/conf/logging/simplelogger.properties`指定logger。
* maven默认有3个lifecycle：`clean`、`default`、`site`，其中`clean`有3个phase，`default`有23个phase，`site`有4个phase。lifecycle不能单独执行，只能执行其中的phase。指定某一phase时，将会从第一个phase开始执行到（包括）当前的phase。如指定`mvn clean install`将会依次执行`pre-clean`、`clean`、`validate`、`initialize`……`install`各个phase。各phase中没有任何具体的可执行内容，具体的执行内容是通过plugin的goal绑定到phase来实现的。通过`mvn help:describe -Dcmd=install`查看各phase所绑定的plugin及其goal。
  每个lifecycle对应的phase：
    * `clean`:
        1. `pre-clean`
        2. `clean`
        3. `post-clean`
    * `default`
        1. `validate`
        2. `initialize`
        3. `generate-sources`
        4. `process-sources`
        5. `generate-resources`
        6. `process-resources`
        7. `compile`
        8. `process-classes`
        9. `generate-test-sources`
       10. `process-test-sources`
       11. `generate-test-resources`
       12. `process-test-resources`
       13. `test-compile`
       14. `process-test-classes`
       15. `test`
       16. `prepare-package`
       17. `package`
       18. `pre-integration-test`
       19. `integration-test`
       20. `post-integration-test`
       21. `verify`
       22. `install`
       23. `deploy`
    * `site`
        1. `pre-site`
        2. `site`
        3. `post-site`
        4. `site-deploy`
* maven plugin的goal可以单独执行，譬如`mvn clean:clean`，但仅可执行当前有效的pom（effective pom，包括parent以及super pom，通过`mvn help:effective-pom`查看）中有定义的plugin的goal。通过`mvn help:describe -Dplugin=clean`查看plugin的各个goal。
* maven的默认lifecycle及其绑定的goal可以在`$MAVEN_HOME/lib/maven-core-x.x.x.jar:META-INF/plex/components.xml`中看到。
* 如何自定义lifecycle请参考[axis2-aar-maven-plugin项目](http://svn.apache.org/repos/asf/axis/axis2/java/core/trunk/modules/tool/axis2-aar-maven-plugin/)。
* 使用maven lifecycle extension来改变maven默认的build过程，[官方参考](https://maven.apache.org/examples/maven-3-lifecycle-extensions.html)
* 常用的maven plugin有：（具体请参考[官方插件列表](https://maven.apache.org/plugins/index.html)）
  * `clean`
  * `compiler`
  * `install`
  * `deploy`
  * `surefire`
  * `site`
  * `jar`
  * `source`
  * `resources`
  * `release`
* `<pluginManagement/>`和`<dependencyManagemenet/>`一样，是用来给子pom继承的用的， 更确切的说是用来管理子pom继承依赖包的版本的。
* maven会从`<pluginRepositories/>`中定义的仓库中下载插件。
* `<plugin/>`中的`<extensions/>`是用来告诉maven，该插件是否扩展了`<packaging/>`或者是否有自定义lifecycle的。
*  maven使用Plexus作为其DI容器，[maven 架构图](https://maven.apache.org/ref/current)，[plexus官方站](http://codehaus-plexus.github.io/)。maven 3.0以后使用[Google Guice](https://github.com/google/guice)来兼容JSR-330，但那些用Plexus API写的旧代码仍然与JSR-330兼容组件并存，[参考](http://blog.sonatype.com/2010/01/from-plexus-to-guice-1-why-guice/)。
* 自行开发Maven Plugin：[官方教程](http://maven.apache.org/plugin-developers/index.html)
    1. 写MOJO(Maven plain Old Java Object)：扩展`AbstractMojo`，并用`@Mojo`注释。一个MOJO一个Plugin Goal。
    2. 创建项目文件，依赖`maven-plugin-api`以及`maven-plugin-annotations`。
    3. 使用`maven-plugin-plugin`生成`plugin.xml`文件。
    4. Client项目引用自行开发的plugin，并将goal绑定phase。或者
    5. 在MOJO上增加`@Execute`注解，未插件的goal绑定全局phase。
* 插件的执行顺序：
    1. 按goal绑定的phase。
    2. 同一个phase里面按pom中goal申明的顺序。
* 使用`-Dmaven.repo.local=/path/to/repo`来覆盖本地仓库的位置。
* 使用`mvn <plugin>:help`查看插件的goal，与`mvn help:describe -Dplugin=<plugin>`相同。使用`mvn <plugin>:help -Ddetail -Dgoal=<goal>`查看插件下某一goal的详细说明，与`mvn help:describe -Dplugin=<plugin> -Dgoal=<goal> -Ddetail`相同。
* 导出某一项目的仓库`mvn dependency:go-offline -Dmaven.repo.local=/path/to/repo`。
* 清理并重新解析本地仓库`mvn dependency:purge-local-repository`
* 使用`maven-assembly-plugin`插件来打包非标准的jar/war项目。
* 使用maven archetype生成项目：`mvn archetype:generate`，[官方教程](https://maven.apache.org/guides/introduction/introduction-to-archetypes.html)
* maven的archetype有3种catalog：
    * local:`~/.m2/archetype-catalog.xml`
    * remote:`http://repo1.maven.org/maven2/archetype-catalog.xml`
    * internal: within maven-archetype-plugin.(deprcated?)
* 从现有项目建立一个maven archetype:[官方教程](https://maven.apache.org/guides/mini/guide-creating-archetypes.html)
    1. 在现有项目根目录下运行`mvn archetype:create-from-project`
    2. cd到`${project.basedir}/target/generated-sources/archetype`然后运行`mvn install`即可。生成的archetype被安装到local repo中去了。
    3. 或者编辑`${project.basedir}/target/generated-sources/archetype/src/main/resources/META-INF/maven/archetype-metadata.xml`然后在`mvn install`即可。
* maven仓库：本地仓库/远程仓库，远程仓库又可细分为release仓库/snapshot仓库/plugin仓库。
* maven仓库的更新策略由`<updatePolice/>`指定，可指定的值为`always`, `daily`, `interval:x` 和 `never`。其中`interval:x`的`x`值的是分钟值。`<updatePolice/>`的默认值为`daily`。
* maven查询仓库的次序依次是：`settings.xml`中的仓库、Application POM, Parent Pom(if any, and parent's parent pom if any), super POM。
* maven仓库mananger，可选项有：Apache Archiva, Sonatype Nexus等，[官方参考](https://maven.apache.org/repository-management.html)。
* 强行更新本地仓库缓存（包括插件）：`mvn clean verify -U -up`
* 在`parent/pom.xml`文件中，使用`<dependencyManagement/>`统一管理所有依赖的版本，使用`<pluginManagement/>`统一管理所有插件的版本。
* maven可用的属性有：built-in, project, local settings, env, java system, custom(仅用作定义依赖及插件版本)。
* 不要在子pom中重复定义groupId和version，让子项目从parent pom中继承。
* 命名规范：
    * groupId小写
    * 使用反向的域名作为groupId，如com.example
    * 在groupId和artifactId中尽量不要用数字和特殊字符，如横杠下划线#, $, &, %等
    * 在groupId和artifactId中不要用驼峰命名法
    * 确保同一家公司的所有子项目继承相同的groupId，如org.apache.axis2, org.apache.synapse。
    * artifactId小写
    * 不要在artifactId中重复groupId的值
    * 版本号命名规范：`<主要版本>.<次要版本>.<增量版本>-<构建号或者qualifier>`，其中：
        * `<主要版本>`指重要功能大更新，主要版本更新说明可能与之前版本不兼容。
        * `<次要版本>`指为当前版本加入了新功能，次要版本更新说明与之前的版本兼容。
        * `<增量版本>`指bug修复
        * `<构建号或者qualifier>`构建号可以是代码仓库的版本号，qualifier指SNAPSHOT/RELEASE。
* maven的profile可以用`<activation/>`指定激活方式，譬如当前环境中有某个property或某个property的值为多少，或者当前jdk是什么版本、当前的操作系统是什么版本cpu是什么架构、某一文件是否存在等。[官方参考](https://maven.apache.org/pom.html#Profiles)
* 使用maven release plugin来释放某一版本[官方参考](https://maven.apache.org/maven-release/maven-release-plugin/)，使用enforcer plugin来限制build环境[官方参考](https://maven.apache.org/enforcer/maven-enforcer-plugin/)。
* 如果在plugin中不指定版本，maven会使用最新版本的plugin，尽量不要使用未指定版本的插件。
* 在仓库manager中指定inclusive/exclusive routes来加速maven查找依赖。
* 不要混用release和snapshot仓库。不要在nexus的group仓库中混用proxy和hosted仓库。尽量减少pom中定义的远程仓库数量。不要更改仓库的url而使用mirrorOf代理仓库。在parent/pom.xml中增加项目的详细说明。对每个pom增加注释。不要更改maven项目的默认文件结构。在开发中使用SNAPSHOT版本。使用`mvn dependency:analyze`查看并移除不需要的依赖。不要在项目的pom中保存用户名密码。不要使用已废弃的pom.* properties。尽量使用archetypes。尽量不要使用maven.test.skip。使用复制资源/svn externals/remote resource plugin来共享项目间的资源。
