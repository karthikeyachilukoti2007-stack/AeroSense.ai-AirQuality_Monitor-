import { Request, Response } from 'express';
import { AirQualityService } from '../services/airQuality.service';
import { ForecastService } from '../services/forecast.service';
import AQIHistory from '../models/AQIHistory';

export class AirQualityController {
  static async getCurrent(req: Request, res: Response) {
    try {
      const { lat, lon } = req.query;
      if (!lat || !lon) return res.status(400).json({ message: 'Lat and Lon required' });

      const data = await AirQualityService.getCurrentAQI(
        parseFloat(lat as string), 
        parseFloat(lon as string)
      );
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }

  static async getHistory(req: Request, res: Response) {
    try {
      const city = req.query.city as string || 'Delhi';
      const history = await AQIHistory.find({ 'location.city': city })
        .sort({ timestamp: -1 })
        .limit(24);
      res.json(history);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }

  static async getForecast(req: Request, res: Response) {
    try {
      const city = req.query.city as string || 'Delhi';
      const forecast = await ForecastService.get24HourForecast(city);
      res.json(forecast);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }
}
