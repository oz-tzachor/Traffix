const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
const nodemailer = require("nodemailer");
const { newMessage } = require("./messages");
const TELEGRAM_TOKEN_DEV = process.env.TELEGRAM_TOKEN_DEV;
let bot;
let devBot;
let emojis = {
  confirm: `\u{2705}`,
  smiley: `\u{1F604}`,
  sad: `\u{1F614}`,
  bye: `\u{270B}`,
  wavingHand: `\u{1F44B}`,
  victory: `\u{270C}`,
  x: `\u{274C}`,
  instructions: `\u{1F4DD}`,
  email: `\u{1F4E7}`,
  like: `\u{1F44D}`,
  fix: `\u{1F44C}`,
  claps: `\u{1F44F}`,
  password: `\u{1F510}`,
  time: `\u{1F55C}`,
  money: `\u{1F4B0}`,
  folder: `\u{1F4C1}`,
  saved: `\u{1F4BE}`,
  welcome: `\u{1F44B}`,
  message: `\u{1F4E9}`,
  letters: `\u{1F520}`,
  creditCard: `\u{1F4B3}`,
  sleepFace: `\u{1F634}`,
  goodMorning: `\u{1F31E}`,
  hammer: `\u{1F528}`,
  screw: `\u{1F529}`,
  heartFace: `\u{1F60D}`,
  dashboard: `\u{1F4CA}`,
  goodWEvening: `\u{1F31C}`,
  search: `\u{1F50D}`,
  restart: `\u{1F504}`,
  gift: `\u{1F381}`,
  stopSign: `\u{1F6D1}`,
  warning: `\u{26A0}`,
  coolGuy: `\u{1F60E}`,
  plus: `\u{2795}`,
  wink: `\u{1F609}`,
  numbers: `\u{1F522}`,
  number1: `\u{0031}`,
  number2: `\u{0032}`,
  number3: `\u{0033}`,
};

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
    bot.sendMessage(chatId, text, replyOptions);
  } catch (e) {
    console.log("message error", e);
  }
};
let sendImage = (chatId, image) => {
  try {
    if (image) {
      bot.sendPhoto(chatId, image);
    }
  } catch (e) {
    console.log("message error", e);
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
        //
        // var keyboards = {
        //   main_menu: {
        //     reply_markup: {
        //       keyboard: [
        //         ["Sne my location"],
        //         ["Sne my location"],
        //         // [{ text: "Cards" }, { text: "Progress" }, { text: "complain" }],
        //         // [{ text: "Warning" }, { text: "Help" }],
        //       ],
        //     },
        //   },
        // };
        // if (text.toLowerCase() === "warning") {
        //   sendMessage(chatId, "Done");
        // } else {
        //   sendMessage(chatId, "Main menu", {
        //     reply_markup: keyboards.main_menu.reply_markup,
        //   });
        // }

        newMessage(chatId, text, sendMessage);
        // sendMessage(chatId, "received");
        // let finalPath = await createOne(text);
        // mail().catch(console.error);
        // mail(text).then(bot.sendMessage(chatId, "sent"));
        // bot.sendDocument(chatId, finalPath);
        let oneLine = "\n";
        let twoLine = "\n\n";
        let threeLine = "\n\n\n";
        let endOfArticle =
          "            -----------------------------------------------------------";
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
  sendImage,
  activateDevBot,
  sendMessageDev,
};
