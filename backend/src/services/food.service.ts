import { foodRepository, FoodHistoryQuery } from '../repositories/food.repository.js';
import { storageService } from './storage.service.js';
import { geminiService } from './gemini.service.js';
import { AppError } from '../middlewares/error.middleware.js';
import { FoodRecord } from '@prisma/client';

export class FoodService {
  async analyzeAndSaveFood(userId: string, file: Express.Multer.File): Promise<FoodRecord> {
    if (!file) {
      throw new AppError('No image file provided', 400);
    }

    // 1. Upload to storage (local or Supabase)
    const imageUrl = await storageService.uploadFile(file);

    try {
      // 2. Perform Gemini image analysis
      const analysis = await geminiService.analyzeFoodImage(file.buffer, file.mimetype);

      // 3. Save food record to database
      const foodRecord = await foodRepository.create({
        userId,
        imageUrl,
        foodName: analysis.food_name,
        calories: analysis.calories,
        protein: analysis.protein,
        carbohydrates: analysis.carbohydrates,
        fat: analysis.fat,
        estimatedWeight: analysis.estimated_weight_grams,
        confidence: analysis.confidence,
      });

      return foodRecord;
    } catch (error) {
      // If db or Gemini fails, try to cleanup uploaded file to prevent orphan files
      await storageService.deleteFile(imageUrl);
      throw error;
    }
  }

  async getHistory(userId: string, query: FoodHistoryQuery) {
    return foodRepository.findHistory(userId, query);
  }

  async deleteFoodRecord(userId: string, recordId: string): Promise<void> {
    const record = await foodRepository.findById(recordId);
    if (!record) {
      throw new AppError('Food record not found', 404);
    }

    if (record.userId !== userId) {
      throw new AppError('Unauthorized to delete this record', 403);
    }

    // Delete file first
    await storageService.deleteFile(record.imageUrl);

    // Delete from DB
    await foodRepository.delete(recordId);
  }
}

export const foodService = new FoodService();
