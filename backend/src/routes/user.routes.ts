import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import { updateProfileSchema } from '../dtos/user.dto.js';

const router = Router();

// Apply requireAuth to all profile routes
router.use(requireAuth as any);

router.get('/profile', userController.getProfile as any);
router.put('/profile', validate(updateProfileSchema), userController.updateProfile as any);

export default router;
