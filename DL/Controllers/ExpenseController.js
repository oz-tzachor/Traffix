const ExpenseModel = require("../models/Expense");

async function create(data) {
  return await ExpenseModel.create(data);
}
async function read(filter) {
  return await ExpenseModel.find(filter);
}
async function update(filter, newData) {
  return await ExpenseModel.updateOne(filter, newData);
}
async function del(filter) {
  await update(filter, { isActive: flase });
}

module.exports = { create, read, update, del };
