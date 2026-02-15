import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  name: {
    type: String,
    required: true
  },
  location: {
    lat: Number,
    lon: Number,
    city: String
  }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
