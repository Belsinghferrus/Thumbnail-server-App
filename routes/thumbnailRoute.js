import express from 'express'
import { uploadThumbnail, 
    filterThumbnail,
    getThumbnails, 
    getThumbnailDetails, 
    getUploadedThumbnails,
    updateImpression, 
    saveThumbnail, 
    getSavedThumbnail, 
    downloadThumbnail,
    updateCtr,
    searchedThumbnail,
    deleteThumbnail

} from '../controllers/thumbnail.js'
import authMiddleware from '../middleware/authMiddleware.js'
import { upload } from '../middleware/multer.js';

const router = express.Router();

//POST
router.post('/upload', upload.single('imageUrl'), authMiddleware, uploadThumbnail);
router.post('/save/:thumbnailId', authMiddleware, saveThumbnail)
router.post('/impression/:thumbnailId',  updateImpression)
router.post('/ctr/:thumbnailId', authMiddleware, updateCtr)

//GET
router.get('/search/', searchedThumbnail)
router.get('/filter/:category',  filterThumbnail)
router.get('/download/:thumbnailId', authMiddleware, downloadThumbnail)
router.get('/saved', authMiddleware, getSavedThumbnail)
router.get('/',  getThumbnails);
router.get('/myUploadedThumbnail', authMiddleware, getUploadedThumbnails)
router.get('/:id', authMiddleware, getThumbnailDetails);


//Delete
router.delete('/delete/:id', authMiddleware, deleteThumbnail)

export default router