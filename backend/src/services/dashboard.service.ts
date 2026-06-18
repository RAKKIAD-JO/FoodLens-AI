import { prisma } from '../config/db.js';
import { userService } from './user.service.js';
import { foodRepository } from '../repositories/food.repository.js';
import { AppError } from '../middlewares/error.middleware.js';

export class DashboardService {
  async getSummary(userId: string) {
    const profile = await userService.getProfile(userId);
    const targetCalories = profile.metrics.targetCalories || 2000; // default standard

    // Get today's nutrition totals
    const todayTotals = await foodRepository.getCaloriesConsumedToday(userId);

    const remaining = Math.max(0, targetCalories - todayTotals.calories);
    const progressPercentage = Math.round((todayTotals.calories / targetCalories) * 100) || 0;

    return {
      tdee: targetCalories,
      consumed: Math.round(todayTotals.calories),
      remaining: Math.round(remaining),
      progress: Math.min(100, progressPercentage),
      macros: {
        protein: Math.round(todayTotals.protein),
        carbohydrates: Math.round(todayTotals.carbohydrates),
        fat: Math.round(todayTotals.fat),
      },
      profileSet: !!profile.weight && !!profile.height && !!profile.age && !!profile.gender,
    };
  }

  async getChartsData(userId: string) {
    // 1. Daily Calories (Last 7 Days)
    const dailyData = await this.getDailyAggregates(userId, 7);

    // 2. Weekly Calories (Last 4 Weeks)
    const weeklyData = await this.getWeeklyAggregates(userId, 4);

    // 3. Monthly Calories (Last 6 Months)
    const monthlyData = await this.getMonthlyAggregates(userId, 6);

    // 4. Macro Distribution (Last 7 Days sum)
    const macroDistribution = await this.getMacroAggregates(userId, 7);

    return {
      daily: dailyData,
      weekly: weeklyData,
      monthly: monthlyData,
      macros: macroDistribution,
    };
  }

  private async getDailyAggregates(userId: string, daysCount: number) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysCount + 1);
    startDate.setHours(0, 0, 0, 0);

    const records = await prisma.foodRecord.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Generate list of days
    const resultMap = new Map<string, { label: string; calories: number }>();
    for (let i = 0; i < daysCount; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const key = date.toISOString().split('T')[0];
      const label = date.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
      resultMap.set(key, { label, calories: 0 });
    }

    // Populate data
    records.forEach((record) => {
      const key = record.createdAt.toISOString().split('T')[0];
      if (resultMap.has(key)) {
        const item = resultMap.get(key)!;
        item.calories += record.calories;
      }
    });

    return Array.from(resultMap.values()).map((v) => ({
      label: v.label,
      calories: Math.round(v.calories),
    }));
  }

  private async getWeeklyAggregates(userId: string, weeksCount: number) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - weeksCount * 7 + 1);
    startDate.setHours(0, 0, 0, 0);

    const records = await prisma.foodRecord.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'asc' },
    });

    const weeks = [];
    for (let i = 0; i < weeksCount; i++) {
      const wStart = new Date(startDate);
      wStart.setDate(startDate.getDate() + i * 7);
      const wEnd = new Date(wStart);
      wEnd.setDate(wStart.getDate() + 6);
      wEnd.setHours(23, 59, 59, 999);

      const label = `Wk ${weeksCount - i}`;
      let calories = 0;

      records.forEach((r) => {
        if (r.createdAt >= wStart && r.createdAt <= wEnd) {
          calories += r.calories;
        }
      });

      weeks.push({
        label,
        calories: Math.round(calories),
      });
    }

    return weeks;
  }

  private async getMonthlyAggregates(userId: string, monthsCount: number) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsCount + 1);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const records = await prisma.foodRecord.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'asc' },
    });

    const months = [];
    for (let i = 0; i < monthsCount; i++) {
      const date = new Date(startDate);
      date.setMonth(startDate.getMonth() + i);
      const monthLabel = date.toLocaleDateString('en-US', { month: 'short' });
      const yearLabel = date.getFullYear().toString().slice(-2);
      const label = `${monthLabel} '${yearLabel}`;

      let calories = 0;
      records.forEach((r) => {
        if (
          r.createdAt.getMonth() === date.getMonth() &&
          r.createdAt.getFullYear() === date.getFullYear()
        ) {
          calories += r.calories;
        }
      });

      months.push({
        label,
        calories: Math.round(calories),
      });
    }

    return months;
  }

  private async getMacroAggregates(userId: string, daysCount: number) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysCount + 1);
    startDate.setHours(0, 0, 0, 0);

    const aggregate = await prisma.foodRecord.aggregate({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
      _sum: {
        protein: true,
        carbohydrates: true,
        fat: true,
      },
    });

    const protein = aggregate._sum.protein || 0;
    const carbs = aggregate._sum.carbohydrates || 0;
    const fat = aggregate._sum.fat || 0;

    return {
      protein: Math.round(protein),
      carbohydrates: Math.round(carbs),
      fat: Math.round(fat),
    };
  }
}

export const dashboardService = new DashboardService();
