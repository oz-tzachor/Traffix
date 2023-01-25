const VerificationCodeModel = require("../models/VerificationCode");

async function create(data) {
  return await VerificationCodeModel.create(data);
}
async function read(filter) {
  return await VerificationCodeModel.find(filter);
}
async function readOne(filter) {
  return await VerificationCodeModel.findOne(filter);
}
async function update(filter, newData) {
  return await VerificationCodeModel.updateOne(filter, newData, { new: true });
}
async function deleteTotal(filter) {
  await VerificationCodeModel.deleteOne(filter);
}
async function del(filter) {
  await update(filter, { isActive: flase });
}

module.exports = { create, read, update, del,deleteTotal ,readOne};
