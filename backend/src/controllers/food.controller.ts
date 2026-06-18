import { Response, NextFunction } from 'express';
import { foodService } from '../services/food.service.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { FoodHistoryQuery } from '../repositories/food.repository.js';

class FoodController {
  async analyze(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const file = req.file;

      if (!file) {
        res.status(400).json({
          status: 'error',
          message: 'Please upload an image file.',
        });
        return;
      }

      const foodRecord = await foodService.analyzeAndSaveFood(userId, file);

      res.status(201).json({
        status: 'success',
        message: 'Food analyzed and recorded successfully',
        data: foodRecord,
      });
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const query: FoodHistoryQuery = {
        search: req.query.search as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
      };

      const result = await foodService.getHistory(userId, query);

      res.status(200).json({
        status: 'success',
        data: {
          records: result.records,
          total: result.total,
          page: query.page,
          limit: query.limit,
          totalPages: Math.ceil(result.total / (query.limit || 10)),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const recordId = req.params.id;

      await foodService.deleteFoodRecord(userId, recordId);

      res.status(200).json({
        status: 'success',
        message: 'Food record deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const foodController = new FoodController();
