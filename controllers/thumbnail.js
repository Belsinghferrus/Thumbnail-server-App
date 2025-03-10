import Thumbnail from "../models/thumbnailModel.js";
import cloudinary from "../lib/cloudinary.js";
// import axios from 'axios';


//Validate request
const validateRequest = (req) => {
  if (!req.file) throw new Error("No file provided");
  if (!req.user?.id) throw new Error("User authentication required");

  const requiredFields = ["title", "description", "category"];
  const missingFields = requiredFields.filter((field) => !req.body[field]);
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
  }
};

// Upload a thumbnail
const uploadThumbnail = async (req, res) => {
  try {
    const file = req.file; // File from multer middleware
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    validateRequest(req);

    // Upload to Cloudinary
    const streamUpload = (fileBuffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "thumbnails", resource_type: "image" },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        stream.end(fileBuffer);
      });
    };

    const result = await streamUpload(file.buffer);

    // Save thumbnail to database
    const thumbnail = new Thumbnail({
      user: req.user.id,
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      imageUrl: result.secure_url,
    });

    // try {
    //   await axios.post(process.env.WEBHOOK_URL_IMAGE, {
    //     event: "thumbnail_uploaded",
    //     thumbnail: {
    //       id: thumbnail._id,
    //       user: thumbnail.user,
    //       title: thumbnail.title,
    //       description: thumbnail.description,
    //       category: thumbnail.category,
    //       imageUrl: thumbnail.imageUrl,
    //       uploadedAt: new Date().toISOString(),
    //     },
    //   });
    // } catch (webhookError) {
    //   console.error("Failed to send webhook:", webhookError.message);
    // }

    await thumbnail.save();
    res.status(201).json(thumbnail);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all thumbnails for all user
const getThumbnails = async (req, res) => {
  
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip = (page - 1) * limit;
    const thumbnails = await Thumbnail.find()
    .populate(
      "user",
      "username profilePicture"
    )
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));
    res.status(200).json(thumbnails);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get details of a specific thumbnail
