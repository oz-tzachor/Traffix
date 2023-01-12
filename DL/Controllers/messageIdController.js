const MessageIdModel = require("../models/MessageId");

async function create(data) {
  return await MessageIdModel.create(data);
}
async function read(filter) {
  return await MessageIdModel.find(filter);
}
async function readOne(filter) {
  return await MessageIdModel.findOne(filter);
}
async function update(filter, newData) {
  return await MessageIdModel.updateOne(filter, newData, { new: true });
}
async function deleteTotal(filter) {
  await MessageIdModel.deleteOne(filter);
}
async function del(filter) {
  await update(filter, { isActive: flase });
}

module.exports = { create, read, update, del,deleteTotal ,readOne};
