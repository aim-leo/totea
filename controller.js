/*
 * @Author: aim-leo
 * @Date: 2019-03-07 11:57:15
 * @Last Modified by: aim-leo
 * @Last Modified time: 2019-07-29 13:56:40
 */

const validator = require('./validator')
const { isString } = require('./helper')

const Util = require('./util')

class ToteaController extends Util {
  constructor(service) {
    super()
    this.service = service
  }

  async insert(params) {
    const res = await this.service.insert(params)

    return { code: 1, message: '新增成功', data: res }
  }

  queryById(id) {
    return this.query({ id })
  }

  async query(params, populate) {
    try {
      const schema = {
        page: {
          type: 'number',
          min: 0,
          optional: true,
          convert: true
        },
        limit: {
          type: 'number',
          min: 10,
          max: 100,
          optional: true,
          convert: true
        },
        all: {
          type: 'number',
          min: 0,
          max: 1,
          optional: true,
          convert: true
        },
        id: {
          type: 'string',
          length: 24,
          optional: true
        },
        filters: {
          type: 'object',
          optional: true
        },
        query: {
          type: 'object',
          optional: true
        },
        sort: {
          type: 'object',
          optional: true
        },
        select: {
          type: 'object',
          optional: true
        }
      }
      const validError = validator.validate(params, schema)
      if (validError && validError.length > 0) {
        return this.rejectRes(-1, validError[0].message)
      }
      // default
      params.page = parseInt(params.page) || 1
      params.limit = parseInt(params.limit) || 10
      // query
      if (params.id) {
        const queryOne = await this.service.queryById(params.id, {
          populate,
          select: params.select
        })
        if (!queryOne) return this.rejectRes(1, '查询出错, 未找到该项')
        return this.resolveRes(1, '查询成功', queryOne)
      }
      const count = await this.service.count({
        filters: params.filters
      })
      const list = (
        await this.service.query({
          params,
          populate,
          filters: params.filters,
          query: params.query,
          sort: params.sort,
          select: params.select
        })
      )
      return this.resolveRes(1, '查询成功', {
        list,
        count,
        pageIn: params.page
      })
    } catch (e) {
      return this.rejectRes(1, '查询出错', e)
    }
  }

  async deleteById(id) {
    try {
      if (!id) {
        return this.rejectRes(-1, '删除失败,请输入id')
      }
      const res = await this.service.deleteById(id)
      if (!res || res.deletedCount === 0) {
        return this.rejectRes(-1, '删除失败,不存在该条目')
      }
      return this.resolveRes(1, '删除成功', res)
    } catch (e) {
      return this.rejectRes(-1, '删除失败', e)
    }
  }

  async updateById(id, params) {
    try {
      if (!id || !isString(id)) {
        return this.rejectRes(-1, '修改成功,请输入要修改的id')
      }
      const exsist = await this.service.checkById(id)
      if (!exsist) {
        return this.rejectRes(-1, '不存在该条目，修改失败')
      }
      const res = await this.service.updateById(id, params)
      return this.resolveRes(1, '修改成功', res)
    } catch (e) {
      return this.rejectRes(-1, '修改失败', e)
    }
  }
}

module.exports = ToteaController
