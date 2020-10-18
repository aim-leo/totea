const { Controller } = require("../../../controller");

const { Get, Route } = require("../../../decorator");

class AdminController extends Controller {
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

  @Get()
  queryByRole({ query }) {
    const role = query.role;

    if (!role) return this.rejectRes(-1, "请输入角色类型");

    return super.query({
      filters: {
        role,
      },
    });
  }

  @Route("get", "queryByPhone")
  canBeAnyFunction({ query }) {
    const phone = query.phone;

    if (!phone) return this.rejectRes(-1, "请输入手机号码");

    return super.query({
      filters: {
        phone,
      },
    });
  }
}

module.exports = AdminController;
