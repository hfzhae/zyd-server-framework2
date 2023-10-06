require("zyd-server-build2")({
  src: ".",
  dst: "./build",
  noBuildFile: [],
  noBuildDir: [],
  ignoreDir: [
    "./.git",
    "./node_modules",
    "./config",
    "./controller",
    "./dataBase",
    "./middleware",
    "./model",
    "./page",
    "./plugin",
    "./schedule",
    "./service",
    "./decorators",
    "./build"
    // "./publicCode/config",
  ],
  ignoreFile: [
    "./build.js",
    "./main.js",
    "./.babelrc",
    "./jsconfig.json",
  ],
  copyright: "Powered by zydsoft®",
  options: {
    drop_console: false, // 删除console
    dead_code: true, // 移除没被引用的代码
    drop_debugger: true, // 移除 debugger;
    hoist_funs: true, // 提升函数声明
    join_vars: true, // 合并连续 var 声明
    booleans: true, // 优化布尔运算，例如 !!a? b : c → a ? b : c
    loops: true, // 当do、while 、 for循环的判断条件可以确定是，对其进行优化。
    hoist_vars: true, //  (默认 false) -- 提升 var 声明 (默认是false,因为那会加大文件的size)
    properties: false, // (默认 false) — 传一个对象来自定义指明混淆对象属性的选项。
    unsafe_math: true, // (默认 false) -- 优化数字表达式，例如2 * x * 3 变成 6 * x, 可能会导致不精确的浮点数结果。
    unused: true, //  干掉没有被引用的函数和变量。（除非设置"keep_assign"，否则变量的简单直接赋值也不算被引用。）
    pure_getters: true, // 默认是 false. 如果你传入true，会假设对象属性的引用（例如foo.bar 或 foo["bar"]）没有函数副作用。
    passes: 10, // 默认 1。运行压缩的次数。在某些情况下，用一个大于1的数字参数可以进一步压缩代码大小。注意：数字越大压缩耗时越长。
    global_defs: {
      DEBUG: false
    },
  }

})