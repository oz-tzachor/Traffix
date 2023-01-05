const express = require("express");
const router = express.Router();
const expenseLogic = require("../BL/expenseLogic");

router.post("/new", async (req, res) => {
  req.body.createdBy = req.user._id;
  const newExpense = await expenseLogic.createNewExpense(req.body);
  res.send(newExpense);
});
router.get("/", async (req, res) => {
  const users = await expenseLogic.getExpense();
  res.send(users);
});
module.exports = router;
