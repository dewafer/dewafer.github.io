---
layout: post
title: spring-data-jpa源码阅读笔记：Repository方法名查询推导(Query Derivation From Method Names)的实现原理
subtitle: 表问我JPA怎么玩的……
header-img: http://ww4.sinaimg.cn/large/51d3f408gw1etizhx8aslj21hc0zctel.jpg
---

## Repository方法名查询推导（Query Derivation From Method Names）的实现原理

### Repository的默认实现

从spring-data-jpa的源代码中可以看到，`Repository`接口有默认的实现类[`SimpleJpaRepository`](https://github.com/spring-projects/spring-data-jpa/blob/master/src/main/java/org/springframework/data/jpa/repository/support/SimpleJpaRepository.java)。（其实还有个[`QueryDslJpaRepository`](https://github.com/spring-projects/spring-data-jpa/blob/master/src/main/java/org/springframework/data/jpa/repository/support/QueryDslJpaRepository.java)扩展了`SimpleJpaRepository`，暂忽略不计）

该类实现了[`JpaRepository`](https://github.com/spring-projects/spring-data-jpa/blob/master/src/main/java/org/springframework/data/jpa/repository/JpaRepository.java)和`JpaSpecificationExecutor`两个接口。它为我们提供了常用的几个仓库接口（`JpaRepository`, `PagingAndSortingRepository`, `CrudRepository`）内各个方法的默认实现方式。

那么问题来了，如果我使用了仓库中的方法名查询推导（Query Derivation from method names），那么这样一个没有实现的接口中的抽象方法又是怎么正确运作的呢？

一个方法名查询推导（Query Derivation）示例：

```
{% highlight java %}
  public interface CustomerRepository extends Repository<Customer, Long> {
    // 这个方法没有实现，但是却能正确猜测两个参数分别是Customer的两个属性。
    List<Customer> findByEmailAndLastname(EmailAddress email, String lastname);
  }
{% endhighlight %}
```

这个接口中的`findByEmailAndLastname`方法没有任何实现，但却能正确完成任务，这是怎么做到的呢？


### 从FactoryBean到Repository

从[`@EnableJpaRepositories`](https://github.com/spring-projects/spring-data-jpa/blob/master/src/main/java/org/springframework/data/jpa/repository/config/EnableJpaRepositories.java)注解中可以看到，注解会默认注册[`JpaRepositoryFactoryBean.class`](https://github.com/spring-projects/spring-data-jpa/blob/master/src/main/java/org/springframework/data/jpa/repository/support/JpaRepositoryFactoryBean.java)作为Repository仓库的工厂Bean。找到了Repository仓库的工厂Bean，应该很方便就能找到当中缺失的一环了。

从[`JpaRepositoryFactoryBean`](https://github.com/spring-projects/spring-data-jpa/blob/master/src/main/java/org/springframework/data/jpa/repository/support/JpaRepositoryFactoryBean.java)的源码中可以看到它的继承结构：

> [`JpaRepositoryFactoryBean`](https://github.com/spring-projects/spring-data-jpa/blob/master/src/main/java/org/springframework/data/jpa/repository/support/JpaRepositoryFactoryBean.java) extends [`TransactionalRepositoryFactoryBeanSupport`](https://github.com/spring-projects/spring-data-commons/blob/master/src/main/java/org/springframework/data/repository/core/support/TransactionalRepositoryFactoryBeanSupport.java)

> [`TransactionalRepositoryFactoryBeanSupport`](https://github.com/spring-projects/spring-data-commons/blob/master/src/main/java/org/springframework/data/repository/core/support/TransactionalRepositoryFactoryBeanSupport.java) extends [`RepositoryFactoryBeanSupport`](https://github.com/spring-projects/spring-data-commons/blob/master/src/main/java/org/springframework/data/repository/core/support/RepositoryFactoryBeanSupport.java)

后两者来自于spring-data-commons项目。

`FactoryBean.getObject()`方法由[`RepositoryFactoryBeanSupport`](https://github.com/spring-projects/spring-data-commons/blob/master/src/main/java/org/springframework/data/repository/core/support/RepositoryFactoryBeanSupport.java)类实现，调用了`RepositoryFactoryBeanSupport.initAndReturn()`方法，在该方法中可以看到调用了`this.factory.getRepository(...)`方法来初始化仓库并将其保持在域中。那么问题来了，`this.factory`从哪里来的呢？

```
{% highlight java %}
  /**
   * Returns the previously initialized repository proxy or creates and returns the proxy if previously uninitialized.
   *
   * @return
   */
  private T initAndReturn() {

    Assert.notNull(repositoryInterface, "Repository interface must not be null on initialization!");

    if (this.repository == null) {
      // 下面这个方法使用this.factory初始化了repository，那么factory哪里来的呢？
      this.repository = this.factory.getRepository(repositoryInterface, customImplementation);
    }

    return this.repository;
  }
{% endhighlight %}
```

在[`RepositoryFactoryBeanSupport`](https://github.com/spring-projects/spring-data-commons/blob/master/src/main/java/org/springframework/data/repository/core/support/RepositoryFactoryBeanSupport.java)中搜索`factory`就会看到，原来`this.factory`是在`afterPropertiesSet()`方法中，由抽象方法`createRepositoryFactory()`提供的。

```
{% highlight java %}
  /*
   * (non-Javadoc)
   * @see org.springframework.beans.factory.InitializingBean#afterPropertiesSet()
   */
  public void afterPropertiesSet() {

    Assert.notNull(repositoryInterface, "Repository interface must not be null on initialization!");

    this.factory = createRepositoryFactory(); // 原来从这里来！
    this.factory.setQueryLookupStrategyKey(queryLookupStrategyKey);
    this.factory.setNamedQueries(namedQueries);
    this.factory.setEvaluationContextProvider(evaluationContextProvider);
    this.factory.setRepositoryBaseClass(repositoryBaseClass);
    this.factory.setBeanClassLoader(classLoader);
    this.factory.setBeanFactory(beanFactory);

    this.repositoryMetadata = this.factory.getRepositoryMetadata(repositoryInterface);

    if (!lazyInit) {
      initAndReturn();
    }
  }
{% endhighlight %}
```

在[`TransactionalRepositoryFactoryBeanSupport`](https://github.com/spring-projects/spring-data-commons/blob/master/src/main/java/org/springframework/data/repository/core/support/TransactionalRepositoryFactoryBeanSupport.java)中可以看到，`createRepositoryFactory()`方法被实现并被标记为`final`。从实现中可以看到它又调用了抽象方法`doCreateRepositoryFactory()`来获取`RepositoryFactorySuport`，然后为该factory增加了`exceptionPostProcessor`和`txPostProcessor`两个PostProcessor。从名称上可以获悉这两个PostProcessor分别负责转换例外（将JPA例外转换成Spring专有的）和事务管理。

```
{% highlight java %}
  /**
   * Delegates {@link RepositoryFactorySupport} creation to {@link #doCreateRepositoryFactory()} and applies the
   * {@link TransactionalRepositoryProxyPostProcessor} to the created instance.
   *
   * @see org.springframework.data.repository.core.support.RepositoryFactoryBeanSupport #createRepositoryFactory()
   */
  @Override
  protected final RepositoryFactorySupport createRepositoryFactory() { // 注意方法是final的，说明不能再被继承覆盖了。

    RepositoryFactorySupport factory = doCreateRepositoryFactory(); // 但这个方法可以被继承覆盖。
    factory.addRepositoryProxyPostProcessor(exceptionPostProcessor);
    factory.addRepositoryProxyPostProcessor(txPostProcessor);

    return factory;
  }
{% endhighlight %}
```

在[`JpaRepositoryFactoryBean`](https://github.com/spring-projects/spring-data-jpa/blob/master/src/main/java/org/springframework/data/jpa/repository/support/JpaRepositoryFactoryBean.java)中可以看到，`doCreateRepositoryFactory`方法被实现。该方法使用注入的`EntityManager`来new了一个[`JpaRepositoryFactory`](https://github.com/spring-projects/spring-data-jpa/blob/master/src/main/java/org/springframework/data/jpa/repository/support/JpaRepositoryFactory.java)，没错，这个类和前面一个比少了一个Bean。


```
{% highlight java %}
  /*
   * (non-Javadoc)
   *
   * @see org.springframework.data.repository.support.
   * TransactionalRepositoryFactoryBeanSupport#doCreateRepositoryFactory()
   */
  @Override
  protected RepositoryFactorySupport doCreateRepositoryFactory() {
    return createRepositoryFactory(entityManager); // 找到你了
  }

  /**
   * Returns a {@link RepositoryFactorySupport}.
   *
   * @param entityManager
   * @return
   */
  protected RepositoryFactorySupport createRepositoryFactory(EntityManager entityManager) {
    return new JpaRepositoryFactory(entityManager); // 没错就这个少了Bean的factory
  }
{% endhighlight %}
```

[`JpaRepositoryFactory`](https://github.com/spring-projects/spring-data-jpa/blob/master/src/main/java/org/springframework/data/jpa/repository/support/JpaRepositoryFactory.java)这个没有Bean的工厂类继承了[`RepositoryFactorySupport`](https://github.com/spring-projects/spring-data-commons/blob/master/src/main/java/org/springframework/data/repository/core/support/RepositoryFactorySupport.java)类（在spring-data-commons项目中），和`JpaRepositoryFactoryBean`的继承结构如出一辙。在`RepositoryFactorySupport`这个类的源代码中，我们可以找到`getRepository`方法的实现。


```
{% highlight java %}
  /**
   * Returns a repository instance for the given interface backed by an instance providing implementation logic for
   * custom logic.
   *
   * @param <T>
   * @param repositoryInterface
   * @param customImplementation
   * @return
   */
  @SuppressWarnings({ "unchecked" })
  public <T> T getRepository(Class<T> repositoryInterface, Object customImplementation) {

    RepositoryMetadata metadata = getRepositoryMetadata(repositoryInterface);
    Class<?> customImplementationClass = null == customImplementation ? null : customImplementation.getClass();
    RepositoryInformation information = getRepositoryInformation(metadata, customImplementationClass);

    validate(information, customImplementation);

    Object target = getTargetRepository(information);

    // Create proxy
    ProxyFactory result = new ProxyFactory(); // Repository都只是代理，并不是真正的实现。
    result.setTarget(target);
    result.setInterfaces(new Class[] { repositoryInterface, Repository.class });

    result.addAdvice(ExposeInvocationInterceptor.INSTANCE);

    if (TRANSACTION_PROXY_TYPE != null) {
      result.addInterface(TRANSACTION_PROXY_TYPE);
    }

    for (RepositoryProxyPostProcessor processor : postProcessors) {
      processor.postProcess(result, information);
    }

    if (IS_JAVA_8) {
      result.addAdvice(new DefaultMethodInvokingMethodInterceptor());
    }

    // 魔法从这里来
    result.addAdvice(new QueryExecutorMethodInterceptor(information, customImplementation, target));

    return (T) result.getProxy(classLoader);
  }
{% endhighlight %}
```

没错，关键缺失的一环就在这里。在这个方法中可以看到，首先它获取了Repository的各种信息，包括metadata、customImplementation、information等，
然后使用了`ProxyFactory`，并且为这个`ProxyFactory`注册了几个`Advice`，最后通过`getProxy`方法创建了一个Repository的代理。
而真正起到魔法般作用的应该就是这个[`QueryExecutorMethodInterceptor`](https://github.com/spring-projects/spring-data-commons/blob/master/src/main/java/org/springframework/data/repository/core/support/RepositoryFactorySupport.java#L389)类了。


### 从魔法到现实

然而我并不想去读懂这个`QueryExecutorMethodInterceptor`，啥时候等我有空了看懂了再来说说这货的实现原理吧。

债见。
