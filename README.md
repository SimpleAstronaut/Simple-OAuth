# Simple-OAuth
## 介绍
Simple-OAuth是一个基于node.js和MySQL的类似于OAuth的鉴权系统，该项目分离自正在开发的Simple-User数字身份管理系统的鉴权微服务  
Simple-OAuth经历过两个开发版本的迭代，这个版本是第二个开发版本，由node.js后端开发而成；而第一个大版本由php开发而成，受限于本人技术原因，上线不久后暴露出诸多问题。  
基于上一个大版本体现出的问题，再=在第二个开发版本中我对后端代码底层进行了推翻和重构，重新设计了新的鉴权机制且对底层算法和逻辑进行了重新构建。  

Simple-OAuth是我全新构建的鉴权机制中的重要的组成部分，负责对客户端提交的登录请求进行验证，并颁发`token`，授权客户端在主服务器的行为。  

![Simple-AuthenticationSystem](https://user-images.githubusercontent.com/63186671/168552994-188ef964-f60d-49ab-9212-68ecfc8be575.svg)  
Simple-OAuth就是上图中的TokenServer

## 功能
接收客户端的登录请求  
判断登录请求中的用户id是否存在  
从Mysql中提取对应id的密码散列，并与提交的密码计算的散列是否一致  
颁发鉴权时效token，并写入token sql  
获取服务端检验token请求，接受服务端发送的id，返回对应token和时效标签  
