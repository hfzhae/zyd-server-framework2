/**
 * @copyright Powered by zydsoft®
 * @since 2022-1-2
 * @author: zz
 */
const fs = require("fs")
module.exports = class Init {
  constructor(dir) {
    this.dir = dir
    this.createExamplesConfigFile(dir)
    this.createExamplesControllerFile(dir)
    this.createExamplesDataBaseFile(dir)
    this.createExamplesMiddlewareFile(dir)
    this.createExamplesMiddlewareTokenFile(dir)
    this.createExamplesModelFile(dir)
    this.createExamplesScheduleFile(dir)
    this.createExamplesServiceFile(dir)
    this.createBabelrcFile(dir)
    this.createJsonConfigFile(dir)
  }
  createBabelrcFile (dir) {
    dir += "/.babelrc"
    if (fs.existsSync(dir)) return
    fs.writeFileSync(dir, `{
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
}`)
  }
  createJsonConfigFile (dir) {
    dir += "/jsconfig.json"
    if (fs.existsSync(dir)) return
    fs.writeFileSync(dir, `{
  "compilerOptions": {
    "experimentalDecorators": true
  }
}`)
  }
  createExamplesConfigFile (dir) {
    if (fs.existsSync(dir + "/jsconfig.json")) return
    dir += "/config"
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
    dir += "/index.js"
    if (fs.existsSync(dir)) return
    fs.writeFileSync(dir, `import { Config } from "zyd-server-framework2"
@Config()
class Index {
  constructor() {
    this.path = "/"
  }
}`)
  }
  createExamplesControllerFile (dir) {
    if (fs.existsSync(dir + "/jsconfig.json")) return
    dir += "/controller"
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
    dir += "/users.js"
    if (fs.existsSync(dir)) return
    fs.writeFileSync(dir, `import { Post, Get, Controller, Middlewares } from "zyd-server-framework2"
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
  @Get()
  async get (ctx) {
    console.log(ctx.state.partnerId)
    console.log(this.configs.Index.path)
    console.log(ctx.request.query)
    return await this.services.Users.setUsers(ctx)
  }
}`)
  }
  createExamplesDataBaseFile (dir) {
    if (fs.existsSync(dir + "/jsconfig.json")) return
    dir += "/dataBase"
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
    dir += "/mongo.js"
    if (fs.existsSync(dir)) return
    fs.writeFileSync(dir, `import { DataBase } from "zyd-server-framework2"
import mongoose from "mongoose"
@DataBase()
class Mongo {
  constructor() {
    this.prod = mongoose.createConnection(\`mongodb://127.0.0.1:27017?replicaSet=rs0\`, {
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
    this.test = mongoose.createConnection(\`mongodb://127.0.0.1:27017?replicaSet=rs0\`, {
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
}`)
  }
  createExamplesMiddlewareFile (dir) {
    if (fs.existsSync(dir + "/jsconfig.json")) return
    dir += "/middleware"
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
    dir += "/middleware.js"
    if (fs.existsSync(dir)) return
    fs.writeFileSync(dir, `import { Middleware } from "zyd-server-framework2"
@Middleware([
  "error",
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
}`)
  }
  createExamplesMiddlewareTokenFile (dir) {
    if (fs.existsSync(dir + "/jsconfig.json")) return
    dir += "/middleware"
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
    dir += "/authToken.js"
    if (fs.existsSync(dir)) return
    fs.writeFileSync(dir, `import assert from "http-assert"
export default async (ctx, next) => {
  assert(ctx.header.token, 408, "invalid token")
  ctx.state.partnerId = "xxxxxx"
  await next()
}`)
  }
  createExamplesModelFile (dir) {
    if (fs.existsSync(dir + "/jsconfig.json")) return
    dir += "/model"
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
    dir += "/users.js"
    if (fs.existsSync(dir)) return
    fs.writeFileSync(dir, `import mongoose from "mongoose"
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
}`)
  }
  createExamplesScheduleFile (dir) {
    if (fs.existsSync(dir + "/jsconfig.json")) return
    dir += "/schedule"
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
    dir += "/index.js"
    if (fs.existsSync(dir)) return
    fs.writeFileSync(dir, `import { Schedule } from "zyd-server-framework2"
class Index {
  @Schedule("0 0 1 * * *") //crontab格式
  handler () {
    console.log("这是一个定时任务 " + new Date().toLocaleString())
  }
}
    `)
  }
  createExamplesServiceFile (dir) {
    if (fs.existsSync(dir + "/jsconfig.json")) return
    dir += "/service"
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
    dir += "/users.js"
    if (fs.existsSync(dir)) return
    fs.writeFileSync(dir, `import { Service } from "zyd-server-framework2"
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
}`)
  }
}