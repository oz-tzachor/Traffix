const express = require("express");
const router = express.Router();
const dashboardLogic = require("../BL/dashboardLogic");
const { decrypt, encrypt } = require("../DL/crypto-js/encrypt");
const { mail } = require("../DL/mails/mails");

router.post("/new", async (req, res) => {
  req.body.createdBy = req.user._id;
  const newDashboard = await dashboardLogic.createDashboard(req.body);
  res.send(newDashboard);
});
router.get("/getOne/:_id", async (req, res) => {
  const dashboards = await dashboardLogic.getDashboard({ _id: req.params._id });
  res.send(dashboards);
});
router.get("/all", async (req, res) => {
  const dashboards = await dashboardLogic.getAllDashboards({});
  res.send(dashboards);
});

module.exports = router;
