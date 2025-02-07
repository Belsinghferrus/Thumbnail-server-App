import Comment from "../models/commentModel.js";
import Thumbnail from "../models/thumbnailModel.js";

// Add a comment to a thumbnail
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const thumbnailId = req.params.thumbnailId;

    // Check if thumbnail exists
    const thumbnail = await Thumbnail.findById(thumbnailId);
    if (!thumbnail) {
      return res.status(404).json({ message: "Thumbnail not found" });
    }

    // Create new comment
    const comment = new Comment({
      thumbnail: thumbnailId,
      user: req.user.id,
      text,
    });

    await comment.save();
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all comments for a thumbnail
const getComments = async (req, res) => {
  try {
    const thumbnailId = req.params.thumbnailId;

    // Fetch comments and populate user details
    const comments = await Comment.find({ thumbnail: thumbnailId })
      .populate("user", "username")
      .sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export { getComments, addComment };
