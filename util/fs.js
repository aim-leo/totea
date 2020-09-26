const path = require("path");
const fs = require("fs");

const { isString, isNil, isUndef, isFunc, isArray } = require("../helper");

function formatFileName(file) {
  if (!isString(file)) {
    throw new Error("file name expected a string type");
  }
  if (file.indexOf(".") === -1) return file;
  return file.split(".").slice(0, -1).join("-");
}

function readFileList(dir, excludes = []) {
  if (isNil(dir) || !isString(dir)) {
    throw new Error("dir expecetd a string type");
  }

  if (!isArray(excludes)) {
    throw new Error("exclude expecetd a arrary like Array<function>");
  }

  const fileList = fs.readdirSync(dir);

  const result = [];

  function getExcludeResult(file, stat) {
    for (const exclude of excludes) {
      if (!isFunc(exclude)) {
        throw new Error("exclude expecetd a arrary like Array<function>");
      }
      if (exclude({ file, stat })) return true;
    }
  }

  for (const file of fileList) {
    const p = path.join(dir, file);
    const stat = fs.statSync(p);

    if (getExcludeResult(file, stat)) continue;

    // if (!stat.isFile()) {
    //   continue;
    // }

    // if (reg && !reg.test(file)) {
    //   continue;
    // }

    result.push(file);
  }

  result.toObject = function () {
    const r = {};
    for (const f of result) {
      const name = formatFileName(f);

      if (!name) throw new Error("name is empty!");

      r[name] = f;
    }

    return r;
  };

  return result;
}

function readSingleFileList(dir, excludes = []) {
  return readFileList(dir, [({ stat }) => !stat.isFile(), ...excludes]);
}

function readDirList(dir, excludes = []) {
  return readFileList(dir, [({ stat }) => stat.isFile(), ...excludes]);
}

module.exports = {
  formatFileName,
  readFileList,
  readSingleFileList,
  readDirList,
};
