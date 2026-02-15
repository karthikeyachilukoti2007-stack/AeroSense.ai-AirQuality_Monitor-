import { Router } from 'express';
import { AirQualityController } from '../controllers/airQuality.controller';

const router = Router();

router.get('/current', AirQualityController.getCurrent);
router.get('/history', AirQualityController.getHistory);
router.get('/forecast', AirQualityController.getForecast);

export default router;
