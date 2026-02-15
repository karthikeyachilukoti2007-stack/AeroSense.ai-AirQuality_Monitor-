import cron from 'node-cron';
import AQIHistory from '../models/AQIHistory';
import Alert from '../models/Alert';
import { AirQualityService } from '../services/airQuality.service';
import { MailService } from '../services/mail.service';
import User from '../models/User';

const DEFAULT_CITY = 'Delhi';
const DEFAULT_COORDS = { lat: 28.6139, lon: 77.209 };

export const initJobs = () => {
  // Snapshot Job: Every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    console.log('Running AQI Snapshot Job...');
    try {
      const data = await AirQualityService.getCurrentAQI(DEFAULT_COORDS.lat, DEFAULT_COORDS.lon);
      
      await AQIHistory.create({
        location: { ...DEFAULT_COORDS, city: DEFAULT_CITY },
        aqi: data.aqi,
        components: data.rawComponents
      });

      console.log('Snapshot saved.');

      // Alert Monitoring Logic
      const activeAlerts = await Alert.find({ isActive: true, city: DEFAULT_CITY }).populate('userId');
      
      for (const alert of activeAlerts) {
        // Convert OpenWeather 1-5 to a 200 scale for comparison with user threshold
        const normalizedAQI = data.rawComponents.pm2_5 * 2; 
        
        if (normalizedAQI >= alert.threshold) {
            const user = alert.userId as any;
            // Rate limit emails to once every 6 hours per alert
            const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
            
            if (!alert.lastNotified || alert.lastNotified < sixHoursAgo) {
                await MailService.sendAlert(user.email, alert.city, Math.round(normalizedAQI));
                alert.lastNotified = new Date();
                await alert.save();
            }
        }
      }
    } catch (error) {
      console.error('Job Error:', error);
    }
  });
};
