import { Router } from 'express';
import authRouter from './auth.routes.js';
import userRouter from './user.routes.js';
import foodRouter from './food.routes.js';
import nutritionRouter from './nutrition.routes.js';
import recommendationRouter from './recommendation.routes.js';
import dashboardRouter from './dashboard.routes.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/foods', foodRouter);
router.use('/nutrition', nutritionRouter);
router.use('/recommendations', recommendationRouter);
router.use('/dashboard', dashboardRouter);

export default router;
