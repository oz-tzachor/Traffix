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
const momentFunctions = { resetPassExpiry, validatePassExpiry };
module.exports = momentFunctions;
