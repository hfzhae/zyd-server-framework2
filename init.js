/**
 * @copyright Powered by zydsoft®
 * @since 2022-1-2
 * @author: zz
 */
const fs = require("fs")
module.exports = class Init {
  constructor(dir) {
    this.dir = dir
    this.createBabelrcFile(dir)
    this.createJsonConfigFile(dir)
  }
  createBabelrcFile (dir) {
    dir += "/.babelrc"
    if (fs.existsSync(dir)) return
    fs.writeFileSync(dir, `
{
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
}
    `)
  }
  createJsonConfigFile (dir) {
    dir += "/jsconfig.json"
    if (fs.existsSync(dir)) return
    fs.writeFileSync(dir, `
{
  "compilerOptions": {
    "experimentalDecorators": true
  }
}
    `)
  }
}