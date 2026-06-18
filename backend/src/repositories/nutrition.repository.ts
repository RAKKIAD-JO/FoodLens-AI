import { prisma } from '../config/db.js';
import { NutritionScan } from '@prisma/client';

export class NutritionRepository {
  async create(data: Omit<NutritionScan, 'id' | 'createdAt'>): Promise<NutritionScan> {
    return prisma.nutritionScan.create({ data });
  }

  async findByUserId(userId: string): Promise<NutritionScan[]> {
    return prisma.nutritionScan.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async delete(id: string): Promise<NutritionScan> {
    return prisma.nutritionScan.delete({ where: { id } });
  }
}

export const nutritionRepository = new NutritionRepository();
