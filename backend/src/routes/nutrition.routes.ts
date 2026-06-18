import { Router } from 'express';
import { nutritionController } from '../controllers/nutrition.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = Router();

router.use(requireAuth as any);

router.post('/scan', upload.single('image'), nutritionController.scan as any);
router.get('/history', nutritionController.getScans as any); // Match path in request /api/nutrition/history (or GET /scans / history)

export default router;
