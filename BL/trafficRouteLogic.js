const { object } = require("joi");
const TrafficUpdate = require("../DL/models/TrafficUpdate");
const TrafficRouteController = require("../DL/Controllers/trafficRouteController");
const trafficUpdateController = require("../DL/Controllers/trafficUpdateController");
// const { createImage } = require("../DL/chart/chart");

///New route
const newTraffRoute = async (newTraffRouteDetails) => {
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
  console.log("new upadte arrived", routeTraffUpadte);
  let newTrafRoute = await TrafficRouteController.update(
    filter,
    routeTraffUpadte
  );
  return newTrafRoute;
};
const updateRouteAvg = async (filter, routeTraffUpadte, type = "daily") => {
  try {
    let currDayOfTheWeek = new Date().getDay();
    // console.log("new upadte arrived", routeTraffUpadte);
    let newTrafRoute = await TrafficRouteController.readOne(filter);
    if (type == "daily") {
      newTrafRoute.from = "Hizme";
      newTrafRoute.avgByDays[currDayOfTheWeek] = routeTraffUpadte;
    } else if (type == "weekly") {
      newTrafRoute.avgByDays = routeTraffUpadte;
    }
    await newTrafRoute.save();
    return newTrafRoute;
  } catch (e) {
    console.log("e", e);
  }
};
//avg daily
const getTrafficRouteAvgGeneral = async (filter, type = "daily") => {
  // filter = {
  //   zip: 144,
  //   dateOfUpdate: {
  //     $gte: "2023-01-06T00:00.000Z",
  //     $lte: "2023-01-07T23:59:00.000Z",
  //   },
  // };
  //Define globals for this function
  let resultsMain = [];
  let resultByWeek = {
    0: {},
    1: {},
    2: {},
    3: {},
    4: {},
    5: {},
    6: {},
  };

  if (type == "daily") {
  }
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
  try {
    let { zip } = filter;
    let data = await trafficUpdateController.read(filter);
    console.log("data length", data.length);
    //
    Object.keys(resultByWeek).forEach((day) => {
      //define day
      let resultByDay = {};
      for (let index = 0; index < 24; index++) {
        resultByDay[index] = {
          0: null,
          1: null,
          2: null,
          3: null,
          hourAvg: null,
        };
      }
      let dayArr = data.filter((data) => {
        let dayOfTheItem = new Date(data.dateOfUpdate).getDay(); //Hold all the data by day of the week
        return dayOfTheItem === Number(day);
      });
      let hourArr;
      for (let index = 0; index < 24; index++) {
        resultByDay[index] = {};
        let hourlySum = 0;
        let hourlyCounter = 1;

        hourArr = dayArr.filter((data) => {
          let hourOfTheItem = new Date(data.dateOfUpdate).getHours();
          if (hourOfTheItem === index) {
            //add to avg
            hourlySum += Number(data.time);
            hourlyCounter++;
          }
          return hourOfTheItem === index;
        });
        //calc avg
        let hourlyAvg = hourlySum / hourlyCounter;
        // insert avg
        resultByDay[index]["hourAvg"] = hourlyAvg !== 0 ? hourlyAvg : null;

        //Temp arr for quearter data
        let temArrForQuarter = {};

        //Create quarter hours
        for (let eleInd = 1; eleInd < 5; eleInd++) {
          if (!resultByDay[index][eleInd]) {
            resultByDay[index][eleInd] = [];
            temArrForQuarter[eleInd] = [];
          }
        }
        //set main array to the same structure
        resultByDay[index] = {
          ...resultByDay[index],
          ...temArrForQuarter,
        };
        //Set the data by his quarter hour
        for (let j = 0; j < hourArr.length; j++) {
          let dataMinuteValue =
            new Date(hourArr[j]?.dateOfUpdate).getMinutes() / 60;
          let quarter = calcQurater(dataMinuteValue);
          temArrForQuarter[quarter].push(hourArr[j]);
        }

        Object.keys(temArrForQuarter).forEach((quartArr) => {
          let quratSum = 0;
          let quratCounter = 1;
          for (
            let tempInd2 = 0;
            tempInd2 < temArrForQuarter[quartArr].length;
            tempInd2++
          ) {
            const data = temArrForQuarter[quartArr][tempInd2];
            quratSum += Number(data.time);
            quratCounter++;
          }
          let quartAvg = quratSum / quratCounter;
          resultByDay[index][quartArr] = quartAvg !== 0 ? quartAvg : null;
        });
      }
      resultsMain.push(resultByDay);
    });

    //
    //done the loops
    let currDayOfTheWeek = new Date().getDay();
    if (type === "daily") {
      //set the DB update
      let resData = resultsMain[currDayOfTheWeek];
      let option = {[`avgByDays.${currDayOfTheWeek}`]: {}  };
      await updateRouteDetails(filter, option, "daily");

      return resultsMain[currDayOfTheWeek];
    } else if (type === "weekly") {
      for (let index = 0; index < resultsMain.length; index++) {
        resultByWeek[index] = resultsMain[index];
      }
      await updateRouteDetails(filter, resultByWeek, "weekly");
    }
    // await updateRouteDetails(filter, { avgByDays: resultByWeek });
    return resultsMain[currDayOfTheWeek];
    // Save data by quwarter hour
    //Then Compare current result with currebt quearter avg  - and then cimpare result with hourly avg - if higher then threshold - then notice the user
  } catch (e) {
    console.log("e", e);
  }
};

