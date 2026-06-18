import { Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard.service.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

class DashboardController {
  async getSummary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const summary = await dashboardService.getSummary(userId);

      res.status(200).json({
        status: 'success',
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCharts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const chartsData = await dashboardService.getChartsData(userId);

      res.status(200).json({
        status: 'success',
        data: chartsData,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
