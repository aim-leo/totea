const Model = require('../../model')
const types = require('../../types')

const ToteaGroup = types.ToteaGroup

const group = new ToteaGroup(types.baseMixin)

module.exports = new Model('tag', group)
