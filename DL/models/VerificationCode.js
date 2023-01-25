const mongoose = require("mongoose");

const VerificationCode = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "TelegramUser",
      required: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// TODO: import connect, create fake data and check CRUD for this data.
const VerificationCodeModel = mongoose.model(
  "VerificationCode",
  VerificationCode
);
module.exports = VerificationCodeModel;
