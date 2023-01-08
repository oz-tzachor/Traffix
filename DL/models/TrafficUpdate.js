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
    },
    route: { type: mongoose.SchemaTypes.ObjectId, ref: "TrafficRoute" },
    source: { type: String, default: "pkk" },
    dateOfUpdate: { type: String, required: true },
    dayOfTheWeek: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TrafficUpdate", TrafficUpdate);
