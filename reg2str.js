"use strict";

function reg2str(reg) {
  if (!(reg instanceof RegExp)) {
    throw new Error(
      `[reg2str ERROR] reg is expected a RegExp, but got a ${reg}`
    );
  }

  let source = reg.source;

  for (let i = 0, len = source.length; i < len; i++) {
    if (source[i] === "\\" || source[i] === '"') {
      source = source.substring(0, i) + "\\" + source.substring(i++);
      len += 2;
    }
  }

  return source + "|" + reg.flags;
}

function str2reg(str) {
  if (typeof str !== "string") {
    throw new Error(
      `[str2reg ERROR] str is expected a String, but got a ${str}`
    );
  }

  const splitIndex = str.lastIndexOf("|");

  let source = null;

  // when you havn't called JSON.parse, we need to call it here
  // some times, you will set the regstr into a json, and call JSON.stringify at outter layer
  // so we use try catch here, when throw a error, use origin source to replace it
  try {
    source = JSON.parse('"' + str.substr(0, splitIndex) + '"');
  } catch {
    source = str.substr(0, splitIndex);
  }

  return new RegExp(source, str.substr(splitIndex + 1));
}

module.exports = {
  reg2str,
  str2reg,
};
