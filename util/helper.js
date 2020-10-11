const {
  isArray,
  isFunc,
  isNaN,
  isString,
  isUndef,
  isObject,
  isNull,
} = require("tegund");

function removeEmpty(
  obj,
  {
    removeUndefined = true,
    removeNull = true,
    removeNaN = true,
    removeEmptyString = true,
    removeEmptyArray = true,
    removeFalse = true,
  } = {}
) {
  if (!isObject(obj)) throw new Error("expected a object");

  const result = {};
  for (const key in obj) {
    const val = obj[key];
    if (removeUndefined && isUndef(val)) {
      continue;
    }

    if (removeNull && isNull(val)) {
      continue;
    }

    if (removeNaN && isNaN(val)) {
      continue;
    }

    if (removeEmptyString && val === "") {
      continue;
    }

    if (removeEmptyArray && isArray(val) && val.length === 0) {
      continue;
    }

    if (removeFalse && val === false) {
      continue;
    }

    result[key] = val;
  }

  return result;
}

function randomString(L = 8) {
  let s = "";
  const randomchar = () => {
    const n = Math.floor(Math.random() * 62);
    if (n < 10) return n; // 1-10
    if (n < 36) return String.fromCharCode(n + 55); // A-Z
    return String.fromCharCode(n + 61); // a-z
  };
  while (s.length < L) s += randomchar();
  return s;
}

function defineEnumerablePropertry(target, key, value) {
  Object.defineProperty(target, key, {
    value,
    enumerable: false,
    writable: true,
  });
}

function class2str(c) {
  // if type is { type: TYPE }
  if (isObject(c) && c.hasOwnProperty("type")) {
    return class2str(c.type);
  }

  // if not a class
  if (isString(c)) return c;

  switch (c) {
    case String:
      return "string";
    case Boolean:
      return "boolean";
    case Date:
      return "date";
    case Number:
      return "number";
    case Function:
      return "function";
    case Array:
      return "array";
    default:
      return "any";
  }
}

function str2class(c) {
  // if type is { type: TYPE }
  if (isObject(c) && c.hasOwnProperty("type")) {
    return str2class(c.type);
  }

  // if is a class
  if (isFunc(c)) return c;

  switch (c) {
    case "string":
      return String;
    case "boolean":
      return Boolean;
    case "date":
      return Date;
    case "number":
      return Number;
    case "function":
      return Function;
    case "array":
      return Array;
  }
}

module.exports = {
  removeEmpty,
  randomString,

  defineEnumerablePropertry,

  class2str,
  str2class,
};
