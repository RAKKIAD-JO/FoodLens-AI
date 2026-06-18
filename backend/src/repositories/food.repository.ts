import { prisma } from '../config/db.js';
import { FoodRecord } from '@prisma/client';

export interface FoodHistoryQuery {
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export class FoodRepository {
  async findById(id: string): Promise<FoodRecord | null> {
    return prisma.foodRecord.findUnique({ where: { id } });
  }

  async create(data: Omit<FoodRecord, 'id' | 'createdAt'>): Promise<FoodRecord> {
    return prisma.foodRecord.create({ data });
  }

  async delete(id: string): Promise<FoodRecord> {
    return prisma.foodRecord.delete({ where: { id } });
  }

  async findHistory(
    userId: string,
    query: FoodHistoryQuery
  ): Promise<{ records: FoodRecord[]; total: number }> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    // Case-insensitive Search
    if (query.search) {
      where.foodName = {
        contains: query.search,
        mode: 'insensitive',
      };
    }

    // Date range filtering
    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        where.createdAt.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        // Extend to end of that day
        const end = new Date(query.endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const [records, total] = await prisma.$transaction([
      prisma.foodRecord.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.foodRecord.count({ where }),
    ]);

    return { records, total };
  }

  async getCaloriesConsumedToday(userId: string): Promise<{
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
  }> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const result = await prisma.foodRecord.aggregate({
      where: {
        userId,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      _sum: {
        calories: true,
        protein: true,
        carbohydrates: true,
        fat: true,
      },
    });

    return {
      calories: result._sum.calories || 0,
      protein: result._sum.protein || 0,
      carbohydrates: result._sum.carbohydrates || 0,
      fat: result._sum.fat || 0,
    };
  }
}

export const foodRepository = new FoodRepository();
