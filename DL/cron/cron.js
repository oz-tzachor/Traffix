const cron = require("node-cron");
const { startIt } = require("../puppeteer/grabFromPkk");
let chatId = 160151970;
const { sendMessage } = require("../bot/bot");
const { getAllTrafUpdates } = require("../../BL/trafficUpdateLogic");
const { getDatesForDailyAvg } = require("../moment/moment");
const { grabFromWaze } = require("../puppeteer/grabFromWaze");
const { manageRouteAvg } = require("../../BL/trafficRouteLogic");
//Flag for scrap
let scrapTrafficData = true;
let grabPeriod = 7;
let expressionsPerTime = {
  H_6_AM_TO_9_AM: `*/${grabPeriod} 6-9/1 * * *`,
  H_10_AM_TO_13_PM: `*/${grabPeriod} 10-13/1 * * *`,
  H_14_PM_TO_18_PM: `*/${grabPeriod} 14-18/1 * * *`,
  H_19_PM_TO_23_PM: `*/${grabPeriod} 19-23/1 * * *`,
  H_0_AM_TO_3_AM: `*/${grabPeriod} 0-3/1 * * *`,
  H_4_AM_TO_5_AM: `*/${grabPeriod} 4-5/1 * * *`,
};

const defineNewCron = (expression, callback) => {
  cron.schedule(
    expression,
    function () {
      callback();
    },
    {
      scheduled: true,
      timezone: "Asia/Jerusalem",
    }
  );
  return;
};
let createAllGrabCrons = () => {
  //define waze crons
  createGrabCrons();
  //Define avg crons
  calcDailyAvg();
  // grabFromWaze()//development
};

//
let createGrabCrons = async () => {
  //waze Expression
  let wazeExpression = "*/7 * * * *";
  console.log("waze grab cron defined:", wazeExpression);
  defineNewCron(wazeExpression, grabFromWaze);
};
//
let calcDailyAvg = async () => {
  // calc avg expression
  let caclAvgExpressoin = "59 23 * * *";
  console.log("avg cron defined:", caclAvgExpressoin);
  defineNewCron(caclAvgExpressoin, manageRouteAvg);
};
const crons = { createAllGrabCrons };
module.exports = crons;
