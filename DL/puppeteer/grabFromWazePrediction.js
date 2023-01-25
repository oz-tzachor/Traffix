const puppeteer = require("puppeteer");
const trafficRouteLogic = require("../../BL/trafficRouteLogic");
const trafficUpdateLogic = require("../../BL/trafficUpdateLogic");
const { getDate } = require("../moment/moment");
const moment = require("moment"); // require

const grabData = async (
  browser,
  type = "waze",
  route = undefined,
  oneRoute = false,
  timeOfPrediction
) => {
  return new Promise(async (resolve1, reject1) => {
    try {
      let address;
      let resByWeek = [{}, {}, {}, {}, {}, {}, {}];
      let results = [];
      let grabTime = new Date();
      let day = new Date(grabTime).getDay();
      // let callback = () => {
      //   console.log(moment(grabTime).add(1, "d"));
      //   grabTime = new Date(moment(grabTime).add(1, "d")).getTime();
      //   grabByDay(grabTime);
      //   day++;
      // };
      let grabByDay = async (grabTimeInput) => {
        return new Promise(async (resolve, reject) => {
          try {
            results = [];
            let mainDayOfTheWeek = new Date(grabTimeInput).getDay();
            console.log("main day", mainDayOfTheWeek);
            let timeInMin = new Date().getMinutes();
            let urlWithTime = route.wazeUrlPredict.replace(
              "traffixTime",
              grabTimeInput
            );
            const page = await browser.newPage();
            await page.goto(urlWithTime, { waitUntil: "networkidle0" });
            let reloaded = 0;

            let title = `${route.from} - ${route.to}`;
            console.log("predict in waze:", title);
            let oneRouteSelector =
              "#map > div.wm-cards.is-destination.with-routing.with-routes > div.wm-card.is-routing > div > div.wm-routing__scrollable > div.wm-routes.false";
            let multipleRoutesSelector =
              "#map > div.wm-cards.is-destination.with-routing.with-routes > div.wm-card.is-routing > div > div.wm-routing__scrollable > div.wm-routes.multiple-routes";
            let dropDownSelector = `#map > div.wm-cards.is-destination.with-routing > div.wm-card.is-routing > div > div.wm-routing__scrollable > div.wm-routing-schedule.wm-routing__reducer > div.wm-routing-schedule__datetime > div:nth-child(2) > div`;
            // let dropDownSelector = `#map > div.wm-cards.is-destination.with-routing.with-routes > div.wm-card.is-routing > div > div.wm-routing__scrollable > div.wm-routing-schedule.wm-routing__reducer > div.wm-routing-schedule__datetime > div:nth-child(2)`;
            let dropDownDataClass = ".wz-react-dropdown__list-container";
            try {
              try {
                await page.waitForSelector(oneRouteSelector, {
                  timeout: 7000,
                  visible: true,
                });
                oneRouteSelector;
              } catch (e) {
                console.log("failed multiple- trying one");
                try {
                  await page.waitForSelector(multipleRoutesSelector, {
                    timeout: 3000,
                    visible: true,
                  });
                } catch (e) {
                  console.log("failed multiple- trying refresh");

                  if (reloaded < 5) {
                    reloaded++;
                    console.log("falied reloading");
                    await page.reload({
                      waitUntil: ["networkidle0", "domcontentloaded"],
                    });
                  } else {
                    console.log("alreadt refreshed reloading");
                  }
                }
              }
              await page.waitForSelector(dropDownSelector, {
                timeout: 4000,
                visible: true,
              });
              let dropDownElement = await page.$eval(
                dropDownSelector,
                async (element) => {
                  element.click();
                  // return element.innerHTML;
                }
              );
              let dropdownData = await page.$eval(
                dropDownDataClass,
                async (element) => {
                  // setTimeout(() => {
                  // element.click();
                  return element.innerHTML;
                  // }, 2200);
                }
              );
              let start = `M<span class="`;
              let end = `(הערכה)</span>`;
              console.log("starts loop", dropdownData.length);

              while (dropdownData.length > 5) {
                let startCut = dropdownData.indexOf(start) - 8;
                let endCut = dropdownData.indexOf(end) + 13;
                let sliceFirst = dropdownData.slice(startCut, endCut);
                if (sliceFirst.length > 1) {
                  let title = sliceFirst.slice(1, 9);
                  if (sliceFirst[1] === ">") {
                    title = sliceFirst.slice(2, 9);
                  }
                  let driveTime = Number(
                    sliceFirst.slice(
                      sliceFirst.length - 21,
                      sliceFirst.length - 19
                    )
                  );
                  if (isNaN(driveTime)) {
                    driveTime = Number(
                      sliceFirst.slice(
                        sliceFirst.length - 20,
                        sliceFirst.length - 19
                      )
                    );
                  }
                  let rangeOfDrive = sliceFirst.slice(
                    sliceFirst.indexOf('tle="') + 5,
                    sliceFirst.indexOf('tle="') + 16
                  );
                  let leaveIn = rangeOfDrive.slice(0, 5);
                  let arriveIn = rangeOfDrive.slice(6, rangeOfDrive.length);
                  if (isNaN(Number(driveTime))) {
                    driveTime = sliceFirst.slice(
                      sliceFirst.length - 21,
                      sliceFirst.length - 20
                    );
                  }
                  if (Number(driveTime) !== 0) {
                    let resObject = { title, driveTime, leaveIn, arriveIn };
                    results.push(resObject);
                  }
                }
                dropdownData = dropdownData.slice(
                  endCut,
                  dropdownData.length - 1
                );
              }
              // console.log("res", results);
              resByWeek[mainDayOfTheWeek] = results;
              resolve(resByWeek);

              // callback();
              ///
              await page.close();
              // if (day === 6) {
              //   resolve(resByWeek);
              // }
            } catch (e) {
              console.log("cant find dropdown", e);
              // callback();
              reject(e);
            }

            // console.log(results);
          } catch (e) {
            reject(e);

            // await browser.close();
            console.log("error main", e);
          }
        });
      };
      let doneWeek = async () => {
        let response = {};
        let weeklyResponse = {};
        let calcQurater = (min) => {
          let quart;
          if (min < 0.25) {
            quart = "1";
          } else if (min < 0.5) {
            quart = "2";
          } else if (min < 0.75) {
            quart = "3";
          } else if (min < 1) {
            quart = "4";
          }
          if (!quart) {
            console.log("quart undefeind");
          }
          return quart;
        };
        let todayData = false;
        let todayDataIndex = null;
        for (let index = 0; index < resByWeek.length; index++) {
          const day = resByWeek[index];

          Object.keys(day).forEach((report) => {
            let time = new Date(
              moment({
                hours: day[report].leaveIn.split(":")[0],
                minutes: day[report].leaveIn.split(":")[1],
              }).add(day[report].driveTime, "minutes")
            ).toLocaleTimeString();
            // console.log("time", time);
            let hourOfReport = day[report].leaveIn.split(":")[0];
            let minutesOfReport = day[report].leaveIn.split(":")[1];

            if (hourOfReport[0] === "0") {
              if (!todayData) {
                todayData = true;
                todayDataIndex = report;
              }
              hourOfReport = hourOfReport.slice(1, 2);
            }
            if (todayData && !isNaN(Number(hourOfReport))) {
              let quart = calcQurater(Number(minutesOfReport) / 60);
              //Split to hours
              if (!response[hourOfReport]) {
                response[hourOfReport] = {};
                response[hourOfReport].hourAvg = 0;
              }
              if (!response[hourOfReport][quart]) {
                response[hourOfReport][quart] = 0;
              }
              response[hourOfReport][quart] = day[report].driveTime;
            }
          });
          let multiply = 100 / 24;
          let predictionPercentages = 0;
          //calc avgs
          let lastKnownValue = null;
          Object.keys(response).forEach((hourData) => {
            let hourlySum = 0;
            let quarters = ["1", "2", "3", "4"];
            // let lastKnownValue = null;

            for (let quarter = 0; quarter < quarters.length; quarter++) {
              const quarterItem = quarters[quarter];
              if (response[hourData][quarterItem]) {
                lastKnownValue = response[hourData][quarterItem];
              } else {
                response[hourData][quarterItem] = lastKnownValue;
              }
              hourlySum += response[hourData][quarterItem];
            }
            response[hourData]["hourAvg"] = hourlySum / 4;
            if (!isNaN(response[hourData]["hourAvg"])) {
              predictionPercentages += multiply;
            }
            hourlySum = 0;
          });
          if (predictionPercentages < 99.99) {
            console.log("error in prediction: day:", index);
            resolve1();
          } else {
            weeklyResponse[index] = response;
          }
          response = {};
        }
        console.log("res", response.length);
        console.log("res", weeklyResponse.length);
        if (route.predictByDays) {
          weeklyResponse = { ...route.predictByDays, ...weeklyResponse };
        }
        let predictionCompleted = true;
        for (let index = 0; index < 7; index++) {
          const day = index.toString();
          if (!weeklyResponse[day]) {
            predictionCompleted = false;
            break;
          }
        }
        await trafficRouteLogic.updateRouteDetails(
          {
            _id: route._id,
          },
          {
            predictByDays: weeklyResponse,
            lastPredictUpdate: new Date(),
            predictionCompleted,
          }
        );
        console.log(`${route.from}-${route.to} prediction completed`);
      };

      for (let index = 0; index < resByWeek.length; index++) {
        grabTime = new Date(moment(grabTime).add(1, "d")).getTime();
        await grabByDay(grabTime);
        console.log("res", resByWeek.length);
        if (index === 6) {
          await doneWeek();
          return resolve1();
        }
      }
      // return await
    } catch (e) {
      console.log("e", e);
    }
  });
};
//////
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
  //main function
  try {
    let browser = await puppeteer.launch({
      headless: false,
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
      $or: [
        {
          predictionCompleted: false,
        },
        { predictionCompleted: { $eq: null } },
      ],
    });
    if (routes.length === 0) {
      console.log("No out to date routes,aborting browser");
      browser.close();
      return false;
    }
    let indexInAddress = 0;
    let addressLength = routes.length;
    console.log("routes with prediction link", routes.length);
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
