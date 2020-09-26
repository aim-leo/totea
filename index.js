const http = require("http");
const path = require("path");

const createError = require("http-errors");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const express = require("./express");
const { isNumber, isString } = require("./util/helper");

class ToteaServer {
  constructor({ mongoUri, port = 3000 } = {}) {
    // set db uri
    if (mongoUri) {
      this.setMongoUri(mongoUri);
    }

    const router = this.createRouter();
    const app = this.createApp(router);

    const server = http.createServer(app);

    // check port
    if (!isNumber(port)) {
      throw new Error(`port expected a number, but get a ${port}`);
    }

    /**
     * Event listener for HTTP server "error" event.
     */

    function onError(error) {
      if (error.syscall !== "listen") {
        throw error;
      }

      const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

      // handle specific listen errors with friendly messages
      switch (error.code) {
        case "EACCES":
          console.error(bind + " requires elevated privileges");
          process.exit(1);
        case "EADDRINUSE":
          console.error(bind + " is already in use");
          process.exit(1);
        default:
          throw error;
      }
    }

    /**
     * Event listener for HTTP server "listening" event.
     */

    function onListening() {
      const addr = server.address();
      const bind =
        typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
      console.log("Listening on " + bind);
    }

    app.set("port", port);

    server.listen(port);
    server.on("error", onError);
    server.on("listening", onListening);
  }

  createApp(router) {
    const app = express();

    // if env is develop, cors
    const { cors } = require("./middleware");
    app.use(cors);

    app.use(logger("tiny"));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());

    // set html engine
    app.set("views", path.resolve("./views"));
    app.set("view engine", "ejs");

    this.defineStatic(app);

    this.registerRouter(app, router);

    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
      next(createError(404));
    });

    // error handler
    app.use(function (err, req, res, next) {
      res.json({
        code: err.status || 500,
        message: err.message || "服务器错误，请联系开发人员",
      });
    });

    return app;
  }

  createRouter() {
    const router = express.Router();

    this.guradRouter(router);

    this.registerToteaRouter(router);

    this.customizeRouter(router);

    return router;
  }

  defineStatic(app) {
    app.use(
      express.static(path.join(global.ROOT, "public"), {
        maxAge: 2592000000,
      })
    );

    app.use(express.static(path.join(global.ROOT, "static")));
  }

  registerRouter(app, router) {
    app.use("/", router);
  }

  registerToteaRouter(router) {
    const ToteaRoute = require("./route");

    const toteaRoute = new ToteaRoute({
      src: global.ROOT,
      router,
    });

    toteaRoute.injectRouteFromModel();
    toteaRoute.injectRouteFromModule();

    this.customizeToteaRouter(toteaRoute);
  }

  guradRouter() {}

  customizeRouter() {}

  customizeToteaRouter() {}

  setMongoUri(uri) {
    if (!isString(uri)) {
      throw new Error("uri expected a string type");
    }
    const Model = require("./model");

    Model.mongoUri = uri;
  }
}

function createServer(...args) {
  const server = new ToteaServer(...args);

  return server;
}

module.exports = {
  ToteaServer,
  createServer,
};
