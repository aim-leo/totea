function whatType(obj) {
  return Object.prototype.toString.call(obj)
}

function isType(...objs) {
  return (
    objs.map(item => whatType(item) === whatType(objs[0])).filter(item => !item)
      .length === 0
  )
}

function isObject(...objs) {
  return isType(...objs, {})
}

function isArray(...objs) {
  return isType(...objs, [])
}

function isOb(...objs) {
  return objs.every(obj => inType(obj, [{}, []]))
}

function isBoolean(...objs) {
  return isType(...objs, true)
}

function isString(...objs) {
  return isType(...objs, '')
}

function isNumber(...objs) {
  return isType(...objs, 1) && !isNaN(...objs)
}

function isSymbol(...objs) {
  return isType(...objs, Symbol('Symbol'))
}

function isPromise(...objs) {
  return isType(...objs, Promise.resolve())
}

function isNaN(...objs) {
  return objs.every(obj => Number.isNaN(obj))
}

function isNull(...objs) {
  return isType(...objs, null)
}

function isUndef(...objs) {
  return isType(...objs, undefined)
}

function isReg(...objs) {
  return isType(...objs, /d/)
}

function isNil(...objs) {
  return objs.every(obj => inType(obj, [undefined, null]))
}

function isFunc(...objs) {
  return objs.every(obj => inType(obj, [() => {}, async () => {}]))
}

function isImagePath(...objs) {
  return objs.every(obj => /\.(png|jpg|gif|jpeg|webp|bmp|psd|tiff|tga|eps)$/.test(obj))
}

function inType(params, list) {
  if (!isType(list, [])) {
    throw new Error(`list expect a ${whatType([])}`)
  }
  let flag = false
  for (const i in list) {
    if (isType(list[i], params)) {
      flag = true
      break
    }
  }
  return flag
}

function removeEmpty(
  obj,
  {
    removeUndefined = true,
    removeNull = true,
    removeNaN = true,
    removeEmptyString = true,
    removeEmptyArray = true,
    removeFalse = true
  } = {}
) {
  if (!isObject(obj)) throw new Error('expected a object')

  const result = {}
  for (const key in obj) {
    const val = obj[key]
    if (removeUndefined && isUndef(val)) {
      continue
    }

    if (removeNull && isNull(val)) {
      continue
    }

    if (removeNaN && isNaN(val)) {
      continue
    }

    if (removeEmptyString && val === '') {
      continue
    }

    if (removeEmptyArray && isArray(val) && val.length === 0) {
      continue
    }

    if (removeFalse && val === false) {
      continue
    }

    result[key] = val
  }

  return result
}

function randomString(L = 8) {
  let s = ''
  const randomchar = () => {
    const n = Math.floor(Math.random() * 62)
    if (n < 10) return n // 1-10
    if (n < 36) return String.fromCharCode(n + 55) // A-Z
    return String.fromCharCode(n + 61) // a-z
  }
  while (s.length < L) s += randomchar()
  return s
}

function formatFileName(file) {
  if (!isString(file)) {
    throw new Error('file name expected a string type')
  }
  return file.split('.').slice(0, -1).join('-')
}

function readFileList(dir, reg) {
  const fs = require('fs')
  const path = require('path')

  if (isNil(dir) || !isString(dir)) {
    throw new Error('dir expecetd a string type')
  }

  if (isString(reg)) {
    reg = new RegExp(`.${reg}$`)
  }

  if (!isUndef(reg) && !isReg(reg)) {
    throw new Error('dir expecetd undefined or a reg type')
  }

  const fileList = fs.readdirSync(dir)

  const result = []

  for (const file of fileList) {
    const p = path.join(dir, file)
    const stat = fs.statSync(p)

    if (!stat.isFile()) {
      continue
    }

    if (reg && !reg.test(file)) {
      continue
    }

    result.push(file)
  }

  result.toObject = function() {
    const r = {}
    for (const f of result) {
      const name = formatFileName(f)

      if (!name) throw new Error('name is empty!')

      r[name] = f
    }

    return r
  }

  return result
}

module.exports = {
  whatType,
  isType,
  inType,

  isArray,
  isBoolean,
  isFunc,
  isNaN,
  isNil,
  isNumber,
  isString,
  isSymbol,
  isUndef,
  isObject,
  isOb,
  isNull,
  isPromise,
  isReg,
  isImagePath,

  removeEmpty,
  randomString,
  readFileList
}
