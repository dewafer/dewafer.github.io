---
layout: post
title: Spring Data JPA 多数据源配置总结
subtitle: Spring boot下Jpa的自动配置以及手动配置原理
---

### Spring boot中Jpa的自动配置

Spring Boot 中，jpa 自动配置在`JpaBaseConfiguration`中能看到。
`JpaBaseConfiguration`是一个抽象类，只有`HibernateJpaAutoConfiguration`一个子类（？）


`JpaBaseConfiguration`提供JPA默认的基础配置，`HibernateJpaAutoConfiguration`则提供Vendor专有的配置。
其实JPA的Vendor只有Hibernate使用最广泛。


`JpaBaseConfiguration`主要提供4个Bean:
 * `PlatformTransactionManager`类型的`transactionManager`
 * `JpaVendorAdapter`
 * `EntityManagerFactoryBuilder`
 * `LocalContainerEntityManagerFactoryBean`类型的`entityManagerFactory`


这4个bean的主要职责分别为：
 * 为JPA提供事务支持，注意这里需要使用`JpaTransactionManager`
 * 为`EntityManagerFactoryBuilder`提供Vender相关的特殊信息
 * 用来构建`EntityManagerFactory`的Builder
 * 使用`EntityManagerFactoryBuilder`构建的`entityManagerFactory`


而在`JpaBaseConfiguration`的子类`HibernateJpaAutoConfiguration`中，则提供了Hibernate相关的Vender特殊配置。
另外，其中部分Hiberante专有Vender相关特殊配置来源于`JpaProperties.getHibernateProperties(datasource)`方法。
特别是`hiberante.id.new_generator_mappings`相关的配置，这个配置决定了Hibernate是否启用新ID Generator。


如果没有特别配置，并且当前hibernate的版本是5的话，这个设置会被默认设置为false。
在MySQL中，这决定了`strategy=AUTO`的`@GeneratedValue`是使用Column的auto increment
还是走由hibernate生成的sequence表（`hibernate_sequence`）。


`JpaBaseConfiguration`启用了一个配置属性Bean（`ConfigurationProperties`）：
 * `JpaProperties`
它的前缀为`spring.jpa`，用来参与jpa相关的配置。另外它还提供了Hibernate作为JPA的Vender相关的配置。


### Spring boot中Datasource的自动配置

自动配置参考`DataSourceAutoConfiguration`类，这个类的主要目的是为了根据动态条件导入一下几个类：
 * `EmbeddedDataSourceConfiguration`，此类负责配置h2嵌入式数据库
 * `DataSourceConfiguration.Tomcat/Hikari/Dbcp/Dbcp2/Generic`，此类负责配置数据库链接缓存池。


当自动配置条件符合h2的时候，`EmbeddedDataSourceConfiguration`会被导入并启用，可以在该类中看到，
真正的datasource是通过`EmbeddedDatabaseBuilder`加载`DataSourceProperties`类来构建的。


当自动配置条件符合其他，也就是`Tomcat/Hikari/Dbcp/Dbcp2/Generic`的情况下，
DataSource是通过`DataSourceProperties`类中的`initializeDataSourceBuilder`方法返回的`DataSourceBuilder`来构建的。


`DataSourceProperties`类的基本职责是为了读取`application.yml`文件中`spring.datasource`下的各项配置项的。
而该类中的`initializeDataSourceBuilder`方法则是将`DataSourceProperties`读取的数据库配置
放入一个新`DataSourceBuilder`实例并返回。


在`DataSourceConfiguration`类中，不同类型的数据库链接池通过对`DataSourceProperties`传入不同的`type`
来指定`DataSourceBuilder`构建不同类型的数据源。这个`type`可以通过`spring.datasource.type`来指定。


这个`spring.datasource.type`可以指定的值有：
 * `org.apache.tomcat.jdbc.pool.DataSource`
 * `com.zaxxer.hikari.HikariDataSource`
 * `org.apache.commons.dbcp.BasicDataSource`
 * `org.apache.commons.dbcp2.BasicDataSource`
  
  
可以看到这些类都是常用的db pool。并且，如果在当前classpath上存在这些类中的某一个，但是
又没有在`application.yml`中指定`spring.datasource.type`，这些相应的配置也会生效。
譬如如果当前系统是tomcat容器，在classpath上存在`org.apache.tomcat.jdbc.pool.DataSource`，
但并没有在`application.yml`中指定`spring.datasource.type=org.apache.tomcat.jdbc.pool.DataSource`，
则Tomcat的数据库缓存池也会起效。


