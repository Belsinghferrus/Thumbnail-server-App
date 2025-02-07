import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import generateToken from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

// Register a new user
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ username, email, password: hashedPassword });

    // Save user to database
    await user.save();

    // Generate JWT token
    generateToken(user._id, res);

    res.status(201).json({
      message: "User Created",
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal server error" });
    next(error);
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    generateToken(user._id, res);

    // const payload = { id: user._id };
    // const token = jwt.sign(payload, process.env.JWT_SECRET, {
    //   // expiresIn: "1h",
    // });

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller");
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateProfile = async (req, res) => {
  const { id } = req.params;
  // const _id = "67974777c5e4b90f90c0ae87"
  const { username, bio } = req.body;

  try {
    let profilePicUrl = null;
    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "profile-picture",
              transformation: [{ width: 500, height: 500, crop: "fill" }],
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          )
          .end(req.file.buffer);
      });
      profilePicUrl = uploadResult.secure_url;
    }
    const updatedData = {};
    if (username) updatedData.username =  username;
    if (bio) updatedData.bio =  bio;
    if (profilePicUrl) updatedData.profilePicture =  profilePicUrl;

    const updatedUser = await User.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
    }
   
    res
      .status(200)
      .json({ message: "Profile updated successfully", 
        user: updatedUser, 
         _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        profilePicture: updatedUser.profilePicture,
        bio: updatedUser.bio, });
  } catch (error) {
    console.error("Error updating profile:", error);
    res
      .status(500)
      .json({ message: "Error updating profile", error: error.message });
  }
};

export { login, register, checkAuth, logout, updateProfile };
