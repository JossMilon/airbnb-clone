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
    //Verify if any information is missing
    if (!email || !username || !name || !req.fields.password) {
      res.status(400).json({ error: "Missing parameters." });
    }
    //Verify if user is already existing
    const isUserAlreadyInDB = await User.findOne({ email: email });
    if (isUserAlreadyInDB) {
      res.status(400).json({ error: "This email already has an account." });
    }
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

router.post("/user/login/", async (req, res) => {
  try {
    const { email, password } = req.fields;
    const userFound = await User.findOne({ email: email });

    if (!userFound) {
      res.status(400).json({ error: "Email not found" });
    } else {
      const hashFromUserLogin = SHA256(password + userFound.salt).toString(
        encBase64
      );
      if (userFound.hash !== hashFromUserLogin) {
        res.status(400).json({ error: "Wrong password" });
      } else {
        res.status(200).json({
          _id: userFound.id,
          token: userFound.token,
          email: userFound.email,
          username: userFound.username,
          description: userFound.description,
          name: userFound.name,
        });
      }
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
