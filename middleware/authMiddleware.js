import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    
    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);


    if(!decoded){
      return res.status(401).json({message:"unauthorized - Invalid Token"})
  }

    // Find user by ID from token
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.log("Error in authMiddleware", error.message);
    res.status(401).json({ message: "Token is not valid" });
  }
};

export default authMiddleware;
