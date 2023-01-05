const puppeteer = require("puppeteer");
// console.log("trying poop");
const trafLogic = require("../../BL/trafficUpdateLogic");
let chatId = 160151970;
const { sendMessage, sendImage } = require("../bot/bot");
const { getTrafficRouteAvg } = require("../../BL/trafficUpdateLogic");
// let chartClass = "highcharts-background";
// let chartSelector = "#highcharts-0 > svg > rect";
let mainDataSelector =
  "body > div > div:nth-child(2) > div:nth-child(1) > div:nth-child(13) > div";
let timeSelector = mainDataSelector + " > b:nth-child(3)";
let zipsMain = [144, 145, 146, 147, 148, 149, 150, 230, 231, 300];
let zips = [144, 145, 146, 147, 148, 149, 150, 230, 231, 300];
const grabData = async (zip) => {
  try {
    let address = `https://www.pkk.bycomputers.com/index.php?zipcode=${zip}`;
    console.log("started:", address);
    // Initial Navigation

    let browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.goto(address, { waitUntil: "networkidle0" });
    //
    //Start scrap
    await page.waitForSelector(mainDataSelector);
    const ele = await page.$(mainDataSelector);

    let dataEl = await page.$eval(mainDataSelector, (element) => {
      return element.innerHTML;
    });
    let time = await page.$eval(timeSelector, (ele) => {
      return ele.innerHTML;
    });
    dataEl = dataEl.toString();
    let startTitle = dataEl.indexOf(">") + 1;
    let endTtile = dataEl.indexOf("</");
    let title = dataEl.substring(startTitle, endTtile);
    ///screenshot
    // let path = `uploads/${Date.now()}-${zip}.png`;
    // await ele.screenshot({ path });
    // sendImage(chatId, path);
    //Date
    let startDate = dataEl.indexOf("2023");
    let end = dataEl.length;
    let dateOfUpdate = dataEl.substring(startDate, end);
    //Logging
    // console.log("Title:", title);
    // console.log("Date of update", dateOfUpdate);
    // console.log("Value of update", time);
    //Saving
    if (title && dateOfUpdate && time && zip) {
      let result = { title, dateOfUpdate, time, zip };
      results.push(result);
      await trafLogic.newTrafficUpdate(result);
      //  getTrafficRouteAvg({ zip: 144 });
    }
    await browser.close();
  } catch (e) {
    // await browser.close();
    console.log("e", e);
    sendMessage(chatId, e || "error occured");
    // console.log('error');
    throw e;
  }
};
//
let results = [];
let indexInZips = 0;
let allZips = zips.length;
let runFunc = (index, callback, stopTheZipLoop) => {
  console.log("callbaclk", callback);
  grabData(zips[index])
    .then(() => {
      console.log("grab ended!");
      callback();
    })
    .catch((e) => {
      stopTheZipLoop();
      console.log("failed", e);
    });
};
let startIt = () => {
  results = [];
  indexInZips = 0;
  let stopTheZipLoop = () => {
    return (indexInZips = allZips + 2);
  };
  let callBack = () => {
    indexInZips++;

    if (indexInZips < allZips) {
      runFunc(indexInZips, callBack, stopTheZipLoop);
      // setTimeout(() => {
      //   runFunc(indexInZips, callBack);
      // }, Math.floor(Math.random() * 6000) + 1000);
    } else {
      console.log("Done!");
      if (results.length > 0) {
        // sendMessage(chatId, "+++++++++Start of update++++++++");
        let text = " ";
        // let item = results[Math.floor(Math.random() * results.length)];
        setTimeout(() => {
          results.map((item) => {
            text += `Title: ${item.title}\n\nTime: ${item.time}\n\nDate: ${item.dateOfUpdate}\n\nZip:  ${item.zip}\n\n\n\n\n\n\n`;
          });
          setTimeout(() => {
            if (text === " ") {
              text += "Empty message";
            }
            //Stop get all the data for now
            text = `${
              results.length
            } traffic datas grabbed successfully and sent to the DB\n ${new Date().toLocaleString()}`;
            sendMessage(chatId, text || "No text provided-some error");
          }, 2000);
          // setTimeout(() => {
          //   sendMessage(chatId, "========End of update=========");
          // }, 2000);
        }, 3000);
      } else {
        sendMessage(
          chatId,
          "XXX Some problem has occured - tried and no data XXX"
        );
      }
      // zips = [...zipsMain];
      // results = [];
      // console.log(results);
    }
  };
  runFunc(indexInZips, callBack, stopTheZipLoop);
};
module.exports = { startIt };
