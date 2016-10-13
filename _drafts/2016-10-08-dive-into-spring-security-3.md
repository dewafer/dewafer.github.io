---
layout: post
title: 深入了解 Spring Security (3)
subtitle: 无证程序员带你深入了解 Spring Security
published: false
---

// TODO: 完成
### 4. 授权

在 Spring Security 中，主要负责访问控制的接口是`AccessDecisionManager`。它有一个`decide`方法，通过外部传入的`Authentication`对象和一个列表的安全属性对象来判断当前已鉴权的用户是否可以访问某个“安全对象”。

#### 4.1. 安全对象 Secure Object

安全对象是指，任何可以有安全限制来控制访问的对象。譬如在Web环境中，安全对象即`FilterInvocation`对象；在针对方法进行安全限制时则是`MethodInvocation`的对象。

需要注意的是，对某个“安全对象”进行访问并不是由`AccessDecisionManager`来执行的，`AccessDecisionManager`之所以需要将“安全对象”传入其中是为了能从其中取得某些属性。

譬如，在Web环境中，用户访问了`/secured/user-details`这个地址，一个包含这个地址信息的`FilterInvocation`被传入`AccessDecisionManager`，`AccessDecisionManager`通过`FilterInvocation`这个“安全对象”得知用户访问的是`/secured/user-details`这个地址，并且通过传入的`ConfigAttribute`安全属性列表得知这个地址只能由拥有`ROLE_USER`角色的用户才能访问，此时`AccessDecisionManager`针对传入的`Authentication`进行检查，查看当前用户是否拥有`ROLE_USER`角色，如果没有则抛出`AccessDeniedException`；如果有则放行。当然真正的过程比这要再复杂一些，我们稍后解释。

来我们总结一下。

#### 4.2. 抽象流程

// TODO: 继续

#### 4.3. 安全属性 `ConfigAttribute`

#### 4.4. 权限 Authority

#### 4.5. 授权决策的核心 `AccessDecisionManager`

#### 4.5.1 由投票决定的 `AccessDecisionManager`

#### 4.5.2 票友 `Voter`
