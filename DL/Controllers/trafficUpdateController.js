const TrafficUpdate = require("../models/TrafficUpdate");

async function create(data) {
  return await TrafficUpdate.create(data);
}
async function read(filter) {
  return await TrafficUpdate.find(filter);
}
async function readOne(filter, options) {
  // { sort: { createdAt: 1 } }
  return await TrafficUpdate.findOne(filter, {}, options);
}
async function update(filter, newData) {
  return await TrafficUpdate.updateOne(filter, newData, { new: true });
}
async function del(filter) {
  await update(filter, { isActive: flase });
}

module.exports = { create, read, update, del, readOne };
