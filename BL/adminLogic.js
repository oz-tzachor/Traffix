const telegramUserController = require("../DL/Controllers/TelegramUserController");
const { getDate } = require("../DL/moment/moment");
//
const getTelegramUsers = async (filter) => {
  const users = await telegramUserController.read(filter);
  return users;
};
//
const getTelegramUser = async (filter) => {
  const user = await telegramUserController.readOne(filter);
  return user;
};

let userRequests = {
  getTelegramUsers,
  getTelegramUser,
};
module.exports = {
  userRequests,
};
