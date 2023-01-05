const cron = require("node-cron");
const { startIt } = require("../puppeteer/index");
let chatId = 160151970;
const { sendMessage } = require("../bot/bot");
//Flag for srap
let scrapTrafficData =true;
let runext = "Running cron: ";
let createCron = () => {
  console.log("definig cron");
  // should be between 6am until 9 am
  cron.schedule(
    //Should be 2 minutes
    "*/2 6-9/1 * * *",
    function () {
      console.log(runext + "6-9");

      if (scrapTrafficData) {
        startIt();
      } else {
        sendMessage(chatId, `${runext} 6-9\n ${new Date().toLocaleString()}`);
      }
    },
    {
      scheduled: true,
      timezone: "Asia/Jerusalem",
    }
  );
  //
  // should be between 10 am until 13 pm 
  cron.schedule(
    //Should be 10 minutes
    "*/1 10-13/1 * * *",
    function () {
      console.log(runext + "10-13");
      if (scrapTrafficData) {
        startIt();
      } else {
        sendMessage(chatId, `${runext} 10-13\n ${new Date().toLocaleString()}`);
      }
    },
    {
      scheduled: true,
      timezone: "Asia/Jerusalem",
    }
  );
  //
  // should be between 14 pm until 18 pm
  cron.schedule(
    //Should be 4 minutes
    "*/2 14-18/1 * * *",
    function () {
      console.log(runext + "14-18");

      if (scrapTrafficData) {
        startIt();
      } else {
        sendMessage(chatId, `${runext} 14-18\n ${new Date().toLocaleString()}`);
      }
    },
    {
      scheduled: true,
      timezone: "Asia/Jerusalem",
    }
  );
  // should be between 19 pm until 21 pm
  cron.schedule(
    //Should be 10 minutes
    "*/5 19-23/1 * * *",
    function () {
      console.log(runext + "19-23");
      if (scrapTrafficData) {
        startIt();
      } else {
        sendMessage(chatId, `${runext} 19-23\n ${new Date().toLocaleString()}`);
      }
    },
    {
      scheduled: true,
      timezone: "Asia/Jerusalem",
    }
  );
  // should be between 21 pm until 6 am
  console.log("new date", new Date().toLocaleString());
  //temp
    //Should be 20 minutes
  cron.schedule(
    "*/6 0-3/1 * * *",
    function () {
      console.log(runext + "0-3", new Date().toLocaleString());
      if (scrapTrafficData) {
        startIt();
      } else {
        sendMessage(chatId, `${runext} 0-3\n ${new Date().toLocaleString()}`);
      }
    },
    {
      scheduled: true,
      timezone: "Asia/Jerusalem",
    }
  );
  //
    //Should be 30

  cron.schedule(
    "*/10 4-5/1 * * *",
    function () {
      console.log(runext + "3-5", new Date().toLocaleString());
      if (scrapTrafficData) {
        startIt();
      } else {
        sendMessage(chatId, `${runext} 3-5\n ${new Date().toLocaleString()}`);
      }
    },
    {
      scheduled: true,
      timezone: "Asia/Jerusalem",
    }
  );
};
const crons = { createCron };
module.exports = crons;
