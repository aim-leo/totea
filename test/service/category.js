const BaseCategoryService = require("../../category-service");
const categoryModel = require("../model/category");

module.exports = new BaseCategoryService(categoryModel);
