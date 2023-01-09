const mongoose = require("mongoose");

const TelegramUser = new mongoose.Schema(
  {
    chatId: {
      type: Number,
      required: true,
    },
    email: {
      type: String,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    updates: [
      {
        route: { type: mongoose.SchemaTypes.ObjectId, ref: "TrafficRoute" },
        fromHour: { type: Date, required: true },
        toHour: { type: Date, required: true },
      },
    ],
    alerts: [
      {
        route: { type: mongoose.SchemaTypes.ObjectId, ref: "TrafficRoute" },
        fromHour: { type: Date, required: true },
        toHour: { type: Date, required: true },
      },
    ],
    state: {
      type: String,
      required: true,
      default: "login_initial",
    },
    // expenseDetails: {
    //   amount: { type: Number, required: true },
    //   description: { type: String },
    //   budgetId: {
    //     type: mongoose.SchemaTypes.ObjectId,
    //     ref: "Budget",
    //     required: true,
    //   },
    //   budgetName: {
    //     type: String,
    //     required: true,
    //   },
    // },
    authenticated: {
      type: Boolean,
      required: true,
      default: false,
    },
    authCode: {
      type: String,
    },
    processStartTime: {
      type: Number,
      required: true,
      default: -1,
    },
  },
  { timestamps: true }
);

// TODO: import connect, create fake data and check CRUD for this data.
const TelegramUserModel = mongoose.model("TelegramUser", TelegramUser);
module.exports = TelegramUserModel;
