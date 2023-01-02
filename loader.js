/**
 * @copyright Powered by zydsoft®
 * @since 2022-1-2
 * @author: zz
 */
const Router = require("koa-router")
const router = new Router()
const decorate = ({ method, url = "", router }) => {
  return (target, property, descriptor) => {
    process.nextTick(() => {
      const mids = []
      // const obj = new target.constructor()
      mids.push(async ctx => { ctx.body = await target[property](ctx) })
      if (!url) {
        url = property
      }
      url = `/${target.constructor.name}/${url}`
      target.prefix && (url = `/${target.prefix}${url}`)
      console.log(`正在映射地址：${method} ${url}`)
      router[method](url, ...mids)
    })
  }
}
const method = method => (url) => decorate({ method, url, router })
const middlewares = []

/**
 * 函数装饰器
 */
const Get = method("get")
const Put = method("put")
const Del = method("del")
const Post = method("post")
const Patch = method("patch")
/**
 * 认证装饰器
 * @param {Class} auth 
 */
const Auth = (auth) => {
  return (target, property, descriptor) => {
    if (auth) {
      const original = descriptor.value
      if (typeof original === 'function') {
        descriptor.value = function (...args) {
          new auth(...args)
          return original.apply(this, args)
        }
      }
    }
  }
}
/**
 * 定时装饰器
 * @param {String} interval crontab格式
 */
const Schedule = (interval) => {
  return (target, property, descriptor) => {
    if (interval) {
      const schedule = require("node-schedule")
      console.log(`正在启动定时器: ${property}`)
      schedule.scheduleJob(interval, target[property])
    }
  }
}

/**
 * 类装饰器 
 */
const Controller = (prefix) => {
  return (target) => {
    prefix && (target.prototype.prefix = prefix)
  }
}
const Service = (services = []) => {
  return (target) => {
    if (!target.prototype.services) {
      target.prototype.services = []
    }
    services.forEach(service => {
      target.prototype.services[service.name] = new service()
    })
  }
}
const Model = (models = []) => {
  return (target) => {
    if (!target.prototype.models) {
      target.prototype.models = {}
    }
    models.forEach(model => {
      console.log(`正在加载模型：${model.name}`)
      target.prototype.models[model.name] = new model()
    })
  }
}
const Config = (configs = []) => {
  return (target) => {
    if (!target.prototype.configs) {
      target.prototype.configs = []
    }
    configs.forEach(config => {
      target.prototype.configs[config.name] = new config()
    })
  }
}
const Middleware = (mids = []) => {
  return (target) => {
    mids.forEach(mid => {
      console.log(`正在加载中间件：${mid}`)
      middlewares.push(target.prototype[mid])
    })
  }
}
const DataBase = (dbs = []) => {
  return (target) => {
    if (!target.prototype.dbs) {
      target.prototype.dbs = []
    }
    dbs.forEach(db => {
      console.log(`正在加载数据库：{db:${db.name},class:${target.name}}`)
      target.prototype.dbs[db.name] = new db()
    })
  }
}

/**
 * 注入函数
 */
const Injectable = ({ folder }) => {
  const fs = require("fs")
  const path = require("path")
  fs.readdirSync(folder).forEach(filename => {
    if (fs.statSync(path.join(folder, filename)).isDirectory() && filename !== "node_modules") {
      Injectable({ folder: `${folder}/${filename}` })
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
  Auth,
  Schedule,
  Controller,
  Service,
  Model,
  Config,
  Middleware,
  DataBase,
  Injectable,
}