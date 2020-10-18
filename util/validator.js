const FastestValidator = require("fastest-validator");
const validator = new FastestValidator({
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
  },
});

function getValidatorMessage(type, field = "", expected, actual) {
  let message = validator.messages[type];

  if (!message) {
    throw new Error(`without this type: ${type}`);
  }

  message = message.replace("{field}", field);
  if (expected !== undefined) message = message.replace("{expected}", expected);
  if (actual !== undefined) message = message.replace("{actual}", actual);

  return message;
}

function validate(json, schema) {
  try {
    const validError = validator.validate(json, schema);
    if (validError && validError.length > 0) {
      return validError[0].message;
    }
  } catch (e) {
    return "校验失败：参数错误";
  }
}

module.exports = {
  validator,
  getValidatorMessage,
  validate,
};
