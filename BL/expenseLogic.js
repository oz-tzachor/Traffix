const expenseController = require("../DL/Controllers/ExpenseController");
const budgetController = require("../DL/Controllers/BudgetController");
const { updateSocket } = require("../DL/sockets/socket");

exports.createNewExpense = async (newExpenseDetails) => {
  let newExpense = await expenseController.create(newExpenseDetails);
  const budgetForUpdate = await budgetController.readOne({
    _id: newExpenseDetails.budget,
  });
  const elmtToPush = newExpense._id;
  budgetForUpdate.expenses.push(elmtToPush);
  budgetForUpdate.save();
  updateSocket();
  return newExpense;
};
exports.getExpense = () => {
  return expenseController.read({});
};
