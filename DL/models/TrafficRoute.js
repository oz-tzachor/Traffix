const mongoose = require("mongoose");

const TrafficRoute = new mongoose.Schema(
  {
    from: {
      type: String,
      required: true,
    },
    to: {
      type: String,
      required: true,
    },
    zip: {
      type: Number,
    },
    wazeUrl: {
      type: String,
      uniqe:true
    },
    avgByDays: {},
    predictByDays: {},
    lastAvgUpdate: { type: Date },
    type: { type: String, enum: ["waze", "pkk"], default: "waze" },
    isTrafficJam: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: {} }
);

module.exports = mongoose.model("TrafficRoute", TrafficRoute);

let avgBuild = {};
