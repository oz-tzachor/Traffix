const TrafficRoute = require("../models/TrafficRoute");

async function create(data) {
  return await TrafficRoute.create(data);
}
async function read(filter,selectExpression = null) {
  console.log('filter',filter);
  return await TrafficRoute.find(filter).select(selectExpression);;
}
async function readOne(filter, options) {
  // { sort: { createdAt: 1 } }
  return await TrafficRoute.findOne(filter,{}, options);
}
async function update(filter, newData) {
  return await TrafficRoute.updateOne(filter, newData,{new:true});
}
async function del(filter) {
  await update(filter, { isActive: flase });
}

module.exports = { create, read, update, del, readOne };
