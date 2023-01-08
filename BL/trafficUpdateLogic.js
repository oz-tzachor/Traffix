const { object } = require("joi");
const TrafficUpdate = require("../DL/models/TrafficUpdate");

const trafficUpdateController = require("../DL//Controllers/trafficUpdateController");
// const { createImage } = require("../DL/chart/chart");

const newTrafficUpdate = async (newTrafficUpdateDetails) => {
  let newTraf = await trafficUpdateController.create(newTrafficUpdateDetails);
  return newTraf;
};
const getAllTrafUpdates = async (filter) => {
  return await trafficUpdateController.read(filter);
};
const getTrafficUpdate = async (filter, options) => {
  return await trafficUpdateController.readOne(filter, options);
};

let addDayToAll = async () => {
  let allData = await trafficUpdateController.read({});

  let retry = () => {
    ind++;
    start(retry)
  };
  let start = async (callback) => {
    if (ind <= allData.length) {
      await trafficUpdateController.update(
        { _id: [id[ind]] },
        { dayOfTheWeek: days[ind] }
      );
      callback();
    } else {
      console.log("all updated");
      return;
    }
  };
  let days = [];
  let id = [];
  let ind = 0;
  allData.map((item, index) => {
    let dayOfTheWeek = new Date(item.dateOfUpdate).getDay();
    days.push(dayOfTheWeek);
    id.push(item._id);
    if (index === allData.length - 1) {
      console.log("mao over,can start updating");
      console.log("days", days.length);
      console.log("id", id.length);
      // start(retry);
    }
  });
  //

  //
  // start(callBack);
};
let fixData = async () => {
  try {
    let dates = [];
    let ids = [];
    let allData = await trafficUpdateController.read({});
    let duplicates = 0;
    console.log("All data", allData.length);
    allData.map((data) => {
      if (!dates.includes(data.dateOfUpdate)) {
        dates.push(data.dateOfUpdate);
      } else {
        ids.push(data._id);
        duplicates++;
      }
    });
    console.log("dates", dates.length);
    console.log("ids", ids.length);
    console.log("dup", duplicates);

    if (ids.length > 0) {
      ids.map(async (id) => {
        try {
          // await TrafficUpdate.remove({ _id: id });
        } catch (e) {
          console.log("e", e);
        }
      });
    }
    return `${ids.length} deleted suuccssfully`;
  } catch (e) {
    return e;
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
  createGraph,
  fixData,
  addDayToAll,
};
module.exports = trafRequests;
