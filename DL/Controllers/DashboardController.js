const DashboardModel = require("../models/Dashboard");

async function create(data) {
  return await DashboardModel.create(data);
}
async function read(filter) {
  return await DashboardModel.find(filter).populate("budgets");
}
async function readOne(filter) {
  return await DashboardModel.findOne(filter).exec();
}
async function update(filter, newData) {
  return await DashboardModel.updateOne(filter, newData);
}
async function del(filter) {
  await update(filter, { isActive: flase });
}

module.exports = { create, read, update, del, readOne };
