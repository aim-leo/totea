const helper = require('./helper')

class Util {
  constructor() {
    Object.assign(this, helper)
  }

  get isDev() {
    return process.env.NODE_ENV === 'development'
  }

  errHandler(res, ret) {
    this.jsonWrite(res, { code: -1, msg: ret.message })
  }

  jsonRes(res, ret) {
    if (typeof ret === 'undefined') {
      res.json({ code: -200, msg: '网络繁忙，请稍后再试' })
    } else {
      res.json(ret)
    }
  }

  jsonWrite(next, res, ret) {
    res.preRes = ret || { code: -200, msg: '网络繁忙，请稍后再试' }
    next()
  }

  rejectRes(code = 0, message = 'unexpected error!', err) {
    this.debug(`[rejectRes]: `, code, message, err)
    return Promise.resolve({ code, message: this.toString(message), err: this.toString(err) })
  }

  resolveRes(code = 1, message = 'success!', data = {}) {
    if (data.pwd) {
      data.pwd = undefined
    }
    data = this.isType(data, {}) ? this.removeEmpty(data, { removeEmptyArray: false, removeEmptyString: false }) : data
    this.debug(`[resolveRes]: `, code, message)
    return Promise.resolve({ code, message: this.toString(message), data })
  }

  debug(...params) {
    console.log(`[Util MESSAGE]: `, ...params)
  }

  toString(params) {
    try {
      params = params.toString()
    } catch (e) {
      params = ''
    }
    return params
  }
}

module.exports = Util
