const express = require("express");
const router = express.Router();
const budgetLogic = require("../BL/budgetLogic");

router.post("/new", async (req, res) => {
  req.body.createdBy = req.user._id;
  const newBudget = await budgetLogic.newBudget(req.body);
  res.send(newBudget);
});
router.post("/all", async (req, res) => {
  console.log("req body", req.body);
  const budgets = await budgetLogic.getAllBudgets(req.body.dashboard);
  res.send(budgets);
});
module.exports = router;
