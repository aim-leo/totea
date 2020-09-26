const {
  isNumber,
  isNil,
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
  class2str,
  str2class,
} = require("./util/helper");

const { reg2str, str2reg } = require("./util/reg2str");

const { validator, getValidatorMessage } = require("./util/validator");

class Totea {
  constructor() {
    this._type = null;
    this._required = false;
    this._unique = false;
    this._min = null;
    this._max = null;
    this._name = null;
    this._length = null;

    this._childType = null; // for array type

    this._forbidCreate = false;
    this._forbidUpdate = false;

    this._ref = null;
    this._refFilter = null;

    this._exclude = false;

    this._virtualFn = null;
    this._computedFn = null;

    this._cate = null;
    this._formType = null;
    this._validator = [];

    this._parttern = null;
  }

  get isFinalise() {
    if (isNil(this._type)) {
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

  type(t) {
    this._type = class2str(t);

    return this;
  }

  string() {
    this.type("string");

    return this;
  }

  number() {
    this.type("number");

    return this;
  }

  boolean() {
    this.type("boolean");

    return this;
  }

  date() {
    this.type("date");

    return this;
  }

  objectId() {
    this.string();

    this._length = 24;
    this._cate = "id";

    return this;
  }

  enum(values, msg) {
    if (isNumber(...values)) {
      this.number();
    } else if (isBoolean(...values)) {
      this.boolean();
    } else {
      this.string();
    }
    return this.validate(
      (val) => values.some((v) => v === val),
      msg || `${this._name}值必须是${values}中的一个`
    );
  }

  array(childType, enums, msg) {
    this.type("array");

    this._childType = str2class(childType);

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
    if (!isNumber(num)) {
      throw new Error(`min expected a number, but get a ${num}`);
    }

    this._min = num;

    return this;
  }

  max(num) {
    if (!isNumber(num)) {
      throw new Error(`max expected a number, but get a ${num}`);
    }

    this._max = num;

    return this;
  }

  parttern(p, msg) {
    if (!isReg(p)) {
      throw new Error(`expected a regexp, but get a ${p}`);
    }

    this._parttern = {
      reg: p,
      msg: msg || `${this._name}值正则校验不通过`,
    };

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
      type: isForbid ? "forbidden" : this._type,
      min: this._min,
      max: this._max,
      length: this._length,
      optional: !this._required || !isCreate,
      validator: this._validator,
      parttern: this._parttern,
    });

    if (this._type === "array" && this._childType) {
      result.items = class2str(this._childType);
    }

    this._assignMessage(result);

    return result;
  }

  toSchema() {
    if (this._type === "array" && this._childType) {
      return [
        this._childType.hasOwnProperty("type")
          ? str2class(this._childType)
          : { type: str2class(this._childType) },
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

    if (!isNil(this._min)) {
      result.attrs.min = this._min;
    }

    if (!isNil(this._max)) {
      result.attrs.max = this._max;
    }

    if (!isNil(this._length)) {
      result.attrs.length = this._length;
    }

    return removeEmpty(result);
  }

  // generate rule of element-ui
  toElementRule() {
    function toRuleList(obj) {
      return [
        {
          ...obj,
          trigger: "blur",
        },
        {
          ...obj,
          trigger: "change",
        },
      ];
    }
    const rule = [];

    // assign required
    if (this._required) {
      rule.push(
        ...toRuleList({
          required: true,
          message: getValidatorMessage("required", this._name),
        })
      );
    }

    const type = class2str(this._type);

    // assign type
    if (type) {
      // if number, validate positive or float
      rule.push(
        ...toRuleList({
          type,
          message: getValidatorMessage(type, this._name),
        })
      );
    }

    // assign length
    if (!isNil(this._length) && ["string", "array"].includes(type)) {
      rule.push(
        ...toRuleList({
          type,
          len: this._length,
          message: getValidatorMessage(
            type + "Length",
            this._name,
            this._length
          ),
        })
      );
    }

    // assign min, max
    if (!isNil(this._min) && ["string", "number", "array"].includes(type)) {
      rule.push(
        ...toRuleList({
          type,
          min: this._min,
          message: getValidatorMessage(type + "Min", this._name, this._min),
        })
      );
    }
    if (!isNil(this._max) && ["string", "number", "array"].includes(type)) {
      rule.push(
        ...toRuleList({
          type,
          max: this._max,
          message: getValidatorMessage(type + "Max", this._name, this._max),
        })
      );
    }

    // assign parttern
    if (!isNil(this._parttern)) {
      rule.push(
        ...toRuleList({
          type,
          pattern: this._parttern.reg,
          message: this._parttern.msg,
        })
      );
    }

    // assign addtional validator
    if (this._validator.length > 0) {
      this._validator.map((v) => {
        const { func, msg } = v;
        rule.push(
          ...toRuleList({
            type,
            validator: async (rule, value, callback) => {
              const passed = await func(value);

              if (passed === false) {
                callback(new Error(msg));
              }

              callback();
            },
          })
        );
      });
    }
    return rule;
  }

  toProtoJson(excludeList = []) {
    if (!isArray(excludeList)) {
      throw new Error("excludeList expected a array");
    }
    // only convert own prop
    const proto = {};
    for (const key of Object.keys(this)) {
      const value = this[key];

      if (excludeList.includes(key)) continue;

      if (key === "_childType" && !isNil(value)) {
        proto[key] = class2str(value);
        continue;
      }

      if (key === "_parttern" && !isNil(value)) {
        proto[key] = {
          reg: reg2str(value.reg),
          msg: value.msg,
        };
        continue;
      }
      proto[key] = value;
    }

    return proto;
  }

  fromProtoJson(proto) {
    for (const key in proto) {
      let value = proto[key];

      if (key === "_childType" && !isNil(value)) {
        this[key] = str2class(value);
        continue;
      }

      if (key === "_parttern" && !isNil(value)) {
        this[key] = {
          reg: str2reg(value.reg),
          msg: value.msg,
        };
        continue;
      }

      this[key] = value;
    }

    return this;
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
      forbidden:
        json.type === "forbidden"
          ? `${this._name}不允许在${forbidMsg}时输入`
          : undefined,
    };

    json.messages = removeEmpty(messages);
  }
}

class ToteaGroup {
  static hooks = [
    "beforeCreate",
    "afterCreate",
    "beforeUpdate",
    "afterUpdate",
    "beforeDelete",
    "afterDelete",
  ];

