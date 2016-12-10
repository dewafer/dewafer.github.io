---
layout: post
title: 远古项目升级 Maven 项目心得
subtitle: 一些有的没的的建议/意见
---

### 前言

朋友让我帮忙把一个用Eclipse开发的、Ant编译的远古Java Web项目升级成使用Maven进行包管理的现代Java Web项目。
升级一个远古项目并不难，但让人最痛苦的莫过于把那些没有文档、没有来源的无头鬼依赖jar包翻译成Maven中央仓库上的依赖，还要考虑各种jar文件的版本以及互相之间的依赖关系。这里就浅谈一下心得吧。

### 变换项目结构

一个Eclipse的Web项目文件夹结构一般如下：

* .settings目录，这个目录是Eclipse保存配置的地方
* bin目录，编译出的classes文件驻扎在此
* src目录，源代码文件和一些properties配置文件会驻扎在此
* WebContent目录，web文件根目录，JSP文件的家、WEB-INF、web.xml和编译出来的classes也可能在这里面，还有最让人头疼的lib文件夹也会在这里面
* 项目根目录下一些如`.classpath`、`.project`等Eclipse的配置文件（通常会被`.gitignore`无视，但既然说了是远古项目，所以也没git什么事了）
* 另外一些由人为手动设置的属于classpath的根目录，可以在`.classpath`文件中看到，比如`<classpathentry kind="src" path="resources"/>`这种就可以知道是一个由人为手动设置的编译时被归为classpath的目录

一个Maven项目的目录结构一般如下：

* `src/main/java`，Java源文件常驻目录
* `src/main/resources`，properties常驻目录，xml配置也可以放这里，一般是用来存放需要在build时进行filter并且打包到classpath下的文件
* `src/test/java`，测试源文件常驻目录
* `src/test/resources`，测试用properties常驻目录
* `src/webapp`，web文件根目录，相当于WebContent

有了这两个表对比将Eclipse项目目录结构变化成Maven项目目录其实是一件很简单的事情了，在此不多赘述。
相比比较重要需要注意的几点：

* 首先在Eclipse项目中，人们比较喜欢手动加一些classpath目录来存放properties文件，注意不要遗漏
* 其次，一些项目会把properties文件存放在src目录下，这在Eclipse项目中没有什么大问题，但在Maven项目中建议将这些配置文件放在`src/main/resources`目录下，原因如下：
  * 首先，如果将配置文件放在`src/main/java`目录下，则maven在打包时可能不会包含这些文件，需要另行手动配置，但行业通识是不建议手动更改Maven目录结构的。
  * 其次，在`src/main/resources`目录下的配置文件可以在Maven打包时进行filter
* 不要把`WEB-INF/classes`目录下的文件导入进来
* 不要把`WEB-INF/lib`目录下的文件导入进来，这个目录下的依赖包需要手动转换成Maven依赖
* 不要遗漏一些在Eclipse项目中手动添加的，但不要lib目录下的依赖包，可以在`.classpath`文件中看到，比如`<classpathentry kind="lib" path="..."/>`这种。
* 不要把不属于需要编译打包的源文件放入Maven项目`src/**`下任何目录中去，因为会被打包发布出去的！如需要可以放在项目根目录下，根据需要起名，譬如`docs`这种简介易懂的名字。
* 推荐使用`.gitignore`、`.editorconfig`和`mvnw`
* 如果有多个Eclipse项目并且互相依赖，在Maven中创建父子继承结构，父项目作为aggregator，子项目作为submodule，并且按照Eclipse的依赖结构在pom中互相依赖。

### 变换依赖jar包

这是最头疼最复杂的事情了，在这里只能提供几点建议：

* 尽量找同版本的jar包，实在不行就`jar -xvf`架包，查看MENIFEST.MF、或者`javap`查看jar包的详细信息，然后去maven中央仓库找同groupId、同artifact、同version的。
* 不是lib下所有的jar都需要显示申明到`pom.xml`文件里面去。首先把比较主要的加入`pom.xml`，譬如`spring-mvc`这种是100%要加得，然后使用`mvn dependency:tree`查看依赖树查找缺少的包、使用`mvn dependency:analyze`检查那些用到的但没有显示依赖的包，去掉那些没用到的包，这里需要注意不能全部去掉，因为有些包编译期没有用到但并不表明它没用，很多情况下运行期需要它，譬如mysql-connector这种包，需要结合经验与实际处理。
* 不是所有的依赖scope都是默认或者说是compile的，譬如`javax.servlet`这种scope就可以是provided，还有mysql-connector这种是runtime。
* 碰到中央仓库中没有的包，按以下最优顺序处理
  1. 如果这个第三方包提供了官方的repository，使用该repository
  2. 如果条件允许，建立项目范围内的或公司范围内的repository
  3. 将这个包install到本地repo，如果可以在项目pom中引用改repo，并该repo作为代码一起提交
  4. 条件实在苛刻，使用system scope指定systemPath
