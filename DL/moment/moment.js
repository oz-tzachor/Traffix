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

const getDatesForDailyAvg = () => {
  try {
    // midnight
    let todayMidnight = moment();
    todayMidnight.set({ hour: 20, minute: 0, second: 0, millisecond: 0 });
    todayMidnight.toISOString();
    todayMidnight.format();
    //
    // before next midnight
    let tomrrowAlmostMidnight = moment();
    tomrrowAlmostMidnight.set({
      hour: 22,
      minute: 59,
      second: 59,
      millisecond: 0,
    });
    tomrrowAlmostMidnight.toISOString();
    tomrrowAlmostMidnight.format();
    return { $gte: todayMidnight, $lt: tomrrowAlmostMidnight };
  } catch (e) {
    console.log("e", e);
    return "error";
  }
};
const momentFunctions = {
  resetPassExpiry,
  validatePassExpiry,
  getDatesForDailyAvg,
};
module.exports = momentFunctions;
