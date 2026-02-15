import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  threshold: {
    type: Number,
    required: true, // AQI level to trigger alert
    default: 150
  },
  city: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastNotified: {
    type: Date
  }
}, { timestamps: true });

export default mongoose.model('Alert', alertSchema);
