const { isString, isNil } = require("tegund");

const { createModel, getModelByName } = require("../model");
const types = require("../types");

const { Controller: ToteaController } = require("../controller");
const { getServiceByName } = require("../service");

const { Post } = require("../decorator");

class Controller extends ToteaController {
  @Post()
  async login({ body }) {
    try {
      const loginDto = new types.ToteaGroup(types.accountMixin);
      const errorMessage = await loginDto.validateCreate(body);

      if (errorMessage) {
        return this.rejectRes(-1, errorMessage);
      }

      // check user exist
      const user = await this.service.queryOne({
        filters: {
          phone: body.phone,
          pwd: body.pwd,
        },
      });

      if (!user) {
        return this.rejectRes(-1, "登录失败，帐号或者密码错误");
      }

      // insert a token to token table
      const tokenService = getServiceByName("token");
      const token = await tokenService.sign(user.id);

      if (!token) {
        return this.rejectRes(-1, "登录失败， 签名失败");
      }

      return this.resolveRes(1, "登录成功", { user, token: token.sign });
    } catch (e) {
      console.error(e);
      return this.rejectRes(-1, "登录失败，帐号或者密码错误");
    }
  }
}

function createModule({ moduleName = "admin", tokenModuleName = "token" }) {
  if (isNil(moduleName) || !isString(moduleName)) {
    throw new Error("[CategoryModuleFactory] module name is expected a string");
  }

  return {
    model: createModel(
      moduleName,
      new types.ToteaGroup(types.baseMixin, types.accountMixin, {
        role: types.enums([1, 2, 3], "角色").required(), // 1 文章发布员 2 招聘管理员 3 管理员
      })
    ),
    controller: Controller,
  };
}

module.exports = createModule;
