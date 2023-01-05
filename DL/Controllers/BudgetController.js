const BudgetModel = require("../models/Budget");

async function create(data) {
  return await BudgetModel.create(data);
}
async function read(filter) {
  return await BudgetModel.find(filter).populate("expenses");
}
async function readOne(filter) {
  return await BudgetModel.findOne(filter);
}
async function update(filter, newData) {
  return await BudgetModel.updateOne(filter, newData);
}
async function del(filter) {
  await update(filter, { isActive: flase });
}

module.exports = { create, read, update, del, readOne };
