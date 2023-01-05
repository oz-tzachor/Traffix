const mongoose = require("mongoose");

const UserTrainReadingSchema = new mongoose.Schema({
  chatId: {
    type: Number,
    required: true,
  },
  userId: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
    ref: "User",
  },
  defaultDashboardName: {
    type: String,
    required: true,
  },
  defaultDashboardTelegram: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Dashboard",
  },
  state: {
    type: String,
    required: true,
  },
  createdAt: {
    type: String,
    default: new Date(),
  },
  updatedAt: {
    type: String,
    default: new Date(),
  },
  budgetDetails: {
    name: { type: String, required: true },
    max: { type: Number, required: true },
  },
  expenseDetails: {
    amount: { type: Number, required: true },
    description: { type: String },
    budgetId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Budget",
      required: true,
    },
    budgetName: {
      type: String,
      required: true,
    },
  },
  authenticated: {
    type: Boolean,
    required: true,
    default: false,
  },
  processStartTime: {
    type: Number,
    required: true,
    default: -1,
  },
});

// TODO: import connect, create fake data and check CRUD for this data.
const UserTrainReadingModel = mongoose.model(
  "userTrainReading",
  UserTrainReadingSchema
);
module.exports = UserTrainReadingModel;
