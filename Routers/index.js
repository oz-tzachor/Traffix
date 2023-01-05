const express = require("express");
const { auth } = require("../Middleware/auth");
const mainRouter = express.Router();

const userRouter = require("./userRouter");
const dashboardRouter = require("./dashboardRouter");
const budgetRouter = require("./budgetRouter");
const expenseRouter = require("./expenseRouter");
const testRouter = require("./testRouter");
const trafRouter = require("./trafficUpdateRouter");

mainRouter.use("/traf", trafRouter);
// mainRouter.use("/user", userRouter);
// mainRouter.use("/dashboard", auth, dashboardRouter);
// mainRouter.use("/budget", auth, budgetRouter);
// mainRouter.use("/expense", auth, expenseRouter);
// mainRouter.use("/test", testRouter);

module.exports = mainRouter;
