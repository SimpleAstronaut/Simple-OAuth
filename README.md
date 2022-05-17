# Simple-OAuth
## 1.介绍
Simple-OAuth是一个基于node.js和MySQL的类似于OAuth的鉴权系统，该项目分离自正在开发的Simple-User数字身份管理系统的鉴权微服务  
Simple-OAuth经历过两个开发版本的迭代，这个版本是第二个开发版本，由node.js后端开发而成；而第一个大版本由php开发而成，受限于本人技术原因，上线不久后暴露出诸多问题。  
基于上一个大版本体现出的问题，再=在第二个开发版本中我对后端代码底层进行了推翻和重构，重新设计了新的鉴权机制且对底层算法和逻辑进行了重新构建。  

Simple-OAuth是我全新构建的鉴权机制中的重要的组成部分，负责对客户端提交的登录请求进行验证，并颁发`token`，授权客户端在主服务器的行为。  

![Simple-AuthenticationSystem](https://user-images.githubusercontent.com/63186671/168552994-188ef964-f60d-49ab-9212-68ecfc8be575.svg)  
Simple-OAuth就是上图中的TokenServer

## 2.功能
接收客户端的登录请求  
判断登录请求中的用户id是否存在  
从Mysql中提取对应id的密码散列，并与提交的密码计算的散列是否一致  
颁发鉴权时效token，并写入token sql  
获取服务端检验token请求，接受服务端发送的id，返回对应token和时效标签  

## 3.安装 
git clone仓库  
```bash
git clone https://github.com/SimpleAstronaut/Simple-OAuth/
```  
启动服务器  
```bash
npm run server
```  

## 4.用法
本项目基于node.js和MySQL开发，二次开发或使用前请确保node.js和MySLQ安装完成  
### 4.1 运行依赖  
npm安装依赖  
```bash
npm install
```
### 4.2 数据库
本项目需要数据库中包含三个空数据表，分别命名为：  
`TOKEN`  `PASSWORD`  
其中TOKEN用于存储时效token，PASSWORD用于存储用户id和密码散列  
1.TOKEN数据表结构为：
| TOKEN_ID | USER_ID | TOKEN | END_TIME |
| ---- | ---- | ---- | ---- |
| 自增，用于标记TOKEN | 用于存储USER_ID,与PASSWORD和USERS中的USER_ID对应 | 用于存储TOKEN | 记录TOKEN失效时间 |  

2.PASSWORD数据表结构为：
| TOKEN_ID | PASSWORD |
| ---- | ---- |
| 与TOKEN和主USER_ID对应 | 用于记录密码散列 |

## 5. api接口
Simple-OAuth包含两个接口，分别是获取token和获取id接口  
### 5.1 响应体格式
```json
{ "statue":200,"date":"test" }
```
### 5.2 状态码信息

参考SimpleUser_v1.0的鉴权机制，TokenServer状态码沿用1.0版本状态码系统。

| 状态码 | 状态信息              |
| --- | ----------------- |
| 200 | 请求正常              |
| 201 | 执行正常              |
| 301 | 用户名或密码错误          |
| 400 | 查询错误或查询结果为空       |
| 401 | 执行错误，包括越权或非法请求或执行 |

### 5.3 获取TOKEN接口
该接口通过客户端上传USER_ID和PASSWORD，鉴别密码正确与否，若密码和USER_ID匹配，则生成一个3600秒时效的token

权限：公开

请求方式：`GET`

地址：`http://127.0.0.1:5231/token/get`

参数：

| key      | value     |
| -------- | --------- |
| id       | 用户id      |
| password | 用户id对应的密码 |

返回JSON参数：

| 参数     | 含义                   |
| ------ | -------------------- |
| status | 状态码，详见状态码含义章节        |
| token  | 当密码正确时生成的token       |
| errmsg | 当密码错误或用户id错误时返回的错误信息 |

示例：

```url
http://127.0.0.1:5231/token/get?id=1&password=test
```

返回示例：

1.当密码正确时：

```json
{
    "status" : 200,
    "token" : "e8c5bda570b602d409fd885cbfa82a13"
}
```

2.当密码错误或用户id错误时：

```json
{
    "status" : 301,
    "errmsg" : "PFALSE"
}
```

### 5.4 获取USER_ID接口

该接口通过上传token，返回注册token时绑定的USER_ID

权限：**仅限app.js服务端**

请求方式：`GET`

请求地址：`http://127.0.0.1:5231/token/id`

参数：

| key   | value    |
| ----- | -------- |
| token | 查询的token |

返回JSON参数：

| 参数      | 含义                 |
| ------- | ------------------ |
| statue  | 状态码，详见状态码章节        |
| USER_ID | token正确时返回的USER_ID |
| errmsg  | token错误时返回的错误信息    |

请求示例：

```url
http://127.0.0.1:5231/token/get?token=e8c5bda570b602d409fd885cbfa82a13
```

返回示例：

1.当正常返回时：

```json
{
    "status" : 200,
    "USER_ID" : 1
}
```

2.当返回错误时：

```json
{
    "status" : 300,
    "errmsg" : "NO TOKEN"
}
```

3.当token过期时：

```json
{
    "status" : 300,
    "errmsg" : "TOKEN OUT DATE"
}
```
