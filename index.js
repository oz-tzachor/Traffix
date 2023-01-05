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
const { createCron } = require("./DL/cron/cron");
const io = new Server(4001, {
  cors: "*",
});

app.use(express.json());
app.use(cors({ origin: "*" }));
app.use("/api", router);

let ports = [3001, 3002, 3002, 3002, 3005, 4002, 4002, 4004];
let randomPort = ports[Math.floor(Math.random() * ports.length)];
console.log("port", randomPort);
require("./DL/db")
  .connect()
  .then(
    () =>
      app.listen(PORT || 5000, () =>
        console.log(`server is running => ${PORT || 5000}`)
      ),
    createCron(),
    // loadMainSocket(io),
    dealWithMessage()
  )
  .catch((e) => console.log("error", e));

module.exports = { app, io };
