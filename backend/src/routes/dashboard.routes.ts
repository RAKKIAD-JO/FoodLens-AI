import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(requireAuth as any);

router.get('/summary', dashboardController.getSummary as any);
router.get('/charts', dashboardController.getCharts as any);

export default router;
