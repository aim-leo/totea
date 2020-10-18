const { createModel } = require("../../model");
const types = require("../../types");

const ToteaGroup = types.ToteaGroup;

const group = new ToteaGroup({
  ...types.baseMixin,
  name: types.shortText("标题").required(),
  summary: types.text("简介").required(),
  detail: types.longText("文章详情").required(),
  category: types.ref("category", "分类").required().formType("category"),
  auther: types
    .ref("admin", "作者")
    .refFilter({ role: 1 }, "只有文章发布员才能新建文章")
    .forbidUpdate()
    .required(),
  keyword: types.array(String, "关键词"),
  tag: types.ids("tag", "标签").max(2),
  readNum: types.int("阅读数").forbidCreate().default(0),
  starNum: types.int("点赞数").forbidCreate().default(0),
  hot: types.int("文章热度").computed((doc) => doc.starNum * 5 + doc.readNum),
  isForbid: types.boolean("已禁用").forbidCreate().default(false),
  top: types.int("置顶等级").max(10).default(0),
  email: types.email(),
});

module.exports = createModel("post", group);
