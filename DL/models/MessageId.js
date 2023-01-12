const mongoose = require("mongoose");

const MessageId = new mongoose.Schema(
  {
    chatId: {
      type: Number,
      required: true,
    },
    messageId: {
      type: Number,
      required: true,
    },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// TODO: import connect, create fake data and check CRUD for this data.
const MessageIdModel = mongoose.model("MessageId", MessageId);
module.exports = MessageIdModel;
