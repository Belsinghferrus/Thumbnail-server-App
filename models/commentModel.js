import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema({
  thumbnailId: { type: mongoose.Schema.Types.ObjectId, ref: 'Thumbnail', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  // upvotes: { type: Number, default: 0 },
  // downvotes: { type: Number, default: 0 },
}, { timestamps: true });


export default mongoose.model('Comment', commentSchema);

