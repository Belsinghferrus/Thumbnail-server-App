import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import generateToken from "../lib/generateToken.js";
import cloudinary from "../lib/cloudinary.js";
import Thumbnail from "../models/thumbnailModel.js";

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
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }
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
    res.cookie("jwt", "", { 
      maxAge: 0 ,
      httpOnly: true, 
      secure: true, 
      sameSite: "Lax",
      path: "/", 
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller");
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateProfile = async (req, res) => {
  const { id } = req.params;
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

const googleAuth =  (req, res) => {
  try {
    const googleAuthUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: 'http://localhost:5000/api/auth/google/callback',
      response_type: 'code',
      scope: 'profile email',
    });
    res.json({ redirectUrl: `${googleAuthUrl}?${params.toString()}` });
  } catch (error) {
    console.log("Error in googleAuth server", error);
    res.status(500).json({message: "Error in google Auth"})
  }
}

const googleAuthCallback = async (req, res) => {
  try {
   
    if (!req.user) {
      return res.status(401).json({ message: "Authentication failed" });
    }
    const { email } = req.user;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
      generateToken(user._id, res);
      res.redirect(process.env.GOOGLE_REDIRECT);
  } catch (error) {
    res.status(500).json({message: "Error in GoogleAuth Callback", error})
  }
};

const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -savedThumbnails');
    const thumbnails = await Thumbnail.find({user: user._id})
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ user, thumbnails });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user details", error: error.message });
  }
};

const changePassword = async(req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.password) {
      return res.status(400).json({ message: "This account is linked to Google. Password change is not allowed." });
    }

    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password)

    if(!isPasswordMatch){
      return res.status(400).json({message: "Invalid Credentials"})
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.status(200).json({message: "Password updated successfully!"})
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export { login, register, checkAuth, logout, updateProfile, googleAuth, googleAuthCallback, getUserDetails, changePassword };
