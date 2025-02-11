import Comment from "../models/commentModel.js";
import Thumbnail from "../models/thumbnailModel.js";

// Add a comment to a thumbnail
const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const {thumbnailId} = req.params;
    const userId = req.user._id;

    // Check if thumbnail exists
    const thumbnail = await Thumbnail.findById(thumbnailId);
    if (!thumbnail) {
      return res.status(404).json({ message: "Thumbnail not found" });
    }

    if (!content) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }


    // Create new comment
    const comment = new Comment({
      thumbnailId,
      userId,
      content,
    });

    await comment.save();
    const populatedComment = await comment.populate('userId', 'username profilePicture');
    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all comments for a thumbnail
const getComments = async (req, res) => {
  try {
    const {thumbnailId} = req.params;
    const { page = 1, limit = 5 } = req.query;
    // Fetch comments and populate user details
    const comments = await Comment.find({ thumbnailId })
      .populate( "userId", "username profilePicture", )
      .sort({ createdAt: -1 })
   
     res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export { getComments, addComment };
