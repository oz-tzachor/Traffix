const mongoose = require("mongoose");

const DashboardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  createdBy: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: String,
    default: new Date(),
  },
  collabrates: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
    },
  ],
  budgets: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Budget",
    },
  ],
});

module.exports = mongoose.model("Dashboard", DashboardSchema);