  constructor(tree) {
    this.tree = tree;

    this._mappingHooks();
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

  toProtoJson(excludeList = []) {
    if (!isArray(excludeList)) {
      throw new Error("excludeList expected a array");
    }

    const tree = {};
    for (const key in this.tree) {
      const totea = this.tree[key];

      if (!(totea instanceof Totea)) continue;

      tree[key] = totea.toProtoJson(excludeList);
    }

    return {
      tree,
    };
  }

  fromProtoJson({ tree }) {
    if (!tree || !isObject(tree)) {
      throw new Error("[fromProtoJson] expected a json like { tree: {} }");
    }

    // clear tree
    this.tree = {};
    // clear hooks
    this._clearHooks();
    // format tree
    for (const key in tree) {
      const totea = new Totea();

      totea.fromProtoJson(tree[key]);

      this.tree[key] = totea;
    }

    return this;
  }

  toCreateFormShema() {
    return this._toFormShema(true);
  }

  toUpdateFormShema() {
    return this._toFormShema();
  }

  toElementRules() {
    const result = {};
    for (const key in this.tree) {
      const totea = this.tree[key];

      if (!(totea instanceof Totea)) continue;

      // if is virtual prop, ignore it
      if (
        ["createTime", "updateTime"].includes(key) ||
        totea._virtualFn ||
        totea._computedFn
      )
        continue;

      // if computedFn is a pure function, assign it to mongoose schema's get
      if (isFunction(totea._computedFn)) {
        result[key].get = function () {
          return totea._computedFn(this);
        };
      }

      result[key] = totea.toElementRule();
    }

    return result;
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

  validateCreate(params) {
    return this._validate(params, "create");
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

        const validator = [...(item.validator || [])];

        // assign _parttern to _validator
        if (!isNil(item.parttern)) {
          validator.push({
            func: (val) => item.parttern.reg.test(val),
            msg: item.parttern.msg,
          });
        }

        if (validator.length === 0) {
          continue;
        }

        const isOptionalAndOfferd =
          item.optional === true && params.hasOwnProperty(key);
        if (isOptionalAndOfferd || !item.optional) {
          // loop check
          for (const v of validator) {
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

  _mappingHooks() {
    for (const hook of ToteaGroup.hooks) {
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

  _clearHooks() {
    for (const hook of ToteaGroup.hooks) {
      if (!isString(hook)) {
        throw new Error("hook name expected a string");
      }

      this[`_${hook}`] = [];
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
  array({ type: String, ref: refName }, null, msg)
    .ref(refName)
    .cate("id")
    .name(name)
    .formType("multi_select");

const images = (name) => array(String, name).cate("image").formType("upload");
const image = (name) => images(name).length(1);

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

const categoryMixinFunction = (modelName) => {
  if (!isString(modelName)) {
    throw new Error(`modelName expected a string, but got a ${modelName}`);
  }
  return {
    parent: ref(modelName, "父分类"),
    level: int("级别").computed(async (doc) => {
      if (!doc.parent) return 0;
      const model = mongoose.models[modelName];

      if (!model)
        throw new Error(
          `computed level error, category model: ${modelName} can not find`
        );

      const parent = await model.findById(doc.parent);
      if (!parent)
        throw new Error(
          `computed level error, can not find id ${doc.parent} at ${modelName} model`
        );

      return (parent.level || 0) + 1;
    }),
    children: ids(modelName, "子分类").forbid(),
  };
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
  images,
  enums,
  boolean,
  array,
  ids,

  baseMixin,
  addressMixin,
  accountMixin,

  categoryMixinFunction,
};
