const mongoose = require("mongoose");

const User = mongoose.model("User", {
  email: {
    type: String,
    unique: true,
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
  token: String,
  hash: String,
  salt: String,
});

module.exports = User;
