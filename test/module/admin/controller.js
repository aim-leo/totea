const BaseController = require("../../../controller");

class AdminController extends BaseController {
  constructor(...args) {
    super(...args);

    this.get("queryByName");
  }

  query(...args) {
    console.log("query admin");

    return super.query(...args);
  }

  queryByName({ query }) {
    const name = query.name;

    if (!name) return this.rejectRes(-1, "请输入名称");

    return super.query({
      filters: {
        name,
      },
    });
  }
}

module.exports = AdminController;
