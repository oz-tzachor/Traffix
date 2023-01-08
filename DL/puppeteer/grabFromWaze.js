const puppeteer = require("puppeteer");
const trafficRouteLogic = require("../../BL/trafficRouteLogic");
let browser;
let addressWaze1 =
  "https://www.waze.com/he/live-map/directions/%D7%90%D7%A8%D7%99%D7%90%D7%9C?to=place.ChIJ6_6XBwsnHRURrbo12csDrug&from=place.w.23134528.231083132.22422";
let addressWaze2 =
  "https://www.waze.com/he/live-map/directions/%D7%A9%D7%99%D7%9C%D7%94?to=place.ChIJWRFTHInZHBURdraNpJUfnk4&from=place.ChIJ18ktYCvUHBURpr2YR8qxBaQ";
let addresses = [addressWaze1, addressWaze2];
let oneRouteSelector =
  "#map > div.wm-cards.is-destination.with-routing.with-routes > div.wm-card.is-routing > div > div.wm-routing__scrollable > div.wm-routes.false";
let multipleRoutesSelector =
  "#map > div.wm-cards.is-destination.with-routing.with-routes > div.wm-card.is-routing > div > div.wm-routing__scrollable > div.wm-routes.multiple-routes";
const grabData = async (type = "waze", route = undefined) => {
  let address;
  try {
    if (type === "waze") {
      address = route.wazeUrl;
    } else if (type === "pkk") {
      address = `https://www.pkk.bycomputers.com/index.php?zipcode=${route.zip}`;
    }
    console.log("started:", address);
    //Initial Navigation
    const page = await browser.newPage();
    await page.goto(address, { waitUntil: "networkidle0" });
    if (type === "waze") {
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
      //time
      let startCutTime = allUl.indexOf('s">') + 3;
      let endCutTime = allUl.indexOf(" דקות");
      let time = allUl.slice(startCutTime, endCutTime);
      console.log("time from waze", time);
      //estimation
      let endCutEst = allUl.indexOf("M</span>") + 1;
      let startCutEst = endCutEst - 8;
      let est = allUl.slice(startCutEst, endCutEst);
      console.log("est from waze", est);
      await page.close();

      // await browser.close();
    } else if (type === "pkk") {
      //
    }
  } catch (e) {
    // await browser.close();
    console.log("e", e);
  }
};

///
let runFunc = (type, route, callback, stop) => {
  grabData(type, route)
    .then(() => {
      console.log("grab ended!");
      callback();
    })
    .catch((e) => {
      stop();
    });
};

let grabFromWaze = async () => {
  try {
    let routes = await trafficRouteLogic.getTrafficRoutes({
      wazeUrl: { $ne: null },
    });
    let indexInAddress = 0;
    let addressLength = routes.length;
    console.log("routes", routes.length);
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox"],
    });
    let stop = () => {
      indexInAddress = addressLength + 2;
      browser.close();
    };
    let callBack = () => {
      indexInAddress++;
      if (indexInAddress < addressLength) {
        runFunc(
          routes[indexInAddress].type || "waze",
          routes[indexInAddress],
          callBack,
          stop
        );
      } else {
        console.log("Done !");
        console.log(results);
      }
    };
    runFunc(
      routes[indexInAddress].type || "waze",
      routes[indexInAddress],
      callBack,
      stop
    );
  } catch (e) {
    console.log("e", e);
  }
};
module.exports = { grabFromWaze };
// grabData();
