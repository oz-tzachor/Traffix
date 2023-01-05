const TelegramUserModel = require("../models/TelegramUser");

async function create(data) {
  console.log("create " + data);
  return await TelegramUserModel.create(data);
}
async function read(filter) {
  return await TelegramUserModel.find(filter);
}
async function update(filter, newData) {
  return await TelegramUserModel.updateOne(filter, newData);
}
async function del(filter) {
  await update(filter, { isActive: flase });
}

module.exports = { create, read, update, del };
