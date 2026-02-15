import axios from 'axios';
import { redisClient } from '../config/redis';
import { getHealthAdvice } from '../utils/aqiCalculator';

const API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = 'http://api.openweathermap.org/data/2.5/air_pollution';

export class AirQualityService {
  static async getCurrentAQI(lat: number, lon: number) {
    const cacheKey = `aqi:${lat}:${lon}`;
    
    // Attempt Redis fetch
    if (redisClient.isOpen) {
      const cached = await redisClient.get(cacheKey);
      if (cached) return JSON.parse(cached);
    }

    try {
      const response = await axios.get(`${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
      const data = response.data.list[0];
      
      const result = {
        aqi: data.main.aqi, // 1-5 scale
        // OpenWeather AQI is 1-5, but common dashboards use 0-500. 
        // We'll map it to a readable index for the frontend or store original.
        rawComponents: data.components,
        healthAdvice: getHealthAdvice(data.components.pm2_5 * 2), // Example calc: 2.5 conversion
        timestamp: new Date()
      };

      // Set to Redis (expiry 10 mins)
      if (redisClient.isOpen) {
        await redisClient.setEx(cacheKey, 600, JSON.stringify(result));
      }

      return result;
    } catch (error) {
      throw new Error('Failed to fetch data from OpenWeather');
    }
  }

  static async getGeocoding(city: string) {
    const url = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`;
    const response = await axios.get(url);
    if (!response.data.length) throw new Error('City not found');
    return {
      lat: response.data[0].lat,
      lon: response.data[0].lon,
      name: response.data[0].name
    };
  }
}
