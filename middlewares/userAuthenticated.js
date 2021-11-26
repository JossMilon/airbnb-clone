const User = require("../models/User");

const userAtuhenticated = async (req, res, next) => {
  const token = req.headers.authorization.replace("Bearer ", "");
  const user = await User.findById(req.params.id);
  if (user && token === user.token) {
    next();
  } else {
    res.status(401).json({ error: "User is unauthorized for modification" });
  }
};

module.exports = userAtuhenticated;
