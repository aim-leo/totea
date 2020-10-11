const express = require("express");

const { isObject, isFunc, isFuncList } = require("./helper");

const { parseRequestParams } = require("../middleware");

class ToteaRouter {
  constructor({ controller, middleware, interceptor }) {
    if (!isObject(controller)) {
      throw new Error(`controller expected a object, but get a ${controller}`);
    }

    if (!isObject(middleware)) {
      throw new Error(`middleware expected a object, but get a ${middleware}`);
    }

    if (!isFuncList(interceptor)) {
      throw new Error(
        `interceptor expected a array | function, but get a ${interceptor}`
      );
    }

    // insert a to json response interceptor
    interceptor.push((req, res, next) => {
      this.controller.jsonRes(res, res.preRes);
    });

    this.controller = controller;
    this.middleware = middleware;
    this.interceptor = interceptor;

    this.router = new express.Router();

    return this.createRouter();
  }

  createRouter() {
    this.query();
    this.insert();
    this.queryById();
    this.deleteById();
    this.updateById();

    this._mappingInterceptor();

    return this.router;
  }

  query() {
    this.router.get(
      "/",
      parseRequestParams,
      ...this._spreadMiddleware("query"),
      async (req, res, next) => {
        this.controller.jsonWrite(
          next,
          res,
          await this.controller.query(req.query)
        );
      }
    );
  }

  insert() {
    this.router.post(
      "/",
      ...this._spreadMiddleware("insert"),
      async (req, res, next) => {
        this.controller.jsonWrite(
          next,
          res,
          await this.controller.insert(req.body)
        );
      }
    );
  }

  queryById() {
    this.router.get(
      "/:id",
      ...this._spreadMiddleware("queryById"),
      async (req, res, next) => {
        this.controller.jsonWrite(
          next,
          res,
          await this.controller.queryById(req.params.id)
        );
      }
    );
  }

  deleteById() {
    this.router.delete(
      "/:id",
      ...this._spreadMiddleware("deleteById"),
      async (req, res, next) => {
        this.controller.jsonWrite(
          next,
          res,
          await this.controller.deleteById(req.params.id)
        );
      }
    );
  }

  updateById() {
    this.router.patch(
      "/:id",
      ...this._spreadMiddleware("updateById"),
      async (req, res, next) => {
        this.controller.jsonWrite(
          next,
          res,
          await this.controller.updateById(req.params.id, req.body)
        );
      }
    );
  }

  _spreadMiddleware(type) {
    const m = this.middleware[type] || [];
    if (isFunc(m)) {
      return [m];
    } else if (isFuncList(m)) {
      return m;
    }

    throw new Error(
      `middleware[${type}] expected a array<function> or a function`
    );
  }

  _mappingInterceptor() {
    for (const interceptor of this.interceptor) {
      if (!isFunc(interceptor)) {
        throw new Error(`interceptor expected a array<function> or a function`);
      }
      this.router.use(interceptor);
    }
  }
}

module.exports = ToteaRouter;
