---
layout: post
title: Spring Security 学习笔记（英文原文）
subtitle: 又是一篇学习笔记
---

### Major building blocks of Spring Security

* `SecurityContextHolder` to provide `SecurityContext`
* `SecurityContext` to hold the `Authentication`
* `Authentication` to represent the principal
* `GrantedAuthority` to reflect the application-wide permissions granted to a principal
* `UserDetails` to provide the user details information to build an Authentication object
* `UserDetailsService` to create a `UserDetails`when passed in a `String`-based uername.

### Authentication in Spring Security

Consider the following scenario:

1. A user is prompted to log in with a username and password.
2. The system (successfully) verifies that the password is correct for the username.
3. The context information for that user is obtained (their list of roles and so on).
4. A security context is established for the user
5. The user proceeds, potentially to perform some operation which is potentially protected by an access control mechanism which checks the required permissions for the operation against the current security context information.

The first three items constitute the authentication process so we’ll take a look at how these take place within Spring Security.

1. The username and password are obtained and combined into an instance of `UsernamePasswordAuthenticationToken` (an instance of the `Authentication` interface, which we saw earlier).
2. The token is passed to an instance of `AuthenticationManager` for validation.
3. The `AuthenticationManager` returns a fully populated `Authentication` instance on successful authentication.
4. The security context is established by calling `SecurityContextHolder.getContext().setAuthentication(…)`, passing in the returned authentication object.

From that point on, the user is considered to be authenticated.

### Authentication Abstraction in Spring Security for Web Application

Consider a typical web application’s authentication process:

1. You visit the home page, and click on a link.
2. A request goes to the server, and the server decides that you’ve asked for a protected resource.
3. As you’re not presently authenticated, the server sends back a response indicating that you must authenticate. The response will either be an HTTP response code, or a redirect to a particular web page.
4. Depending on the authentication mechanism, your browser will either redirect to the specific web page so that you can fill out the form, or the browser will somehow retrieve your identity (via a BASIC authentication dialogue box, a cookie, a X.509 certificate etc.).
5. The browser will send back a response to the server. This will either be an HTTP POST containing the contents of the form that you filled out, or an HTTP header containing your authentication details.
6. Next the server will decide whether or not the presented credentials are valid. If they’re valid, the next step will happen. If they’re invalid, usually your browser will be asked to try again (so you return to step two above).
7. The original request that you made to cause the authentication process will be retried. Hopefully you’ve authenticated with sufficient granted authorities to access the protected resource. If you have sufficient access, the request will be successful. Otherwise, you’ll receive back an HTTP error code 403, which means "forbidden".

The Main participants are

* `ExceptionTranslationFilter` - a Spring Security filter that has responsibility for detecting any Spring Security exceptions that are thrown (generally be thrown by `AbstractSecurityInterceptor`). This filter offers the service to translate the exceptions into actual action(url redirection or returning error code 403) or launching an `AuthenticationEntryPoint`.
* `AuthenticationEntryPoint` - responsible for step 3 in the above list.
* Authentication Mechansim - responsible for collect authentication details from user (username and password etc.) and buile `Authentication` request object then presented to `AuthenticationManager` to valid the authentication request and set back to `SecurityContextHolder` (step 6 - 7 above)

### The Security Filter Chain

#### Filter delegating chain

DelegatingFilterProxy(in web.xml) -> FilterChainProxy(Bean in context) -> each security filter

#### Security FIlter ordering

The order that security filters are defined in the chain is very import, should be as follows:

* `ChannelProcessingFilter`, because it might need to redirect to a different protocol
* `SecurityContextPersistenceFilter`, so a `SecurityContext` can be set up in the `SecurityContextHolder` at the beginning of a web request, and any changes to the `SecurityContext` can be copied to the `HttpSession` when the web request ends (ready for use with the next web request)
* `ConcurrentSessionFilter`, because it uses the `SecurityContextHolder` functionality and needs to update the `SessionRegistry` to refect ongoing requests from the principal.
* Authentication processing mechanisms (`UsernamePasswordAuthenticationFilter`, `CasAuthenticationFilter`, `BasicAuthenticationFilter` etc), so that the `SecurityContextHolder` can be modified to contain a valid `Authentication` request token.
* The `SecurityContextHolderAwareRequestFilter`, install Spring Security aware `HttpServletRequestWrapper` into your servlet container.
* The `JaasApiIntegrationFilter`, if a `JaasAuthenticationToken` is in the `SecurityContextHolder` this will process the `FilterChain` as the `Subject` in the `JaasAuthenticationToken`
* `RememberMeAuhenticationFilter`, if no earlier authentication processing mechanism updated the `SecurityContextHolder`, and the request presents a cookie that enables remember-me services to take place, a suitable remembered `Authentication` object will be put here
* `AnonymousAuthenticationFilter`, if no earlier authentication processing mechanism updated the `SecurityContextHolder`, an anonymous `Authentication` object will be put here.
* `ExceptionTranslationFilter` to catch any Spring Security exceptions so that either an HTTP error response can be returned or an appropriate `AuthenticationEntryPoint` can be launched
* `FilterSecurityInterceptor` to protect web URIs and raise exceptions when access is denied

