const { Service } = require("./service");

class CategoryService extends Service {
  async query(conditions) {
    const list = await super.query(conditions);

    const nodeList = list.filter((s) => s.level === 0);

    return this._loopGetSubCate(nodeList, list);
  }

  _loopGetSubCate(nodeList, list) {
    for (const item of nodeList) {
      // if this cate'id at subCates list's parent
      const childCates = list.filter(
        (s) => s.parent && s.parent.id === item.id
      );

      if (childCates && childCates.length > 0)
        item.children = this._loopGetSubCate(childCates, list);

      if (!item.children || item.children.length === 0)
        item.children = undefined;
      item.parent = undefined;
    }

    return nodeList;
  }
}
module.exports = CategoryService;
