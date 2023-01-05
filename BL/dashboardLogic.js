const dashboardController = require("../DL/Controllers/DashboardController");
exports.createDashboard = async (newDashboard) => {
  let nameExist = await dashboardController.readOne({
    name: newDashboard.name,
  });
  if (nameExist) {
    return { message: "Name already exist,please select new name" };
  }
  return dashboardController.create(newDashboard);
};
exports.getDashboard = (filter) => {
  return dashboardController.readOne({ filter });
};
exports.getAllDashboards = () => {
  return dashboardController.read({});
};
