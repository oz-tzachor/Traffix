const mongoose = require("mongoose");

const TrafficUpdate = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    zip: {
      type: Number,
      required: true,
    },
    dateOfUpdate: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TrafficUpdate", TrafficUpdate);
