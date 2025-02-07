import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors'
import dotenv from 'dotenv'
import authRoute from './routes/authRoute.js'
import thumbnailRoute from './routes/thumbnailRoute.js'
import commentRoute from './routes/commentRoute.js'
import cookieParser from 'cookie-parser'
import authMiddleware from './middleware/authMiddleware.js';

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: 'http://localhost:5173', 
    credentials: true, 
  })
);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI,)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routes
app.use('/api/auth', authRoute);
app.use('/api/thumbnails', thumbnailRoute);
app.use('/api/comments',authMiddleware, commentRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


