import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '2525'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export class MailService {
  static async sendAlert(email: string, city: string, aqi: number) {
    const info = await transporter.sendMail({
      from: '"AeroSense Alerts" <alerts@aerosense.ai>',
      to: email,
      subject: `🚨 Air Quality Alert: ${city}`,
      text: `Alert! The AQI in ${city} has reached ${aqi}. Please wear a mask and stay indoors.`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #e11d48;">AeroSense.ai Alert</h2>
          <p>Dangerous air quality levels detected in <b>${city}</b>.</p>
          <div style="font-size: 24px; font-weight: bold; margin: 20px 0;">Current AQI: ${aqi}</div>
          <p>Recommendation: Stay indoors and keep windows closed.</p>
        </div>
      `
    });
    console.log(`Alert email sent to ${email}`);
  }
}
