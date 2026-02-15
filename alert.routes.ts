import { Router } from 'express';
import { AlertController } from '../controllers/alert.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);
router.post('/', AlertController.createAlert);
router.get('/', AlertController.getMyAlerts);
router.delete('/:id', AlertController.deleteAlert);

export default router;
