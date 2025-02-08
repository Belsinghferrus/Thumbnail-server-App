
import express from 'express'
import {  register, login, checkAuth, logout, updateProfile, googleAuth, googleAuthCallback, getUserDetails} from '../controllers/auth.js'
import authMiddleware from '../middleware/authMiddleware.js';
import { profilePicUpload } from '../middleware/multer.js';
import passport from '../lib/passport.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authMiddleware, logout)
router.get('/check', authMiddleware, checkAuth)
router.get('/user/:id', authMiddleware, getUserDetails)

router.put('/update/:id', profilePicUpload.single('profilePicture'), authMiddleware, updateProfile)
export default router;

router.get('/google', googleAuth);
router.get('/google/callback', passport.authenticate("google", {session: false}), googleAuthCallback)