let trafRequests = {
  newTraffRoute,
  updateRouteDetails,
  getTrafficRouteAvg: getTrafficRouteAvgGeneral,
  getTrafficRoutes
};
module.exports = trafRequests;

///////////////
//avg daily
// const getTrafficRouteAvgGeneral = async (filter, type = "week") => {
//   //Define globals for this function
//   let resultsMain = []
//   let resultByWeek = {
//     0: {},
//     1: {},
//     2: {},
//     3: {},
//     4: {},
//     5: {},
//     6: {},
//   };

//   if (type == "daily") {
//   }
//   let calcQurater = (min) => {
//     let quart;
//     if (min <= 0.25) {
//       quart = "1";
//     } else if (min <= 0.5) {
//       quart = "2";
//     } else if (min <= 0.75) {
//       quart = "3";
//     } else if (min <= 1) {
//       quart = "4";
//     }
//     if (!quart) {
//       console.log("quart undefeind");
//     }
//     return quart;
//   };
//   //
//   try {
//     let { zip } = filter;
//     let data = await trafficUpdateController.read(filter);
//     //
//     Object.keys(resultByWeek).forEach((day) => {
//       //define day
//       let resultByDay = {};
//       for (let index = 0; index < 24; index++) {
//         resultByDay[index] = {
//           0: null,
//           1: null,
//           2: null,
//           3: null,
//           hourAvg: null,
//         };
//       }
//       let dayArr = data.filter((data) => {
//         let dayOfTheItem = new Date(data.dateOfUpdate).getDay(); //Hold all the data by day of the week
//         return dayOfTheItem === Number(day);
//       });
//       let hourArr;
//       for (let index = 0; index < 24; index++) {
//         resultByWeek[day][index] = {};
//         let hourlySum = 0;
//         let hourlyCounter = 1;

//         hourArr = dayArr.filter((data) => {
//           let hourOfTheItem = new Date(data.dateOfUpdate).getHours();
//           if (hourOfTheItem === index) {
//             //add to avg
//             hourlySum += Number(data.time);
//             hourlyCounter++;
//           }
//           return hourOfTheItem === index;
//         });
//         //calc avg
//         let hourlyAvg = hourlySum / hourlyCounter;
//         // insert avg
//         resultByWeek[day][index]["hourAvg"] =
//           hourlyAvg !== 0 ? hourlyAvg : null;

//         //Temp arr for quearter data
//         let temArrForQuarter = {};

//         //Create quarter hours
//         for (let eleInd = 1; eleInd < 5; eleInd++) {
//           if (!resultByWeek[day][index][eleInd]) {
//             resultByWeek[day][index][eleInd] = [];
//             temArrForQuarter[eleInd] = [];
//           }
//         }
//         //set main array to the same structure
//         resultByWeek[day][index] = {
//           ...resultByWeek[day][index],
//           ...temArrForQuarter,
//         };
//         //Set the data by his quarter hour
//         for (let j = 0; j < hourArr.length; j++) {
//           let dataMinuteValue =
//             new Date(hourArr[j]?.dateOfUpdate).getMinutes() / 60;
//           let quarter = calcQurater(dataMinuteValue);
//           temArrForQuarter[quarter].push(hourArr[j]);
//         }

//         Object.keys(temArrForQuarter).forEach((quartArr) => {
//           let quratSum = 0;
//           let quratCounter = 1;
//           for (
//             let tempInd2 = 0;
//             tempInd2 < temArrForQuarter[quartArr].length;
//             tempInd2++
//           ) {
//             const data = temArrForQuarter[quartArr][tempInd2];
//             quratSum += Number(data.time);
//             quratCounter++;
//           }
//           let quartAvg = quratSum / quratCounter;
//           resultByWeek[day][index][quartArr] = quartAvg !== 0 ? quartAvg : null;
//         });
//       }
//     });
//     // console.log(resultByWeek);
//     await updateRouteDetails(filter, { avgByDays: resultByWeek });
//     return resultByWeek;
//     // Save data by quwarter hour
//     //Then Compare current result with currebt quearter avg  - and then cimpare result with hourly avg - if higher then threshold - then notice the user
//   } catch (e) {
//     console.log("e", e);
//   }
// };
