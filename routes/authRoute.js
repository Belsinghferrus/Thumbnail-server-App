
import express from 'express'
import {  register, login, checkAuth, logout, updateProfile} from '../controllers/auth.js'
import authMiddleware from '../middleware/authMiddleware.js';
import { profilePicUpload } from '../middleware/multer.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authMiddleware, logout)
router.get('/check', authMiddleware, checkAuth)

router.put('/update/:id', profilePicUpload.single('profilePicture'), authMiddleware, updateProfile)
export default router;