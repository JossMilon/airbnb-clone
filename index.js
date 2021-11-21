const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");

//Initialize server
const app = express();
app.use(formidable());

//Connect DB
mongoose.connect("mongodb://localhost:27017/airbnb-clone");

//Importing routes
const userRoutes = require("./routes/user");
app.use(userRoutes);

app.all("*", (req, res) => {
  res.status(404).json({ error: "Page not found" });
});

app.listen(3000, () => {
  console.log("Server has started...");
});
