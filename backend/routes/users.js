const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { User, validate } = require("../models/user");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// REGISTER USER (Add User)
router.post("/add", async (req, res) => {
  try {
    // Destructure the mobile field along with other fields
    const { name, email, mobile, password, dob, gender, expectedRole } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user including mobile
    const newUser = new User({
      name,
      email,
      mobile, // new field
      password: hashedPassword,
      dob,
      gender,
      expectedRole
    });

    const userdetails = await newUser.save();

    return res.status(200).json({
      message: "User Registered Successfully",
      data: userdetails._id
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error Registering User", error: err.message });
  }
});

// GET ALL USERS
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching users", error: err.message });
  }
});

// UPDATE USER
router.put("/update/:id", async (req, res) => {
  const userID = req.params.id;
  const { field, value } = req.body;

  try {
    if (field === "password") {
      const hashedPassword = await bcrypt.hash(value, 10);
      await User.findByIdAndUpdate(userID, { [field]: hashedPassword });
    } else {
      await User.findByIdAndUpdate(userID, { [field]: value });
    }

    res.status(200).json({ message: "User Updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error Updating User", error: err.message });
  }
});

// DELETE USER
router.delete("/delete/:id", async (req, res) => {
  const userID = req.params.id;
  const { currentPassword, requesterId } = req.body; // 👈 add requesterId

  try {
    const user = await User.findById(userID);
    if (!user) return res.status(404).json({ message: "User Not Found" });

    // If deleting own account, require password
    if (userID === requesterId) {
      const validPassword = await bcrypt.compare(currentPassword, user.password);
      if (!validPassword) return res.status(401).json({ message: "Incorrect Password" });
    }

    await User.findByIdAndDelete(userID);
    res.status(200).json({ message: "User Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error Deleting User", error: err.message });
  }
});

//update Password
router.put("/reset-password", async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;

  try {
      const user = await User.findOne({ email });
      if (!user) {
          return res.status(404).json({ message: "User not found with this email." });
      }

      // Compare current password with database hashed password
      const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordMatch) {
          return res.status(400).json({ message: "Incorrect current password." });
      }

      // If matched, update new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      res.status(200).json({ message: "Password updated successfully!" });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error resetting password." });
  }
});

// FORGOT Password (No Current Password)
router.put("/forgot-password", async (req, res) => {
  const { email, newPassword } = req.body;

  try {
      const user = await User.findOne({ email });
      if (!user) {
          return res.status(404).json({ message: "User not found with this email." });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      res.status(200).json({ message: "Password updated successfully!" });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error resetting password." });
  }
});




// GET USER BY ID
router.get("/get/:id", async (req, res) => {
  const userID = req.params.id;

  try {
    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error Fetching User", error: err.message });
  }
});

// Create uploads folder if not exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "profileImage-" + uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Upload route
router.post("/upload-image", upload.single("profileImage"), async (req, res) => {
  try {
    const userId = req.body.userId;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No image file uploaded." });
    }

    if (!userId) {
      return res.status(400).json({ message: "User ID missing in form data." });
    }

    const relativePath = `/uploads/${file.filename}`;
const updatedUser = await User.findByIdAndUpdate(userId, { profileImage: relativePath }, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // Return the URL of the uploaded image
    res.status(200).json({
      message: "Profile image uploaded successfully.",
      imageUrl: relativePath,
    });
  } catch (error) {
    console.error("Upload error:", error.message);
    res.status(500).json({ message: "Image upload failed.", error: error.message });
  }
});

module.exports = router;