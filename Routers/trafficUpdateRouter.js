const express = require("express");
const router = express.Router();
const trafficUpdateLogic = require("../BL/trafficUpdateLogic");
let chatId = 160151970;
const { sendMessage, sendImage } = require("../DL/bot/bot");
router.post("/new", async (req, res) => {
  const newTraf = await trafficUpdateLogic.newBudget(req.body);
  res.send(newTraf);
});
router.post("/chart", async (req, res) => {
  const newGraph = await trafficUpdateLogic.createGraph();
  sendImage(chatId, newGraph);
  res.send(newGraph);
});
router.post("/avg", async (req, res) => {
  const avg = await trafficUpdateLogic.getTrafficRouteAvg({zip:req.body.zip});
  // sendImage(chatId, newGraph);
  res.send(avg);
});
router.post("/all", async (req, res) => {
  console.log("req body", req.body);
  const trafs = await trafficUpdateLogic.getAllTrafUpdates(req.body);
  res.send(trafs);
});
module.exports = router;
