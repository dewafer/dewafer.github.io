---
layout: post
title: OAuth2学习笔记
subtitle: 又是一篇学习笔记
---

### OAuth2定义：

https://tools.ietf.org/html/rfc6749

### OAuth2认证流程


### Authorization Grant Type

![Abstract Protocol Flow](/uploads/2016/2016-09-19-notes-for-oauth2-abstract-protocol-flow.png)

* Authorization Code ("code")
* Implicit ("token")
* Resource Owner Password Credentials ("password")
* Client Credentials ("client_credentials")
* Extension Grants (grant_type=absolute URI)

#### Authorization Code Grant 流程

https://tools.ietf.org/html/rfc6749#section-4.1

![Authorization Code Flow](/uploads/2016/2016-09-19-notes-for-oauth2-authorization-code-flow.png)

#### Implicit Grant 流程

https://tools.ietf.org/html/rfc6749#section-4.2

![Implicit Grant Flow](/uploads/2016/2016-09-19-notes-for-oauth2-implicit-grant-flow.png)

 #### Resource Owner Password Credentials Grant 流程

https://tools.ietf.org/html/rfc6749#section-4.3

![Resource Owner Password Credentials Flow](/uploads/2016/2016-09-19-notes-for-oauth2-res-owner-pwd-crd-flow.png)

 #### Client Credentials Grant 流程

https://tools.ietf.org/html/rfc6749#section-4.4

![Client Credentials Flow](/uploads/2016/2016-09-19-notes-for-oauth2-client-credentials-flow.png)
