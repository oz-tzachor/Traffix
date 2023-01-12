const puppeteer = require("puppeteer");
const trafficRouteLogic = require("../../BL/trafficRouteLogic");
const trafficUpdateLogic = require("../../BL/trafficUpdateLogic");
const { getDate } = require("../moment/moment");

const grabData = async (
  browser,
  type = "waze",
  route = undefined,
  oneRoute = false,
  timeOfPrediction
) => {
  let address;
  try {
    let mainDate = new Date();
    let timeInMin = new Date().getMinutes();

    let startTime = Date.now();
    // for (let index = 0; index < array.length; index++) {
    //   const element = array[index];
    // }
    let urlWithTime = `https://www.waze.com/he/live-map/directions/%D7%90%D7%A8%D7%99%D7%90%D7%9C?to=place.ChIJ6_6XBwsnHRURrbo12csDrug&from=place.ChIJ18ktYCvUHBURpr2YR8qxBaQ&time=${timeOfPrediction}&reverse=yes`;
    address =
      "https://www.waze.com/he/live-map/directions/%D7%90%D7%A8%D7%99%D7%90%D7%9C?to=place.ChIJ6_6XBwsnHRURrbo12csDrug&from=place.ChIJ18ktYCvUHBURpr2YR8qxBaQ&time=1673560800000&reverse=yes";
      //Initial Navigation
    const page = await browser.newPage();
    await page.goto(urlWithTime, { waitUntil: "networkidle0" });
    if (type === "waze") {
      let title = `${route.from} - ${route.to}`;
      console.log("predict in waze:", title);
      let oneRouteSelector =
        "#map > div.wm-cards.is-destination.with-routing.with-routes > div.wm-card.is-routing > div > div.wm-routing__scrollable > div.wm-routes.false";
      let multipleRoutesSelector =
        "#map > div.wm-cards.is-destination.with-routing.with-routes > div.wm-card.is-routing > div > div.wm-routing__scrollable > div.wm-routes.multiple-routes";
        let dropDownSelector = `#map > div.wm-cards.is-destination.with-routing.with-routes > div.wm-card.is-routing > div > div.wm-routing__scrollable > div.wm-routing-schedule.wm-routing__reducer > div.wm-routing-schedule__datetime > div:nth-child(2)`
         let foundedElement = null;


      try{
        await page.waitForSelector(dropDownSelector, {
          timeout: 4000,
          visible: true,
        }); 
        let dropDownElement  = await page.$eval(dropDownSelector, (element) => {
          return element.innerHTML;
        });
        console.log('drop',dropDownElement);
return;



      }catch(e){
        console.log('cant find dropdown',e);

      }
      try {
        await page.waitForSelector(multipleRoutesSelector, {
          timeout: 4000,
          visible: true,
        });
        console.log("multiple Routes founded");
        foundedElement = multipleRoutesSelector;
      } catch (e) {
        //failed to find the first
        console.log("failed to find multiple route");
        try {
          console.log("Trying one route");
          await page.waitForSelector(oneRouteSelector, {
            timeout: 4000,
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
      console.log(
        "\n\n\ntime from waze",
        time,
        "\n",
        "est from waze",
        est,
        "\n"
      );
      const locale = "he-IL";
      const dateOptions = { timeZone: "Asia/Jerusalem" };
      let dateOfUpdate = getDate().toLocaleString(locale, dateOptions);
      let dayOfTheWeek = new Date(dateOfUpdate).getDay();
      //Saving
      let routeId = route._id;
      if (title && dateOfUpdate && time && dayOfTheWeek.toString()) {
        let result = {
          title,
          dateOfUpdate,
          time,
          dayOfTheWeek,
          route: routeId,
          source: "waze",
        };
        if (oneRoute) {
          return result;
        }
        // console.log("result", result);
        let lastUpdateForRoute = await trafficUpdateLogic.getTrafficUpdate(
          { wazeUrl: { $ne: null } },
          { sort: { dateOfUpdate: -1 } }
        );
        if (lastUpdateForRoute.dateOfUpdate === dateOfUpdate) {
          // console.log("The same data grabbed- avoiding this data");
        } else {
          await trafficUpdateLogic.newTrafficUpdate(result);
          console.log(
            "\nTitle:",
            title,
            "Time from waze",
            time,
            "\n\nDate:",
            dateOfUpdate
          );
        }
        //  getTrafficRouteAvg({ zip: 144 });
      } else {
        console.log("not all the fields exist");
        if (oneRoute) {
          return false;
        }
      }
      await page.close();
      // await browser.close();
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

let predictFromWaze = async (oneRoute = false, oneRouteData = undefined) => {
  //mian function
  try {
    let browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox"],
    });
    if (oneRoute) {
      //one Route prediction
      //request for one route
      let res = await grabData(browser, "waze", oneRouteData, true);
      return res;
    }
    let routes = await trafficRouteLogic.getTrafficRoutes({
      isActive: true,
      _id: "63bb0ea55944eebd34bd1357",
    });
    let indexInAddress = 0;
    let addressLength = routes.length;
    console.log("routes", routes.length);
    let stop = () => {
      indexInAddress = addressLength + 2;
      console.log("closing browser!");
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
        } else {
          type = routes[indexInAddress].type;
        }

        runFunc(browser, type, routes[indexInAddress], callBack, stop);
      } else {
        console.log("Done !");
        stop();
      }
    };
    let type;
    if (routes[indexInAddress].type == null || !routes[indexInAddress].type) {
    } else {
      type = routes[indexInAddress].type;
    }
    runFunc(browser, (type = "waze"), routes[indexInAddress], callBack, stop);
  } catch (e) {
    console.log("e", e);
  }
};
module.exports = { predictFromWaze };
// grabData();
