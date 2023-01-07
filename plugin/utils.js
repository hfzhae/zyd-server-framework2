import { Plugin } from "../loader"
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
}