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
    // this.createExamplesDataBaseFile(dir)
    this.createExamplesMiddlewareFile(dir)
    this.createExamplesMiddlewareTokenFile(dir)
    // this.createExamplesModelFile(dir)
    this.createExamplesPluginFile(dir)
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
    fs.writeFileSync(dir, `import { Post, Get, Controller } from "zyd-server-framework2"
import assert from "http-assert"
import authToken from "../middleware/authToken"
@Controller("api", {
  middlewares: [authToken]
}) // prefix
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
    console.log(this.config.Index.path)
    console.log(ctx.request.query)
    return await this.service.Users.setUsers(ctx)
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
    this.prod = this.db.Mongo.prod.model("users", schema, "users")
    this.test = this.db.Mongo.test.model("users", schema, "users")
  }
}`)
  }
  createExamplesPluginFile (dir) {
    if (fs.existsSync(dir + "/jsconfig.json")) return
    dir += "/plugin"
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
    dir += "/utils.js"
    if (fs.existsSync(dir)) return
    fs.writeFileSync(dir, `import { Plugin } from "zyd-server-framework2"
@Plugin()
class Utils {
  constructor() {
    /**
     * 日起格式化方法
     * @param {*} fmt 
     * @returns 
     * @example new Date().format("yyyy-MM-dd")
     */
    Date.prototype.format = function (fmt) {
      // 将当前
      var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
      };
      // 先替换年份
      if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
      // 再依次替换其他时间日期内容
      for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
      return fmt;
    }
  }
  /**
   * 阻塞函数
   * @param {Number} milliSeconds 毫秒数 
   */
  sleep (milliSeconds) {
    const startTime = new Date().getTime()
    while (new Date().getTime() < startTime + milliSeconds) { }
  }
  getClientIp (req) {//获取客户端ip地址
    let ip = req.headers['x-forwarded-for'] ||
      req.ip ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress || '';
    if (ip.split(',').length > 0) {
      ip = ip.split(',')[0];
    }
    if (ip === "::1") ip = "127.0.0.1"
    return ip.match(/\d+\.\d+\.\d+\.\d+/)[0];
  }
}`)
  } createExamplesScheduleFile (dir) {
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
  handler (app) {
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
@Service()
class Users {
  async setUsers (ctx) {
    return { success:true }
  }
}`)
  }
}