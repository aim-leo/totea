const importModules = require("import-modules");
const path = require("path");
const merge = require("deepmerge");
const { isString, isObject, isFunc, isArray, isNil } = require("tegund");

const ToteaRouter = require("./util/router");

const ToteaService = require("./service");
const ToteaController = require("./controller");
const createUpload = require("./upload");

const {
  formatFileName,
  readSingleFileList,
  readDirList,
} = require("./util/fs");

class ToteaRoute {
  constructor({ src = ".", router, middleware = {}, interceptors = [] } = {}) {
    if (!isString(src)) {
      throw new Error(`src expected a string, but get a ${src}`);
    }

    if (!isFunc(router)) {
      throw new Error(`router expected a express.router, but get a ${src}`);
    }

    if (!isObject(middleware)) {
      throw new Error(`middleware expected a object, but get a ${middleware}`);
    }

    if (isFunc(interceptors)) {
      this._interceptors = [interceptors];
    } else if (isArray(interceptors)) {
      this._interceptors = interceptors;
    } else {
      throw new Error(
        `interceptors expected a array | function, but get a ${interceptors}`
      );
    }

    this._router = router;

    this._middleware = middleware;

    this._controllers = importModules(this._getPath(src, "controller"));
    this._services = importModules(this._getPath(src, "service"));
    this._models = importModules(this._getPath(src, "model"));

    this._staticPath = this._getPath(src, "static");
    this._modulePath = this._getPath(src, "module");
  }

  createRoute(routeName, { middleware = {} } = {}) {
    return this._formatRoute(routeName, merge(this._middleware, middleware));
  }

  injectRouteFromModel() {
    // inject route from model
    for (const key in this._models) {
      this._router.use("/" + key, this.createRoute(key));
    }
  }

  // support module define like
  // -module
  //   -user
  //     -controller.js
  //     -model.js
  //     -service.js
  injectRouteFromModule() {
    const inject = (moduleName, module) => {
      // check
      if (isNil(module.controller, module.model)) {
        throw new Error(
          `module expected atleast export a model or a controller`
        );
      }
      // import module's controller service model into this._controllers
      if (!isNil(module.model)) {
        this._models[moduleName] = module.model;
      }
      if (!isNil(module.service)) {
        this._services[moduleName] = module.service;
      }
      if (!isNil(module.controller)) {
        this._controllers[moduleName] = module.controller;
      }

      // then create router
      this._router.use("/" + moduleName, this.createRoute(moduleName));
    };
    // inject single file module
    const moduleFiles = readSingleFileList(this._modulePath);
    for (const moduleName of moduleFiles) {
      const module = require(this._getPath(this._modulePath, moduleName));

      inject(formatFileName(moduleName), module);
    }

    const moduleDirs = readDirList(this._modulePath);
    // read file form those dir
    for (const dir of moduleDirs) {
      const module = importModules(this._getPath(this._modulePath, dir));

      inject(dir, module);
    }
  }

  // auto mapping static html file into route
  // ep: static/index.html => /, static/abc.html => /abc
  // it is not recommand
  injectStatic() {
    // inject page from static
    const staticList = readSingleFileList(this._staticPath).toObject();
    for (const key in staticList) {
      this._router.get("/" + (key === "index" ? "" : key), (req, res, next) => {
        res.sendFile(staticList[key], { root: this._staticPath });
      });
    }
  }

  injectUpload(list = [], prefix = "upload") {
    if (!isArray(list)) {
      throw new Error("list expected a array");
    }
    for (const u of list) {
      let obj = {};
      if (isString(u)) {
        obj = {
          name: u,
          folder: u,
        };
      } else if (isObject(u) && u.hasOwnProperty("name")) {
        obj = u;
      } else {
        throw new Error(
          "list expected a array include string or { name: [name], folder?: [folder] } typed object"
        );
      }

      this._router.use(
        `/${prefix}/${obj.name}`,
        createUpload(obj.name, obj.folder)
      );
    }
  }

  _formatRoute(routeName, middleware = {}) {
    if (!isString(routeName)) {
      throw new Error(`routeName expected a string, but get a ${routeName}`);
    }

    if (!isObject(middleware)) {
      throw new Error(`middleware expected a object, but get a ${middleware}`);
    }

    // check model exist
    if (!(routeName in this._models)) {
      throw new Error(`Attempt to find model under ../model, but get none`);
    }

    const controller = this._importController(routeName);

    const router = new ToteaRouter({
      controller,
      middleware,
      interceptor: this._interceptors,
    });

    // mapping form create page
    const toteaGroup = this._models[routeName].toteaGroup;

    router.route("/form").get(async (req, res, next) => {
      res.render("form", {
        title: routeName,
        toteaGroupJsonString: JSON.stringify(
          toteaGroup.toProtoJson(["_validator"])
        ),
        action: routeName,
      });
    });

    return router;
  }

  _importController(routeName) {
    // import model
    const model = this._models[routeName];

    const service = this._getService({
      service: this._services[routeName],
      model,
    });

    const controller = this._getController({
      controller: this._controllers[routeName],
      service,
      model,
    });

    return controller;
  }

  _getPath(src, ...dir) {
    return path.join(src, ...dir);
  }

  _getService({ service, model }) {
    if (isObject(service)) {
      return service;
    }

    if (!model) {
      throw new Error("init service expected a model");
    }

    service = service || ToteaService;

    return new service(model);
  }

  _getController({ controller, service, model }) {
    if (isObject(controller)) {
      return controller;
    }

    service = this._getService({
      service,
      model,
    });

    if (!service) {
      throw new Error("init controller expected a service");
    }

    controller = controller || ToteaController;

    return new controller(service);
  }
}

module.exports = ToteaRoute;
