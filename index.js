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
  Middleware,
  Controller,
  Auth,
  Config,
  Schedule,
  DataBase,
} = require("./loader");
const { resolve } = require("path")
const Init = require("./init")
const Koa = require("koa")
const version = require('./package.json').version
class Zsf {
  constructor() {
    const dir = __dirname.split("/node_modules/zyd-server-framework2")[0]
    new Init(dir)
    console.log(`\x1B[33m
┌───────────────────────┐
│ Powered by zydsoft®   │
│ zyd-server-framework2 │
└───────────────────────┘
version：${version}
\x1B[0m`)
    this.$app = new Koa()
    this.$app.use(require("koa-bodyparser")())
    const { router, middlewares } = Injectable({ folder: resolve(dir, ".") })
    middlewares.forEach(m => { this.$app.use(m) })
    this.$app.use(router.routes())
  }
  start (port = 3000, callBack = () => {
    console.log("start on port:" + port)
  }) {
    this.$app.listen(port, () => {
      callBack && callBack()
      console.log(`\x1B[1m\x1B[32m
┌───────────────┐
│ start success │
└───────────────┘
\x1B[0m\x1B[0m`)
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
  Middleware,
  Controller,
  Auth,
  Config,
  Schedule,
  DataBase,
}