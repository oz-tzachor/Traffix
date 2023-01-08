const express = require("express");
const router = express.Router();
const traffRouteLogic = require("../BL/trafficRouteLogic");
// let chatId = 160151970;
const { sendMessage, sendImage } = require("../DL/bot/bot");
router.post("/new", async (req, res) => {
  console.log("new", req.body);
  try {
    const newTraf = await traffRouteLogic.newTraffRoute(req.body);
    res.send(newTraf);
  } catch (e) {
    res.send(e);
  }
});
//
router.post("/avg", async (req, res) => {
  const avg = await traffRouteLogic.getTrafficRouteAvg({
    zip: req.body.zip,
  });
  // sendImage(chatId, newGraph);
  res.send(avg);
});
//
router.post("/update/:routeZip", async (req, res) => {
  // console.log('new',req.body);
  try {
    const newTraf = await traffRouteLogic.updateRouteDetails(
      { zip: req.params.routeZip },
      req.body
    );
    res.send(newTraf);
  } catch (e) {
    res.send(e);
  }
});
module.exports = router;