const getThumbnailDetails = async (req, res) => {
  try {
    const thumbnail = await Thumbnail.findById(req.params.id).populate(
      "user",
      "username profilePicture"
    );
    if (!thumbnail) {
      return res.status(401).json({ message: "Thumbnail not found" });
    }

    res.status(200).json(thumbnail);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//uploadedThumbnail
const getUploadedThumbnails = async (req, res) => {
  try {
    const thumbnails = await Thumbnail.find({ user: req.user.id }).select(
      "_id imageUrl title"
    ).sort({ createdAt: -1 });
    res.status(200).json(thumbnails);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//SAVE THUMBNAIL
const saveThumbnail = async (req, res) => {
  const { thumbnailId } = req.params;
  try {
    const thumbnail = await Thumbnail.findById(thumbnailId);
    if (!thumbnail) {
      return res.status(401).json({ message: "Thumbnail not found" });
    }
    const user = req.user;

    if (user.savedThumbnails.includes(thumbnailId)) {
      return res.status(409).json({ message: "Thumbnail already saved" });
    }

    thumbnail.saves += 1;
    await thumbnail.save();

    user.savedThumbnails.push(thumbnailId);
    await user.save();

    res.status(200).json({ message: "Thumbnail saved successful" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//getSavedThumbnail
const getSavedThumbnail = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    await user.populate("savedThumbnails");
    res.status(200).json(user.savedThumbnails);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//downloadThumbnail
const downloadThumbnail = async (req, res) => {
  const { thumbnailId } = req.params;
  try {
    const thumbnail = await Thumbnail.findById(thumbnailId);
    if (!thumbnail) {
      return res.status(401).json({ message: "Thumbnail not found" });
    }
    thumbnail.downloads += 1;
    await thumbnail.save();
    res.status(200).json({
      downloadUrl: thumbnail.imageUrl,
      message: "Thumbnail download successful",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error in downloadThumbnail",
      error: error.message,
    });
  }
};

//UPDATE IMPRESSION
const updateImpression = async (req, res) => {
  try {
    const { thumbnailId } = req.params;
    const thumbnail = await Thumbnail.findById(thumbnailId);
    if (!thumbnail) {
      return res.status(401).json({ message: "Thumbnail not found" });
    }
    const lastUpdatedTime = thumbnail.updatedAt;
    const timeDifference = Date.now() - new Date(lastUpdatedTime).getTime();
    if(timeDifference > 30000){
      thumbnail.impressions += 1;
      await thumbnail.save();
      res.status(200).json({ message: "Impression updated" });
    }else {
      res.status(200).json({ message: "Impression update skipped" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Update CTR
const updateCtr = async (req, res) => {
  try {
    const { thumbnailId } = req.params;
    const thumbnail = await Thumbnail.findById(thumbnailId);
    if (!thumbnail) {
      return res.status(401).json({ message: "Thumbnail not found" });
    }
    thumbnail.ctr += 1;
    await thumbnail.save();
    res.status(200).json({ message: "CTR updated" });
  } catch (error) {
    res.status(500).json({message: "Error in updateCTR", error: error.message });
  }
};

const searchedThumbnail = async(req, res) => {
  const {query} = req.query;
  if (!query) {
    return res.status(200).json({ message: "Search query is required" });
  }
  try {
    const trimmedQuery = query.trim().toLowerCase();
    const thumbnails = await Thumbnail.find({
      $or: [
        {title: {$regex:  trimmedQuery, $options: "i"}},
        {description: {$regex:  trimmedQuery, $options: "i"}},
        {'user.username': {$regex:  trimmedQuery, $options: "i"}},
        {category: {$regex:  trimmedQuery, $options: "i"}}
      ]
    }).populate(
      "user",
      "username profilePicture "
    );
    res.status(200).json(thumbnails)
  } catch (error) {
    res.status(500).json({ message: "Error searching thumbnails", error: error.message });
  }
}
//FILTER THUMBNAIL
const filterThumbnail = async (req, res) => {
  const {category} = req.params;
  const { page = 1, limit = 6 } = req.query;
  const skip = (page - 1) * limit;
  try {
    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }
    const thumbnails = await Thumbnail.find({  category: category }).populate(
      "user",
      "username profilePicture"
    ).sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));
    res.status(200).json({thumbnails})
  } catch (error) {
    res.status(500).json({message: "Error in filterThumbnail", error: error.message})
  }
}

//DELETE THUMBNAIL
const deleteThumbnail = async (req, res) => {
  try {
    const {id} = req.params;

    const thumbnail = await Thumbnail.findById(id)
    if(!thumbnail) {
      res.status(400).json({message: "Thumbnail not found"})
    }

    const thumbnailImage = thumbnail.imageUrl;
    if(!thumbnailImage) {
      res.status(400).json({message: "Thumbnail imageUrl not found"})
    }
    
    const publicIdMatch = thumbnailImage.match(/\/([^/]+)\.[a-z]+$/i);
    if (!publicIdMatch) {
      return res.status(400).json({ message: "Invalid image URL format" });
    }

    const publicId = publicIdMatch[1];
    
    const result = await cloudinary.uploader.destroy(`thumbnails/${publicId}`);

    if (result.result !== "ok") {
      return res.status(400).json({ message: "Failed to delete image from Cloudinary" });
    }
    
    await thumbnail.deleteOne();
    res.status(200).json({ message: "Thumbnail deleted successfully" });
  } catch (error) {
    console.error("Error deleting thumbnail:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}


export {
  uploadThumbnail,
  getThumbnails,
  getThumbnailDetails,
  getUploadedThumbnails,
  saveThumbnail,
  getSavedThumbnail,
  downloadThumbnail,
  updateImpression,
  updateCtr,
  searchedThumbnail,
  filterThumbnail,
  deleteThumbnail,
};
