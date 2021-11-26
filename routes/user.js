const express = require("express");
const mongoose = require("mongoose");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");
const router = express.Router();
const cloudinary = require("cloudinary").v2;

//Importing middlewares
const userAuthenticated = require("../middlewares/userAuthenticated");

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
      account: {
        username: username,
        name: name,
        description: description,
      },
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
          username: userFound.account.username,
          description: userFound.account.description,
          name: userFound.account.name,
        });
      }
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/user/upload_picture/:id", userAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const result = await cloudinary.uploader.upload(req.files.picture.path, {
      folder: `/airbnb/users/${user.id}`,
    });
    user.account.photo.url = result.secure_url;
    user.account.photo.picture_id = result.public_id;
    await user.save();
    res.status(200).json({
      account: user.account,
      _id: user.id,
      email: user.email,
      rooms: user.rooms,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete(
  "/user/delete_picture/:id",
  userAuthenticated,
  async (req, res) => {
    try {
      //Not sure how to delete with picture_id
      //So I've deleted with public_id and destroy method
      const user = await User.findById(req.params.id);
      await cloudinary.uploader.destroy(user.account.photo.picture_id);
      user.account.photo = {};
      await user.save();
      res.status(200).json({ message: "Photo deleted" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("id account rooms");
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
