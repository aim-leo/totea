const { acceptString } = require("tegund");
const METHODS = ["Get", "Post", "Delete", "Put", "Patch"];

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

module.exports = {
  Route,
  ...methods,
};
