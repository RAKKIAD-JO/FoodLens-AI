import { Router } from 'express';
import { recommendationController } from '../controllers/recommendation.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(requireAuth as any);

router.post('/healthy-food', recommendationController.getHealthyAlternatives);

export default router;
