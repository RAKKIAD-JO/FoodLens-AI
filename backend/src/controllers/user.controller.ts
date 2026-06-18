import { Response, NextFunction } from 'express';
import { userService } from '../services/user.service.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

class UserController {
  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const profile = await userService.getProfile(userId);
      
      res.status(200).json({
        status: 'success',
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const updatedProfile = await userService.updateProfile(userId, req.body);
      
      res.status(200).json({
        status: 'success',
        message: 'Profile updated successfully',
        data: updatedProfile,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
