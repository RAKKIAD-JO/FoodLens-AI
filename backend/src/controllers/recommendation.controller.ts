import { Request, Response, NextFunction } from 'express';
import { recommendationService } from '../services/recommendation.service.js';

class RecommendationController {
  async getHealthyAlternatives(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { foodName, calories } = req.body;

      if (!foodName || calories === undefined) {
        res.status(400).json({
          status: 'error',
          message: 'Both foodName and calories are required in the request body',
        });
        return;
      }

      const recommendations = await recommendationService.getAlternatives(foodName, Number(calories));

      res.status(200).json({
        status: 'success',
        data: recommendations,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const recommendationController = new RecommendationController();
