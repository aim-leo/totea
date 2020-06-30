const Model = require('../../model')
const types = require('../../types')

const ToteaGroup = types.ToteaGroup

const group = new ToteaGroup({
  ...types.baseMixin,
  parent: types.ref('post-category', '父分类'),
  type: types.enums([1, 2, 3], '类型').required()
})

module.exports = new Model('post-category', group)
