const moment = require("moment"); // require
const resetPassExpiry = (number = 10, timeUnit = "minute") => {
  let newTime = moment().add(parseInt(number), timeUnit).toString();
  return newTime;
};
const validatePassExpiry = (time) => {
  time = moment(new Date(time));
  let expired = time.isBefore(moment());
  return expired;
};

let checkNewerUpdate = (dataItemDate, lastUpdateSaved) => {
  if (!lastUpdateSaved) {
    return true;
  }
  dataItemDate = moment(dataItemDate);
  lastUpdateSaved = moment(lastUpdateSaved);
  let after = dataItemDate.isAfter(lastUpdateSaved);
  return after;
};

const getDate = (date) => {
  if(date){

    return moment(new Date(date));
  }
  return moment()
};

const getDatesForDailyAvg = () => {
  try {
    // midnight
    let todayMidnight = moment();
    todayMidnight.set({ hour: 00, minute: 0, second: 0, millisecond: 0 });
    todayMidnight.toISOString();
    todayMidnight.format();
    //
    // before next midnight
    let tomrrowAlmostMidnight = moment();
    tomrrowAlmostMidnight.set({
      hour: 23,
      minute: 59,
      second: 59,
      millisecond: 0,
    });
    tomrrowAlmostMidnight.toISOString();
    tomrrowAlmostMidnight.format();
    let res = { $gte: todayMidnight, $lt: tomrrowAlmostMidnight };
    console.log("res", res);
    return res;
  } catch (e) {
    console.log("e", e);
    return "error";
  }
};
const momentFunctions = {
  resetPassExpiry,
  validatePassExpiry,
  getDatesForDailyAvg,
  getDate,
  checkNewerUpdate,
};
module.exports = momentFunctions;
