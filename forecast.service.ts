import AQIHistory from '../models/AQIHistory';

export class ForecastService {
  /**
   * Generates a 24-hour forecast using simple linear regression 
   * based on the last 7 days of historical records for a location.
   */
  static async get24HourForecast(city: string) {
    const history = await AQIHistory.find({ 'location.city': city })
      .sort({ timestamp: -1 })
      .limit(168); // ~7 days of hourly data if sampled hourly

    if (history.length < 12) {
      return { msg: 'Insufficient data for AI forecast', fallback: true };
    }

    // Simple Linear Regression: y = mx + b
    const n = history.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

    history.forEach((record, index) => {
      const x = n - index; // Time sequence
      const y = record.aqi;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Generate next 24 hours
    const predictions = [];
    const lastTimestamp = history[0].timestamp.getTime();

    for (let i = 1; i <= 24; i++) {
        const predictedVal = slope * (n + i) + intercept;
        predictions.push({
            time: new Date(lastTimestamp + i * 3600000),
            predictedAqi: Math.max(0, Math.round(predictedVal))
        });
    }

    return {
        city,
        type: 'Linear Regression Forecast',
        confidence: history.length > 50 ? 'High' : 'Moderate',
        predictions
    };
  }
}
