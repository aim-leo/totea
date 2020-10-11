const fs = require("fs-extra");
const path = require("path");
const multer = require("multer");
const md5 = require("md5");
const resizer = require("resize-img");
const { isString, isFunc, isUndef } = require("tegund");

const express = require("./express");
const { isImagePath, randomString } = require("./util/helper");

const tmpDir = path.join(global.ROOT, "./public/tmp");

// ensure tmp dir exsist
fs.ensureDirSync(tmpDir);

async function getFileBuffer(p) {
  const fileBuffer = await fs.readFile(p);

  // delete old file
  await fs.unlinkSync(p);

  if (!isImagePath(p)) {
    return fileBuffer;
  }

  return new Promise((resolve) => {
    resizer(fileBuffer, { width: 800 }).then((buf) => {
      resolve(buf);
    });
  });
}

function createUpload(name, folder) {
  if (!isString(name)) {
    throw new Error("name expected a string type");
  }

  if (isUndef(folder)) {
    folder = name;
  }

  if (!isString(folder) && !isFunc(folder)) {
    throw new Error("folder expected a string | function type");
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, tmpDir);
    },
    filename: (req, files, cb) => {
      cb(
        null,
        `uploadtmp_${name}_${new Date().getTime()}_${randomString()}_${
          files.originalname
        }`
      );
    },
  });

  const upload = multer({ storage });

  const router = express.Router();

  router.route("/").post(upload.single(name), async (req, res, next) => {
    if (!req.file) {
      res.json({
        code: -1,
        message: "上传失败，请选择文件!",
      });
      return;
    }

    if (isFunc(folder)) {
      folder = await folder(req.query);

      if (!isString(folder)) {
        throw new Error("folder expected a function return a string");
      }
    }

    // get upload dir
    const dir = path.join(global.ROOT, "./public", folder);

    // ensure tmp dir exsist
    fs.ensureDirSync(dir);

    // resize
    const fileBuffer = await getFileBuffer(req.file.path);
    const fileName = `/upload_${name}_${md5(fileBuffer)}.${
      req.file.path.split(".").reverse()[0]
    }`;
    const filePath = dir + fileName;

    // if un exsist
    if (!(await fs.exists(filePath))) {
      await fs.writeFile(filePath, fileBuffer);
    }

    res.json({
      code: 1,
      message: "上传成功!",
      data: folder + fileName,
    });
  });

  return router;
}

module.exports = createUpload;
