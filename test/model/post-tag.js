const Model = require('../../src/model')
const types = require('../../src/types')

const ToteaGroup = types.ToteaGroup

const group = new ToteaGroup(types.baseMixin)

module.exports = new Model('tag', group)
