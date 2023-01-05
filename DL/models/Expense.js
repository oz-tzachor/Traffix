const mongoose = require("mongoose");

const Expense = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: String,
    default: new Date(),
  },
  budget: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Budget",
    required: true,
  },
  source: {
    type: String,
    required: true,
    enum: ["telegram", "web"],
    default: "web",
  },
});
module.exports = mongoose.model("Expense", Expense);
