const express = require("express");
const app = express();
//production flags
let production = false; //means not in localhost
let prodGrab = true; //means that version of the grabber - to avoid conflict when grab runing online and localhost trying to grab also
let prodBot = false; //means that version of the grabber - to avoid conflict when grab runing online and localhost trying to grab also
const PORT = process.env.PORT || 3001;
const { Server } = require("socket.io");
const moment = require("moment");
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
const cluster = require("cluster");
// const io = new Server(4001, {
//   cors: "*",
// });

app.use(express.json());
app.use(cors({ origin: "*" }));
app.use("/api", router);
let botStarted = false;
// if (cluster.isMaster) {
//   if(!botStarted){
//     botStarted=true;
//   dealWithMessage();
//   }
//   const totalCPUs = require("os").cpus().length;
//   for (let i = 0; i < production ? totalCPUs : 1; i++) {
//     cluster.fork();
//   }

//   cluster.on("online", (worker) => {
//     console.log("Worker " + worker.process.pid + " is online.");
//   });

//   cluster.on("exit", function (worker, code, signal) {
//     console.log("Worker " + worker.process.pid + " exited with code: " + code);
//     console.log("Starting a new worker");
//     cluster.fork();
//   });
// } else {
  require("./DL/db")
    .connect()
    .then(() => {
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
          // activateDevBot();
          // dealWithMessage();
          // deleteGraphPhotos()
          // analyzeTheData();
          // createAllGrabCrons();
          // grabFromWaze()
          // let data = await getTrafficRoute({ _id: "63baa83c06b795747ea8f262" });
          // predictFromWaze()
          // console.log(
          //   "path",
          //   await createDataChart(data)
          // );
        }
        // loadMainSocket(io),
        // dealWithMessage()
      });
    })
    .catch((e) => console.log("error", e));
// }

module.exports = { app, production };
