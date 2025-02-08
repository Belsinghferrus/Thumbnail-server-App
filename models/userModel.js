import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  bio: {type: String, default: 'About me'},
  email: { type: String, required: true, unique: true },
  password: { type: String},
  profilePicture: { type: String, default: '' },
  savedThumbnails: [{ type: mongoose.Schema.Types.ObjectId, ref: "Thumbnail" }],
}, { timestamps: true });

export default mongoose.model('User', userSchema);
