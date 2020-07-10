const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const {
  isNumber,
  isUndef,
  isReg,
  isString,
  isFunc,
  isFunction,
  isAsyncFunction,
  isBoolean,
  isObject,
  isArray,
  removeEmpty,
  defineEnumerablePropertry,
} = require("./helper");

const validator = require("./validator");

class Totea {
  constructor() {
    this._type = undefined;
    this._required = false;
    this._unique = false;
    this._min = undefined;
    this._max = undefined;
    this._name = undefined;

    this._childType = undefined; // for array type

    this._forbidCreate = false;
    this._forbidUpdate = false;

    this._ref = null;
    this._refFilter = undefined;

    this._exclude = false;

    this._virtualFn = null;
    this._computedFn = null;

    this._cate = undefined;
    this._formType = undefined;
    this._validator = [];
  }

  get isFinalise() {
    if (isUndef(this._type)) {
      return false;
    }

    return true;
  }

  get isExclude() {
    return this._exclude;
  }

  get createJson() {
    return this.toValidateJson(true);
  }

  get updateJson() {
    return this.toValidateJson(false);
  }

  get schema() {
    return this.toSchema();
  }

  get refConfig() {
    return this.getRefConfig();
  }

  string() {
    this._type = String;

    return this;
  }

  number() {
    this._type = Number;

    return this;
  }

  boolean() {
    this._type = Boolean;

    return this;
  }

  date() {
    this._type = Date;

    return this;
  }

  objectId() {
    this._type = String;
    this._length = 24;
    this._cate = "id";

    return this;
  }

  enum(values, msg) {
    if (isNumber(...values)) {
      this._type = Number;
    } else if (isBoolean(...values)) {
      this._type = Boolean;
    } else {
      this._type = String;
    }
    return this.validate(
      (val) => values.some((v) => v === val),
      msg || `${this._name}值必须是${values}中的一个`
    );
  }

  array(childType, enums, msg) {
    this._type = Array;

    this._childType = childType;

    if (enums && isArray(enums)) {
      this.validate(
        (list) => list.every((v) => enums.includes(v)),
        msg || `${this._name}数组的每个值都必须在${enums}范围中`
      );
    }

    return this;
  }

  validate(func, msg = "校验失败(code: 1)") {
    if (!isFunc(func)) {
      throw new Error(`validate expected a function, but get a ${func}`);
    }

    if (!isString(msg)) {
      throw new Error(`msg expected a string, but get a ${msg}`);
    }

    this._validator.push({
      func,
      msg,
    });

    return this;
  }

  required() {
    this._required = true;

    return this;
  }

  unique() {
    this._unique = true;

    return this;
  }

  length(num) {
    this._length = num;

    return this;
  }

  min(num) {
    if (!isUndef(num) && !isNumber(num)) {
      throw new Error(`min expected a number, but get a ${num}`);
    }

    this._min = num;

    return this;
  }

  max(num) {
    if (!isUndef(num) && !isNumber(num)) {
      throw new Error(`max expected a number, but get a ${num}`);
    }

    this._max = num;

    return this;
  }

  parttern(p, msg) {
    if (!isReg(p)) {
      throw new Error(`expected a regexp, but get a ${p}`);
    }

    this.validate((val) => p.test(val), msg || `${this._name}值正则校验不通过`);

    return this;
  }

  cate(val) {
    this._cate = val;

    return this;
  }

  default(val) {
    this._default = val;

    return this;
  }

  name(name) {
    this._name = name;

    return this;
  }

  ref(val) {
    if (!isString(val) || val.length === 0) {
      throw new Error(`ref expected a notEmpty string, but get a ${val}`);
    }
    this._ref = val;

    return this;
  }

  refFilter(filter, msg) {
    let _filter = filter;
    // test filter, expected a id | object | function
    if (isString(filter)) {
      _filter = () => ({ _id: filter });
    } else if (isObject(filter)) {
      _filter = () => filter;
    } else if (!isFunc(filter)) {
      throw new Error(`ref filter is expect a string id | object | function`);
    }

    this._refFilter = { filter: _filter, msg };

    return this;
  }

  forbid() {
    this.forbidCreate();
    this.forbidUpdate();

    return this;
  }

  forbidCreate() {
    this._forbidCreate = true;

    return this;
  }

  forbidUpdate() {
    this._forbidUpdate = true;

    return this;
  }

  exclude() {
    this._exclude = true;

    return this;
  }

  virtual(fn) {
    if (!isFunc(fn)) throw new Error(`virtual expected a funtion`);
    this._virtualFn = fn;

    return this;
  }

