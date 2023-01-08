const express = require("express");
const app = express();
//
let production = true; //means not in localhost
let prodGrab = true; //means that version of the grabber - to avoid conflict when grab runing online and localhost trying to grab also
const PORT = process.env.PORT || 3001;
const { Server } = require("socket.io");

if (!production) {
  require("dotenv").config();
}
const { dealWithMessage } = require("./DL/bot/bot");
const router = require("./Routers");
const cors = require("cors");
const { createAllGrabCrons,activateAvgCrons } = require("./DL/cron/cron");
const { grabFromWaze } = require("./DL/puppeteer/grabFromWaze");
const io = new Server(4001, {
  cors: "*",
});

app.use(express.json());
app.use(cors({ origin: "*" }));
app.use("/api", router);

require("./DL/db")
  .connect()
  .then(() =>
    app.listen(PORT || 5000, () => {
      console.log(`server is running => ${PORT || 5000}`);
      if (production && prodGrab) {
        createAllGrabCrons();
      }
      if (production && !prodGrab) {
        dealWithMessage();
      }
      // loadMainSocket(io),
      // dealWithMessage()
    })
  )
  .catch((e) => console.log("error", e));

module.exports = { app, io };
