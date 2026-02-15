import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Alert from '../models/Alert';

export class AlertController {
  static async createAlert(req: AuthRequest, res: Response) {
    const { threshold, city } = req.body;
    const alert = await Alert.create({
      userId: req.user?.id,
      threshold,
      city
    });
    res.status(201).json(alert);
  }

  static async getMyAlerts(req: AuthRequest, res: Response) {
    const alerts = await Alert.find({ userId: req.user?.id });
    res.json(alerts);
  }

  static async deleteAlert(req: AuthRequest, res: Response) {
    const alert = await Alert.findOneAndDelete({ 
        _id: req.params.id, 
        userId: req.user?.id 
    });
    if (!alert) return res.status(404).json({ message: 'Alert not found' });
    res.json({ message: 'Alert removed' });
  }
}
