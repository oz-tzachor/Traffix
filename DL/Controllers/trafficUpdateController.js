const TrafficUpdate = require("../models/TrafficUpdate");

async function create(data) {
  return await TrafficUpdate.create(data);
}
async function read(filter) {
  return await TrafficUpdate.find(filter);
}
async function readOne(filter) {
  return await TrafficUpdate.findOne(filter).exec();
}
async function update(filter, newData) {
  return await TrafficUpdate.updateOne(filter, newData);
}
async function del(filter) {
  await update(filter, { isActive: flase });
}

module.exports = { create, read, update, del, readOne };
