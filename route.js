const express = require('express')
const importModules = require('import-modules')
const path = require('path')
const merge = require('deepmerge')

const { isString, isObject, isFunc, isArray, readFileList } = require('./helper')

const ToteaService = require('./service')
const ToteaControoler = require('./controller')
const { parseRequestParams } = require('./middleware')
const createUpload = require('./upload')

class ToteaRoute {
  constructor({
    src = '.',
    router,
    middleware = {},
    interceptors = []
  } = {}) {
    if (!isString(src)) {
      throw new Error(
        `src expected a string, but get a ${src}`
      )
    }

    if (!isFunc(router)) {
      throw new Error(
        `router expected a express.router, but get a ${src}`
      )
    }

    if (!isObject(middleware)) {
      throw new Error(`middleware expected a object, but get a ${middleware}`)
    }

    if (isFunc(interceptors)) {
      this._interceptors = [interceptors]
    } else if (isArray(interceptors)) {
      this._interceptors = interceptors
    } else {
      throw new Error(`interceptors expected a array | function, but get a ${interceptors}`)
    }

    this._router = router

    this._middleware = middleware

    this._controllers = importModules(this._getPath(src, 'controller'))
    this._services = importModules(this._getPath(src, 'service'))
    this._models = importModules(this._getPath(src, 'model'))

    this._staticPath = this._getPath(src, 'static')

    this._mappingGuardAndShip()
  }

  route(routeName, { middleware = {} } = {}) {
    return this._formatRoute(routeName, merge(this._middleware, middleware))
  }

  injectModel() {
    // inject route from model
    for (const key in this._models) {
      this._router.use('/' + key, this.route(key))
    }
  }

  // auto mapping static html file into route
  // ep: static/index.html => /, static/abc.html => /abc
  // it is not recommand
  injectStatic() {
    // inject page from static
    const staticList = readFileList(this._staticPath).toObject()
    for (const key in staticList) {
      this._router.get('/' + (key === 'index' ? '' : key), (req, res, next) => {
        res.sendFile(staticList[key], { root: this._staticPath })
      })
    }
  }

  injectUpload(list = [], prefix = 'upload') {
    if (!isArray(list)) {
      throw new Error('list expected a array')
    }
    for (const u of list) {
      let obj = {}
      if (isString(u)) {
        obj = {
          name: u,
          folder: u
        }
      } else if (isObject(u) && u.hasOwnProperty('name')) {
        obj = u
      } else {
        throw new Error('list expected a array include string or { name: [name], folder?: [folder] } typed object')
      }

      this._router.use(`/${prefix}/${obj.name}`, createUpload(obj.name, obj.folder))
    }
  }

  _mappingGuardAndShip() {
    // apply interceptors
    for (const g of this._interceptors) {
      if (!isFunc(g)) {
        throw new Error(`interceptors expected a array<function> or a function`)
      }
      this._router.use(g)
    }
  }

  _formatRoute(routeName, middleware = {}) {
    if (!isString(routeName)) {
      throw new Error(`routeName expected a string, but get a ${routeName}`)
    }

    if (!isObject(middleware)) {
      throw new Error(`middleware expected a object, but get a ${middleware}`)
    }

    // check model exist
    if (!(routeName in this._models)) {
      throw new Error(`Attempt to find model under ../model, but get none`)
    }

    const controller = this._importController(routeName)

    const router = express.Router()

    function mappingMiddleware(type) {
      const m = middleware[type] || []
      if (isFunc(m)) {
        return [m]
      } else if (isArray(m)) {
        return m
      }

      throw new Error(
        `middleware[${type}] expected a array<function> or a function`
      )
    }

    router
      .route('/')
      .get(
        parseRequestParams,
        ...mappingMiddleware('query'),
        async (req, res, next) => {
          controller.jsonWrite(next, res, await controller.query(req.query))
        }
      )
      .post(...mappingMiddleware('insert'), async (req, res, next) => {
        controller.jsonWrite(next, res, await controller.insert(req.body))
      })
    router
      .route('/:id')
      .get(...mappingMiddleware('queryById'), async (req, res, next) => {
        controller.jsonWrite(
          next,
          res,
          await controller.queryById(req.params.id)
        )
      })
      .delete(...mappingMiddleware('deleteById'), async (req, res, next) => {
        controller.jsonWrite(
          next,
          res,
          await controller.deleteById(req.params.id)
        )
      })
      .patch(...mappingMiddleware('updateById'), async (req, res, next) => {
        controller.jsonWrite(
          next,
          res,
          await controller.updateById(req.params.id, req.body)
        )
      })

    // at last, write json
    router.use((req, res, next) => {
      controller.jsonRes(res, res.preRes)
    })

    return router
  }

  _importController(routeName) {
    // import model
    const model = this._models[routeName]
    const service = this._services[routeName] || new ToteaService(model)

    const controller =
      this._controllers[routeName] || new ToteaControoler(service)

    return controller
  }

  _getPath(src, dir) {
    return path.join(src, dir)
  }
}

module.exports = ToteaRoute
