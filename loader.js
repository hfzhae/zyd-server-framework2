/**
 * @copyright Powered by zydsoft®
 * @since 2022-1-2
 * @author: zz
 */
const _router = require("koa-router")
const router = new _router()
const middlewares = []
let _conf = {}
const _injectApp = (target) => {
  Object.keys(_conf.app).forEach(key => { target.prototype[key] = _conf.app[key] })
}
/**
 * 工厂
 */
const _functionDecorate = ({ method, url = "", router, options = {} }) => { // 方法
  return (target, property, descriptor) => {
    process.nextTick(() => {
      const mids = []
      target.middlewares && mids.push(...target.middlewares)
      options.middlewares && mids.push(...options.middlewares) // 是否配置了中间件
      mids.push(async (ctx, next) => { ctx.body = await target[property](ctx, next) })
      if (!url) {
        url = `/${target.constructor.name}/${property}` // 路由后缀
      } else if (url === "/") {
        url = `/${target.constructor.name}`
      } else {
        url = `/${target.constructor.name}/${url.split("/").filter(item => item).join("/")}`
      }
      target.prefix && (url = `/${target.prefix}${url}`) // 路由前缀
      url = _conf.baseUrl + url // 添加基础路径
      router[method](url, ...mids)
      console.log(`\x1B[30mrouter: \x1B[0m\x1B[36m${method} ${url}\x1B[0m \x1B[32m√\x1B[0m`)
    })
  }
}
const _classDecorate = moduleName => { // 类
  return target => {
    _injectApp(target)
    if (!_conf.app[moduleName]) {
      _conf.app[moduleName] = []
    }
    _conf.app[moduleName][target.name] = new target()
    console.log(`\x1B[30m${moduleName}: \x1B[0m\x1B[36m${target.name}\x1B[0m \x1B[32m√\x1B[0m`)
    process.nextTick(() => {
      process.nextTick(() => {
        _injectApp(target)
      })
    })
  }
}
const _injectFunction = method => (url, options) => _functionDecorate({ method, url, router, options })
const _injectClass = moduleName => () => _classDecorate(moduleName)
/**
 * 方法装饰器
 */
const Get = _injectFunction("get")
const Put = _injectFunction("put")
const Del = _injectFunction("del")
const Post = _injectFunction("post")
const Patch = _injectFunction("patch")
/**
 * 定时装饰器
 * @param {String} interval crontab格式
 */
const Schedule = (interval) => {
  return (target, property, descriptor) => {
    if (interval) {
      const schedule = require("node-schedule")
      schedule.scheduleJob(interval, () => target[property]())
      console.log(`\x1B[30mschedule: \x1B[0m\x1B[36m${property}\x1B[0m \x1B[32m√\x1B[0m`)
      process.nextTick(() => {
        process.nextTick(() => {
          _injectApp(target.constructor)
        })
      })
    }
  }
}
/**
 * 类装饰器 
 */
const Controller = (prefix, options = {}) => { // 控制器
  return (target) => {
    _injectApp(target)
    prefix && (target.prototype.prefix = prefix)
    console.log(`\x1B[30mcontroller: \x1B[0m\x1B[36m${target.name}\x1B[0m \x1B[32m√\x1B[0m`)
    if (options.middlewares) { // 是否配置了中间件
      if (!target.prototype.middlewares) {
        target.prototype.middlewares = []
      }
      options.middlewares.forEach(mid => {
        mid.prototype[mid.name] = mid
        target.prototype.middlewares.push(async (ctx, next) => { ctx.body = await mid.prototype[[mid.name]](ctx, next) })
        process.nextTick(() => {
          process.nextTick(() => {
            _injectApp(mid)
          })
        })
      })
      console.log(`\x1B[30mmiddlewares: \x1B[0m\x1B[36m${target.name}\x1B[0m \x1B[32m√\x1B[0m`)
    }
    process.nextTick(() => {
      process.nextTick(() => {
        _injectApp(target)
      })
    })
  }
}
const Service = _injectClass("service") // 服务
const Model = _injectClass("model") // 模型
const Config = _injectClass("config") // 配置
const DataBase = _injectClass("db") // 数据库
const Plugin = _injectClass("plugin") // 插件
const Middleware = (mids = []) => { // 中间件
  return (target) => {
    _injectApp(target)
    const midObj = new target()
    mids.forEach(mid => {
      middlewares.push(async (ctx, next) => midObj[mid](ctx, next))
      console.log(`\x1B[30mmiddleware: \x1B[0m\x1B[36m${mid}\x1B[0m \x1B[32m√\x1B[0m`)
    })
    process.nextTick(() => {
      process.nextTick(() => {
        _injectApp(target)
      })
    })
  }
}
/**
 * 注入函数
 */
const Injectable = ({ folder, rootFolder, conf = {} }) => {
  const fs = require("fs")
  const path = require("path")
  if (!conf.ignoreDir) {
    conf.ignoreDir = ["./node_modules", "./.git"]
  } else {
    conf.ignoreDir.push("./node_modules")
    conf.ignoreDir.push("./.git")
  }
  conf.ignoreDir = [...new Set(conf.ignoreDir)]
  !conf.ignoreFile && (conf.ignoreFile = [])
  conf.ignoreFile = [...new Set(conf.ignoreFile)]
  _conf = conf
  fs.readdirSync(folder).forEach(filename => {
    const dirFilePath = path.resolve(folder, filename)
    if (fs.statSync(path.join(folder, filename)).isDirectory()) {
      if (conf.ignoreDir && conf.ignoreDir.filter(item => path.resolve(rootFolder, item) === dirFilePath).length > 0) return
      Injectable({ folder: `${folder}/${filename}`, rootFolder, conf })
    } else {
      if (filename.split(".").pop() === "js") {
        if (conf.ignoreFile && conf.ignoreFile.filter(item => path.resolve(rootFolder, item) === dirFilePath).length > 0) return
        require("./" + path.relative(__dirname, folder) + "/" + filename)
      }
    }
  })
  return { router, middlewares }
}
module.exports = {
  Get,
  Put,
  Del,
  Post,
  Patch,
  Schedule,
  Controller,
  Service,
  Model,
  Config,
  Plugin,
  Middleware,
  DataBase,
  Injectable,
}