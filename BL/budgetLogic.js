const budgetController = require("../DL//Controllers/BudgetController");
const dashboardController = require("../DL/Controllers/DashboardController");
const { updateSocket } = require("../DL/sockets/socket");
exports.newBudget = async (newBudgetDetails) => {
  let budgetExist = await budgetController.readOne({
    name: newBudgetDetails.name,
  });
  if (budgetExist) {
    return { message: "Name already exist,please select new name" };
  }

  let newBudget = await budgetController.create(newBudgetDetails);
  const dashboardForUpdate = await dashboardController.readOne({
    _id: newBudgetDetails.dashboard,
  });
  console.log(dashboardForUpdate);
  const elmtToPush = newBudget._id;
  dashboardForUpdate.budgets.push(elmtToPush);
  dashboardForUpdate.save();
  updateSocket();
  return newBudget;
};
exports.getAllBudgets = (dashboard) => {
  return budgetController.read({ dashboard });
};
exports.getBudget = () => {
  return budgetController.readOne({});
};
