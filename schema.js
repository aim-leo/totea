const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const { Totea } = require("./types");

function toMongooseSchema(toteaGroup) {
  function assignVirtualProp(schema) {
    for (const key in toteaGroup.tree) {
      const totea = toteaGroup.tree[key];
  
      if (!(totea instanceof Totea)) continue;
  
      if (totea._virtualFn) {
        schema.virtual(key).get(function () {
          return totea._virtualFn(this);
        });
      }
    }
  }

  const schema = new Schema(toteaGroup.toJsonSchema());

  // assigin virtual prop
  assignVirtualProp(schema);

  return schema;
}

module.exports = {
  toMongooseSchema
}