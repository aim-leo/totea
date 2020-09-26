!(function (e, t) {
  "object" == typeof exports && "object" == typeof module
    ? (module.exports = t())
    : "function" == typeof define && define.amd
    ? define([], t)
    : "object" == typeof exports
    ? (exports.toteaTypes = t())
    : (e.toteaTypes = t());
})(window, function () {
  return (function (e) {
    var t = {};
    function r(n) {
      if (t[n]) return t[n].exports;
      var i = (t[n] = { i: n, l: !1, exports: {} });
      return e[n].call(i.exports, i, i.exports, r), (i.l = !0), i.exports;
    }
    return (
      (r.m = e),
      (r.c = t),
      (r.d = function (e, t, n) {
        r.o(e, t) || Object.defineProperty(e, t, { enumerable: !0, get: n });
      }),
      (r.r = function (e) {
        "undefined" != typeof Symbol &&
          Symbol.toStringTag &&
          Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }),
          Object.defineProperty(e, "__esModule", { value: !0 });
      }),
      (r.t = function (e, t) {
        if ((1 & t && (e = r(e)), 8 & t)) return e;
        if (4 & t && "object" == typeof e && e && e.__esModule) return e;
        var n = Object.create(null);
        if (
          (r.r(n),
          Object.defineProperty(n, "default", { enumerable: !0, value: e }),
          2 & t && "string" != typeof e)
        )
          for (var i in e)
            r.d(
              n,
              i,
              function (t) {
                return e[t];
              }.bind(null, i)
            );
        return n;
      }),
      (r.n = function (e) {
        var t =
          e && e.__esModule
            ? function () {
                return e.default;
              }
            : function () {
                return e;
              };
        return r.d(t, "a", t), t;
      }),
      (r.o = function (e, t) {
        return Object.prototype.hasOwnProperty.call(e, t);
      }),
      (r.p = ""),
      r((r.s = 0))
    );
  })([
    function (e, t, r) {
      const {
          isNumber: n,
          isNil: i,
          isReg: a,
          isString: o,
          isFunc: s,
          isFunction: u,
          isAsyncFunction: l,
          isBoolean: c,
          isObject: h,
          isArray: f,
          removeEmpty: d,
          defineEnumerablePropertry: p,
          class2str: m,
          str2class: y,
        } = r(1),
        { reg2str: g, str2reg: b } = r(2),
        { validator: _, getValidatorMessage: v } = r(3);
      class x {
        constructor() {
          (this._type = null),
            (this._required = !1),
            (this._unique = !1),
            (this._min = null),
            (this._max = null),
            (this._name = null),
            (this._length = null),
            (this._childType = null),
            (this._forbidCreate = !1),
            (this._forbidUpdate = !1),
            (this._ref = null),
            (this._refFilter = null),
            (this._exclude = !1),
            (this._virtualFn = null),
            (this._computedFn = null),
            (this._cate = null),
            (this._formType = null),
            (this._validator = []),
            (this._parttern = null);
        }
        get isFinalise() {
          return !i(this._type);
        }
        get isExclude() {
          return this._exclude;
        }
        get createJson() {
          return this.toValidateJson(!0);
        }
        get updateJson() {
          return this.toValidateJson(!1);
        }
        get schema() {
          return this.toSchema();
        }
        get refConfig() {
          return this.getRefConfig();
        }
        type(e) {
          return (this._type = m(e)), this;
        }
        string() {
          return this.type("string"), this;
        }
        number() {
          return this.type("number"), this;
        }
        boolean() {
          return this.type("boolean"), this;
        }
        date() {
          return this.type("date"), this;
        }
        objectId() {
          return this.string(), (this._length = 24), (this._cate = "id"), this;
        }
        enum(e, t) {
          return (
            n(...e) ? this.number() : c(...e) ? this.boolean() : this.string(),
            this.validate(
              (t) => e.some((e) => e === t),
              t || `${this._name}值必须是${e}中的一个`
            )
          );
        }
        array(e, t, r) {
          return (
            this.type("array"),
            (this._childType = y(e)),
            t &&
              f(t) &&
              this.validate(
                (e) => e.every((e) => t.includes(e)),
                r || `${this._name}数组的每个值都必须在${t}范围中`
              ),
            this
          );
        }
        validate(e, t = "校验失败(code: 1)") {
          if (!s(e))
            throw new Error("validate expected a function, but get a " + e);
          if (!o(t)) throw new Error("msg expected a string, but get a " + t);
          return this._validator.push({ func: e, msg: t }), this;
        }
        required() {
          return (this._required = !0), this;
        }
        unique() {
          return (this._unique = !0), this;
        }
        length(e) {
          return (this._length = e), this;
        }
        min(e) {
          if (!n(e)) throw new Error("min expected a number, but get a " + e);
          return (this._min = e), this;
        }
        max(e) {
          if (!n(e)) throw new Error("max expected a number, but get a " + e);
          return (this._max = e), this;
        }
        parttern(e, t) {
          if (!a(e)) throw new Error("expected a regexp, but get a " + e);
          return (
            (this._parttern = {
              reg: e,
              msg: t || this._name + "值正则校验不通过",
            }),
            this
          );
        }
        cate(e) {
          return (this._cate = e), this;
        }
        default(e) {
          return (this._default = e), this;
        }
        name(e) {
          return (this._name = e), this;
        }
        ref(e) {
          if (!o(e) || 0 === e.length)
            throw new Error("ref expected a notEmpty string, but get a " + e);
          return (this._ref = e), this;
        }
        refFilter(e, t) {
          let r = e;
          if (o(e)) r = () => ({ _id: e });
          else if (h(e)) r = () => e;
          else if (!s(e))
            throw new Error(
              "ref filter is expect a string id | object | function"
            );
          return (this._refFilter = { filter: r, msg: t }), this;
        }
        forbid() {
          return this.forbidCreate(), this.forbidUpdate(), this;
        }
        forbidCreate() {
          return (this._forbidCreate = !0), this;
        }
        forbidUpdate() {
          return (this._forbidUpdate = !0), this;
        }
        exclude() {
          return (this._exclude = !0), this;
        }
        virtual(e) {
          if (!s(e)) throw new Error("virtual expected a funtion");
          return (this._virtualFn = e), this;
        }
        computed(e) {
          if (!s(e)) throw new Error("computed expected a funtion");
          return (this._computedFn = e), this;
        }
        formType(e) {
          return (this._formType = e), this;
        }
        toValidateJson(e = !1) {
          if (!this.isFinalise)
            throw new Error(
              this._name
                ? `field: ${this._name} is unfinalised`
                : "This field is unfinalised"
            );
          const t = (e && this._forbidCreate) || (!e && this._forbidUpdate),
            r = d({
              type: t ? "forbidden" : this._type,
              min: this._min,
              max: this._max,
              length: this._length,
              optional: !this._required || !e,
              validator: this._validator,
              parttern: this._parttern,
            });
          return (
            "array" === this._type &&
              this._childType &&
              (r.items = m(this._childType)),
            this._assignMessage(r),
            r
          );
        }
        toSchema() {
          if ("array" === this._type && this._childType)
            return [
              this._childType.hasOwnProperty("type")
                ? y(this._childType)
                : { type: y(this._childType) },
            ];
          const e = {
            type: this._type,
            unique: this._unique,
            ref: this._ref,
            default: this._default,
          };
          return d(e);
        }
        toFormSchema() {
          const e = {
            label: this._name,
            cate: this._formType || "input",
            attrs: {},
          };
          return (
            this._ref && (e.childs = { callback: this._ref }),
            "category" === this._formType &&
              ((e.attrs.options = { callback: this._ref }), delete e.childs),
            i(this._min) || (e.attrs.min = this._min),
            i(this._max) || (e.attrs.max = this._max),
            i(this._length) || (e.attrs.length = this._length),
            d(e)
          );
        }
        toElementRule() {
          function e(e) {
            return [
              { ...e, trigger: "blur" },
              { ...e, trigger: "change" },
            ];
          }
          const t = [];
          this._required &&
            t.push(...e({ required: !0, message: v("required", this._name) }));
          const r = m(this._type);
          return (
            r && t.push(...e({ type: r, message: v(r, this._name) })),
            !i(this._length) &&
              ["string", "array"].includes(r) &&
              t.push(
                ...e({
                  type: r,
                  len: this._length,
                  message: v(r + "Length", this._name, this._length),
                })
              ),
            !i(this._min) &&
              ["string", "number", "array"].includes(r) &&
              t.push(
                ...e({
                  type: r,
                  min: this._min,
                  message: v(r + "Min", this._name, this._min),
                })
              ),
            !i(this._max) &&
              ["string", "number", "array"].includes(r) &&
              t.push(
                ...e({
                  type: r,
                  max: this._max,
                  message: v(r + "Max", this._name, this._max),
                })
              ),
            i(this._parttern) ||
              t.push(
                ...e({
                  type: r,
                  pattern: this._parttern.reg,
                  message: this._parttern.msg,
                })
              ),
            this._validator.length > 0 &&
              this._validator.map((n) => {
                const { func: i, msg: a } = n;
                t.push(
                  ...e({
                    type: r,
                    validator: async (e, t, r) => {
                      !1 === (await i(t)) && r(new Error(a)), r();
                    },
                  })
                );
              }),
            t
          );
        }
        toProtoJson(e = []) {
          if (!f(e)) throw new Error("excludeList expected a array");
          const t = {};
          for (const r of Object.keys(this)) {
            const n = this[r];
            e.includes(r) ||
              ("_childType" !== r || i(n)
                ? "_parttern" !== r || i(n)
                  ? (t[r] = n)
                  : (t[r] = { reg: g(n.reg), msg: n.msg })
                : (t[r] = m(n)));
          }
          return t;
        }
        fromProtoJson(e) {
          for (const t in e) {
            let r = e[t];
            "_childType" !== t || i(r)
              ? "_parttern" !== t || i(r)
                ? (this[t] = r)
                : (this[t] = { reg: b(r.reg), msg: r.msg })
              : (this[t] = y(r));
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
        getDefault(e) {
          return s(this._default) ? this._default(e) : this._default;
        }
        _assignMessage(e) {
          if (!this._name) return;
          const t = [
              this._forbidCreate ? "创建" : null,
              this._forbidUpdate ? "修改" : null,
            ]
              .filter((e) => !!e)
              .join("和"),
            r = {
              forbidden:
                "forbidden" === e.type
                  ? `${this._name}不允许在${t}时输入`
                  : void 0,
            };
          e.messages = d(r);
        }
      }
      class E {
        constructor(e) {
          (this.tree = e), this._mappingHooks();
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
        beforeCreateOrUpdate(...e) {
          this.beforeCreate(...e), this.beforeUpdate(...e);
        }
        afterCreateOrUpdate(...e) {
          this.afterCreate(...e), this.afterUpdate(...e);
        }
        toCreateJson() {
          return this._toJson(!0);
        }
        toUpdateJson() {
          return this._toJson(!1);
        }
        toJsonSchema() {
          const e = {};
          for (const t in this.tree) {
            const r = this.tree[t];
            r instanceof x &&
              (r._virtualFn ||
                ((e[t] = r.toSchema()),
                u(r._computedFn) &&
                  (e[t].get = function () {
                    return r._computedFn(this);
                  }),
                l(r._computedFn) &&
                  this.beforeCreateOrUpdate(async (e, ...n) => {
                    e[t] = await r._computedFn(e, ...n);
                  }, !1)));
          }
          return e;
        }
        toProtoJson(e = []) {
          if (!f(e)) throw new Error("excludeList expected a array");
          const t = {};
          for (const r in this.tree) {
            const n = this.tree[r];
            n instanceof x && (t[r] = n.toProtoJson(e));
          }
          return { tree: t };
        }
        fromProtoJson({ tree: e }) {
          if (!e || !h(e))
            throw new Error(
              "[fromProtoJson] expected a json like { tree: {} }"
            );
          (this.tree = {}), this._clearHooks();
          for (const t in e) {
            const r = new x();
            r.fromProtoJson(e[t]), (this.tree[t] = r);
          }
          return this;
        }
        toCreateFormShema() {
          return this._toFormShema(!0);
        }
        toUpdateFormShema() {
          return this._toFormShema();
        }
        toElementRules() {
          const e = {};
          for (const t in this.tree) {
            const r = this.tree[t];
            r instanceof x &&
              (["createTime", "updateTime"].includes(t) ||
                r._virtualFn ||
                r._computedFn ||
                (u(r._computedFn) &&
                  (e[t].get = function () {
                    return r._computedFn(this);
                  }),
                (e[t] = r.toElementRule())));
          }
          return e;
        }
        getExcludeList() {
          const e = [];
          for (const t in this.tree) {
            const r = this.tree[t];
            r instanceof x && r.isExclude && e.push(t);
          }
          return e;
        }
        getRefConfig() {
          const e = {};
          for (const t in this.tree) {
            const r = this.tree[t];
            r instanceof x &&
              "id" === r._cate &&
              r._ref &&
              (e[t] = r.refConfig);
          }
          return e;
        }
        getRefDbList() {
          const e = [];
          for (const t in this.tree) {
            const r = this.tree[t];
            r instanceof x && "id" === r._cate && r._ref && e.push(r._ref);
          }
          return e;
        }
        validateCreate(e) {
          return this._validate(e, "create");
        }
        validateUpdate(e) {
          return this._validate(e, "update");
        }
        async _validate(e, t) {
          try {
            if (!h(e)) return "params expected a object";
            const r = "create" === t ? this.createJson : this.updateJson,
              n = _.validate(e, r);
            if (n && n.length > 0) return n[0].message;
            for (const t in r) {
              const n = r[t],
                a = [...(n.validator || [])];
              if (
                (i(n.parttern) ||
                  a.push({
                    func: (e) => n.parttern.reg.test(e),
                    msg: n.parttern.msg,
                  }),
                0 === a.length)
              )
                continue;
              if ((!0 === n.optional && e.hasOwnProperty(t)) || !n.optional)
                for (const r of a) {
                  const { func: n, msg: i } = r;
                  if (!1 === (await n(e[t], e))) return i;
                }
            }
          } catch (e) {
            return console.error(e), "校验失败:参数错误";
          }
        }
        _toJson(e = !1) {
          const t = {};
          for (const r in this.tree) {
            const n = this.tree[r];
            n instanceof x && (t[r] = e ? n.createJson : n.updateJson);
          }
          return t;
        }
        _toFormShema(e = !1) {
          const t = [];
          for (const r in this.tree) {
            const n = this.tree[r];
            n instanceof x &&
              (["createTime", "updateTime"].includes(r) ||
                n._virtualFn ||
                n._computedFn ||
                (n._forbidCreate && e) ||
                (n._forbidUpdate && !e) ||
                t.push({ prop: r, ...n.toFormSchema() }));
          }
          return t;
        }
        _assignVirtualProp(e) {
          for (const t in this.tree) {
            const r = this.tree[t];
            r instanceof x &&
              r._virtualFn &&
              e.virtual(t).get(function () {
                return r._virtualFn(this);
              });
          }
        }
        _mappingHooks() {
          for (const e of E.hooks) {
            if (!o(e)) throw new Error("hook name expected a string");
            p(this, "_" + e, []),
              p(this, e + "Caller", async (...t) => {
                for (const r of this["_" + e]) await r(...t);
              }),
              (this[e] = (t, r = !0) => {
                if (!s(t))
                  throw new Error(
                    `callback named ${e} expected a function, but got a ${t}`
                  );
                r ? this["_" + e].push(t) : this["_" + e].unshift(t);
              });
          }
        }
        _clearHooks() {
          for (const e of E.hooks) {
            if (!o(e)) throw new Error("hook name expected a string");
            this["_" + e] = [];
          }
        }
      }
      var w, S, T;
      (T = [
        "beforeCreate",
        "afterCreate",
        "beforeUpdate",
        "afterUpdate",
        "beforeDelete",
        "afterDelete",
      ]),
        (S = "hooks") in (w = E)
          ? Object.defineProperty(w, S, {
              value: T,
              enumerable: !0,
              configurable: !0,
              writable: !0,
            })
          : (w[S] = T);
      const k = (e) => new x().objectId().cate("id").name(e).formType("input"),
        O = (e, t) => k(t).ref(e).formType("id_select"),
        j = (e) => new x().string().min(1).max(30).name(e).formType("input"),
        A = (e) =>
          new x().string().min(3).max(1e3).name(e).formType("textarea"),
        F = (e = "手机号") =>
          new x()
            .string()
            .parttern(
              /^(13[0-9]|14[5|7]|15[0|1|2|3|4|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/,
              "请输入一个正确的手机号"
            )
            .name(e)
            .formType("input"),
        M = (e = "邮箱") =>
          new x()
            .string()
            .parttern(
              /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
              "请输入一个正确的邮箱地址"
            )
            .name(e)
            .formType("input"),
        C = (e = "密码") =>
          new x()
            .string()
            .parttern(
              /^[a-zA-Z]\w{5,17}$/,
              "请输入一个6-18位的密码,需包含数字和字母"
            )
            .cate("pwd")
            .name(e)
            .formType("input"),
        P = (e) => new x().number().name(e),
        R = (e) => P(e).min(0).formType("int"),
        q = (e) => new x().date().cate("date").default(Date.now).name(e),
        N = (e = "创建时间") => q(e),
        I = (e = "创建时间") => q(e).cate("updateTime"),
        $ = (e, t) =>
          new x().array(e).name(t).cate("array").formType("dynamic_tags"),
        U = (e, t, r) =>
          $({ type: String, ref: e }, null)
            .ref(e)
            .cate("id")
            .name(t)
            .formType("multi_select"),
        J = (e) => $(String, e).cate("image").formType("upload"),
        L = (e) => J(e).length(1),
        D = {
          name: j("名称").required(),
          remark: A("备注"),
          logo: L("图片"),
          createTime: N(),
          updateTime: I(),
        },
        V = {
          province: j("省").required(),
          city: j("市").required(),
          county: j("区").required(),
          addressDetail: A("详细地址").required(),
        },
        z = {
          phone: F().required().unique(),
          pwd: C().required().exclude(),
          email: M(),
        };
      e.exports = {
        ToteaGroup: E,
        Totea: x,
        text: A,
        shortText: j,
        longText: (e) =>
          new x().string().min(3).max(1e5).name(e).formType("editor"),
        tel: (e = "联系方式") =>
          new x()
            .string()
            .parttern(
              /((\d{11})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$)/,
              "请输入一个联系电话,支持固定电话|手机号"
            )
            .name(e)
            .formType("input"),
        id: k,
        pwd: C,
        strongPwd: (e = "密码") =>
          new x()
            .string()
            .parttern(
              /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,20}$/,
              "请输入一个8-20位的强密码,必须同时包含数字和大小写字母"
            )
            .cate("pwd")
            .name(e)
            .formType("input"),
        email: M,
        phone: F,
        date: (e) => new x().date().cate("date").name(e).formType("date"),
        dateNow: q,
        ref: O,
        int: R,
        float: (e) => P(e).min(0).formType("float"),
        createTime: N,
        updateTime: I,
        image: L,
        images: J,
        enums: (e, t) =>
          new x().name(t).enum(e).cate("enums").formType("radio"),
        boolean: (e) => new x().boolean().name(e).formType("switch"),
        array: $,
        ids: U,
        baseMixin: D,
        addressMixin: V,
        accountMixin: z,
        categoryMixinFunction: (e) => {
          if (!o(e))
            throw new Error("modelName expected a string, but got a " + e);
          return {
            parent: O(e, "父分类"),
            level: R("级别").computed(async (t) => {
              if (!t.parent) return 0;
              const r = mongoose.models[e];
              if (!r)
                throw new Error(
                  `computed level error, category model: ${e} can not find`
                );
              const n = await r.findById(t.parent);
              if (!n)
                throw new Error(
                  `computed level error, can not find id ${t.parent} at ${e} model`
                );
              return (n.level || 0) + 1;
            }),
            children: U(e, "子分类").forbid(),
          };
        },
      };
    },
    function (e, t) {
      function r(e) {
        return Object.prototype.toString.call(e);
      }
      function n(...e) {
        return 0 === e.map((t) => r(t) === r(e[0])).filter((e) => !e).length;
      }
      function i(...e) {
        return n(...e, {});
      }
      function a(...e) {
        return n(...e, []);
      }
      function o(...e) {
        return n(...e, "");
      }
      function s(...e) {
        return e.every((e) => Number.isNaN(e));
      }
      function u(...e) {
        return n(...e, null);
      }
      function l(...e) {
        return n(...e, void 0);
      }
      function c(...e) {
        return e.every((e) => h(e, [() => {}, async () => {}]));
      }
      function h(e, t) {
        if (!n(t, [])) throw new Error("list expect a " + r([]));
        let i = !1;
        for (const r in t)
          if (n(t[r], e)) {
            i = !0;
            break;
          }
        return i;
      }
      e.exports = {
        whatType: r,
        isType: n,
        inType: h,
        isArray: a,
        isBoolean: function (...e) {
          return n(...e, !0);
        },
        isFunc: c,
        isFunction: function (...e) {
          return e.every((e) => n(e, () => {}));
        },
        isAsyncFunction: function (...e) {
          return e.every((e) => n(e, async () => {}));
        },
        isNaN: s,
        isNil: function (...e) {
          return e.every((e) => h(e, [void 0, null]));
        },
        isNumber: function (...e) {
          return n(...e, 1) && !s(...e);
        },
        isString: o,
        isSymbol: function (...e) {
          return n(...e, Symbol("Symbol"));
        },
        isUndef: l,
        isObject: i,
        isOb: function (...e) {
          return e.every((e) => h(e, [{}, []]));
        },
        isNull: u,
        isPromise: function (...e) {
          return n(...e, Promise.resolve());
        },
        isReg: function (...e) {
          return n(...e, /d/);
        },
        isImagePath: function (...e) {
          return e.every((e) =>
            /\.(png|jpg|gif|jpeg|webp|bmp|psd|tiff|tga|eps)$/.test(e)
          );
        },
        removeEmpty: function (
          e,
          {
            removeUndefined: t = !0,
            removeNull: r = !0,
            removeNaN: n = !0,
            removeEmptyString: o = !0,
            removeEmptyArray: c = !0,
            removeFalse: h = !0,
          } = {}
        ) {
          if (!i(e)) throw new Error("expected a object");
          const f = {};
          for (const i in e) {
            const d = e[i];
            (t && l(d)) ||
              (r && u(d)) ||
              (n && s(d)) ||
              (o && "" === d) ||
              (c && a(d) && 0 === d.length) ||
              (h && !1 === d) ||
              (f[i] = d);
          }
          return f;
        },
        randomString: function (e = 8) {
          let t = "";
          const r = () => {
            const e = Math.floor(62 * Math.random());
            return e < 10
              ? e
              : e < 36
              ? String.fromCharCode(e + 55)
              : String.fromCharCode(e + 61);
          };
          for (; t.length < e; ) t += r();
          return t;
        },
        defineEnumerablePropertry: function (e, t, r) {
          Object.defineProperty(e, t, {
            value: r,
            enumerable: !1,
            writable: !0,
          });
        },
        class2str: function e(t) {
          if (i(t) && t.hasOwnProperty("type")) return e(t.type);
          if (o(t)) return t;
          switch (t) {
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
        },
        str2class: function e(t) {
          if (i(t) && t.hasOwnProperty("type")) return e(t.type);
          if (c(t)) return t;
          switch (t) {
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
        },
      };
    },
    function (e, t, r) {
      "use strict";
      e.exports = {
        reg2str: function (e) {
          if (!(e instanceof RegExp))
            throw new Error(
              "[reg2str ERROR] reg is expected a RegExp, but got a " + e
            );
          let t = e.source;
          for (let e = 0, r = t.length; e < r; e++)
            ("\\" !== t[e] && '"' !== t[e]) ||
              ((t = t.substring(0, e) + "\\" + t.substring(e++)), (r += 2));
          return t + "|" + e.flags;
        },
        str2reg: function (e) {
          if ("string" != typeof e)
            throw new Error(
              "[str2reg ERROR] str is expected a String, but got a " + e
            );
          const t = e.lastIndexOf("|");
          let r = null;
          try {
            r = JSON.parse('"' + e.substr(0, t) + '"');
          } catch {
            r = e.substr(0, t);
          }
          return new RegExp(r, e.substr(t + 1));
        },
      };
    },
    function (e, t, r) {
      const n = new (r(4))({
        messages: {
          required: "必填项:{field}",
          string: "{field}字段必须为字符串",
          stringEmpty: "{field}字段不能为空",
          stringMin: "{field}字段长度必须大于或等于{expected}个字符长",
          stringMax: "{field}字段的长度必须小于或等于{expected}个字符的长度",
          stringLength: "{field}字段的长度必须为{expected}个字符",
          stringPattern: "{field}字段与所需的模式不匹配",
          stringContains: " {field}字段必须包含 {expected}文本",
          stringEnum: "{field}字段与任何允许的值都不匹配",
          stringNumeric: "{field}字段必须是数字字符串",
          stringAlpha: "{field}字段必须是字母字符串",
          stringAlphanum: "{field}字段必须是字母数字字符串",
          stringAlphadash: "{field}字段必须为字母破折号字符串",
          stringHex: "{field}字段必须为十六进制字符串",
          number: "{field}字段必须是数字",
          numberMin: "{field}字段必须大于或等于{expected}",
          numberMax: "{field}字段必须小于或等于{expected}",
          numberEqual: "{field}字段必须等于{expected}",
          numberNotEqual: "{field}字段不能等于{expected}",
          numberInteger: "{field}字段必须为整数",
          numberPositive: "{field}字段必须为正数",
          numberNegative: "{field}字段必须为负数",
          array: "{field}字段必须是一个数组",
          arrayEmpty: "{field}字段不能为空数组",
          arrayMin: "{field}字段必须至少包含{expected}个项目",
          arrayMax: " {field}字段必须包含小于或等于{expected}个项目",
          arrayLength: "{field}字段必须只包含{expected}个项目",
          arrayContains: "{field}字段必须包含{expected}项",
          arrayUnique: "{field}字段中的{actual}值不会唯一化{expected}值",
          arrayEnum: "{field}字段中的{actual}值与任何{expected}值都不匹配",
          tuple: "{field}字段必须为数组",
          tupleEmpty: "{field}字段不能为空数组",
          tupleLength: "{field}字段必须包含{expected}个项目",
          boolean: "{field}字段必须为布尔值",
          date: "{field}字段必须为日期",
          dateMin: "{field}字段必须大于或等于{expected}",
          dateMax: "{field}字段必须小于或等于{expected}",
          enumValue: "{field}字段值{expected}与任何允许的值都不匹配",
          equalValue: "{field}字段值必须等于{expected}",
          equalField: "{field}字段值必须等于{expected}字段值",
          forbidden: "{field}字段被禁止",
          function: "{field}字段必须是一个函数",
          email: "{field}字段必须是有效的电子邮件",
          emailEmpty: "{field}字段不能为空",
          luhn: "{field}字段必须是有效的校验和luhn",
          mac: "{field}字段必须是有效的MAC地址",
          object: "{field}必须是一个对象",
          objectStrict: "对象{field}包含禁止的键:{actual}",
          objectMinProps: "对象{field}必须至少包含{expected}个属性",
          objectMaxProps: "对象{field}最多必须包含{expected}个属性",
          url: "{field}字段必须是有效的URL",
          urlEmpty: "{field}字段不能为空",
          uuid: "{field}字段必须是有效的UUID",
          uuidVersion: "{field}字段必须是提供的有效UUID版本",
          classInstanceOf: "{field}字段必须是{expected}类的实例",
          mongoObjectId: "'{field}' 必须是一个正确的ObjectId, 实际: {actual}",
        },
      });
      n.add("objectId", function ({ schema: e, messages: t }, r, n) {
        return {
          source: `\n    const mongoose = require('mongoose')\n    const Schema = mongoose.Schema\n    const ObjectId = Schema.Types.ObjectId\nif (!(value instanceof ObjectId))\n  ${this.makeError(
            { type: "mongoObjectId", actual: "value", messages: t }
          )}\n\nreturn value;\n    `,
        };
      }),
        (e.exports = {
          validator: n,
          getValidatorMessage: function (e, t = "", r, i) {
            let a = n.messages[e];
            if (!a) throw new Error("without this type: " + e);
            return (
              (a = a.replace("{field}", t)),
              void 0 !== r && (a = a.replace("{expected}", r)),
              void 0 !== i && (a = a.replace("{actual}", i)),
              a
            );
          },
        });
    },
    function (e, t, r) {
      "use strict";
      (function (t) {
        var r,
          n = n || {};
        (n.scope = {}),
          (n.ASSUME_ES5 = !1),
          (n.ASSUME_NO_NATIVE_MAP = !1),
          (n.ASSUME_NO_NATIVE_SET = !1),
          (n.defineProperty =
            n.ASSUME_ES5 || "function" == typeof Object.defineProperties
              ? Object.defineProperty
              : function (e, t, r) {
                  e != Array.prototype &&
                    e != Object.prototype &&
                    (e[t] = r.value);
                }),
          (n.getGlobal = function (e) {
            return "undefined" != typeof window && window === e
              ? e
              : void 0 !== t && null != t
              ? t
              : e;
          }),
          (n.global = n.getGlobal(this)),
          (n.SYMBOL_PREFIX = "jscomp_symbol_"),
          (n.initSymbol = function () {
            (n.initSymbol = function () {}),
              n.global.Symbol || (n.global.Symbol = n.Symbol);
          }),
          (n.Symbol =
            ((r = 0),
            function (e) {
              return n.SYMBOL_PREFIX + (e || "") + r++;
            })),
          (n.initSymbolIterator = function () {
            n.initSymbol();
            var e = n.global.Symbol.iterator;
            e || (e = n.global.Symbol.iterator = n.global.Symbol("iterator")),
              "function" != typeof Array.prototype[e] &&
                n.defineProperty(Array.prototype, e, {
                  configurable: !0,
                  writable: !0,
                  value: function () {
                    return n.arrayIterator(this);
                  },
                }),
              (n.initSymbolIterator = function () {});
          }),
          (n.arrayIterator = function (e) {
            var t = 0;
            return n.iteratorPrototype(function () {
              return t < e.length ? { done: !1, value: e[t++] } : { done: !0 };
            });
          }),
          (n.iteratorPrototype = function (e) {
            return (
              n.initSymbolIterator(),
              ((e = { next: e })[n.global.Symbol.iterator] = function () {
                return this;
              }),
              e
            );
          }),
          (n.iteratorFromArray = function (e, t) {
            n.initSymbolIterator(), e instanceof String && (e += "");
            var r = 0,
              i = {
                next: function () {
                  if (r < e.length) {
                    var n = r++;
                    return { value: t(n, e[n]), done: !1 };
                  }
                  return (
                    (i.next = function () {
                      return { done: !0, value: void 0 };
                    }),
                    i.next()
                  );
                },
              };
            return (
              (i[Symbol.iterator] = function () {
                return i;
              }),
              i
            );
          }),
          (n.polyfill = function (e, t) {
            if (t) {
              var r = n.global;
              e = e.split(".");
              for (var i = 0; i < e.length - 1; i++) {
                var a = e[i];
                a in r || (r[a] = {}), (r = r[a]);
              }
              (t = t((i = r[(e = e[e.length - 1])]))) != i &&
                null != t &&
                n.defineProperty(r, e, {
                  configurable: !0,
                  writable: !0,
                  value: t,
                });
            }
          }),
          n.polyfill(
            "Array.prototype.keys",
            function (e) {
              return (
                e ||
                function () {
                  return n.iteratorFromArray(this, function (e) {
                    return e;
                  });
                }
              );
            },
            "es6",
            "es3"
          ),
          (n.checkEs6ConformanceViaProxy = function () {
            try {
              var e = {},
                t = Object.create(
                  new n.global.Proxy(e, {
                    get: function (r, n, i) {
                      return r == e && "q" == n && i == t;
                    },
                  })
                );
              return !0 === t.q;
            } catch (e) {
              return !1;
            }
          }),
          (n.USE_PROXY_FOR_ES6_CONFORMANCE_CHECKS = !1),
          (n.ES6_CONFORMANCE =
            n.USE_PROXY_FOR_ES6_CONFORMANCE_CHECKS &&
            n.checkEs6ConformanceViaProxy()),
          (n.makeIterator = function (e) {
            n.initSymbolIterator();
            var t = e[Symbol.iterator];
            return t ? t.call(e) : n.arrayIterator(e);
          }),
          (n.owns = function (e, t) {
            return Object.prototype.hasOwnProperty.call(e, t);
          }),
          n.polyfill(
            "WeakMap",
            function (e) {
              function t(e) {
                if (((this.id_ = (o += Math.random() + 1).toString()), e)) {
                  n.initSymbol(),
                    n.initSymbolIterator(),
                    (e = n.makeIterator(e));
                  for (var t; !(t = e.next()).done; )
                    (t = t.value), this.set(t[0], t[1]);
                }
              }
              function r(e) {
                n.owns(e, a) || n.defineProperty(e, a, { value: {} });
              }
              function i(e) {
                var t = Object[e];
                t &&
                  (Object[e] = function (e) {
                    return r(e), t(e);
                  });
              }
              if (n.USE_PROXY_FOR_ES6_CONFORMANCE_CHECKS) {
                if (e && n.ES6_CONFORMANCE) return e;
              } else if (
                (function () {
                  if (!e || !Object.seal) return !1;
                  try {
                    var t = Object.seal({}),
                      r = Object.seal({}),
                      n = new e([
                        [t, 2],
                        [r, 3],
                      ]);
                    return (
                      2 == n.get(t) &&
                      3 == n.get(r) &&
                      (n.delete(t), n.set(r, 4), !n.has(t) && 4 == n.get(r))
                    );
                  } catch (e) {
                    return !1;
                  }
                })()
              )
                return e;
              var a = "$jscomp_hidden_" + Math.random();
              i("freeze"), i("preventExtensions"), i("seal");
              var o = 0;
              return (
                (t.prototype.set = function (e, t) {
                  if ((r(e), !n.owns(e, a)))
                    throw Error("WeakMap key fail: " + e);
                  return (e[a][this.id_] = t), this;
                }),
                (t.prototype.get = function (e) {
                  return n.owns(e, a) ? e[a][this.id_] : void 0;
                }),
                (t.prototype.has = function (e) {
                  return n.owns(e, a) && n.owns(e[a], this.id_);
                }),
                (t.prototype.delete = function (e) {
                  return (
                    !(!n.owns(e, a) || !n.owns(e[a], this.id_)) &&
                    delete e[a][this.id_]
                  );
                }),
                t
              );
            },
            "es6",
            "es3"
          ),
          (n.MapEntry = function () {}),
          n.polyfill(
            "Map",
            function (e) {
              function t() {
                var e = {};
                return (e.previous = e.next = e.head = e);
              }
              function r(e, t) {
                var r = e.head_;
                return n.iteratorPrototype(function () {
                  if (r) {
                    for (; r.head != e.head_; ) r = r.previous;
                    for (; r.next != r.head; )
                      return (r = r.next), { done: !1, value: t(r) };
                    r = null;
                  }
                  return { done: !0, value: void 0 };
                });
              }
              function i(e, t) {
                var r = t && typeof t;
                "object" == r || "function" == r
                  ? o.has(t)
                    ? (r = o.get(t))
                    : ((r = "" + ++s), o.set(t, r))
                  : (r = "p_" + t);
                var i = e.data_[r];
                if (i && n.owns(e.data_, r))
                  for (e = 0; e < i.length; e++) {
                    var a = i[e];
                    if ((t != t && a.key != a.key) || t === a.key)
                      return { id: r, list: i, index: e, entry: a };
                  }
                return { id: r, list: i, index: -1, entry: void 0 };
              }
              function a(e) {
                if (
                  ((this.data_ = {}), (this.head_ = t()), (this.size = 0), e)
                ) {
                  e = n.makeIterator(e);
                  for (var r; !(r = e.next()).done; )
                    (r = r.value), this.set(r[0], r[1]);
                }
              }
              if (n.USE_PROXY_FOR_ES6_CONFORMANCE_CHECKS) {
                if (e && n.ES6_CONFORMANCE) return e;
              } else if (
                (function () {
                  if (
                    n.ASSUME_NO_NATIVE_MAP ||
                    !e ||
                    "function" != typeof e ||
                    !e.prototype.entries ||
                    "function" != typeof Object.seal
                  )
                    return !1;
                  try {
                    var t = Object.seal({ x: 4 }),
                      r = new e(n.makeIterator([[t, "s"]]));
                    if (
                      "s" != r.get(t) ||
                      1 != r.size ||
                      r.get({ x: 4 }) ||
                      r.set({ x: 4 }, "t") != r ||
                      2 != r.size
                    )
                      return !1;
                    var i = r.entries(),
                      a = i.next();
                    return (
                      !a.done &&
                      a.value[0] == t &&
                      "s" == a.value[1] &&
                      !(
                        (a = i.next()).done ||
                        4 != a.value[0].x ||
                        "t" != a.value[1] ||
                        !i.next().done
                      )
                    );
                  } catch (e) {
                    return !1;
                  }
                })()
              )
                return e;
              n.initSymbol(), n.initSymbolIterator();
              var o = new WeakMap();
              (a.prototype.set = function (e, t) {
                var r = i(this, e);
                return (
                  r.list || (r.list = this.data_[r.id] = []),
                  r.entry
                    ? (r.entry.value = t)
                    : ((r.entry = {
                        next: this.head_,
                        previous: this.head_.previous,
                        head: this.head_,
                        key: e,
                        value: t,
                      }),
                      r.list.push(r.entry),
                      (this.head_.previous.next = r.entry),
                      (this.head_.previous = r.entry),
                      this.size++),
                  this
                );
              }),
                (a.prototype.delete = function (e) {
                  return !(
                    !(e = i(this, e)).entry ||
                    !e.list ||
                    (e.list.splice(e.index, 1),
                    e.list.length || delete this.data_[e.id],
                    (e.entry.previous.next = e.entry.next),
                    (e.entry.next.previous = e.entry.previous),
                    (e.entry.head = null),
                    this.size--,
                    0)
                  );
                }),
                (a.prototype.clear = function () {
                  (this.data_ = {}),
                    (this.head_ = this.head_.previous = t()),
                    (this.size = 0);
                }),
                (a.prototype.has = function (e) {
                  return !!i(this, e).entry;
                }),
                (a.prototype.get = function (e) {
                  return (e = i(this, e).entry) && e.value;
                }),
                (a.prototype.entries = function () {
                  return r(this, function (e) {
                    return [e.key, e.value];
                  });
                }),
                (a.prototype.keys = function () {
                  return r(this, function (e) {
                    return e.key;
                  });
                }),
                (a.prototype.values = function () {
                  return r(this, function (e) {
                    return e.value;
                  });
                }),
                (a.prototype.forEach = function (e, t) {
                  for (var r, n = this.entries(); !(r = n.next()).done; )
                    (r = r.value), e.call(t, r[1], r[0], this);
                }),
                (a.prototype[Symbol.iterator] = a.prototype.entries);
              var s = 0;
              return a;
            },
            "es6",
            "es3"
          ),
          (n.assign =
            "function" == typeof Object.assign
              ? Object.assign
              : function (e, t) {
                  for (var r = 1; r < arguments.length; r++) {
                    var i = arguments[r];
                    if (i) for (var a in i) n.owns(i, a) && (e[a] = i[a]);
                  }
                  return e;
                }),
          n.polyfill(
            "Object.assign",
            function (e) {
              return e || n.assign;
            },
            "es6",
            "es3"
          );
        e.exports = (function () {
          function e(e) {
            return "number" != typeof e && "string" != typeof e
              ? this.makeError("string")
              : ("string" != typeof e && (e = String(e)),
                (e = e.replace(/\D+/g, "")),
                (function (e) {
                  return function (t) {
                    for (var r = t ? t.length : 0, n = 1, i = 0; r--; )
                      i += (n ^= 1) ? e[t[r]] : parseInt(t[r], 10);
                    return 0 == i % 10 && 0 < i;
                  };
                })([0, 2, 4, 6, 8, 1, 3, 5, 7, 9])(e) ||
                  this.makeError("luhn"));
          }
          function t(e) {
            return "string" != typeof e
              ? this.makeError("string")
              : ((e = e.toLowerCase()), !!j.test(e) || this.makeError("mac"));
          }
          function r(e, t) {
            if ("string" != typeof e) return this.makeError("string");
            if (((e = e.toLowerCase()), !O.test(e)))
              return this.makeError("uuid");
            var r = 0 | e.charAt(14);
            if (t.version && t.version !== r)
              return this.makeError("uuidVersion", t.version, r);
            switch (r) {
              case 1:
              case 2:
                return !0;
              case 3:
              case 4:
              case 5:
                return (
                  -1 !== ["8", "9", "a", "b"].indexOf(e.charAt(19)) ||
                  this.makeError("uuid")
                );
            }
          }
          function n(e) {
            return "string" != typeof e
              ? this.makeError("string")
              : !!k.test(e) || this.makeError("url");
          }
          function i(e, t) {
            if ("string" != typeof e) return this.makeError("string");
            var r = e.length;
            return !1 === t.empty && 0 === r
              ? this.makeError("stringEmpty")
              : null != t.min && r < t.min
              ? this.makeError("stringMin", t.min, r)
              : null != t.max && r > t.max
              ? this.makeError("stringMax", t.max, r)
              : null != t.length && r !== t.length
              ? this.makeError("stringLength", t.length, r)
              : null == t.pattern ||
                (r =
                  "string" == typeof t.pattern
                    ? new RegExp(t.pattern, t.patternFlags)
                    : t.pattern).test(e)
              ? null != t.contains && -1 === e.indexOf(t.contains)
                ? this.makeError("stringContains", t.contains, e)
                : null != t.enum && -1 === t.enum.indexOf(e)
                ? this.makeError("stringEnum", t.enum, e)
                : !0 !== t.numeric || E.test(e)
                ? !0 !== t.alpha || w.test(e)
                  ? !0 !== t.alphanum || S.test(e)
                    ? !(!0 === t.alphadash && !T.test(e)) ||
                      this.makeError(
                        "stringAlphadash",
                        "An alphadash string",
                        e
                      )
                    : this.makeError(
                        "stringAlphanum",
                        "An alphanumeric string",
                        e
                      )
                  : this.makeError("stringAlpha", "An alphabetic string", e)
                : this.makeError("stringNumeric", "A numeric string", e)
              : this.makeError("stringPattern", r, e);
          }
          function a(e, t) {
            if ("object" != typeof e || null === e || Array.isArray(e))
              return this.makeError("object");
            if (!0 === t.strict && t.props) {
              t = Object.keys(t.props);
              var r = [];
              e = Object.keys(e);
              for (var n = 0; n < e.length; n++)
                -1 === t.indexOf(e[n]) && r.push(e[n]);
              if (0 !== r.length)
                return this.makeError("objectStrict", void 0, r.join(", "));
            }
            return !0;
          }
          function o(e, t) {
            return (
              !0 === t.convert && "number" != typeof e && (e = Number(e)),
              "number" != typeof e || isNaN(e) || !isFinite(e)
                ? this.makeError("number")
                : null != t.min && e < t.min
                ? this.makeError("numberMin", t.min, e)
                : null != t.max && e > t.max
                ? this.makeError("numberMax", t.max, e)
                : null != t.equal && e !== t.equal
                ? this.makeError("numberEqual", t.equal, e)
                : null != t.notEqual && e === t.notEqual
                ? this.makeError("numberNotEqual", t.notEqual)
                : !0 === t.integer && 0 != e % 1
                ? this.makeError("numberInteger", e)
                : !0 === t.positive && 0 >= e
                ? this.makeError("numberPositive", e)
                : !(!0 === t.negative && 0 <= e) ||
                  this.makeError("numberNegative", e)
            );
          }
          function s(e) {
            return "function" == typeof e || this.makeError("function");
          }
          function u(e) {
            return null == e || this.makeError("forbidden");
          }
          function l(e, t) {
            return (
              null == t.values ||
              -1 !== t.values.indexOf(e) ||
              this.makeError("enumValue", t.values, e)
            );
          }
          function c(e, t) {
            return "string" != typeof e
              ? this.makeError("string")
              : !!("precise" == t.mode ? v : x).test(e) ||
                  this.makeError("email");
          }
          function h(e, t) {
            return (
              !0 !== t.convert || e instanceof Date || (e = new Date(e)),
              (e instanceof Date && !isNaN(e.getTime())) ||
                this.makeError("date")
            );
          }
          function f(e, t) {
            return t.check.call(this, e, t);
          }
          function d(e, t) {
            return (
              (!0 === t.convert &&
                "boolean" != typeof e &&
                (1 === e ||
                  0 === e ||
                  "true" === e ||
                  "false" === e ||
                  "1" === e ||
                  "0" === e ||
                  "on" === e ||
                  "off" === e)) ||
              "boolean" == typeof e ||
              this.makeError("boolean")
            );
          }
          function p(e, t) {
            if (!Array.isArray(e)) return this.makeError("array");
            var r = e.length;
            if (!1 === t.empty && 0 === r) return this.makeError("arrayEmpty");
            if (null != t.min && r < t.min)
              return this.makeError("arrayMin", t.min, r);
            if (null != t.max && r > t.max)
              return this.makeError("arrayMax", t.max, r);
            if (null != t.length && r !== t.length)
              return this.makeError("arrayLength", t.length, r);
            if (null != t.contains && -1 === e.indexOf(t.contains))
              return this.makeError("arrayContains", t.contains);
            if (null != t.enum)
              for (r = 0; r < e.length; r++)
                if (-1 === t.enum.indexOf(e[r]))
                  return this.makeError("arrayEnum", e[r], t.enum);
            return !0;
          }
          function m() {
            return !0;
          }
          function y(e) {
            return e.replace(F, function (e) {
              switch (e) {
                case '"':
                case "'":
                case "\\":
                  return "\\" + e;
                case "\n":
                  return "\\n";
                case "\r":
                  return "\\r";
                case "\u2028":
                  return "\\u2028";
                case "\u2029":
                  return "\\u2029";
              }
            });
          }
          function g(y) {
            (this.opts = { messages: b({}, _) }),
              y && b(this.opts, y),
              (this.messages = this.opts.messages),
              (this.messageKeys = Object.keys(this.messages)),
              (this.rules = {
                any: m,
                array: p,
                boolean: d,
                custom: f,
                date: h,
                email: c,
                enum: l,
                forbidden: u,
                function: s,
                number: o,
                object: a,
                string: i,
                url: n,
                uuid: r,
                mac: t,
                luhn: e,
              }),
              (this.cache = new Map());
          }
          var b = function e(t, r) {
              for (var n in r)
                "object" == typeof r[n] && null !== r[n]
                  ? ((t[n] = t[n] || {}), e(t[n], r[n]))
                  : (t[n] = r[n]);
              return t;
            },
            _ = {
              required: "The '{field}' field is required!",
              string: "The '{field}' field must be a string!",
              stringEmpty: "The '{field}' field must not be empty!",
              stringMin:
                "The '{field}' field length must be greater than or equal to {expected} characters long!",
              stringMax:
                "The '{field}' field length must be less than or equal to {expected} characters long!",
              stringLength:
                "The '{field}' field length must be {expected} characters long!",
              stringPattern:
                "The '{field}' field fails to match the required pattern!",
              stringContains:
                "The '{field}' field must contain the '{expected}' text!",
              stringEnum:
                "The '{field}' field does not match any of the allowed values!",
              stringNumeric: "The '{field}' field must be a numeric string",
              stringAlpha: "The '{field}' field must be an alphabetic string",
              stringAlphanum:
                "The '{field}' field must be an alphanumeric string",
              stringAlphadash:
                "The '{field}' field must be an alphadash string",
              number: "The '{field}' field must be a number!",
              numberMin:
                "The '{field}' field must be greater than or equal to {expected}!",
              numberMax:
                "The '{field}' field must be less than or equal to {expected}!",
              numberEqual: "The '{field}' field must be equal with {expected}!",
              numberNotEqual:
                "The '{field}' field can't be equal with {expected}!",
              numberInteger: "The '{field}' field must be an integer!",
              numberPositive: "The '{field}' field must be a positive number!",
              numberNegative: "The '{field}' field must be a negative number!",
              array: "The '{field}' field must be an array!",
              arrayEmpty: "The '{field}' field must not be an empty array!",
              arrayMin:
                "The '{field}' field must contain at least {expected} items!",
              arrayMax:
                "The '{field}' field must contain less than or equal to {expected} items!",
              arrayLength: "The '{field}' field must contain {expected} items!",
              arrayContains:
                "The '{field}' field must contain the '{expected}' item!",
              arrayEnum:
                "The '{field} field value '{expected}' does not match any of the allowed values!",
              boolean: "The '{field}' field must be a boolean!",
              function: "The '{field}' field must be a function!",
              date: "The '{field}' field must be a Date!",
              dateMin:
                "The '{field}' field must be greater than or equal to {expected}!",
              dateMax:
                "The '{field}' field must be less than or equal to {expected}!",
              forbidden: "The '{field}' field is forbidden!",
              email: "The '{field}' field must be a valid e-mail!",
              url: "The '{field}' field must be a valid URL!",
              enumValue:
                "The '{field} field value '{expected}' does not match any of the allowed values!",
              object: "The '{field}' must be an Object!",
              objectStrict:
                "The object '{field}' contains invalid keys: '{actual}'!",
              uuid: "The {field} field must be a valid UUID",
              uuidVersion: "The {field} field must be a valid version provided",
              mac: "The {field} field must be a valid MAC address",
              luhn: "The {field} field must be a valid checksum luhn",
            },
            v = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            x = /^\S+@\S+\.\S+$/,
            E = /^-?[0-9]\d*(\.\d+)?$/,
            w = /^[a-zA-Z]+$/,
            S = /^[a-zA-Z0-9]+$/,
            T = /^[a-zA-Z0-9_-]+$/,
            k = /^https?:\/\/\S+/,
            O = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
            j = /^((([a-f0-9][a-f0-9]+[-]){5}|([a-f0-9][a-f0-9]+[:]){5})([a-f0-9][a-f0-9])$)|(^([a-f0-9][a-f0-9][a-f0-9][a-f0-9]+[.]){2}([a-f0-9][a-f0-9][a-f0-9][a-f0-9]))$/i,
            A = /^[_$a-zA-Z][_$a-zA-Z0-9]*$/,
            F = /["'\\\n\r\u2028\u2029]/g;
          return (
            (g.prototype.validate = function (e, t) {
              return this.compile(t)(e);
            }),
            (g.prototype.compile = function (e) {
              var t = this;
              if (Array.isArray(e)) {
                if (0 == e.length)
                  throw Error(
                    "If the schema is an Array, must contain at least one element!"
                  );
                var r = this.compileSchemaType(e);
                return (
                  this.cache.clear(),
                  function (e, n, i) {
                    return t.checkSchemaType(e, r, n, i || null);
                  }
                );
              }
              var n = this.compileSchemaObject(e);
              return (
                this.cache.clear(),
                function (e, r, i) {
                  return t.checkSchemaObject(e, n, r, i || null);
                }
              );
            }),
            (g.prototype.compileSchemaObject = function (e) {
              var t = this;
              if (null === e || "object" != typeof e || Array.isArray(e))
                throw Error("Invalid schema!");
              var r = this.cache.get(e);
              if (r) return (r.cycle = !0), r;
              (r = {
                cycle: !1,
                properties: null,
                compiledObjectFunction: null,
                objectStack: [],
              }),
                this.cache.set(e, r),
                (r.properties = Object.keys(e)
                  .filter(function (e) {
                    return "$$strict" !== e;
                  })
                  .map(function (r) {
                    return { name: r, compiledType: t.compileSchemaType(e[r]) };
                  }));
              var n = [];
              n.push("let res;"),
                n.push("let propertyPath;"),
                n.push("const errors = [];"),
                !0 === e.$$strict &&
                  n.push(
                    "const givenProps = new Map(Object.keys(value).map(key => [key, true]));"
                  );
              for (var i = 0; i < r.properties.length; i++) {
                var a = r.properties[i],
                  o = y(a.name),
                  s = A.test(o) ? "value." + o : 'value["' + o + '"]';
                n.push(
                  'propertyPath = (path !== undefined ? path + ".' +
                    o +
                    '" : "' +
                    o +
                    '");'
                ),
                  Array.isArray(a.compiledType)
                    ? n.push(
                        "res = this.checkSchemaType(" +
                          s +
                          ", properties[" +
                          i +
                          "].compiledType, propertyPath, value);"
                      )
                    : n.push(
                        "res = this.checkSchemaRule(" +
                          s +
                          ", properties[" +
                          i +
                          "].compiledType, propertyPath, value);"
                      ),
                  n.push("if (res !== true) {"),
                  n.push(
                    "\tthis.handleResult(errors, propertyPath, res, properties[" +
                      i +
                      "].compiledType.messages);"
                  ),
                  n.push("}"),
                  !0 === e.$$strict &&
                    n.push('givenProps.delete("' + o + '");');
              }
              return (
                !0 === e.$$strict &&
                  (n.push("if (givenProps.size !== 0) {"),
                  n.push(
                    "\tthis.handleResult(errors, path || 'rootObject', this.makeError('objectStrict', undefined, [...givenProps.keys()].join(', ')), this.messages);"
                  ),
                  n.push("}")),
                n.push("return errors.length === 0 ? true : errors;"),
                (r.compiledObjectFunction = new Function(
                  "value",
                  "properties",
                  "path",
                  "parent",
                  n.join("\n")
                )),
                r
              );
            }),
            (g.prototype.compileSchemaType = function (e) {
              var t = this;
              return Array.isArray(e)
                ? 1 ==
                  (e = (function e(t, r) {
                    r = r || [];
                    for (var n = 0; n < t.length; ++n)
                      Array.isArray(t[n]) ? e(t[n], r) : r.push(t[n]);
                    return r;
                  })(
                    e.map(function (e) {
                      return t.compileSchemaType(e);
                    })
                  )).length
                  ? e[0]
                  : e
                : this.compileSchemaRule(e);
            }),
            (g.prototype.compileMessages = function (e) {
              return e.messages
                ? Object.assign({}, this.messages, e.messages)
                : this.messages;
            }),
            (g.prototype.compileSchemaRule = function (e) {
              "string" == typeof e && (e = { type: e });
              var t = this.rules[e.type];
              if (!t)
                throw Error(
                  "Invalid '" + e.type + "' type in validator schema!"
                );
              var r = this.compileMessages(e),
                n = null,
                i = null;
              return (
                "object" === e.type && e.props
                  ? ((n = this.compileSchemaObject(e.props)),
                    (i = this.checkSchemaObject))
                  : "array" === e.type &&
                    e.items &&
                    ((n = this.compileSchemaType(e.items)),
                    (i = this.checkSchemaArray)),
                {
                  messages: r,
                  schemaRule: e,
                  ruleFunction: t,
                  dataFunction: i,
                  dataParameter: n,
                }
              );
            }),
            (g.prototype.checkSchemaObject = function (e, t, r, n) {
              return t.cycle
                ? -1 !== t.objectStack.indexOf(e) ||
                    (t.objectStack.push(e),
                    (e = this.checkSchemaObjectInner(e, t, r, n)),
                    t.objectStack.pop(),
                    e)
                : this.checkSchemaObjectInner(e, t, r, n);
            }),
            (g.prototype.checkSchemaObjectInner = function (e, t, r, n) {
              return t.compiledObjectFunction.call(this, e, t.properties, r, n);
            }),
            (g.prototype.checkSchemaType = function (e, t, r, n) {
              if (Array.isArray(t)) {
                for (var i = [], a = t.length, o = 0; o < a; o++) {
                  var s = this.checkSchemaRule(e, t[o], r, n);
                  if (!0 === s) return !0;
                  this.handleResult(i, r, s, t.messages);
                }
                return i;
              }
              return this.checkSchemaRule(e, t, r, n);
            }),
            (g.prototype.checkSchemaArray = function (e, t, r, n) {
              for (var i = [], a = e.length, o = 0; o < a; o++) {
                var s = (void 0 !== r ? r : "") + "[" + o + "]",
                  u = this.checkSchemaType(e[o], t, s, e, n);
                !0 !== u && this.handleResult(i, s, u, t.messages);
              }
              return 0 === i.length || i;
            }),
            (g.prototype.checkSchemaRule = function (e, t, r, n) {
              var i = t.schemaRule;
              return null == e
                ? "forbidden" === i.type ||
                    !0 === i.optional ||
                    ((e = []),
                    this.handleResult(
                      e,
                      r,
                      this.makeError("required"),
                      t.messages
                    ),
                    e)
                : !0 !== (i = t.ruleFunction.call(this, e, i, r, n))
                ? ((e = []), this.handleResult(e, r, i, t.messages), e)
                : null === t.dataFunction ||
                  t.dataFunction.call(this, e, t.dataParameter, r, n);
            }),
            (g.prototype.handleResult = function (e, t, r, n) {
              var i = this;
              (Array.isArray(r) ? r : [r]).forEach(function (r) {
                r.field || (r.field = t),
                  r.message || (r.message = i.resolveMessage(r, n[r.type])),
                  e.push(r);
              });
            }),
            (g.prototype.makeError = function (e, t, r) {
              return { type: e, expected: t, actual: r };
            }),
            (g.prototype.resolveMessage = function (e, t) {
              if ((void 0 === t && (t = null), null != t)) {
                var r = null != e.expected ? e.expected : "",
                  n = null != e.actual ? e.actual : "";
                return t
                  .replace(/\{field\}/g, e.field)
                  .replace(/\{expected\}/g, r)
                  .replace(/\{actual\}/g, n);
              }
            }),
            (g.prototype.add = function (e, t) {
              this.rules[e] = t;
            }),
            g
          );
        })();
      }.call(this, r(5)));
    },
    function (e, t) {
      var r;
      r = (function () {
        return this;
      })();
      try {
        r = r || new Function("return this")();
      } catch (e) {
        "object" == typeof window && (r = window);
      }
      e.exports = r;
    },
  ]);
});