  computed(fn) {
    if (!isFunc(fn)) throw new Error(`computed expected a funtion`);
    this._computedFn = fn;

    return this;
  }

  formType(type) {
    this._formType = type;

    return this;
  }

  // countModel(modelName, filter = {}) {
  //   this._countModelName = modelName
  //   this._countFilter = filter

  //   return this
  // }

  toValidateJson(isCreate = false) {
    if (!this.isFinalise) {
      throw new Error(
        this._name
          ? `field: ${this._name} is unfinalised`
          : `This field is unfinalised`
      );
    }

    const isForbid =
      (isCreate && this._forbidCreate) || (!isCreate && this._forbidUpdate);

    const result = removeEmpty({
      type: isForbid ? "forbidden" : this._class2Type(this._type)[0],
      min: this._min,
      max: this._max,
      length: this._length,
      optional: !this._required || !isCreate,
      validator: this._validator,
    });

    if (this._type === Array && this._childType) {
      result.items = this._class2Type(this._childType)[0];
    }

    this._assignMessage(result);

    return result;
  }

  toSchema() {
    if (this._type === Array && this._childType) {
      return [
        this._childType.hasOwnProperty("type")
          ? this._childType
          : { type: this._childType },
      ];
    }

    const result = {
      type: this._type,
      unique: this._unique,
      ref: this._ref,
      default: this._default,
    };

    return removeEmpty(result);
  }

  // trans to scheme-form data
  toFormSchema() {
    const result = {
      label: this._name,
      cate: this._formType || "input",
      attrs: {},
    };

    if (this._ref) {
      result.childs = {
        callback: this._ref,
      };
    }

    // specical for category type
    if (this._formType === "category") {
      result.attrs.options = {
        callback: this._ref,
      };

      delete result.childs;
    }

    if (!isUndef(this._min)) {
      result.attrs.min = this._min;
    }

    if (!isUndef(this._max)) {
      result.attrs.max = this._max;
    }

    return removeEmpty(result);
  }

  getRefConfig() {
    return {
      ref: this._ref,
      refFilter: this._refFilter,
      isArray: !!this._childType,
    };
  }

  getDefault(params) {
    // if default is a funtion, calculate it
    if (isFunc(this._default)) {
      return this._default(params);
    }

    return this._default;
  }

  _assignMessage(json) {
    if (!this._name) return;

    const forbidMsg = [
      this._forbidCreate ? "创建" : null,
      this._forbidUpdate ? "修改" : null,
    ]
      .filter((s) => !!s)
      .join("和");

    const messages = {
      required: `必填项:${this._name}`,
      forbidden:
        json.type === "forbidden"
          ? `${this._name}不允许在${forbidMsg}时输入`
          : undefined,
      stringMin:
        this._min && json.type === "string"
          ? `${this._name}字符长度过短,应大于${this._min}`
          : undefined,
      stringMax:
        this._max && json.type === "string"
          ? `${this._name}字符长度过长,应小于${this._max}`
          : undefined,
      numberMin:
        this._min && json.type === "number"
          ? `${this._name}不应小于最小值:${this._min}`
          : undefined,
      numberMax:
        this._max && json.type === "number"
          ? `${this._name}不应大于最大值:${this._max}`
          : undefined,
    };

    const [type, typeName] = this._class2Type(this._type);

    if (type !== "any") {
      messages[type] = `${this._name}类型错误,请输入${typeName}`;
    }

    json.messages = removeEmpty(messages);
  }

  _class2Type(c) {
    // if type is { type: TYPE }
    if (isObject(c) && c.hasOwnProperty("type")) {
      return this._class2Type(c.type);
    }

    switch (c) {
      case String:
        return ["string", "字符串类型"];
      case Boolean:
        return ["boolean", "布尔类型"];
      case Date:
        return ["date", "日期类型"];
      case Number:
        return ["number", "数字类型"];
      // case ObjectId:
      //   return ['objectId', 'id']
      case Array:
        return ["array", "数组"];
      default:
        return ["any"];
    }
  }
}

class ToteaGroup {
  constructor(tree) {
    this.tree = tree;

    this._mappingHooks(
      "beforeCreate",
      "afterCreate",
      "beforeUpdate",
      "afterUpdate",
      "beforeDelete",
      "afterDelete"
    );
  }

  get refDbList() {
    return this.getRefDbList();
  }

  get refConfig() {
    return this.getRefConfig();
  }

  get excludeList() {
    return this.getExcludeList();
  }

  get createJson() {
    return this.toCreateJson();
  }

  get updateJson() {
    return this.toUpdateJson();
  }

