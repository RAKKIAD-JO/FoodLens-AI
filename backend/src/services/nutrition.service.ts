import { nutritionRepository } from '../repositories/nutrition.repository.js';
import { storageService } from './storage.service.js';
import { geminiService } from './gemini.service.js';
import { AppError } from '../middlewares/error.middleware.js';
import { NutritionScan } from '@prisma/client';

export class NutritionService {
  async scanAndSaveLabel(userId: string, file: Express.Multer.File): Promise<NutritionScan> {
    if (!file) {
      throw new AppError('No image file provided', 400);
    }

    // 1. Upload file to storage
    const imageUrl = await storageService.uploadFile(file);

    try {
      // 2. Scan image with Gemini Vision
      const parsedData = await geminiService.scanNutritionLabel(file.buffer, file.mimetype);

      // 3. Save scan to DB
      const scan = await nutritionRepository.create({
        userId,
        imageUrl,
        calories: parsedData.calories,
        protein: parsedData.protein,
        carbohydrates: parsedData.carbohydrates,
        sugar: parsedData.sugar,
        fat: parsedData.fat,
        sodium: parsedData.sodium,
      });

      return scan;
    } catch (error) {
      // Cleanup uploaded file on error
      await storageService.deleteFile(imageUrl);
      throw error;
    }
  }

  async getScansByUserId(userId: string): Promise<NutritionScan[]> {
    return nutritionRepository.findByUserId(userId);
  }
}

export const nutritionService = new NutritionService();
