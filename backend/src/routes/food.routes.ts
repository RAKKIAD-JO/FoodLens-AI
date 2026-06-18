import { Router } from 'express';
import { foodController } from '../controllers/food.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = Router();

router.use(requireAuth as any);

router.post('/analyze', upload.single('image'), foodController.analyze as any);
router.get('/history', foodController.getHistory as any);
router.delete('/:id', foodController.delete as any);

export default router;
