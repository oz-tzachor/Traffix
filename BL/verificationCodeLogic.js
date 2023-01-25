const verificationCodeController = require("../DL/Controllers/verificationCodeController");
const { getDate } = require("../DL/moment/moment");
const moment = require("moment");
const { update } = require("../DL/Controllers/TelegramUserController");
//
const createVerificationCode = async (user) => {
  let rand = [100000, 200000, 300000, 400000, 500000, 600000];
  let number = Math.floor(
    Math.random() * 10000 +
      Math.random() * 10000 +
      rand[Math.floor(Math.random() * rand.length)]
  );
  console.log("Number", number);
  let verif = { user: user._id, code: number };
  const verificationCode = await verificationCodeController.create(verif);
  return number;
};
//
const validateVerificationCode = async (user, code) => {
  let filter = { code, user, isActive: true };
  let codeFromDb = await verificationCodeController.readOne(filter);
  if (codeFromDb) {
    await update(filter,{isActive:false})
    let now = moment();
    let valid = now.diff(moment(code.createdAt),"m") <= 10;
    if (valid) {
      return 1;
    } else {
      update(filter,{isActive:false})
      return 0;
    }
  } else {
    return -1;
  }

  // return code;
};

let verificationCodeRequests = {
  createVerificationCode,
   validateVerificationCode,
};
module.exports = {
  verificationCodeRequests,
};
