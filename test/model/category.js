const Model = require('../../model')
const types = require('../../types')

const ToteaGroup = types.ToteaGroup

const group = new ToteaGroup({
  ...types.baseMixin,
  parent: types.ref('category', '父分类'),
  type: types.enums([1, 2, 3], '类型').required()
})

module.exports = new Model('category', group)