  get schema() {
    return this.toSchema();
  }

  get createFormSchema() {
    return this.toCreateFormShema();
  }

  get updateFormSchema() {
    return this.toUpdateFormShema();
  }

  beforeCreateOrUpdate(...args) {
    this.beforeCreate(...args);
    this.beforeUpdate(...args);
  }

  afterCreateOrUpdate(...args) {
    this.afterCreate(...args);
    this.afterUpdate(...args);
  }

  toCreateJson() {
    return this._toJson(true);
  }

  toUpdateJson() {
    return this._toJson(false);
  }

  toJsonSchema() {
    const result = {};
    for (const key in this.tree) {
      const totea = this.tree[key];

      if (!(totea instanceof Totea)) continue;

      // if is virtual prop, ignore it
      if (totea._virtualFn) continue;

      result[key] = totea.toSchema();

      // if computedFn is a pure function, assign it to mongoose schema's get
      if (isFunction(totea._computedFn)) {
        result[key].get = function () {
          return totea._computedFn(this);
        };
      }

      // if computedFn is a async function, we need to register a hook to handle it
      // and insert this callback at start of all hooks
      if (isAsyncFunction(totea._computedFn)) {
        this.beforeCreateOrUpdate(async (doc, ...args) => {
          doc[key] = await totea._computedFn(doc, ...args);
        }, false);
      }
    }

    return result;
  }

  toSchema() {
    const schema = new Schema(this.toJsonSchema());

    // assigin virtual prop
    this._assignVirtualProp(schema);

    return schema;
  }

  toCreateFormShema() {
    return this._toFormShema(true);
  }

  toUpdateFormShema() {
    return this._toFormShema();
  }

  getExcludeList() {
    const result = [];
    for (const key in this.tree) {
      const totea = this.tree[key];

      if (!(totea instanceof Totea)) continue;

      if (totea.isExclude) {
        result.push(key);
      }
    }

    return result;
  }

  getRefConfig() {
    const result = {};
    for (const key in this.tree) {
      const totea = this.tree[key];

      if (!(totea instanceof Totea)) continue;

      if (totea._cate === "id" && totea._ref) {
        result[key] = totea.refConfig;
      }
    }

    return result;
  }

  getRefDbList() {
    const result = [];
    for (const key in this.tree) {
      const totea = this.tree[key];

      if (!(totea instanceof Totea)) continue;

      if (totea._cate === "id" && totea._ref) {
        result.push(totea._ref);
      }
    }

    return result;
  }

  async validateCreate(params) {
    const msg = await this._validate(params, "create");
    // if (!msg) await this._assignDefault(params)

    return msg;
  }

  validateUpdate(params) {
    return this._validate(params, "update");
  }

  async _validate(params, type) {
    try {
      // params expected a object
      if (!isObject(params)) {
        return `params expected a object`;
      }
      const json = type === "create" ? this.createJson : this.updateJson;
      // first, use fastest-validator to check
      const validError = validator.validate(params, json);
      if (validError && validError.length > 0) {
        return validError[0].message;
      }

      // then validate addtional validator
      for (const key in json) {
        const item = json[key];

        if (!item.validator || item.validator.length === 0) {
          continue;
        }

        const isOptionalAndOfferd =
          item.optional === true && params.hasOwnProperty(key);
        if (isOptionalAndOfferd || !item.optional) {
          // loop check
          for (const v of item.validator) {
            const { func, msg } = v;
            const passed = await func(params[key], params);

            if (passed === false) {
              return msg;
            }
          }
        }
      }
    } catch (e) {
      console.error(e);
      return "校验失败:参数错误";
    }
  }

  _toJson(isCreate = false) {
    const result = {};
    for (const key in this.tree) {
      const totea = this.tree[key];

      if (!(totea instanceof Totea)) continue;

      result[key] = isCreate ? totea.createJson : totea.updateJson;
    }

    return result;
  }

  _toFormShema(isCreate = false) {
    const result = [];
    for (const key in this.tree) {
      const totea = this.tree[key];

      if (!(totea instanceof Totea)) continue;

      // if is virtual prop, ignore it
      if (
        ["createTime", "updateTime"].includes(key) ||
        totea._virtualFn ||
        totea._computedFn ||
        (totea._forbidCreate && isCreate) ||
        (totea._forbidUpdate && !isCreate)
      )
        continue;

      result.push({
        prop: key,
        ...totea.toFormSchema(),
      });
    }

    return result;
  }

