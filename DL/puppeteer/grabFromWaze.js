const puppeteer = require("puppeteer");
const trafficRouteLogic = require("../../BL/trafficRouteLogic");
const trafficUpdateLogic = require("../../BL/trafficUpdateLogic");
const { getDate } = require("../moment/moment");
const grabData = async (browser, type = "waze", route = undefined) => {
  let address;
  try {
    if (type === "waze") {
      address = route.wazeUrl;
    } else if (type === "pkk") {
      address = `https://www.pkk.bycomputers.com/index.php?zipcode=${route.zip}`;
    }
    //Initial Navigation
    const page = await browser.newPage();
    await page.goto(address, { waitUntil: "networkidle0" });
    if (type === "waze") {
      let title = `${route.from} - ${route.to}`;
      console.log("started in waze:", title);
      let oneRouteSelector =
        "#map > div.wm-cards.is-destination.with-routing.with-routes > div.wm-card.is-routing > div > div.wm-routing__scrollable > div.wm-routes.false";
      let multipleRoutesSelector =
        "#map > div.wm-cards.is-destination.with-routing.with-routes > div.wm-card.is-routing > div > div.wm-routing__scrollable > div.wm-routes.multiple-routes";
      let foundedElement = null;
      try {
        await page.waitForSelector(multipleRoutesSelector, {
          timeout: 6000,
          visible: true,
        });
        console.log("multiple Routes founded");
        foundedElement = multipleRoutesSelector;
      } catch (e) {
        //failed to find the first
        console.log("failed to find the multiple route");
        try {
          console.log("Trying find the only one route");
          await page.waitForSelector(oneRouteSelector, {
            timeout: 6000,
            visible: true,
          });
          console.log("One route founded");

          foundedElement = oneRouteSelector;
          //try other one
        } catch (e) {
          console.log("failed to find one route also");
          //double error
        }
      }
      let allUl = await page.$eval(foundedElement, (element) => {
        return element.innerHTML;
      });
      //title

      //time
      let startCutTime = allUl.indexOf('s">') + 3;
      let endCutTime = allUl.indexOf(" דקות");
      let time = allUl.slice(startCutTime, endCutTime);
      //estimation
      let endCutEst = allUl.indexOf("M</span>") + 1;
      let startCutEst = endCutEst - 8;
      let est = allUl.slice(startCutEst, endCutEst);
      // console.log("est from waze", est);
      console.log("time from waze", time, "\n", "est from waze", est, "\n");
      let dateOfUpdate = getDate().toISOString();
      let dayOfTheWeek = new Date(dateOfUpdate).getDay();
      //Saving
      let routeId = route._id;
      if (title && dateOfUpdate && time && dayOfTheWeek) {
        let result = {
          title,
          dateOfUpdate,
          time,
          dayOfTheWeek,
          route: routeId,
          source: "waze",
        };
        console.log("result", result);
        let lastUpdateForRoute = await trafficUpdateLogic.getTrafficUpdate(
          { wazeUrl: { $ne: null } },
          { sort: { dateOfUpdate: -1 } }
        );
        if (lastUpdateForRoute.dateOfUpdate === dateOfUpdate) {
          console.log("The same data grabbed- avoiding this data");
        } else {
          await trafficUpdateLogic.newTrafficUpdate(result);
        }
        //  getTrafficRouteAvg({ zip: 144 });
      }
      await page.close();
      // await browser.close();
    } else if (type === "pkk") {
      ////////////////////////////////////////////////////////////////////////////////////
      console.log("started in pkk:", address);

      let mainDataSelector =
        "body > div > div:nth-child(2) > div:nth-child(1) > div:nth-child(12) > div";
      // let mainDataSelector =
      //   "body > div > div:nth-child(2) > div:nth-child(1) > div:nth-child(13) > div";
      let timeSelector = mainDataSelector + " > b:nth-child(3)";

      //pkk logic
      const page = await browser.newPage();
      await page.goto(address, { waitUntil: "networkidle0" });
      //
      //Start scrap
      await page.waitForSelector(mainDataSelector, { timeout: 4000 });
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
      //Date
      let startDate = dataEl.indexOf("2023");
      let end = dataEl.length;
      let dateOfUpdate = dataEl.substring(startDate, end);
      let dayOfTheWeek = new Date(dateOfUpdate).getDay();
      let type = "pkk";
      //Saving
      if ((title && dateOfUpdate && time && zip && dayOfTheWeek, type)) {
        let result = { title, dateOfUpdate, time, zip, dayOfTheWeek, type };
        results.push(result);
        let lastUpdateForRoute = await trafLogic.getTrafficUpdate(
          { zip },
          { sort: { dateOfUpdate: -1 } }
        );
        if (lastUpdateForRoute.dateOfUpdate === dateOfUpdate) {
          console.log("The same data grabbed- avoiding this data");
        } else {
          await trafLogic.newTrafficUpdate(result);
        }
        //  getTrafficRouteAvg({ zip: 144 });
      }

      await page.close();
      //
    }
  } catch (e) {
    // await browser.close();
    console.log("e", e);
  }
};

///
let runFunc = (browser, type, route, callback, stop) => {
  grabData(browser, type, route)
    .then(() => {
      console.log("grab ended!");
      callback();
    })
    .catch((e) => {
      stop();
    });
};

let grabFromWaze = async () => {
  //mian function
  try {
    let routes = await trafficRouteLogic.getTrafficRoutes({
      isActive: true,
    });
    let indexInAddress = 0;
    let addressLength = routes.length;
    console.log("routes", routes.length);
    let browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox"],
    });
    let stop = () => {
      indexInAddress = addressLength + 2;
      console.log('closing browser!');
      browser.close();
    };
    let callBack = () => {
      indexInAddress++;
      if (indexInAddress < addressLength) {
        let type;
        if (
          routes[indexInAddress].type == null ||
          !routes[indexInAddress].type
        ) {
          if (routes[indexInAddress].zip) {
            type = "pkk";
          } else {
            type = "waze";
          }
        } else {
          type = routes[indexInAddress].type;
        }

        runFunc(browser, type, routes[indexInAddress], callBack, stop);
      } else {
        console.log("Done !");
      }
    };
    let type;
    if (routes[indexInAddress].type == null || !routes[indexInAddress].type) {
      if (routes[indexInAddress].zip) {
        type = "pkk";
      } else {
        type = "waze";
      }
    } else {
      type = routes[indexInAddress].type;
    }
    runFunc(browser, type, routes[indexInAddress], callBack, stop);
  } catch (e) {
    console.log("e", e);
  }
};
module.exports = { grabFromWaze };
// grabData();
