// const { io } = require("../../index");
let localIo;
const loadMainSocket = (io) => {
  localIo = io;
  localIo.on("connection", (socket) => {
    console.log("User connected");
  });
};

const updateSocket = () => {
  console.log("sending");
  localIo?.emit("getBudgets", { message: "New message from server file" });
};
module.exports = { updateSocket, loadMainSocket };
