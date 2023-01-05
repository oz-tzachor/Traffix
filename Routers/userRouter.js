const express = require("express");
const router = express.Router();
const userLogic = require("../BL/userLogic");
const { updateSocket } = require("../DL/sockets/socket");
const { auth } = require("../Middleware/auth");

router.post("/register", async (req, res) => {
  const newUser = await userLogic.createNewUser(req.body);
  res.send(newUser);
});

router.post("/login", async (req, res) => {
  generateClassId
  console.log("start login");
  try {
    const users = await userLogic.login(req.body);
    res.send(users);
  } catch (e) {
    res.status(e.code).send(e);
  }
});
router.get("/getusers", auth, async (req, res) => {
  try {
    const users = await userLogic.getAllUsers();
    res.send(users);
  } catch (e) {
    res.status(e.code).send(e);
  }
});

router.post("/getUserDetails", auth, async (req, res) => {
  try {
    const user = await userLogic.getUserDetails(req.user._id);
    res.send(user);
  } catch (e) {
    res.status(e.code).send(e);
  }
});
router.post("/updateDefaultDashboard", auth, async (req, res) => {
  try {
    const user = await userLogic.updateDefaultDashboard(
      req.user._id,
      req.body.dashboard
    );
    res.send(user);
  } catch (e) {
    res.status(e.code).send(e);
  }
});
router.post("/forget-password", async (req, res) => {
  try {
    const response = await userLogic.forgetPassword(req.body.email);
    res.send(response);
  } catch (e) {
    res.status(e.code).send(e);
  }
});
router.post("/reset-password", async (req, res) => {
  try {
    const response = await userLogic.resetPassword(req.body);
    res.send(response);
  } catch (e) {
    res.status(e.code).send(e);
  }
});

module.exports = router;
