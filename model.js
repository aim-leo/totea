const mongoose = require('mongoose')

const { isString, isFunc, isArray } = require('./helper')
const connect = require('./db')
const types = require('./types')
const { toMongooseSchema } = require('./schema')

const ToteaGroup = types.ToteaGroup

class ToteaModel {
  static mongoUri

  constructor(modelName, toteaGroup) {
    this._preHandle(modelName, toteaGroup)
  }

  async exsist(params) {
    try {
      const item = await this.model.findOne(params)

      if (item) return true

      return false
    } catch (e) {
      console.error(e)

      return false
    }
  }

  findOneAndUpdate(conditions, params) {
    return this.model.findOneAndUpdate(conditions, params, {
      new: true,
      runValidators: true
    })
  }

  findByIdAndUpdate(conditions, params) {
    return this.model.findByIdAndUpdate(conditions, params, {
      new: true,
      runValidators: true
    })
  }

  create(doc, ...args) {
    return new Promise((resolve, reject) => {
      // validate
      this._checkCreate(doc, async err => {
        if (err) {
          reject(err)
        }

        try {
          // call before create hook
          if (isFunc(this.toteaGroup.beforeCreateCaller)) {
            await this.toteaGroup.beforeCreateCaller(doc)
          }

          const result = await this.model.create(doc, ...args)

          // call after create hook
          if (isFunc(this.toteaGroup.afterCreateCaller)) {
            await this.toteaGroup.afterCreateCaller(result)
          }

          resolve(result)
        } catch (e) {
          reject(e)
        }
      })
    })
  }

  _preHandle(modelName, toteaGroup) {
    if (!isString(modelName)) {
      throw new Error(`modelName expected a string, but get a ${modelName}`)
    }

    if (!(toteaGroup instanceof ToteaGroup)) {
      throw new Error(`toteaGroup expected a ToteaGroup, but get a ${toteaGroup}`)
    }

    this.toteaGroup = toteaGroup
    this.schema = toMongooseSchema(toteaGroup)

    this.schema.set('toJSON', { getters: true, virtuals: true })

    // assign middleware
    this._assignMiddleware()

    this.model = connect(ToteaModel.mongoUri).model(modelName, this.schema)

    // mapping model method
    this._mappingModelMethod()
  }

  async _checkCreate(doc, next) {
    try {
      // check doc
      const errorMessage = await this.toteaGroup.validateCreate(doc)

      if (errorMessage) {
        next(new Error(errorMessage))
      }

      // validateRef
      await this._checkRef(doc, next)

      next()
    } catch (e) {
      next(e)
    }
  }

  async _checkUpdate(doc, self, next) {
    try {
      // check doc
      const errorMessage = await this.toteaGroup.validateUpdate(doc)

      if (errorMessage) {
        next(new Error(errorMessage))
      }

      // validateRef
      await this._checkRef(doc, next)

      // assign updateTime
      self.update({}, { $set: { updateTime: new Date() } })

      // call before update hook
      if (isFunc(this.toteaGroup.beforeUpdateCaller)) {
        await this.toteaGroup.beforeUpdateCaller(doc, self)
      }

      await next()

      // call after update hook
      if (isFunc(this.toteaGroup.afterUpdateCaller)) {
        await this.toteaGroup.afterUpdateCaller()
      }
    } catch (e) {
      next(e)
    }
  }

  // validate the ref id is current
  async _checkRef(doc, next) {
    // get ref list
    const refConfig = this.toteaGroup.refConfig
    for (const key in refConfig) {
      if (!doc[key]) continue

      const { ref, refFilter = {}, isArray: _isArray } = refConfig[key]
      const model = mongoose.models[ref]

      if (!model) next(new Error(`新增失败， ${ref}表不存在`))

      const { filter, msg } = refFilter

      const ids = _isArray ? doc[key] : [doc[key]]

      if (!isArray(ids)) {
        next('_checkRef error, expected a id list')
        return
      }

      for (const _id of ids) {
        let filterVal = {
          _id
        }

        if (filter && isFunc(filter)) {
          filterVal = {
            ...filterVal,
            ...filter(doc)
          }
        }

        // test id exsist
        const item = await model.findOne(filterVal)

        if (!item) {
          next(new Error(msg || `新增失败， ${ref}表不存在id为${_id}的项`))
          return
        }
      }
    }
  }

  _excludeResult() {
    const excludeList = this.toteaGroup.excludeList

    if (excludeList && excludeList.length > 0) {
      return excludeList.map(s => '-' + s).join(' ')
    }

    return null
  }

  _joinResult() {
    const joinList = Object.keys(this.toteaGroup.refConfig)

    return joinList
  }

  _assignMiddleware() {
    const THIS = this
    // this.schema.pre('validate', function (next) {
    //   THIS._checkCreate(this, next)
    // })

    this.schema.pre('update', function (next) {
      THIS._checkUpdate(this, this, next)
    })

    this.schema.pre('findOneAndUpdate', function (next) {
      THIS._checkUpdate(this.getUpdate(), this, next)
    })

    this.schema.pre('findOneAndRemove', async function (next) {
      // call before delete hook
      if (isFunc(THIS.toteaGroup.beforeDeleteCaller)) {
        await THIS.toteaGroup.beforeDeleteCaller(this._conditions)
      }
      await next()
      // call after delete hook
      if (isFunc(THIS.toteaGroup.afterDeleteCaller)) {
        await THIS.toteaGroup.beforeDeleteCaller(this._conditions)
      }
    })

    this.schema.pre('find', function (next) {
      const exclude = THIS._excludeResult()
      if (exclude) this.select(exclude)

      const join = THIS._joinResult()
      if (join.length > 0) {
        for (const j of join) {
          this.populate(j)
        }
      }

      next()
    })
  }

  _mappingModelMethod() {
    const array = [
      'find',
      'findById',
      'findOne',
      'countDocuments',
      'findOneAndRemove',
      'findByIdAndRemove',
      'update',
      'updateMany',
      'updateOne'
    ]

    for (const method of array) {
      this[method] = this.model[method].bind(this.model)
    }
  }
}

module.exports = ToteaModel
