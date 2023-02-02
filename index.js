/**
 * @copyright Powered by zydsoft®
 * @since 2022-1-2
 * @author: zz
 */
const {
  Injectable,
  Get,
  Post,
  Del,
  Put,
  Patch,
  Service,
  Model,
  Plugin,
  Middleware,
  Controller,
  Config,
  Schedule,
  DataBase,
} = require("./loader");
const { resolve } = require("path")
const Init = require("./init")
const Koa = require("koa")
const version = require('./package.json').version
class Zsf {
  constructor(conf = {}) {
    const dir = __dirname.split("/node_modules/zyd-server-framework2")[0]
    new Init(dir)
    console.log(`\x1B[33m
┌───────────────────────┐
│ Powered by zydsoft®   │
│ zyd-server-framework2 │
└───────────────────────┘
\x1B[0m\x1B[37mversion：\x1B[0m\x1B[31m${version}\x1B[0m
  `)
    this.koa = new Koa()
    //生命周期函数 - init前 zz 2023-1-4
    if (conf && conf.beforeInit) conf.beforeInit(this.koa)
    this.koa.use(require("koa-bodyparser")())
    const { router, middlewares } = Injectable({ folder: resolve(dir, "."), rootFolder: resolve(dir, "."), conf: { ...conf, app: this } })
    middlewares.forEach(mid => {
      this.koa.use(mid)
    })
    // this.koa.use(...middlewares)
    this.koa.use(router.routes())
    //生命周期函数 - init后 zz 2023-1-4
    process.nextTick(() => {
      if (conf && conf.afterInit) conf.afterInit(this.koa)
    })
  }
  start (port = 3000, callBack = () => {
    console.log(`\n\x1B[33m\x1B[1mstart on port: ${port}\x1B[0m`)
  }) {
    this.koa.listen(port, () => {
      callBack && callBack()
      console.log(`\x1B[32m
┌───────────────┐
│ start success │
└───────────────┘
\x1B[0m`)
    })
  }
}
module.exports = {
  Zsf,
  Injectable,
  Get,
  Post,
  Del,
  Put,
  Patch,
  Service,
  Model,
  Plugin,
  Middleware,
  Controller,
  Config,
  Schedule,
  DataBase,
}