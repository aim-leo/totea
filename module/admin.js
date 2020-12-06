const { isString, isNil } = require("tegund");

const { createModel, getModelByName } = require("../model");
const types = require("../types");

const { Controller: ToteaController } = require("../controller");
const { getServiceByName } = require("../service");

const { Post, Body } = require("../decorator");

class Controller extends ToteaController {
  @Post()
  @Body(types.accountMixin)
  async login(body, header, query) {
    try {
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

      return this.resolveRes(1, "登录成功", { user, token: token.token });
    } catch (e) {
      console.error(e);
      return this.rejectRes(-1, "登录失败，帐号或者密码错误");
    }
  }

  @Post()
  async loginOut({ headers }) {
    try {
      const loginDto = new types.ToteaGroup({
        token: types.text("签名").length(32).required(),
      });
      const errorMessage = await loginDto.validateCreate(headers);

      if (errorMessage) {
        return this.rejectRes(-1, errorMessage);
      }

      // find the token, then delete
      const tokenService = getServiceByName("token");
      const expireSuccess = await tokenService.expire(headers.token);

      if (!expireSuccess) {
        return this.rejectRes(-1, "登出失败");
      }

      return this.resolveRes(1, "登出成功");
    } catch (e) {
      console.error(e);
      return this.rejectRes(-1, "登出失败");
    }
  }
}

async function checkLoginmiddleware(req, res, next) {
  try {
    // get token from req
    const token = req.headers.token || req.query.token;

    if (!token || typeof token !== "string" || token.length !== 32) {
      return res.json({ code: -401, message: "登录过期，请重新登录!" });
    }

    // find the token, then delete
    const tokenService = getServiceByName("token");
    const validateRes = await tokenService.validate(token);

    if (!validateRes) {
      return res.json({ code: -401, message: "登录过期，请重新登录!" });
    }

    req.headers.token = token;
    req.query.token = token;
    req.body.token = token;

    req.headers.userId = validateRes.userId;
    req.query.userId = validateRes.userId;
    req.body.userId = validateRes.userId;

    next();
  } catch (e) {
    console.error(e);
    return res.json({ code: -401, message: "登录校验失败!" });
  }
}

function createModule({ moduleName = "admin" }) {
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
    middleware: {
      checkLogin: checkLoginmiddleware,
    },
  };
}

module.exports = createModule;
