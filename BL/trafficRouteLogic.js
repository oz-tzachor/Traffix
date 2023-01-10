const { object } = require("joi");
const TrafficUpdate = require("../DL/models/TrafficUpdate");
const TrafficRouteController = require("../DL/Controllers/trafficRouteController");
const trafficUpdateController = require("../DL/Controllers/trafficUpdateController");
const {
  checkNewerUpdate,
  getDatesForDailyAvg,
} = require("../DL/moment/moment");
const { sendMessageDev, sendMessage } = require("../DL/bot/bot");
const { production } = require("..");
// const { createImage } = require("../DL/chart/chart");

///New route
const newTraffRoute = async (newTraffRouteDetails) => {
  let routeExist = await TrafficRouteController.readOne({
    wazeUrl: newTraffRouteDetails.wazeUrl,
  });
  if (routeExist)
    throw { code: 400, message: "route exist", route: routeExist };
  let newTrafRoute = await TrafficRouteController.create(newTraffRouteDetails);
  return newTrafRoute;
};
///New route
const getTrafficRoutes = async (filter) => {
  let traffRoutes = await TrafficRouteController.read(filter);
  return traffRoutes;
};
//update route
const updateRouteDetails = async (filter, routeTraffUpadte) => {
  // console.log("new upadte arrived", routeTraffUpadte);
  let newTrafRoute = await TrafficRouteController.update(
    filter,
    routeTraffUpadte
  );
  return newTrafRoute;
};
// const updateRouteAvg = async (filter, routeTraffUpadte, type = "daily") => {
//   try {
//     let currDayOfTheWeek = new Date().getDay();
//     // console.log("new upadte arrived", routeTraffUpadte);
//     let newTrafRoute = await TrafficRouteController.readOne(filter);
//     if (type == "daily") {
//       // newTrafRoute.from = "Hizme";
//       newTrafRoute.avgByDays[currDayOfTheWeek] = routeTraffUpadte;
//     } else if (type == "weekly") {
//       newTrafRoute.avgByDays = routeTraffUpadte;
//     }
//     await newTrafRoute.save();
//     return newTrafRoute;
//   } catch (e) {
//     console.log("e", e);
//   }
// };
//avg daily
const getTrafficRouteAvgGeneral = async (filter, type = "daily") => {
  //
  //Define globals for this function
  let resultsMain = {};
  let resultByWeek = {
    0: {},
    1: {},
    2: {},
    3: {},
    4: {},
    5: {},
    6: {},
  };
  //
  let fieldUpdated = [];
  try {
    let currentRoute = await TrafficRouteController.readOne({
      _id: filter.route,
    });
    let prevAvgByDaysData = currentRoute.avgByDays;

    let calcQurater = (min) => {
      let quart;
      if (min <= 0.25) {
        quart = "1";
      } else if (min <= 0.5) {
        quart = "2";
      } else if (min <= 0.75) {
        quart = "3";
      } else if (min <= 1) {
        quart = "4";
      }
      if (!quart) {
        console.log("quart undefeind");
      }
      return quart;
    };
    //
    let data;
    if (filter.route.toString() === "63bc4da2a3f44dfe5c611479") {
      console.log("x");
    }
    if (prevAvgByDaysData) {
      let tempFilter = filter;
      //if there is earlier data of this route - keep with update each day separatley - and keep with the filter of the dates
      if (currentRoute.zip) {
        let { route, dateOfUpdate } = filter;
        tempFilter = {
          $or: [{ route }, { zip: currentRoute.zip }],
          dateOfUpdate,
        };
      }
      data = await trafficUpdateController.read(tempFilter);
      // console.log('filter',filter);
      // console.log("There is earlier data - getting by date");
    } else {
      let tempFilter = filter;
      //if there is מם earlier data of this route -change filter to get all the data of this route and calc avg
      if (currentRoute.zip) {
        let { route, dateOfUpdate } = filter;
        tempFilter = { route: filter.route };
        tempFilter = {
          $or: [{ route }, { zip: currentRoute.zip }],
        };
      }
      data = await trafficUpdateController.read(tempFilter);
      // console.log(data[data.length - 1].dateOfUpdate);
      //force collecting all data
      currentRoute.lastAvgUpdate = new Date(
        data[data.length - 1].dateOfUpdate
      ).setDate(new Date(data[data.length - 1].dateOfUpdate).getDate() - 7);
      console.log("updated", currentRoute.lastAvgUpdate);
      // console.log("no earlier data - getting all");
    }

    //check if data is relevant
    console.log("data length", data.length);
    //
    let dayArr;
    Object.keys(resultByWeek).forEach((day) => {
      //define day
      let resultByDay = {};
      for (let index = 0; index < 24; index++) {
        resultByDay[index] = {
          1: { value: 0, count: 0 },
          2: { value: 0, count: 0 },
          3: { value: 0, count: 0 },
          4: { value: 0, count: 0 },
          hourAvg: { value: null, count: 0 },
        };
      }
      dayArr = data.filter((data) => {
        let dayOfTheItem = data.dayOfTheWeek
          ? data.dayOfTheWeek
          : new Date(new Date(data.dateOfUpdate).toLocaleString()).getDay(); //Hold all the data by day of the week
        // console.log("day of th eitem", dayOfTheItem);
        return (
          dayOfTheItem === Number(day) &&
          checkNewerUpdate(
            new Date(data.dateOfUpdate),
            currentRoute.lastAvgUpdate
          )
        );
      });
      // if (!dayArr.length) {
      //   return;
      // }
      let hourArr;
      for (let index = 0; index < 24; index++) {
        let hourlySum = 0;
        let hourlyCounter = 0;

        hourArr = dayArr.filter((data) => {
          let hourOfTheItem = new Date(
            new Date(data.createdAt).toLocaleString()
          ).getHours();
          if (hourOfTheItem === index) {
            //add to avg
            hourlySum += Number(data.time);
            hourlyCounter++;
          }
          return hourOfTheItem === index;
        });
        //calc avg
        let hourlyAvg = hourlyCounter > 0 ? hourlySum / hourlyCounter : 0;
        // insert avg
        resultByDay[index]["hourAvg"] = {
          value: hourlyAvg,
          count: hourlyCounter,
        };

        //Temp arr for quearter data
        let temArrForQuarter = {};

        //Create quarter hours
        for (let eleInd = 1; eleInd < 5; eleInd++) {
          if (!temArrForQuarter[eleInd]) {
            // resultByDay[index][eleInd] = [];
            temArrForQuarter[eleInd] = [];
          }
        }

        //Set the data by his quarter hour
        for (let j = 0; j < hourArr.length; j++) {
          let dataMinuteValue =
            new Date(hourArr[j]?.dateOfUpdate).getMinutes() / 60;
          let quarter = calcQurater(dataMinuteValue);
          temArrForQuarter[quarter].push(hourArr[j]);
        }

        Object.keys(temArrForQuarter).forEach((quartArr) => {
          let quratSum = 0;
          let quratCounter = 0;
          for (
            let tempIndex = 0;
            tempIndex < temArrForQuarter[quartArr].length;
            tempIndex++
          ) {
            const data = temArrForQuarter[quartArr][tempIndex];
            quratSum += Number(data.time);
            quratCounter++;
          }
          let quartAvg = quratCounter > 0 ? quratSum / quratCounter : 0;
          resultByDay[index][quartArr] = {
            value: quartAvg,
            count: quratCounter,
          };
        });
      }
      resultsMain[day] = resultByDay;
    });
    //
    //done the loops
    let lastAvgUpdate = data[data.length - 1].dateOfUpdate;
    let currDayOfTheWeek = new Date().getDay();
    if (filter.route) {
      filter = { _id: filter.route };
      if (type === "daily" && prevAvgByDaysData) {
        // console.log("There is prev data  - creating daily");
        //set the DB update
        let resData = resultsMain[currDayOfTheWeek];
        //add results of the day to the total avg;
        Object.keys(resData).forEach((index) => {
          const hourElement = resData[index];
          //run on the results from today
          if (hourElement.hourAvg.value !== 0) {
            //if there is new data in this hour
            Object.keys(resData[index]).forEach((j) => {
              const newCount = resData[index][j].count;
              const newValue = resData[index][j].value;
              if (newCount !== 0) {
                const oldCount =
                  prevAvgByDaysData[currDayOfTheWeek][index][j].count;
                const oldValue =
                  prevAvgByDaysData[currDayOfTheWeek][index][j].value;
                prevAvgByDaysData[currDayOfTheWeek][index][j].value =
                  oldValue +
                  (newCount / (oldCount + newCount)) * (newValue - oldValue);
                prevAvgByDaysData[currDayOfTheWeek][index][j].count += newCount;
                fieldUpdated.push({
                  day: currDayOfTheWeek,
                  hour: index,
                  quarter: j,
                  oldVal: oldValue,
                  oldCount: oldCount,
                  newCount: newCount,
                  newVal: newValue,
                  combinedVal:
                    prevAvgByDaysData[currDayOfTheWeek][index][j].value,
                  combinedCount:
                    prevAvgByDaysData[currDayOfTheWeek][index][j].count,
                });
              }
              //run on results per quarter -notice the hourly
            });
          }
        });
        console.log("fields updated(new data)", fieldUpdated.length);
        // console.log("fields", fieldUpdated);
        if (
          currentRoute.lastAvgUpdate &&
          lastAvgUpdate !== currentRoute.lastAvgUpdate
        ) {
          await updateRouteDetails(filter, {
            avgByDays: prevAvgByDaysData,
            lastAvgUpdate,
          });
        } else {
          console.log("working on the same data");
        }
        return resultsMain[currDayOfTheWeek];

        // /////////////////////////////////////////////////
      } else if (type === "weekly" || !prevAvgByDaysData) {
        Object.keys(resultsMain).forEach((index) => {
          resultByWeek[index] = resultsMain[index];
        });

        if (!currentRoute.lastAvgUpdate) {
          await updateRouteDetails(
            filter,
            { avgByDays: resultByWeek, lastAvgUpdate },
            "weekly"
          );
        } else if (lastAvgUpdate !== currentRoute.lastAvgUpdate) {
          await updateRouteDetails(
            filter,
            { avgByDays: resultByWeek, lastAvgUpdate },
            "weekly"
          );
        } else {
          console.log("cant save - same data");
        }
      }
    }
    // await updateRouteDetails(filter, { avgByDays: resultByWeek });
    return resultsMain[currDayOfTheWeek];
    // Save data by quwarter hour
    //Then Compare current result with currebt quearter avg  - and then cimpare result with hourly avg - if higher then threshold - then notice the user
  } catch (e) {
    console.log("e", e);
  }
};
//Analyze the data

