const { acceptString, acceptObject } = require("tegund");

const { ToteaGroup } = require("./types");

const METHODS = ["Get", "Post", "Delete", "Put", "Patch"];
const PARAMETERS = ["Body", "Query", "Params", "Header"];

// Route Get Post Delete Put Patch

function Route(method, uri) {
  acceptString(method);

  if (!METHODS.map((s) => s.toLowerCase()).includes(method.toLowerCase())) {
    throw new Error(`method expected at ${METHODS}, but got a ${method}`);
  }

  return function (target, key) {
    if (!target.routesAddedFromDecorator) target.routesAddedFromDecorator = {};
    target.routesAddedFromDecorator[uri || key] = {
      method: method.toLocaleLowerCase(),
      callback: target[key],
    };
  };
}

const methods = {};

METHODS.map((item) => {
  methods[item] = (uri) => Route(item, uri);
});

async function validate(schema, params) {
  acceptObject(schema);
  // if schema is a object
  if (!(schema instanceof ToteaGroup)) {
    schema = new ToteaGroup(schema);
  }

  return await schema.validateCreate(params);
}

// Body
function Parameter(type, schema) {
  if (!PARAMETERS.includes(type)) {
    throw new Error(`parameters expected at ${PARAMETERS}, but got a ${type}`);
  }

  type = type.toLowerCase();

  return function (target, key) {
    target.assignMiddleware(key, async (req, res, next) => {
      if (schema) {
        const errorMessage = await validate(schema, req[type]);
        if (errorMessage) {
          res.json({ code: -1, message: errorMessage });

          return;
        }
      }

      if (!req.__args) req.__args = [];

      req.__args.unshift(req[type]);

      next();
    });
  };
}

const parameters = {};

PARAMETERS.map((item) => {
  parameters[item] = (uri) => Parameter(item, uri);
});

module.exports = {
  // route decorator
  Route,
  ...methods,

  // params validate decorator
  Parameter,
  ...parameters,
};
