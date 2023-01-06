const { object } = require("joi");
const trafficUpdateController = require("../DL//Controllers/trafficUpdateController");
// const { createImage } = require("../DL/chart/chart");
let resultByWeek = {
  0: {},
  1: {},
  2: {},
  3: {},
  4: {},
  5: {},
  6: {},
};
const newTrafficUpdate = async (newTrafficUpdateDetails) => {
  let newTraf = await trafficUpdateController.create(newTrafficUpdateDetails);
  return newTraf;
};
const getAllTrafUpdates = async (filter) => {
  return await trafficUpdateController.read(filter);
};
const getTrafficUpdate = async (filter) => {
  return await trafficUpdateController.readOne(filter);
};

const getTrafficRouteAvg = async (filter) => {
  let calcQurater = (min) => {
    let quart;
    if (min <= 0.25) {
      quart = "1";
    } else if (min >= 0.25 && min <= 0.5) {
      quart = "2";
    } else if (min >= 0.5 && min <= 0.75) {
      quart = "3";
    } else if (min >= 0.75 && min <= 1) {
      quart = "4";
    }
    if (!quart) {
      console.log("quart undefeind");
    }
    return quart;
  };
  let cal;
  try {
    let { zip } = filter;
    let data = await trafficUpdateController.read(filter);
    //
    Object.keys(resultByWeek).forEach((day) => {
      let dayArr = data.filter((data) => {
        let dayOfTheItem = new Date(data.createdAt).getDay(); //Hold all the data by day of the week
        return dayOfTheItem === Number(day);
      });
      let hourArr;
      for (let index = 0; index < 24; index++) {
        resultByWeek[day][index] = {};
        let hourlySum = 0;
        let hourlyCounter = 1;

        hourArr = dayArr.filter((data) => {
          let hourOfTheItem = new Date(data.createdAt).getHours();
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
        resultByWeek[day][index]["hourAvg"] =
          hourlyAvg !== 0 ? hourlyAvg : null;

        //Temp arr for quearter data
        let temArrForQuarter = {};

        //Create quarter hours
        for (let eleInd = 1; eleInd < 5; eleInd++) {
          if (!resultByWeek[day][index][eleInd]) {
            resultByWeek[day][index][eleInd] = [];
            temArrForQuarter[eleInd] = [];
          }
        }
        //set main array to the same structure
        resultByWeek[day][index] = {
          ...resultByWeek[day][index],
          ...temArrForQuarter,
        };
        //Set the data by his quarter hour
        for (let j = 0; j < hourArr.length; j++) {
          let dataMinuteValue =
            new Date(hourArr[j]?.createdAt).getMinutes() / 60;
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
          resultByWeek[day][index][quartArr] = quartAvg !== 0 ? quartAvg : null;
        });

        //save the avg in original data array

        // resultByWeek[day][index][quarter].push(hourArr[j]);

        //calc avg per quarter
      }
    });
    console.log(resultByWeek);
    return resultByWeek;
    // Save data by quwarter hour
    //Then Compare current result with currebt quearter avg  - and then cimpare result with hourly avg - if higher then threshold - then notice the user
  } catch (e) {
    console.log("e", e);
  }
};

let createGraph = async () => {
  // let image = await createImage();
  let image = 2;
  return image;
};
let trafRequests = {
  newTrafficUpdate,
  getAllTrafUpdates,
  getTrafficUpdate,
  getTrafficRouteAvg,
  createGraph,
};
module.exports = trafRequests;
