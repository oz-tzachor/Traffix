const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
const nodemailer = require("nodemailer");
const { newMessage } = require("./messages");
const { analyzeTheData } = require("../../BL/trafficRouteLogic");
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_TOKEN_DEV = process.env.TELEGRAM_TOKEN_DEV;
let bot;
let devBot;
////////
let sendMessage = (
  chatId,
  text = "Initial message",
  replyOptions = {
    reply_markup: {
      remove_keyboard: true,
    },
  }
) => {
  try {
    return bot.sendMessage(chatId, text, replyOptions);
  } catch (e) {
    console.log("message error", e);
  }
};
let sendImage = async (chatId, image) => {
  try {
    if (image) {
      let sendImg = await bot.sendPhoto(chatId, image);
      return sendImg;
    } else {
      console.log("no image provided");
    }
  } catch (e) {
    console.log("message error", e);
  }
};
let deleteMessage = async (chatId, messageId) => {
  try {
    return await bot.deleteMessage(chatId, messageId);
  } catch (e) {
    console.log("e", e);
  }
};
let dealWithMessage = async () => {
  try {
    bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
    bot.on("message", async (msg) => {
      try {
        let chatId = msg.chat.id;
        let text = msg.text;
        let messageToSent = ``;
        console.log("new message", text, chatId);
        if (text.toLowerCase() === "analyze") {
          analyzeTheData();
          return;
        }
        
        newMessage(chatId, text, sendMessage, sendImage, deleteMessage);
      } catch (e) {
        // console.log("e", e);
      }
    });
  } catch (e) {
    console.log("e", e);
  }
};

//DEV BOT
let activateDevBot = () => {
  try {
    devBot = new TelegramBot(TELEGRAM_TOKEN_DEV, { polling: true });
    devBot.on("message", async (msg) => {
      let chatId = msg.chat.id;
      let text = msg.text;
      console.log('new messaage dev!',text);
      devBot.sendMessage(chatId,'Hi!\nI am Traffix backoffice bot\nSoon i will be able to help you manage all the app')
    });
  } catch (e) {
    console.log("error in dev bot", e);
  }
};
let sendMessageDev = (text = "initial") => {
  let chatIdDev = 160151970;
  try {
    devBot.sendMessage(chatIdDev, text);
    dev;
  } catch (e) {
    console.log("eror when sending message dev bot", e);
  }
};
module.exports = {
  dealWithMessage,
  sendMessage,
  deleteMessage,
  sendImage,
  activateDevBot,
  sendMessageDev,
};
