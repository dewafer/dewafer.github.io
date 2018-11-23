---
layout: post
title: Spring Boot 自定义注解实现切面编程
---

这两年，好多人在用 Spring Boot 做微服务，想必大家都用过 Spring Boot 的 `@Async` 注解，都觉得非常好用，但是有没有同学了解过 `@Async` 是怎么实现的呢？
本文中我们将模仿 `@Async` 注解来实现一个我们自己的切面注解。

在继续阅读之前，我们假设读者已经熟知了以下知识点，如果对以下内容有问题的，请阅读相关文章进行补习，我不会在后文中解释下面的内容。

* Spring `@Async` 注解的[相关内容](https://docs.spring.io/spring/docs/5.1.2.RELEASE/spring-framework-reference/integration.html#scheduling-annotation-support-async)。
* Spring AOP 的[基本概念](https://docs.spring.io/spring/docs/5.1.2.RELEASE/spring-framework-reference/core.html#aop-introduction-defn)和[API](https://docs.spring.io/spring/docs/5.1.2.RELEASE/spring-framework-reference/core.html#aop-api)。
* Spring IOC 容器的[基本概念](https://docs.spring.io/spring/docs/5.1.2.RELEASE/spring-framework-reference/core.html#beans)以及 `BeanPostProcessor` 的[基本概念](https://docs.spring.io/spring/docs/5.1.2.RELEASE/spring-framework-reference/core.html#beans-factory-extension)。

在正式开始之前，我们先来讨论一下这种需求的常见场景。

虽然这些年市面上都号称流行各种切面编程，但从我个人的工作经验总结下来，通常所谓“切面”中所需实现的内容，要和业务代码完全正交的场景，是非常少见的。
比较常见的情况则是“切面”中的内容与业务的实现部分相关，或者需要根据业务不同场景进行自定义的。

举个例子，譬如说与业务完全正交的切面场景，我能想到的除了 logging 和 transaction 处理外，几乎就没有了。但我相信大部分有经验的同学肯定碰到过这样的需求：
BI 的同学希望通过 log 大数据分析能知道我们用户使用某业务时喜欢选用的参数，或者我们需要根据某业务的需求自定义某模块的 transaction 的 propagation 的参数。
你说这里的 logging 和 transaction 和业务完全相关吗？也不是，完全无关吗？也不是。这是一个比较尴尬的点。就算是像 `@Async` 这样的实现，其实也是与业务有部分相关的，
尤其是当你需要使用到 `Future` 来等待异步完成，或者使用信号量来控制异步执行的时候，业务场景和异步的实现其实是强相关的。

通常情况下，一个系统的切面实现由所谓的架构师实现，但大部分所谓的架构师并不太会去关心业务实现所需要的需求；一个业务的实现由码农实现，而码农几乎不太会去关心系统架构的问题，
譬如这个系统的切面是如何实现的，能否根据需要客制化。有时候这样的各自为阵就会导致问题：要么架构师实现的切面在业务的实现中几乎起不了作用，要么码农会把一些与业务几乎正交并且通常重复的代码，
复制黏贴并散布到各个业务模块中去，如此一来，整个系统的可维护性几乎是不会有的。企业就不得不在推倒了重来的过程中重复浪费，time to production 效率低，容易错失先机。
这样的情况在一些大企业外包软件业务中非常常见。

总体来说，一般比较常见的场景是切面的实现是跟业务的实现有部分关系的，或者，切面中的某些处理，是需要根据业务实现的需求进行客制化的。
因此，理论上，我们需要架构师能够实现能应业务实现需求而进行客制化的切面处理，而需要码农在实现业务时意识到切面的存在，并且能够在业务实现的过程中，
正确使用地使用切面，或者说正确地配置由架构师实现的客制化切面。

由此可见，比起传统的切面实现，像 `@Async` 这样的注解切面的实现，在业务实现的过程当中，其需求量是非常大的。

那么我们就来看看，到底如何实现一个类似 `@Async` 这样的注解。

要实现一个类似 `@Async` 的注解，首先我们要了解这个注解是怎么实现的。

如果你查看 `@Async` 的源代码，你会看到2个类，分别是 `AsyncAnnotationAdvisor` 和 `AnnotationAsyncExecutionInterceptor` 。
其中 `AsyncAnnotationAdvisor` 是一个 `PointcutAdvisor` ，这个 `Advisor` 的基本任务就是在构造的时候，使用传入的 `TaskExecutor` 建立 `Pointcut` 和 `Advice` ；
而 `AnnotationAsyncExecutionInterceptor` 则是一个 `MethodInterceptor` ，而 `MethodInterceptor` 本质上是一种 `Advice` ，
并且正是 `AsyncAnnotationAdvisor` 在构造的时候建立的`Advice`。

在 `AsyncAnnotationAdvisor` 的 `buildPointcut` 方法中，我们可以看到一个很有趣的类 `AnnotationMatchingPointcut` 。
这个类可以用来构造能够针对被特定注解注释的切点，其中分别有两个 static 方法 `forClassAnnotation` 和 `forMethodAnnotation`。
我想看名字大致就能猜到干啥用的了，我就不做解释了。

好了，读懂了源代码，想要模仿一个 `@Async` 就不难了，我们只需要模仿 `AsyncAnnotationAdvisor` 实现一个 `PointcutAdvisor` ，
然后为我们自建的注解复用 `AnnotationMatchingPointcut` 就行了。
如果你仔细看 `AsyncAnnotationAdvisor` 就会发现它的父类 `AbstractPointcutAdvisor` 是一个通用的 `PointcutAdvisor` ，
我们只需要继承它，然后分别实现 `getAdvice` 和 `getPointcut` 就行了。

好了，大致的思路有了，接下来的问题是，这些 `Adivsor` 和 `Interceptor` 是怎么被用到 Spring 的 bean container 里面去的？

答案非常简单： `BeanPostProcessor`。

`@Async` 相关的源码里面有个 `AsyncAnnotationBeanPostProcessor` ，它的父类 `AbstractBeanFactoryAwareAdvisingPostProcessor` 可以用来创建
被 `Advice` 修饰的 bean，而且实现起来非常简单，只要告诉它我们的 `Advisor` 就行了。

好了，既然原理都搞懂了，自己实现一套应该不难，于是我就创建了一个演示项目好让只有七秒记忆的我能记住：

[spring-annotation-advisor-example](https://github.com/dewafer/spring-annotation-advisor-example)
