const express = require("express");
const mongoose = require("mongoose");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");
const router = express.Router();

//Importing models
const User = require("../models/User");
const { builtinModules } = require("module");

router.post("/user/signup", async (req, res) => {
  try {
    const { email, username, name, description } = req.fields;
    //Generating all security var
    const salt = uid2(16);
    const hash = SHA256(req.fields.password + salt).toString(encBase64);
    const token = uid2(16);
    const newUser = new User({
      email: email,
      username: username,
      name: name,
      description: description,
      hash: hash,
      salt: salt,
      token: token,
    });
    await newUser.save();
    res.status(200).json({
      id: newUser.id,
      token: newUser.token,
      email: newUser.emaiil,
      username: newUser.username,
      description: newUser.description,
      name: newUser.name,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
