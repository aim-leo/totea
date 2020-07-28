const Model = require('../../model')
const types = require('../../types')

const ToteaGroup = types.ToteaGroup

const group = new ToteaGroup({
  ...types.baseMixin,
  ...types.categoryMixinFunction('category')
})

module.exports = new Model('category', group)
