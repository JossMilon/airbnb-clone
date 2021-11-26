const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const cloudinary = require("cloudinary").v2;

//Importing middlewares
const isAuthenticated = require("../middlewares/isAuthenticated");
const roomUserAuthenticated = require("../middlewares/roomUserAuthenticated");

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
    const owner = await User.findById(req.user.id);
    owner.rooms.push(newRoom.id);
    await newRoom.save();
    await owner.save(); //Saving the new room created
    res.status(200).json(newRoom);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/rooms", async (req, res) => {
  try {
    //building filter system (title and price range)
    const filters = {};
    if (req.query.title) {
      const title = new RegExp(req.query.title, "i");
      filters.title = title;
    }
    if (req.query.priceMin) {
      filters.price = { $gte: req.query.priceMin };
    }
    if (req.query.priceMax) {
      if (req.query.priceMin) {
        filters.price = {
          $gte: req.query.priceMin,
          $lte: req.query.priceMax,
        };
      } else {
        filters.price = { $lte: req.query.priceMax };
      }
    }
    //building sorting system
    let sorting = {};
    if (req.query.sort) {
      const sortType = req.query.sort.replace("price-", "");
      sorting = { price: sortType };
    }
    //building limit and skip for pagination
    let limit = 3;
    if (req.query.limit) {
      limit = Number(req.query.limit);
    }
    let skip = 0;
    if (req.query.page) {
      skip = Number((req.query.page - 1) * limit);
    }
    const allRooms = await Room.find(filters)
      .sort(sorting)
      .skip(skip)
      .limit(limit)
      .select("id title price user location");
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

router.put("/room/update/:id", roomUserAuthenticated, async (req, res) => {
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

router.delete("/room/delete/:id", roomUserAuthenticated, async (req, res) => {
  try {
    const roomToDelete = await Room.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Room deleted" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post(
  "/room/upload_picture/:id",
  roomUserAuthenticated,
  async (req, res) => {
    try {
      const roomToAddPhotoTo = await Room.findById(req.params.id);
      const allPhotos = roomToAddPhotoTo.photos;
      let allPhotosCounter = allPhotos.length;
      for (let photo in req.files) {
        if (allPhotosCounter < 5) {
          const result = await cloudinary.uploader.upload(
            req.files[photo].path,
            {
              folder: `/airbnb/rooms/${roomToAddPhotoTo.id}`,
            }
          );
          allPhotos.push({
            url: result.secure_url,
            picture_id: result.public_id,
          });
          allPhotosCounter++;
        }
      }
      roomToAddPhotoTo.photos = allPhotos;
      await roomToAddPhotoTo.save();
      res.status(200).json("Upload nouvelles photos");
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

router.delete(
  "/room/delete_picture/:id",
  roomUserAuthenticated,
  async (req, res) => {
    try {
      const roomToDeletePictureFrom = await Room.findById(req.params.id);
      const pictureToDelete = req.fields.picture_id;
      const allPhotos = roomToDeletePictureFrom.photos;
      const remainingPhotos = [];
      for (let i = 0; i < allPhotos.length; i++) {
        if (allPhotos[i].picture_id !== pictureToDelete) {
          remainingPhotos.push(allPhotos[i]);
        }
      }
      roomToDeletePictureFrom.photos = remainingPhotos;
      await cloudinary.uploader.destroy(pictureToDelete);
      await roomToDeletePictureFrom.save();
      res.status(200).json({ message: "Picture deleted" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

router.get("/user/rooms/:id", async (req, res) => {
  try {
    const ownerRooms = [];
    const owner = await User.findById(req.params.id);
    if (!owner) {
      res.status(400).json({ error: "No user corresponding to this ID" });
    } else {
      const rooms = owner.rooms;
      for (let i = 0; i < rooms.length; i++) {
        const roomToAdd = await Room.findById(rooms[i]);
        ownerRooms.push(roomToAdd);
      }
      res.status(200).json(ownerRooms);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
