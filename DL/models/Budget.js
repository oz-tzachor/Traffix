const mongoose = require("mongoose");

const BudgetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  max: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: String,
    required: true,
    default: new Date(),
  },
  createdBy: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "User",
  },
  dashboard: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Dashboard",
  },
  expenses: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Expense",
    },
  ],
});

module.exports = mongoose.model("Budget", BudgetSchema);
