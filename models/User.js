const mongoose = require("mongoose");

const User = mongoose.model("User", {
  account: {
    photo: {
      url: {
        type: String,
        default: "",
      },
      picture_id: {
        type: String,
        default: "",
      },
    },
    username: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: String,
  },
  email: {
    type: String,
    unique: true,
  },
  rooms: {
    type: Array,
    default: [],
  },
  token: String,
  hash: String,
  salt: String,
});

module.exports = User;