  _assignVirtualProp(schema) {
    for (const key in this.tree) {
      const totea = this.tree[key];

      if (!(totea instanceof Totea)) continue;

      if (totea._virtualFn) {
        schema.virtual(key).get(function () {
          return totea._virtualFn(this);
        });
      }
    }
  }

  _mappingHooks(...list) {
    for (const hook of list) {
      if (!isString(hook)) {
        throw new Error("hook name expected a string");
      }

      defineEnumerablePropertry(this, `_${hook}`, []);

      defineEnumerablePropertry(this, `${hook}Caller`, async (...args) => {
        for (const callback of this[`_${hook}`]) {
          await callback(...args);
        }
      });

      this[hook] = (callback, atLast = true) => {
        if (!isFunc(callback))
          throw new Error(
            `callback named ${hook} expected a function, but got a ${callback}`
          );
        if (atLast) {
          this[`_${hook}`].push(callback);
        } else {
          this[`_${hook}`].unshift(callback);
        }
      };
    }
  }
}

const id = (name) =>
  new Totea().objectId().cate("id").name(name).formType("input");

const ref = (val, name) => id(name).ref(val).formType("id_select");

const shortText = (name) =>
  new Totea().string().min(1).max(30).name(name).formType("input");

const text = (name) =>
  new Totea().string().min(3).max(1000).name(name).formType("textarea");

const longText = (name) =>
  new Totea().string().min(3).max(100000).name(name).formType("editor");

const tel = (name = "联系方式") =>
  new Totea()
    .string()
    .parttern(
      /((\d{11})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$)/,
      "请输入一个联系电话,支持固定电话|手机号"
    )
    .name(name)
    .formType("input");

const phone = (name = "手机号") =>
  new Totea()
    .string()
    .parttern(
      /^(13[0-9]|14[5|7]|15[0|1|2|3|4|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/,
      "请输入一个正确的手机号"
    )
    .name(name)
    .formType("input");

const email = (name = "邮箱") =>
  new Totea()
    .string()
    .parttern(
      /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
      "请输入一个正确的邮箱地址"
    )
    .name(name)
    .formType("input");

// 6-18 Can only contain letters, numbers and underscores
const pwd = (name = "密码") =>
  new Totea()
    .string()
    .parttern(/^[a-zA-Z]\w{5,17}$/, "请输入一个6-18位的密码,需包含数字和字母")
    .cate("pwd")
    .name(name)
    .formType("input");

// 8-20 It must contain a combination of upper and lower case letters and numbers. Special characters can be used and the length is between 8-20
const strongPwd = (name = "密码") =>
  new Totea()
    .string()
    .parttern(
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,20}$/,
      "请输入一个8-20位的强密码,必须同时包含数字和大小写字母"
    )
    .cate("pwd")
    .name(name)
    .formType("input");

const number = (name) => new Totea().number().name(name);

const int = (name) => number(name).min(0).formType("int");

const float = (name) => number(name).min(0).formType("float");

const date = (name) =>
  new Totea().date().cate("date").name(name).formType("date");

const dateNow = (name) =>
  new Totea().date().cate("date").default(Date.now).name(name);

const createTime = (name = "创建时间") => dateNow(name);

const updateTime = (name = "创建时间") => dateNow(name).cate("updateTime");

const image = (name) => text(name).cate("image").formType("upload");

const enums = (values, name) =>
  new Totea().name(name).enum(values).cate("enums").formType("radio");

const boolean = (name) => new Totea().boolean().name(name).formType("switch");

const array = (childType, name) =>
  new Totea()
    .array(childType)
    .name(name)
    .cate("array")
    .formType("dynamic_tags");

const ids = (refName, name, msg) =>
  array({ type: ObjectId, ref: refName }, null, msg)
    .ref(refName)
    .cate("id")
    .name(name)
    .formType("multi_select");

const baseMixin = {
  name: shortText("名称").required(),
  remark: text("备注"),
  logo: image("图片"),
  createTime: createTime(),
  updateTime: updateTime(),
};

const addressMixin = {
  province: shortText("省").required(),
  city: shortText("市").required(),
  county: shortText("区").required(),
  addressDetail: text("详细地址").required(),
};

const accountMixin = {
  phone: phone().required().unique(),
  pwd: pwd().required().exclude(),
  email: email(),
};

module.exports = {
  ToteaGroup,
  Totea,

  text,
  shortText,
  longText,
  tel,
  id,
  pwd,
  strongPwd,
  email,
  phone,
  date,
  dateNow,
  ref,
  int,
  float,
  createTime,
  updateTime,
  image,
  enums,
  boolean,
  array,
  ids,

  baseMixin,
  addressMixin,
  accountMixin,
};
