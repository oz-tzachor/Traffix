const mongoose = require("mongoose");

const TrafficRoute = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    zip: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TrafficRoute", TrafficRoute);
