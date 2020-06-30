const Model = require('../../model')
const types = require('../../types')

const ToteaGroup = types.ToteaGroup

const group = new ToteaGroup({
  ...types.baseMixin,
  ...types.accountMixin,
  role: types.enums([1, 2, 3], '角色').required() // 1 文章发布员 2 招聘管理员 3 管理员
})

module.exports = new Model('admin', group)
