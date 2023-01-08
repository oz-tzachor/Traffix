const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
const nodemailer = require("nodemailer");
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
let bot;
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
let sendMessage = (chatId, text='Initial message') => {
  try {
    bot.sendMessage(chatId, text);
  } catch (e) {
    console.log("message error", e);
  }
};
let sendImage = (chatId, image) => {
  try {
    if(image){
      bot.sendPhoto(chatId, image);
      // if (fs.existsSync(image)) {
      //   console.log("file exists");
      //   fs.unlink(image, (err) => {
      //     if (err) {
      //       console.log(err); 
      
      //       // (code: err.code, message: err.message };
      //     }
      //     console.log("Delete File successfully.");
      //   });
      // } else {
      //   console.log("file not found!");
      // }
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
        const expense = {
          budget: "62cbe8d3ac72b9da1311b7d2",
          description: "Telegram",
          amount: 1,
        };
        let chatId = msg.chat.id;
        let text = msg.text;
        let messageToSent = ``;
        console.log("new message", text, chatId);
        sendMessage(chatId, "received");
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
        console.log("e", e);
      }
    });
  } catch (e) {
    console.log("e", e);
  }
};
module.exports = { dealWithMessage, sendMessage,sendImage };