如果没有指定任何`spring.datasource.type`，并且在classpath上也不存在上述那些`DataSource`类，
则不会针对`DataSourceBuilder`指定任何`type`。一般来说会直接`new`一个在`application.yml`中
指定的`driverClass`的对象（一般来说是`DataSource`接口的实现）出来并返回。


另外需要提一下的是，如果你指定了`type`，或者知道系统会明确使用哪个db pool的话，
本来指定在`spring.datasource`下的配置可以指定到相应的`type`类型下，譬如tomcat的话可以指定到
`spring.datasource.tomcat`下，hikari的话是`spring.datasource.hikari`下。


针对`DataSourceBuilder`，我们还需要特别说明的是，当`DataSourceBuilder` build datasource的时候，
如果当前没有指定任何`type`，它还会再次尝试通过`Class.forName`的方式去加载上述4个db pool，
如果失败了，则会报`No supported DataSource Type found`的错。


另外，如果你没有指定`driverClassName`，这个类还会通过猜测database的url来获取driver class name。


### 自行配置数据源和相应的JPA

知道了Spring boot是如何自动配置JPA和数据源的，我们就能手动配置了。


首先需要配置数据源，数据源最简单的配置方式是，首先使用`@ConfigurationProperties`将相应的数据库配置
注入`DataSourceProperties`对象。然后使用该对象的`initializeDataSourceBuilder`方法初始化一个
`DataSourceBuilder`然后build即可。譬如


```java
@Bean
@ConfigurationProperties("spring.datasource")
public DataSourceProperties dataSourceProperties() {
    return new DataSourceProperties();
}

@Bean
public DataSource dataSource() {
    return dataSourceProperties().initializeDataSourceBuilder().build();
}
```


这样我们就能根据`spring.datasource`下的配置注入数据源了。


然后JPA需要注入两个Bean，一个是`LocalContainerEntityManagerFactoryBean`，此`FactoryBean`
主要用来为JPA提供`EntityManager`。另外一个是`PlatformTransactionManager`，此`transactionManager`
主要为`EntityManager`提供事务管理的支持。


其中，`LocalContainerEntityManagerFactoryBean`可以使用auto config提供的`EntityManagerFactoryBuilder`来构建。
然后，为了让Spring Data JPA知道我们需要使用`Repository`并且扫描指定的目录，可以使用`@EnableJpaRepository`注解
来指定相应的package。另外，我们还可以使用`JpaProperties`来获取`spring.jpa`下的vender相关配置。


一个示例配置如下：


```java
@Configuration
@EnableConfigurationProperties(JpaRepoerties.class)
@EnableJpaRepository(basePackageClasses = {RepositoryScanMarker.class}) // 指定Spring Data JPA的Repository所在包
public class JpaRepositoryConfiguration {

    @Autowired
    private JpaProperties jpaProperties;

    @Bean
    public LocalContainerEntityManagerFactoryBean entityManagerFactory(EntityManagerFactoryBuilder builder, DataSource datasource) {
        return builder.dataSource(datasource)  // 指定数据源
            .packages(EntityScanMarker.class) // 指定Entity所在包
            .properties(jpaProperties.getHibernateProperties(dataSource)) // 获取并注入hibernate vender相关配置
            .persistenceUnit("default") // 指定persistence unit
            .build();
    }

    @Bean
    public PlatformTransactionManager transactionManager(EntityManagerFactory entityManagerFactory) {
        return new JpaTransactionManager(entityManagerFactory); // 构建事务管理器
    }
}
```


如果要配置多个数据源和多个`entityManager`，只需要注入多个`LocalContainerEntityManagerFactoryBean`
和多个`transactionManager`即可。但需要注意以下事项：
 * 为一个`LocalContainerEntityManagerFactoryBean`和`transactionManager`的bean增加`@Primary`，
   这样如果后面有自动配置的情况，系统能知道默认使用哪个`EntityManagerFactoryBean`和哪个`transactionManager`。
 * `@EnableJpaRepository`会自动使用默认名字为`entityManagerFactory`的`LocalContainerEntityManagerFactoryBean`
   和默认名字为`transactionManager`的`TransactionManager`。如果要指定多个`EntityManager`的情况，
   需要在`@EnableJpaRepository`上使用`entityManagerFactoryRef`和`transactionManagerRef`另外指定不同的
   `LocalContainerEntityManagerFactoryBean`和`TransactionManager`.
 * 另外，`TransactionManager`必须是`JpaTransactionManager`！必须是`JpaTransactionManager`！
   必须是`JpaTransactionManager`！入过的坑必须要说3遍。