let analyzeTheData = async () => {
  try {
    console.log("Start analyze");
    let routes = await getTrafficRoutes({ isActive: true });
    let index = 0;
    let textMessage = "";
    for (let index = 0; index < routes.length; index++) {
      let multiply = 100 / (24 * 7);
      let totalPercantages = 0;
      textMessage += `${routes[index].from} - ${routes[index].to}\n`;
      const avgByDays = routes[index].avgByDays;
      if (avgByDays) {
        Object.keys(avgByDays).forEach((day) => {
          //days
          Object.keys(avgByDays[day]).forEach((hour) => {
            //hours
            if (avgByDays[day][hour]["hourAvg"].value > 0) {
              totalPercantages += multiply;
            }
          });
        });
        textMessage += `${Math.floor(totalPercantages)}% הושלמו!\n\n`;
      } else {
        textMessage += "\nאין מידע על נתיב זה";
      }
    }
    // let chatIdDev = 160151970;
    // if (production) {
    //   sendMessageDev(textMessage);
    // } else {
    //   console.log(textMessage);
    //   // sendMessage(chatIdDev, textMessage);
    // }
    console.log(textMessage);
    console.log("done");
  } catch (e) {
    console.log("error", e);
  }
};
//Daily avg calculation for all the routes
let manageRouteAvg = async () => {
  // sendMessageDev("Start calculation of daily avg of all routes");
  //main function
  try {
    let routes = await getTrafficRoutes({
      isActive: true,
    });

    let dates = getDatesForDailyAvg();
    let filter = { route: routes[0]._id, dateOfUpdate: dates };
    let runFunc = (filter, callback, stop) => {
      getTrafficRouteAvgNew(filter)
        .then(() => {
          console.log(
            "calc route over",
            routes[indexInRoutes].from,
            "-",
            routes[indexInRoutes].to
          );
          callback();
        })
        .catch((e) => {
          // sendMessageDev("Daily avg calc failed:\n\n\n", e);
          stop();
        });
    };
    let indexInRoutes = 0;
    let routesLength = routes.length;
    let stop = () => {
      indexInRoutes = routesLength + 2;
      console.log("Done calc avg");
    };
    let callBack = () => {
      indexInRoutes++;
      if (indexInRoutes < routesLength) {
        let filter = { route: routes[indexInRoutes]._id, dateOfUpdate: dates };
        runFunc(filter, callBack, stop);
      } else {
        console.log("Done !");
        // sendMessageDev("Daily avg calc done successfully!");

        stop();
      }
    };
    //call to the function to trigger the loop
    runFunc(filter, callBack, stop);
  } catch (e) {
    console.log("avg calc error", e);
  }
};

