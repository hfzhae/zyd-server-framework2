/**
 * @copyright Powered by zydsoft®
 * @since 2022-1-2
 * @author: zz
 */
const Router = require("koa-router")
const router = new Router()
const middlewares = []
let baseUrl = ""
let app
const injectApp = (target) => {
  Object.keys(app).forEach(key => {
    target.prototype[key] = app[key]
  })
}
const injectClass = (target, className) => {
  injectApp(target)
  if (!app[className]) {
    app[className] = []
  }
  app[className][target.name] = new target()
  console.log(`\x1B[30m${className}: \x1B[0m\x1B[36m${target.name}\x1B[0m \x1B[32m√\x1B[0m`)
  process.nextTick(() => {
    process.nextTick(() => {
      injectApp(target)
    })
  })
}
/**
 * 工厂
 * @param {*} param0 
 * @returns 
 */
const decorate = ({ method, url = "", router, options = {} }) => {
  return (target, property, descriptor) => {
    process.nextTick(() => {
      const mids = []
      if (target.middlewares) {
        mids.push(...target.middlewares)
      }
      if (options.middlewares) { // 是否配置了中间件
        mids.push(...options.middlewares)
      }
      if (target[property].prototype.auth) {
        mids.push(...target[property].prototype.auth)
      }
      mids.push(async (ctx, next) => { ctx.body = await target[property](ctx, next) })
      if (!url) {
        url = property // 路由后缀
      }
      url = `/${target.constructor.name}/${url}`
      target.prefix && (url = `/${target.prefix}${url}`) // 路由前缀
      url = baseUrl + url // 添加基础路径
      router[method](url, ...mids)
      console.log(`\x1B[30mrouter: \x1B[0m\x1B[36m${method} ${url}\x1B[0m \x1B[32m√\x1B[0m`)
    })
  }
}
const method = method => (url, options) => decorate({ method, url, router, options })
/**
 * 方法装饰器
 */
const Get = method("get")
const Put = method("put")
const Del = method("del")
const Post = method("post")
const Patch = method("patch")
/**
 * 定时装饰器
 * @param {String} interval crontab格式
 */
const Schedule = (interval) => {
  return (target, property, descriptor) => {
    if (interval) {
      const schedule = require("node-schedule")
      schedule.scheduleJob(interval, () => target[property](app))
      console.log(`\x1B[30mschedule: \x1B[0m\x1B[36m${property}\x1B[0m \x1B[32m√\x1B[0m`)
    }
  }
}

/**
 * 类装饰器 
 */
// 控制器
const Controller = (prefix, options = {}) => {
  return (target) => {
    injectApp(target)
    prefix && (target.prototype.prefix = prefix)
    console.log(`\x1B[30mcontroller: \x1B[0m\x1B[36m${target.name}\x1B[0m \x1B[32m√\x1B[0m`)
    if (options.middlewares) { // 是否配置了中间件
      if (!target.prototype.middlewares) {
        target.prototype.middlewares = []
      }
      options.middlewares.forEach(mid => {
        target.prototype.middlewares.push(mid(app))
      })
      console.log(`\x1B[30mmiddlewares: \x1B[0m\x1B[36m${target.name}\x1B[0m \x1B[32m√\x1B[0m`)
    }
    process.nextTick(() => {
      process.nextTick(() => {
        injectApp(target)
      })
    })
  }
}
// 服务
const Service = () => {
  return (target) => {
    injectClass(target, "service")
  }
}
// 模型
const Model = () => {
  return (target) => {
    process.nextTick(() => {
      injectClass(target, "model")
    })
  }
}
// 配置
const Config = () => {
  return (target) => {
    injectClass(target, "config")
  }
}
// 数据库
const DataBase = () => {
  return (target) => {
    injectClass(target, "db")
  }
}
// 插件
const Plugin = () => {
  return (target) => {
    injectClass(target, "plugin")
  }
}
// 中间件
const Middleware = (mids = []) => {
  return (target) => {
    injectApp(target)
    const midObj = new target()
    mids.forEach(mid => {
      middlewares.push(midObj[mid](app))
      console.log(`\x1B[30mmiddleware: \x1B[0m\x1B[36m${mid}\x1B[0m \x1B[32m√\x1B[0m`)
    })
    process.nextTick(() => {
      process.nextTick(() => {
        injectApp(target)
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
    conf.ignoreDir = [
      "./node_modules",
      "./.git"
    ]
  } else {
    conf.ignoreDir.push("./node_modules")
    conf.ignoreDir.push("./.git")
  }
  conf.ignoreDir = [...new Set(conf.ignoreDir)]
  if (!conf.ignoreFile) {
    conf.ignoreFile = []
  }
  conf.ignoreFile = [...new Set(conf.ignoreFile)]
  app = conf.app
  baseUrl = conf.baseUrl || ""
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