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
    favRoutes: [{ type: mongoose.SchemaTypes.ObjectId, ref: "TrafficRoute" }],
    updates: [
      {
        route: { type: mongoose.SchemaTypes.ObjectId, ref: "TrafficRoute" },
        hour: { type: String, required: true },
      },
    ],
    alerts: [
      {
        route: { type: mongoose.SchemaTypes.ObjectId, ref: "TrafficRoute" },
        fromHour: { type: String, required: true },
        toHour: { type: String, required: true },
      },
    ],
    state: {
      type: String,
      required: true,
      default: "login_initial",
    },
    lastStateUpdate: {
      type: Date,
      required: true,
      default: new Date(),
    },
    storeDetails: {
      scheduleHour: { type: String },
      route: {
        type: String,
      },
      fromHour: {
        type: String,
      },
      toHour: {
        type: String,
      },
      routeFrom: {
        type: String,
      },
      routeTo: {
        type: String,
      },
    },
    authenticated: {
      type: Boolean,
      required: true,
      default: false,
    },
    isAdmin: {
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
