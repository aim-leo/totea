const express = require("express");

const {
  acceptObject,
  acceptFuncArray,
  acceptObjectArray,
  acceptFunc,
  isFunc,
  isFuncArray,
} = require("tegund");

const { parseRequestParams } = require("../middleware");

class ToteaRouter {
  constructor({ controller, middleware, interceptor }) {
    acceptObject(
      controller,
      `controller expected a object, but get a ${controller}`
    );
    acceptObject(
      middleware,
      `middleware expected a object, but get a ${middleware}`
    );
    acceptFuncArray(
      interceptor,
      `interceptor expected a function array, but get a ${interceptor}`
    );

    // insert a to json response interceptor
    interceptor.push((req, res, next) => {
      this.controller.jsonRes(res, res.preRes);
    });

    this.controller = controller;
    this.middleware = middleware;
    this.interceptor = interceptor;

    this.router = new express.Router();
  }

  createRouter(routes) {
    this.query();
    this.insert();
    this.queryById();
    this.deleteById();
    this.updateById();

    this._mappingAddtionalRoutes(routes);

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
    } else if (isFuncArray(m)) {
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

  _mappingAddtionalRoutes(routes) {
    acceptObjectArray(routes);

    for (const item of routes) {
      const { method, uri, callback } = item;

      const func = this.router[method];

      acceptFunc(func);

      this.router[method](uri, async (req, res, next) => {
        this.controller.jsonWrite(next, res, await callback(req));
      });
    }
  }
}

module.exports = ToteaRouter;
