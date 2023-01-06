# [zyd-server-framework2](https://github.com/hfzhae/zyd-server-framework2)
<p>
  <a href="https://github.com/hfzhae/zyd-server-framework2/blob/master/LICENSE"><img style="margin-right:5px;" src="https://img.shields.io/badge/license-MIT-grren.svg"></a>
  <img style="margin-right:5px;" src="https://img.shields.io/badge/koa-v2.14.1-blue.svg">
  <img style="margin-right:5px;" src="https://img.shields.io/badge/node-v16.x-orange.svg">
  <a href="https://www.npmjs.com/package/zyd-server-framework2"><img style="margin-right:5px;" src="https://img.shields.io/badge/npm-passing-yellow.svg"></a>

</p>

## Installation
```
$ npm install -s zyd-server-framework2
```
## Quickstart
>/.babelrc
```json
{
  "presets": [
    "@babel/preset-env"
  ],
  "plugins": [
    [
      "@babel/plugin-proposal-decorators",
      {
        "legacy": true
      }
    ]
  ]
}
```
>/package.json
```json
{
  "name": "myApp",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "serve": "nodemon --exec babel-node index.js",
    "prod": "babel-node index.js"
  },
  "author": "",
  "license": "ISC"
}
```
>/index.js
```js
import { Zsf } from "zyd-server-framework2"
const app = new Zsf() 
app.start()
```
```
$ npm run serve
```
```
┌───────────────────────┐
│ Powered by zydsoft®   │
│ zyd-server-framework2 │
└───────────────────────┘
version：1.0.x

正在加载数据库：{db:Mongo,class:Users}
正在加载模型：Users
正在加载数据库：{db:Mongo,class:Users}
正在加载中间件：error
正在加载数据库：{db:Mongo,class:Users}
正在启动定时器: handler
正在加载模型：Users
正在加载数据库：{db:Mongo,class:Users}
正在映射地址：post /api/Users/add
正在映射地址：get /api/Users/get
start on port:3000

┌───────────────┐
│ start success │
└───────────────┘
```
## Options
>/index.js
```js
import { Zsf } from "zyd-server-framework2"
const app = new Zsf({ 
  baseUrl: "/open", // 基础路径设置
  beforeInit(koaApp){ // 生命周期函数 - 初始化前
    koaApp.use(require("koa2-cors")()) // 跨域设置
    const session = require("koa-session") // session设置
    koaApp.keys = ["some secret hurr"]
    koaApp.use(session({
      key: "koa:sess",
      maxAge: 86400000,
      overwrite: true,
      httpOnly: true,
      signed: true,
      rolling: false,
      renew: false,
    }, koaApp))
  },
  afterInit(koaApp){ ... } // 生命周期函数 - 初始化后
})
app.start(3000, callBack(){
  console.log("start on port：3000")
})
```
## Class decorators
name|params|desc
-|-|-
Controller|prefix|定义控制器对象，prefix(String):前缀路径
Model||定义数据库模型对象
Config||定义配置对象
DataBase||定义数据库对象
Service||定义服务对象
Middleware|mids|定义全局中间件对象，mids(Array[Class]):中间件对象
Middlewares|mids|定义类中间件方法，mids(Array[Function]):中间件方法
## Function decorators
name|params|desc
-|-|-
Get|url,options|定义Get方法路由，url(String)后置路径，options(Object)选项，支持middlewares(Array)定义中间件
Put|url,options|定义Put方法路由，url(String)后置路径，options(Object)选项，支持middlewares(Array)定义中间件
Del|url,options|定义Del方法路由，url(String)后置路径，options(Object)选项，支持middlewares(Array)定义中间件
Post|url,options|定义Post方法路由，url(String)后置路径，options(Object)选项，支持middlewares(Array)定义中间件
Patch|url,options|定义Patch方法路由，url(String)后置路径，options(Object)选项，支持middlewares(Array)定义中间件
Schedule|interval|定义定时器对象，interval(String)定时器规则，crontab格式
## Config
>/config/conf.js
```js
import { Config } from "zyd-server-framework2"
@Config()
class Index {
  constructor() {
    this.path = "/"
  }
}
```
>/controller/users.js
```js
this.configs.Index.path
```
## Controller
>/controller/users.js
```js
import { Post, Get, Controller, Middlewares } from "zyd-server-framework2"
import assert from "http-assert"
import authToken from "../middleware/authToken"
@Controller("api") // prefix
@Middlewares([authToken])
class Users {
  @Post("", {
    middlewares: [
      async function validation (ctx, next) {
        const name = ctx.request.body.name
        assert(name, 400, "Missing name")
        await next()
      },
    ]
  })
  add (ctx) {
    return { success: true, ...ctx.request.body }
  }
  @Get("getInfo")
  async get (ctx) {
    console.log(ctx.state.partnerId) // xxxxxx
    console.log(this.configs.Index.path) // \
    console.log(ctx.request.query.name) // lucy
    return await this.services.Users.setUsers(ctx)
  }
}
```
[http://localhost:3000/api/Users/getInfo?name=lucy](http://localhost:3000/api/Users/get?name=lucy)

## DataBase
>/dataBase/mongo.js
```js
import { DataBase } from "zyd-server-framework2"
import mongoose from "mongoose"
@DataBase()
class Mongo {
  constructor() {
    this.prod = mongoose.createConnection(`mongodb://127.0.0.1:27017?replicaSet=rs0`, {
      // useCreateIndex: true,
      // useFindAndModify: false,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: "prodDb"
    })
    this.prod.on("connected", () => {
      console.log('mongodb connect prod success')
    })
    this.prod.on("error", () => {
      console.log('mongodb connect prod error')
    })
    this.prod.on("disconnected", () => {
      console.log('mongodb connect prod disconnected')
    })
    this.test = mongoose.createConnection(`mongodb://127.0.0.1:27017?replicaSet=rs0`, {
      // useCreateIndex: true,
      // useFindAndModify: false,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: "testDb"
    })
    this.test.on("connected", () => {
      console.log('mongodb connect test success')
    })
    this.test.on("error", () => {
      console.log('mongodb connect test error')
    })
    this.test.on("disconnected", () => {
      console.log('mongodb connect test disconnected')
    })
  }
  async mongoSession (dataBase) {
    const session = await dataBase.startSession({
      readPreference: { mode: 'primary' }, //只从主节点读取，默认值。
    })
    await session.startTransaction({
      readConcern: { level: 'majority' }, //读取在大多数节点上提交完成的数据。level:"snapshot"读取最近快照中的数据。
      writeConcern: { w: 'majority' }, //大多数节点成功原则，例如一个复制集 3 个节点，2 个节点成功就认为本次写入成功。 w:"all"所以节点都成功，才认为写入成功，效率较低。
    })
    return session
  }
}
```
```js
this.dbs.Mongo.prod
this.dbs.Mongo.test
```
## Middleware
>/middleware/middleware.js
```js
import { Middleware } from "zyd-server-framework2"
import koaStatic from "koa-static"
import mount from "koa-mount"
@Middleware([
  "error",
  "favicon",
  "homePage",
])
class Middlewares {
  constructor() {
    this.homePage = mount('/homePage', koaStatic('./homePage')) // 静态页面配置在构造器中
  }
  async error (ctx, next) {
    try {
      await next()
    } catch (err) {
      console.log(err)
      const code = err.status || 500
      const message = err.response && err.response.data || err.message
      ctx.body = {
        code,
        message
      }
      ctx.status = code // 200
    }
  }
  favicon (ctx, next) {
    if (ctx.path === "/favicon.ico") {
      ctx.body = ""
      return
    }
    await next()
  }
}
```
>/middleware/authToken.js
```js
import assert from "http-assert"
export default async (ctx, next) => {
  assert(ctx.header.token, 408, "invalid token")
  ctx.state.partnerId = "xxxxxx"
  await next()
}
```
## Model
>/model/users.js
```js
import mongoose from "mongoose"
import { Model } from "zyd-server-framework2"
@Model()
class Users {
  constructor(app) {
    const schema = new mongoose.Schema({
      name: { type: String },
      age: { type: Number }
    }, {
      versionKey: false,
      timestamps: {
        createdAt: "createdAt",
        updatedAt: "updatedAt"
      }
    })
    this.prod = this.dbs.Mongo.prod.model("users", schema, "users")
    this.test = this.dbs.Mongo.test.model("users", schema, "users")
  }
}
```
```js
this.models.Users.prod
```
## Schedule
>/schedule/index.js
```js
import { Schedule } from "zyd-server-framework2"
class Index {
  @Schedule("0 0 1 * * *") //crontab格式
  handler (app) {
    console.log("这是一个定时任务 " + new Date().toLocaleString())
  }
}
```
## Service
>/service/users.js
```js
import { Service } from "zyd-server-framework2"
import assert from "http-assert"
@Service()
class Users {
  async setUsers (ctx) {
    // mongo数据库执行事物方式
    const session = await this.dbs.Mongo.mongoSession(this.dbs.Mongo.prod)
    let result = []
    try {
      result.push(await this.models.Users.prod.create(
        [{ name: "张三", age: 25 }],
        { session }
      ))
      result.push(await this.models.Users.prod.findByIdAndUpdate(
        result._id,
        { $set: { name: "李四" }},
        { session }
      ))
      assert(result[1], 401, "写库失败，数据回滚")
      await session.commitTransaction()
      return result
    } catch (err) {
      await session.abortTransaction()
      assert(false, err.status, err.message)
    } finally {
      await session.endSession()
    }
  }
}
```
```js
this.services.Users.setUsers(ctx)
```
## License
[MIT](https://github.com/hfzhae/zyd-server-framework/blob/master/LICENSE)