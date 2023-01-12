const express = require("express");
const app = express();
//production flags
let production = false; //means not in localhost
let prodGrab = true; //means that version of the grabber - to avoid conflict when grab runing online and localhost trying to grab also
let prodBot = false; //means that version of the grabber - to avoid conflict when grab runing online and localhost trying to grab also
const PORT = process.env.PORT || 3001;
const { Server } = require("socket.io");

if (!production) {
  require("dotenv").config();
}
const { dealWithMessage, activateDevBot } = require("./DL/bot/bot");
const router = require("./Routers");
const cors = require("cors");
const { createAllGrabCrons, deleteGraphPhotos } = require("./DL/cron/cron");
const { grabFromWaze } = require("./DL/puppeteer/grabFromWaze");
const {
  manageRouteAvg,
  analyzeTheData,
  getTrafficRouteAvgGeneral,
  getTrafficRouteAvgNew,
  getTrafficRoute,
} = require("./BL/trafficRouteLogic");
const { createDataChart } = require("./DL/chart/chart");
const { predictFromWaze } = require("./DL/puppeteer/grabFromWazePrediction");
// const io = new Server(4001, {
//   cors: "*",
// });

app.use(express.json());
app.use(cors({ origin: "*" }));
app.use("/api", router);

require("./DL/db")
  .connect()
  .then(() =>
    app.listen(PORT || 5000, async () => {
      console.log(`server is running => ${PORT || 5000}`);
      if (production && prodGrab) {
        createAllGrabCrons();
        // activateDevBot();
      }
      if (production && prodBot) {
        dealWithMessage();
      }
      if (!production) {
        // manageRouteAvg();
        // getTrafficRouteAvgNew({route:'63baa97f38081445ab4f0ba5'})
        // getTrafficRouteAvgGeneral({route:'63baa97f38081445ab4f0ba5'})
        activateDevBot();
        dealWithMessage();
        // deleteGraphPhotos()
        // analyzeTheData();
        // createAllGrabCrons();
        // grabFromWaze()
        // let data = await getTrafficRoute({ _id: "63bb0ea55944eebd34bd1357" });
        // predictFromWaze(true,data)
        // console.log(
          //   "path",
          
        //   await createDataChart(data)
        // );
      }
      // loadMainSocket(io),
      // dealWithMessage()
    })
  )
  .catch((e) => console.log("error", e));

module.exports = { app, production };
