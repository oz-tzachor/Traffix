const express = require("express");
const app = express();
const PORT = process.env.PORT || 3001;
const { Server } = require("socket.io");

if (require("os").hostname().indexOf("local") > -1) {
  require("dotenv").config();
}
const { dealWithMessage } = require("./DL/bot/bot");
const router = require("./Routers");
const cors = require("cors");
const { createAllGrabCrons } = require("./DL/cron/cron");
const io = new Server(4001, {
  cors: "*",
});

app.use(express.json());
app.use(cors({ origin: "*" }));
app.use("/api", router);

require("./DL/db")
  .connect()
  .then(
    () =>
      app.listen(PORT || 5000, () =>
        console.log(`server is running => ${PORT || 5000}`)
      ),
      createAllGrabCrons(),
    loadMainSocket(io),
    dealWithMessage()
  )
  .catch((e) => console.log("error", e));

module.exports = { app, io };
