import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors'
import dotenv from 'dotenv'
import authRoute from './routes/authRoute.js'
import thumbnailRoute from './routes/thumbnailRoute.js'
import commentRoute from './routes/commentRoute.js'
import cookieParser from 'cookie-parser'
import authMiddleware from './middleware/authMiddleware.js';
import passport from "passport";

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));


app.use(
  cors({
    origin: process.env.NODE_ENV === "Production" 
    ? process.env.HOST 
    : process.env.LOCALHOST, 
    credentials: true, 
    
  })
);
app.use(passport.initialize());


// MongoDB connection
mongoose.connect(process.env.MONGO_URI,)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routes
app.use('/api/auth', authRoute);
app.use('/api/thumbnails', thumbnailRoute);
app.use('/api/comments',authMiddleware, commentRoute);

app.get('/health',(req, res) => {
  res.send("Health is good")
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


