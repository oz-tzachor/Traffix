const mongoose = require("mongoose");
exports.connect = () => {
  return new Promise(async (resolve, reject) => {
    try {
      await mongoose.connect(
        process.env.MONGO_URL,
        { useNewUrlParser: true },
        (err) => {
          if (err) {
            reject(err);
            throw err;
          }
          console.log("DB connection success");
          resolve();
        }
      );
    } catch (e) {
      console.log("error mpngoose:", e);
      reject(e)
    }
  });
};