The complete order of filters can be found at `org.springframework.security.config.annotation.web.builders.FilterComparator`

#### Core Security Filters

There are some key filters which will always be used in Spring Security web application.

##### FilterSecurityInterceptor

* Responsible for handling the security of HTTP resources.
* has a reference to an `AuthenticationManager` and a `AccessDecisionManager`
* supplied with configuration attributes (or SecurityMetadataSource) that apply to different HTTP URL request.
* extends `AbstractSecurityInterceptor`

##### ExceptionTranslationFilter

* sits above `FilterSecurityInterceptor`
* doesn't do any actual security enforcement itself
* handles exceptions thrown by the security interceptors and provide suitable HTTP response
* `AuthenticationEntryPoint` will be called if the user requests a secure HTTP resource but they are not authenticated. (`AuthenticationException` will be thrown by a security interceptor futher down the call stace, triggerint the `commence` method on the entry point.)
* `AccessDeniedHandler` will be called if the user authenticated but don't have enough permissions to access the resources. (`AccessDeniedException` will be thrown by a security interceptor futher down the call stack)
* Also responsible for saving the current request before `AuthenticationEntryPoint` is invoked and restoring after the user has authenticated. (`SavedRequest`s and `RequestCache`)

##### SecurityContextPersistenceFilter

* Responsible for storage of the `SecurityContext` contents between HTTP requests
* Responsible for clearing the `SecurityContextHolder` when a request is completed.
* v3.0 onward, `SecurityContextRepository` is used for different storage strategy.

### Authorization in Spring Security

The main interface responsible for making access-control decisions is `AccessDecisionManager`, it `decide`s the principal represented by an `Authentication` object can or can not access the "secure object" using a list of security metadata attributes which apply for the object.

#### Secure Object

"secure object" refers to any object that can have security (such as an authorization decision) applied to it, for example: method invocations and web requests.

#### workflow

Each supported secure object type has its own implementation of `AbstractSecurityInterceptor`, but the workflow for handling secure object requests is consistent:

1. Look up the "configuration attributes" associated with the present request
2. Submitting the secure object, current `Authentication` and configuration attributes to the `AccessDecisionManager` for an authorization decision
3. Optionally change the `Authentication` under which the invocation takes place
4. Allow the secure object invocation to proceed (assuming access was granted)
5. Call the `AfterInvocationManager` if configured, once the invocation has returned. If the invocation raised an exception, the `AfterInvocationManager` will not be invoked.

#### configuration attributes

Can be thought of as a String that has special meaning to the classes used by `AbstractSecurityInterceptor`, represented by the interface `ConfigAttribute` within the framework. May be simple role names or have more complex meaning, depending on the implementation of `AccessDecisionManager`.

`AbstractSecurityInterceptor` uses `SecurityMetadataSource` to look up the attributes for a secure object. Usually configuration attributes will be entered as annotations on secured methods or as access attributes on secured URLs. For exmple, `<intercept-url pattern='/secure/**' access='ROLE_A,ROLE_B' />` is saying that the configuration attributes `ROLE_A` and `ROLE_B` apply to web requests matching the given pattern.

#### Authorities

All `Authentication` implementations store a list of `GrantedAuthority` objects, represent the authorities that have been granted to the principal, and are inserted by `AuthenticationManager` and are later read by `AccessDecisionManager` when making authorization decisions.

#### AccessDecisionManager

* `decide` all the authorization decisions for the "secured object". Throw `AccessDeniedException` if access is denied.
* `supports(ConfigAttribute)` is used by `AbstractSecurityInterceptor` at startup time to determine if the `AccessDecisionManager` can process the passed `ConfigAttribute`.
* `supports(Class)` is used by a security interceptor implementation to ensure the `AccessDecisionManager` supports the type of secure object.
* `AccessDecisionManager` delegates authorization decisions  to `AccessDecisionVoter`s

##### Voting-Based Implementations

A series of `AccessDecisionVoter` implementations are polled on authorization decision, then `AccessDecisionManager` decides whether or not to throw an `AccessDeniedException` based on its assessment of the votes.

Concrete implementations of `AccessDecisionVoter` returns `int` result, possible values are: (All are reflected in the `AccessDecisionVoter` static fields)
* `ACCESS_ABSTAIN` (a voting implementation has no opinion on an authorization decision),
* `ACCESS_DENIED`,
* `ACCESS_GRANTED`

There are 3 concrete `AccessDecisionManager`s that tally the votes:
* `AffirmativeBased` - will grant access if one or more `ACCESS_GRANTED` votes were received.
* `ConsensusBased` - will grant or deny access based on the consensus of non-abstain votes
* `UnanimousBased` - expects unanimous `ACCESS_GRANTED` votes in order to grant access, ignoring abstains. It will deny access if there is any `ACCESS_DENIED` vote
( Properties are provided to controls the behaviour if all votes are abstain or in the event of an equality of votes. )

#### Voters
* `RoleVoter` - most commonly used, vote against `ROLE_` prefixed `ConfigAttribute`
* `AuthenticatedVoter` - used to differentiate between anonymous, fully-authenticated and remember-me authenticated users.
* Custom voters - you can implement a custom `AccessDecisionVoter`
