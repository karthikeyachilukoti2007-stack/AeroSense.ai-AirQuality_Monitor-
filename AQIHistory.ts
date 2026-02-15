import mongoose from 'mongoose';

const aqiHistorySchema = new mongoose.Schema({
  location: {
    lat: { type: Number, required: true },
    lon: { type: Number, required: true },
    city: { type: String, default: 'Delhi' }
  },
  aqi: { type: Number, required: true },
  components: {
    co: Number,
    no: Number,
    no2: Number,
    o3: Number,
    so2: Number,
    pm2_5: Number,
    pm10: Number,
    nh3: Number
  },
  timestamp: { type: Date, default: Date.now }
});

// Indexing for faster forecast queries
aqiHistorySchema.index({ 'location.city': 1, timestamp: -1 });

export default mongoose.model('AQIHistory', aqiHistorySchema);
