const telegramUserController = require("../DL/Controllers/TelegramUserController");
const userController = require("../DL/Controllers/UserController");

async function getTelegramUser(filter) {
  const user = await telegramUserController.readOne(filter);
  return user;
}
//
async function newTelegramUser(newUserDetails) {
  const newUser = await telegramUserController.create(newUserDetails);
  return newUser;
}
//
async function updateUserDetails(filter,newUserDetails) {
  const newUser = await telegramUserController.update(filter,newUserDetails,{new:true});
  return newUser;
}

module.exports = { newTelegramUser, getTelegramUser,updateUserDetails };
