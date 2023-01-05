const telegramUserController = require("../DL/Controllers/TelegramUserController");
const userController = require("../DL/Controllers/UserController");

async function newTelegramUser(newUserDetails) {
  const newUser = await telegramUserController.create(newUserDetails);
  return newUser;
}

module.exports = { newTelegramUser };
