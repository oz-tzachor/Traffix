const userModel = require("../models/User");

async function create(data) {
  return await userModel.create(data);
}
async function readOne(filter) {
  return await userModel.findOne(filter);
}
async function read(filter) {
  return await userModel.find(filter);
}
async function readOne(filter) {
  return await userModel.findOne(filter);
}
async function update(filter, newData) {
  console.log(filter, newData);
  return await userModel.findOneAndUpdate(filter, newData);
}
async function del(filter) {
  await update(filter, { isActive: flase });
}

module.exports = { create, read, update, del, readOne };
