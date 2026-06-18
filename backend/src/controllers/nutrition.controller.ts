import { Response, NextFunction } from 'express';
import { nutritionService } from '../services/nutrition.service.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

class NutritionController {
  async scan(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const file = req.file;

      if (!file) {
        res.status(400).json({
          status: 'error',
          message: 'Please upload a nutrition label image file.',
        });
        return;
      }

      const scanResult = await nutritionService.scanAndSaveLabel(userId, file);

      res.status(201).json({
        status: 'success',
        message: 'Nutrition label scanned and stored successfully',
        data: scanResult,
      });
    } catch (error) {
      next(error);
    }
  }

  async getScans(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const scans = await nutritionService.getScansByUserId(userId);
      
      res.status(200).json({
        status: 'success',
        data: scans,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const nutritionController = new NutritionController();
