import express from 'express'
import { addComment, getComments } from '../controllers/comments.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router();

router.post('/:thumbnailId', authMiddleware, addComment);
router.get('/:thumbnailId', authMiddleware, getComments);

export default router