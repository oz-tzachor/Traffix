const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: String,
    required: true,
    default: new Date(),
  },
  defaultDashboard: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Dashboard",
  },
  active: { type: Boolean, default: true },
  deletedHimself: { type: Boolean },
  deletedByAdmin: { type: Boolean },
});

module.exports = mongoose.model("User", UserSchema);
