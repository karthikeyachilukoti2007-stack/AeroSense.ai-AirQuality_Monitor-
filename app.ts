import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.routes';
import airQualityRoutes from './routes/airQuality.routes';
import alertRoutes from './routes/alert.routes';
import { errorHandler } from './middleware/error.middleware';

dotenv.config();

const app = express();

// Secure middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100 
});
app.use('/api/', limiter);

// Welcome Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to AeroSense.ai API' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/air-quality', airQualityRoutes);
app.use('/api/alerts', alertRoutes);

// Error Handling
app.use(errorHandler);

export default app;
