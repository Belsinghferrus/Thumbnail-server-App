import mongoose from 'mongoose'

const thumbnailSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  category: {type: String, default: ''},
  imageUrl: { type: String, required: true },
  impressions: { type: Number, default: 0 },
  ctr: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  saves: { type: Number, default: 0 },
  downloads: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Thumbnail', thumbnailSchema);
