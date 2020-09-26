const BaseController = require("../../../controller");

class AdminController extends BaseController {
  query(...args) {
    console.log("query admin");

    return super.query(...args);
  }
}

module.exports = AdminController;
