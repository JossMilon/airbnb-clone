const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const isAuthenticated = require("../middlewares/isAuthenticated");
const isOwnerAuthenticated = require("../middlewares/isOwnerAuthenticated");

//Importing models
const User = require("../models/User");
const Room = require("../models/Room");

router.post("/room/publish", isAuthenticated, async (req, res) => {
  try {
    const { title, description, price, location } = req.fields;
    const newRoom = new Room({
      title: title,
      description: description,
      price: price,
      location: [location.lat, location.lng],
      user: req.user,
    });
    await newRoom.save();
    res.status(200).json(newRoom);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/rooms", async (req, res) => {
  try {
    const allRooms = await Room.find().select("id title price user location");
    res.status(200).json(allRooms);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/rooms/:id", async (req, res) => {
  try {
    const targetRoom = await Room.findById(req.params.id).populate({
      path: "user",
      select: "id email username name descriptio",
    });
    res.status(200).json(targetRoom);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/room/update/:id", isOwnerAuthenticated, async (req, res) => {
  try {
    const roomToUpdate = await Room.findById(req.params.id);
    if (Object.entries(req.fields).length === 0) {
      //If no parameter to modify
      res
        .status(400)
        .json({ error: "Please specify the parameters to modify" });
    } else {
      //Else loop through modifications to update room
      for (let prop in req.fields) {
        roomToUpdate[prop] = req.fields[prop];
      }
      await roomToUpdate.save();
      res.status(200).json(roomToUpdate);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/room/delete/:id", isOwnerAuthenticated, async (req, res) => {
  try {
    const roomToDelete = await Room.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Room deleted" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
