const express = require("express");
const { auth } = require("../Middleware/auth");
const mainRouter = express.Router();

const userRouter = require("./userRouter");
const trafUpdateRouter = require("./trafficUpdateRouter");
const trafRouteRouter = require("./trafficRouteRouter");

mainRouter.use("/traffUpdate", trafUpdateRouter);
mainRouter.use("/traffRoute", trafRouteRouter);
// mainRouter.use("/user", userRouter);

module.exports = mainRouter;