const getTrafficRouteAvgNew = async (filter) => {
  //Tasks:
  //Create week
  //* terms for getting route
  //get route
  //* terms for getting data:
  //check if should get zip data also - add $or if should
  //get data
  //run on week- divide new data by day,then run on day - divide data by hours -then run on hour - dvide data by quarter;
  //run the function that calc - if was earlier data - run on earlier - if wasn't,define the old data as the new
  ///new
  ///new
  ///new
  ///new
  ///new
  ///new
  ///new
  ///new
  ///new
  ///new
  ///new////////////////////////////////////////////////////////////////////////////////////////////
  ///new////////////////////////////////////////////////////////////////////////////////////////////
  ///new////////////////////////////////////////////////////////////////////////////////////////////
  ///new////////////////////////////////////////////////////////////////////////////////////////////
  ///new////////////////////////////////////////////////////////////////////////////////////////////
  ///new
  ///new
  ///new
  ///new
  ///new
  ///new
  //
  //Define globals for this function
  let resultsMain = {};
  let resultByWeek = {
    0: {},
    1: {},
    2: {},
    3: {},
    4: {},
    5: {},
    6: {},
  };
  let calcQurater = (min) => {
    let quart;
    if (min <= 0.25) {
      quart = "1";
    } else if (min <= 0.5) {
      quart = "2";
    } else if (min <= 0.75) {
      quart = "3";
    } else if (min <= 1) {
      quart = "4";
    }
    if (!quart) {
      console.log("quart undefeind");
    }
    return quart;
  };
  //
  let fieldUpdated = [];
  try {
    let currentRoute = await TrafficRouteController.readOne({
      _id: filter.route,
    });
    let prevAvgByDaysData = currentRoute.prevAvgByDaysDataף;

    //
    let data;
    if (filter.route.toString() === "63bc4da2a3f44dfe5c611479") {
      console.log("x");
    }
    let tempFilter;
    if (prevAvgByDaysData) {
      tempFilter = filter;
      //if there is earlier data of this route - keep with update each day separatley - and keep with the filter of the dates
      if (currentRoute.zip) {
        let { route, dateOfUpdate } = filter;
        tempFilter = {
          $or: [{ route }, { zip: currentRoute.zip }],
          dateOfUpdate,
        };
      }
    } else {
      tempFilter = filter;
      //if there is מם earlier data of this route -change filter to get all the data of this route and calc avg
      if (currentRoute.zip) {
        let { route, dateOfUpdate } = filter;
        tempFilter = { route: filter.route };
        tempFilter = {
          $or: [{ route }, { zip: currentRoute.zip }],
        };
      }

      console.log("updated", currentRoute.lastAvgUpdate);
    }
    //Getting the data
    data = await trafficUpdateController.read(tempFilter);
    //check if data is relevant
    console.log("data length", data.length);
    if (!data.length) return;
    //force collecting all data by defining date very old
    currentRoute.lastAvgUpdate = new Date(
      data[data.length - 1].dateOfUpdate
    ).setDate(new Date(data[data.length - 1].dateOfUpdate).getDate() - 7);
    //
    let dayArr;
    Object.keys(resultByWeek).forEach((day) => {
      //define day
      let resultByDay = {};
      for (let index = 0; index < 24; index++) {
        resultByDay[index] = {
          1: { value: 0, count: 0 },
          2: { value: 0, count: 0 },
          3: { value: 0, count: 0 },
          4: { value: 0, count: 0 },
          hourAvg: { value: null, count: 0 },
        };
      }
      dayArr = data.filter((data) => {
        let dayOfTheItem = data.dayOfTheWeek
          ? data.dayOfTheWeek
          : new Date(new Date(data.dateOfUpdate).toLocaleString()).getDay(); //Hold all the data by day of the week
        return (
          dayOfTheItem === Number(day) &&
          checkNewerUpdate(
            new Date(data.dateOfUpdate),
            currentRoute.lastAvgUpdate
          )
        );
      });

      //calc data by hour
      let hourArr;
      for (let index = 0; index < 24; index++) {
        let hourlySum = 0;
        let hourlyCounter = 0;

        hourArr = dayArr.filter((data) => {
          let hourOfTheItem = new Date(
            new Date(data.createdAt).toLocaleString()
          ).getHours();
          if (hourOfTheItem === index) {
            //add to avg
            hourlySum += Number(data.time);
            hourlyCounter++;
          }
          return hourOfTheItem === index;
        });
        //calc avg
        let hourlyAvg = hourlyCounter > 0 ? hourlySum / hourlyCounter : 0;
        // insert avg
        resultByDay[index]["hourAvg"] = {
          value: hourlyAvg,
          count: hourlyCounter,
        };
        //Temp arr for quearter data
        let temArrForQuarter = {};

        //Create quarter hours
        for (let eleInd = 1; eleInd < 5; eleInd++) {
          if (!temArrForQuarter[eleInd]) {
            // resultByDay[index][eleInd] = [];
            temArrForQuarter[eleInd] = [];
          }
        }

        //Set the data by his quarter hour
        for (let j = 0; j < hourArr.length; j++) {
          let dataMinuteValue =
            new Date(hourArr[j]?.dateOfUpdate).getMinutes() / 60;
          let quarter = calcQurater(dataMinuteValue);
          temArrForQuarter[quarter].push(hourArr[j]);
        }
        //calc avg of each quarter
        Object.keys(temArrForQuarter).forEach((quartArr) => {
          let quratSum = 0;
          let quratCounter = 0;
          for (
            let tempIndex = 0;
            tempIndex < temArrForQuarter[quartArr].length;
            tempIndex++
          ) {
            const data = temArrForQuarter[quartArr][tempIndex];
            quratSum += Number(data.time);
            quratCounter++;
          }
          let quartAvg = quratCounter > 0 ? quratSum / quratCounter : 0;
          resultByDay[index][quartArr] = {
            value: quartAvg,
            count: quratCounter,
          };
        });
      }
      //save day results on main array
      resultsMain[day] = resultByDay;
    });
    /////////////DONE THE LOOPS!/////////////////////
    data.length;
    //Check again - if was old data or not
    let skipAddToAvgCalc = false;
    if (!prevAvgByDaysData) {
      prevAvgByDaysData = resultsMain;
      skipAddToAvgCalc = true;
    }
    let lastAvgUpdate = data[data.length - 1].dateOfUpdate;
    let currDayOfTheWeek = new Date().getDay();
    if (!skipAddToAvgCalc) {
      // console.log("There is prev data  - creating daily");
      //set the DB update
      Object.keys(resultsMain).forEach((resDay) => {
        let resData = resultsMain[resDay];
        //add results of the day to the total avg;
        Object.keys(resData).forEach((index) => {
          const hourElement = resData[index];
          //run on the results from today
          if (hourElement.hourAvg.value !== 0) {
            //if there is new data in this hour
            Object.keys(resData[index]).forEach((j) => {
              const newCount = resData[index][j].count;
              const newValue = resData[index][j].value;
              if (newCount !== 0) {
                const oldCount =
                  prevAvgByDaysData[currDayOfTheWeek][index][j].count;
                const oldValue =
                  prevAvgByDaysData[currDayOfTheWeek][index][j].value;
                prevAvgByDaysData[currDayOfTheWeek][index][j].value =
                  oldValue +
                  (newCount / (oldCount + newCount)) * (newValue - oldValue);
                prevAvgByDaysData[currDayOfTheWeek][index][j].count += newCount;
                fieldUpdated.push({
                  day: currDayOfTheWeek,
                  hour: index,
                  quarter: j,
                  oldVal: oldValue,
                  oldCount: oldCount,
                  newCount: newCount,
                  newVal: newValue,
                  combinedVal:
                    prevAvgByDaysData[currDayOfTheWeek][index][j].value,
                  combinedCount:
                    prevAvgByDaysData[currDayOfTheWeek][index][j].count,
                });
              }
              //run on results per quarter -notice the hourly
            });
          }
        });
      });
      console.log("fields updated(new data)", fieldUpdated.length);
      // console.log("fields", fieldUpdated);
      return resultsMain[currDayOfTheWeek];
    }
    //
    filter = { _id: currentRoute._id };
    await updateRouteDetails(filter, {
      avgByDays: prevAvgByDaysData,
      lastAvgUpdate,
    });
    // await updateRouteDetails(filter, { avgByDays: resultByWeek });
    return resultsMain[currDayOfTheWeek];
    // Save data by quwarter hour
  } catch (e) {
    console.log("e", e);
  }
};
//Analyze the data

let trafRequests = {
  newTraffRoute,
  updateRouteDetails,
  getTrafficRoutes,
  manageRouteAvg,
  analyzeTheData,
  getTrafficRouteAvgGeneral,
  getTrafficRouteAvgNew,
};
module.exports = trafRequests;
