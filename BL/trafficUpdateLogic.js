const trafficUpdateController = require("../DL//Controllers/trafficUpdateController");
// const { createImage } = require("../DL/chart/chart");

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
  try {
    let { zip } = filter;
    let sum = 0;
    let counter = 0;
    let data = await trafficUpdateController.read(filter);
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      if (element.zip === zip) {
        sum += Number(element.time);
        counter++;
      }
    }
    let avg = sum / counter;
    console.log("sum", sum);
    console.log("counter", counter);
    console.log("avg", avg);
    return avg;
  } catch (e) {
    console.log("e", e);
  }
};

let createGraph = async () => {
  // let image = await createImage();
  let image = 2
  return image
};
let trafRequests = {
  newTrafficUpdate,
  getAllTrafUpdates,
  getTrafficUpdate,
  getTrafficRouteAvg,
  createGraph,
};
module.exports = trafRequests;
