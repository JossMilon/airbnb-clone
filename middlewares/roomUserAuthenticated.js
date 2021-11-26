//Importing models
const User = require("../models/User");
const Room = require("../models/Room");

const roomUserAuthenticated = async (req, res, next) => {
  const token = req.headers.authorization.replace("Bearer ", "");
  if (req.params.id) {
    const roomToUpdate = await Room.findById(req.params.id).populate({
      path: "user",
      select: "token",
    });
    if (!roomToUpdate) {
      res.status(400).json({ error: "The room doesn't exist" });
    } else {
      if (token === roomToUpdate.user.token) {
        next();
      } else {
        res
          .status(401)
          .json({ error: "User is unauthorized for modification" });
      }
    }
  } else {
    res.status(400).json({ error: "Missing ID" });
  }
};

module.exports = roomUserAuthenticated;
