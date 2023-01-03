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
>/index.js
```js
const { Zsf } = require("zyd-server-framework2")
const app = new Zsf() 
app.start()
```
## Options
>/index.js
```js
const { Zsf } = require("zyd-server-framework2")
const app = new Zsf({ 
  baseUrl: "/api", // 基础路径设置
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
Model|models|定义数据库模型对象，models(Array[Class]):数据库模型对象
Config|configs|定义配置对象，configs(Array[Class]):配置对象
Middleware|mids|定义中间件对象，mids(Array[Class]):中间件对象
DataBase|dbs|定义数据库对象，dbs(Array[Class]):数据库配置对象

## Function decorators
name|params|desc
-|-|-
Get|url|定义Get方法路由，url(String)后置路径
Put|url|定义Put方法路由，url(String)后置路径
Del|url|定义Del方法路由，url(String)后置路径
Post|url|定义Post方法路由，url(String)后置路径
Patch|url|定义Patch方法路由，url(String)后置路径
Auth|auth|定义路由认证对象，auth(Class)认证对象
Schedule|interval|定义定时器对象，interval(String)定时器规则，crontab格式

## authenticator
>/authenticator/authToken.js
```js
const assert = require("http-assert")
module.exports = class AuthToken {
  constructor(ctx) {
    this.auth(ctx)
  }
  auth (ctx) {
    this.sign(ctx)
    ctx.state.partnerId = "xxxxxx"
    assert(false, 402, "auth error")
  }
  sign (ctx) { }
}
```
>/controller/users.js
```js
const { Get } = require("zyd-server-framework2")
const AuthToken = require("../authenticator/authToken")
class Users {
  @Get()
  @Auth(AuthToken)
  async get (ctx) {
    return { success: true }
  }
}
```
## config
>/config/conf.js
```js
module.exports = class Global {
  constructor() {
    this.path = "/"
  }
}
```
>/controller/users.js
```js
const { Get, Config } = require("zyd-server-framework2")
const Global = require("../config/index")
@Config([Global])
class Users {
  @Get()
  async get (ctx) {
    const path = this.configs.Global.path // "/"
    return { path }
  }
}
```
## controller
>/controller/users.js
```js
const { Post, Get, Service, Controller, Auth, Config, Model } = require("zyd-server-framework2")
const UsersService = require("../service/users")
const AuthToken = require("../authenticator/authToken")
const Global = require("../config/index")

@Service([UsersService])
@Controller("api") // prefix
@Config([Global])
class Users {
  @Post()
  add (ctx) {
    return { success: true, ...ctx.request.body }
  }
  @Get("/getUsers")
  @Auth(AuthToken)
  async get (ctx) {
    console.log(ctx.state.partnerId) // "XXXXXX"
    console.log(this.configs.Global.path) // "/"
    console.log(ctx.request.query) // { name: "lucy" }
    return await this.services.Users.setUsers(ctx)
  }
}
```
[http://localhost:3000/api/Users/getUsers?name=lucy](http://localhost:3000/api/Users/getUsers?name=lucy)

## dataBase
>/dataBase/mongo.js
```js
module.exports = class Mongo {
  constructor() {
    const mongoose = require("mongoose")
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
## middleware
>/middleware/middleware.js
```js
const { Middleware } = require("zyd-server-framework2")
@Middleware([
  "error",
  "favicon",
  "homePage",
])
class Middlewares {
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
  homePage (ctx, next) {
    const static = require("koa-static")
    const mount = require('koa-mount')
    return mount('/homePage', static('./homePage'))
  }
}
```
## model
>/model/users.js
```js
const mongoose = require("mongoose")
const { DataBase } = require("zyd-server-framework2")
const Mongo = require("../dataBase/mongo")

@DataBase([Mongo])
class Users {
  constructor() {
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
module.exports = Users
```
## schedule
>/schedule/index.js

```js
const { Schedule } = require("zyd-server-framework2")
class Index {
  @Schedule("* * 1 * * *") //crontab格式
  printLog () {
    console.log("这是一个定时任务 " + new Date().toLocaleString())
  }
}
```
## service
>/service/users.js
```js
const { Model, DataBase } = require("zyd-server-framework2")
const ModelUsers = require("../model/Users")
const Mongo = require("../dataBase/mongo")
const assert = require("http-assert")

@DataBase([Mongo])
@Model([ModelUsers])
class Users {
  async setUsers (ctx) {
    // mongo数据库执行事物方式
    const session = await this.dbs.Mongo.mongoSession(this.dbs.Mongo.prod)
    let result
    try {
      result = await this.models.Users.prod.create(
        { name: "张三", age: 25 },
        { session }
      )
      await this.models.Users.prod.findByIdAndUpdate(
        result._id,
        { $set: { name: "李四" }},
        { session }
      )
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
module.exports = Users
```
## License
[MIT](https://github.com/hfzhae/zyd-server-framework/blob/master/LICENSE)