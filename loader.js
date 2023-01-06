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
      console.log(`正在映射地址：${method} ${url}`)
      router[method](url, ...mids)
    })
  }
}
const method = method => (url, options) => decorate({ method, url, router, options })
const injectApp = (target, app) => {
  Object.keys(app).forEach(key => {
    target.prototype[key] = app[key]
  })
}

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
      console.log(`正在启动定时器: ${property}`)
      schedule.scheduleJob(interval, () => target[property](app))
    }
  }
}

/**
 * 类装饰器 
 */
const Controller = (prefix) => {
  return (target) => {
    injectApp(target, app)
    prefix && (target.prototype.prefix = prefix)
    process.nextTick(() => {
      process.nextTick(() => {
        injectApp(target, app)
      })
    })
  }
}
const Service = () => {
  return (target) => {
    injectApp(target, app)
    if (!app.services) {
      app.services = []
    }
    console.log(`正在加载服务：${target.name}`)
    app.services[target.name] = new target()
    process.nextTick(() => {
      process.nextTick(() => {
        injectApp(target, app)
      })
    })
  }
}
const Model = () => {
  return (target) => {
    process.nextTick(() => {
      injectApp(target, app)
      if (!app.models) {
        app.models = []
      }
      console.log(`正在加载模型：${target.name}`)
      app.models[target.name] = new target(app)
      process.nextTick(() => {
        injectApp(target, app)
      })
    })
  }
}
const Config = () => {
  return (target) => {
    injectApp(target, app)
    if (!app.configs) {
      app.configs = []
    }
    console.log(`正在加载配置：${target.name}`)
    app.configs[target.name] = new target()
    process.nextTick(() => {
      process.nextTick(() => {
        injectApp(target, app)
      })
    })
  }
}
const Middleware = (mids = []) => {
  return (target) => {
    injectApp(target, app)
    const midObj = new target()
    mids.forEach(mid => {
      console.log(`正在加载中间件：${mid}`)
      middlewares.push(midObj[mid])
    })
    process.nextTick(() => {
      process.nextTick(() => {
        injectApp(target, app)
      })
    })
  }
}
const DataBase = () => {
  return (target) => {
    injectApp(target, app)
    if (!app.dbs) {
      app.dbs = []
    }
    console.log(`正在加载数据库：${target.name}`)
    app.dbs[target.name] = new target()
    process.nextTick(() => {
      process.nextTick(() => {
        injectApp(target, app)
      })
    })
  }
}
const Middlewares = (mids) => {
  return (target) => {
    injectApp(target, app)
    target.prototype.middlewares = mids
    process.nextTick(() => {
      process.nextTick(() => {
        injectApp(target, app)
      })
    })
  }
}
/**
 * 注入函数
 */
const Injectable = ({ folder, conf = {} }) => {
  const fs = require("fs")
  const path = require("path")
  app = conf.app
  baseUrl = conf.baseUrl || ""
  fs.readdirSync(folder).forEach(filename => {
    if (fs.statSync(path.join(folder, filename)).isDirectory() && filename !== "node_modules") {
      Injectable({ folder: `${folder}/${filename}`, conf })
    } else {
      if (filename.split(".").pop() === "js") {
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
  Middleware,
  DataBase,
  Injectable,
  Middlewares,
}