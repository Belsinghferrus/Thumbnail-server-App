import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema({
  thumbnail: { type: mongoose.Schema.Types.ObjectId, ref: 'Thumbnail', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
}, { timestamps: true });


export default mongoose.model('Comment', commentSchema);

