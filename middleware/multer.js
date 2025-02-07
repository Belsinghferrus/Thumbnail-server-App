
import multer from 'multer'

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1280 * 720 }, // 2MB limit
    fileFilter(req, file, cb) {
      if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
      }
      cb(null, true);
    }
  });

  const profilePicUpload = multer({
    storage: multer.memoryStorage(),
    limits: {fileSize: 1 * 1024 *1024},
    fileFilter(req, file, cb){
      if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
        return cb(new Error('Only image files are allowed'), false)
      }
      cb(null, true)
    }
  })

  export { upload, profilePicUpload }