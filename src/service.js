/*
 * @Author: aim-leo
 * @Date: 2019-03-07 11:57:15
 * @Last Modified by: aim-leo
 * @Last Modified time: 2019-07-29 11:50:01
 */

class ToteaService {
  constructor(model) {
    this.model = model
  }

  query({
    params: { page, limit, all } = {
      page: null,
      limit: null
    },
    populate = [],
    filters = {},
    select = {},
    sort
  } = {}) {
    if (all === '1' || all === 1) {
      limit = null
      page = null
    }
    return this.model
      .find(filters, select)
      .populate(populate)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort(sort || { createTime: -1 })
  }

  queryOne({ populate = [], filters = {}, select = {} }) {
    return this.model.findOne(filters, select).populate(populate)
  }

  count({ filters }) {
    return this.model.countDocuments(filters)
  }

  queryById(id, { populate = [], select = {} } = {}) {
    try {
      return this.model.findById(id).populate(populate).select(select)
    } catch (e) {
      return null
    }
  }

  insert(params) {
    return this.model.create(params)
  }

  deleteById(id) {
    return this.model.findByIdAndRemove(id)
  }

  updateById(id, params) {
    return this.model.findByIdAndUpdate(id, params)
  }

  update(filter, params) {
    return this.model.updateOne(params, filter)
  }

  checkById(id) {
    if (!id) {
      return Promise.reject(new Error('[checkById] id is empty!'))
    }
    return this.model.exsist({ _id: id })
  }
}

module.exports = ToteaService
