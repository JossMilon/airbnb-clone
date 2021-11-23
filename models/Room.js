const mongoose = require("mongoose");
const User = require("./User");

const Room = mongoose.model("Room", {
  title: {
    type: String,
    required: true,
  },
  description: String,
  photos: {
    type: Array,
    default: [],
  },
  price: {
    type: Number,
    required: true,
  },
  location: {
    type: Array,
    default: [],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
  },
});

module.exports = Room;
