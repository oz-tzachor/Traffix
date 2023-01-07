const cron = require("node-cron");
const { startIt } = require("../puppeteer/index");
let chatId = 160151970;
const { sendMessage } = require("../bot/bot");
const { getAllTrafUpdates } = require("../../BL/trafficUpdateLogic");
const { getDatesForDailyAvg } = require("../moment/moment");
//Flag for scrap
let scrapTrafficData = true;
let expressionsPerTime = {
  H_6_AM_TO_9_AM: "*/2 6-9/1 * * *",
  H_10_AM_TO_13_PM: "*/5 10-13/1 * * *",
  H_14_PM_TO_18_PM: "*/2 14-18/1 * * *",
  H_19_PM_TO_23_PM: "*/5 19-23/1 * * *",
  H_0_AM_TO_3_AM: "*/15 0-3/1 * * *",
  H_4_AM_TO_5_AM: "*/20 4-5/1 * * *",
};

const defineGrabbingCron = (expression) => {
  cron.schedule(
    expression,
    function () {
      if (scrapTrafficData) {
        startIt();
      } else {
        // sendMessage(chatId, `$Cron run!\n ${new Date().toLocaleString()}`);
      }
    },
    {
      scheduled: true,
      timezone: "Asia/Jerusalem",
    }
  );
  return;
};
let createAllGrabCrons = () => {
  //
  Object.keys(expressionsPerTime).forEach((key) => {
    defineGrabbingCron(expressionsPerTime[key]);
  });
};
//
let activateAvgCrons = () => {
  // cron.schedule(
  //   "59 23 * * *",
  //   async function () {
  //     console.log("getting");
  //     let dates = getCurrDayDates();
  //     console.log("dates", dates);
  //     console.log("data", data);
  //   },
  //   {
  //     scheduled: true,
  //     timezone: "Asia/Jerusalem",
  //   }
  // );
};

const crons = { createAllGrabCrons, activateAvgCrons };
module.exports = crons;
