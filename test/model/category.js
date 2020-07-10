const mongoose = require('mongoose')

const Model = require('../../model')
const types = require('../../types')

const ToteaGroup = types.ToteaGroup

const group = new ToteaGroup({
  ...types.baseMixin,
  parent: types.ref('category', '父分类'),
  type: types.enums([1, 2, 3], '类型').required(),
  level: types.int('级别').computed(async doc => {
    if (!doc.parent) return 0
    const model = mongoose.models['category']

    if (!model) throw new Error('computed level error, category model can not find')

    const parent = await model.findById(doc.parent)
    if (!parent) throw new Error(`computed level error, can not find id ${doc.parent} at category`)

    return (parent.level || 0) + 1
  })
})

module.exports = new Model('category', group)
