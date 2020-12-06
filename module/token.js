const { isString, isNil } = require("tegund");
const md5 = require("md5");

const { randomString } = require("../util/helper");

const { createModel } = require("../model");
const types = require("../types");

const { Service: ToteaService } = require("../service");
const { Controller: ToteaController } = require("../controller");
const { Get } = require("../decorator");

const toteaGroup = new types.ToteaGroup({
  token: types
    .text("签名")
    .length(32)
    .computed((doc) => {
      return md5(`${doc.userId}_${new Date().getTime()}_${randomString()}`);
    }),
  userId: types.id("用户ID").required(),
  exprire: types.int("有效时间").default(60 * 60 * 3),
  createTime: types.createTime(),
});

class Controller extends ToteaController {
  @Get()
  async sign({ query }) {
    const { userId } = query;
    try {
      if (!userId) {
        return this.rejectRes(-1, "失败,请输入userId");
      }
      const res = await this.service.sign(userId);
      if (!res) {
        return this.rejectRes(-1, "fail");
      }
      return this.resolveRes(1, "success", res);
    } catch (e) {
      return this.rejectRes(-1, "fail", e);
    }
  }

  @Get()
  async validate({ query }) {
    const { token } = query;
    try {
      if (!token) {
        return this.rejectRes(-1, "失败,请输入token");
      }
      const res = await this.service.validate(token);
      if (!res) {
        return this.rejectRes(-1, "fail");
      }
      return this.resolveRes(1, "success", res);
    } catch (e) {
      return this.rejectRes(-1, "fail", e);
    }
  }
}

class Service extends ToteaService {
  async sign(userId) {
    // check exsist
    const result = await this.queryOne({
      filters: {
        userId,
      },
    });
    // update
    if (result) {
      return await this.updateOne(
        { userId },
        {
          createTime: new Date(),
        }
      );
    } else {
      return await this.insert({
        userId,
        createTime: new Date(),
      });
    }
  }

  async expire(token) {
    // check exsist
    const tokenRes = await this.queryOne({
      filters: {
        token,
      },
    });

    if (!tokenRes) return false;

    // remove token
    const res = await this.deleteById(tokenRes._id);
    if (!res || res.deletedCount === 0) {
      return false;
    }
    return true;
  }

  async expireByUserId(userId) {
    // check exsist
    const tokenRes = await this.queryOne({
      filters: {
        userId,
      },
    });

    if (!tokenRes) return false;

    // remove token
    const res = await this.deleteById(tokenRes._id);
    if (!res || res.deletedCount === 0) {
      return false;
    }
    return true;
  }

  async validate(token) {
    // check exsist
    const result = await this.queryOne({
      filters: {
        token,
      },
    });

    if (!result) return null;

    // validate exprire
    const overDate = result.createTime.getTime() + result.exprire * 1000;
    const nowDate = new Date().getTime();
    if (overDate < nowDate) {
      return null;
    }

    return result;
  }
}

function createModule({ moduleName = "token" } = {}) {
  if (isNil(moduleName) || !isString(moduleName)) {
    throw new Error("[CategoryModuleFactory] module name is expected a string");
  }

  return {
    model: createModel(moduleName, toteaGroup),
    service: Service,
    controller: Controller,
  };
}

module.exports = createModule;
