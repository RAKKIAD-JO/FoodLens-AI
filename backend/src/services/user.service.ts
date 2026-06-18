import { userRepository } from '../repositories/user.repository.js';
import { AppError } from '../middlewares/error.middleware.js';
import { UpdateProfileDTO } from '../dtos/user.dto.js';
import { User } from '@prisma/client';

export interface ComputedHealthMetrics {
  bmi: number | null;
  bmr: number | null;
  tdee: number | null;
  targetCalories: number | null;
}

export class UserService {
  async getProfile(userId: string): Promise<Omit<User, 'password'> & { metrics: ComputedHealthMetrics }> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const { password, ...userWithoutPassword } = user;
    const metrics = this.calculateMetrics(user);

    return {
      ...userWithoutPassword,
      metrics,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDTO): Promise<Omit<User, 'password'> & { metrics: ComputedHealthMetrics }> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const updatedUser = await userRepository.update(userId, dto);
    const { password, ...userWithoutPassword } = updatedUser;
    const metrics = this.calculateMetrics(updatedUser);

    return {
      ...userWithoutPassword,
      metrics,
    };
  }

  public calculateMetrics(user: User): ComputedHealthMetrics {
    const { weight, height, age, gender, activityLevel, goal } = user;

    if (!weight || !height || !age || !gender) {
      return { bmi: null, bmr: null, tdee: null, targetCalories: null };
    }

    // 1. BMI Calculation (weight in kg, height in cm)
    const heightInMeters = height / 100;
    const bmi = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));

    // 2. BMR Calculation (Mifflin-St Jeor Equation)
    let bmr = 0;
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else if (gender === 'female') {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    } else {
      // average of male and female formulas
      bmr = 10 * weight + 6.25 * height - 5 * age - 78;
    }
    bmr = Math.round(bmr);

    // 3. TDEE Calculation
    let activityMultiplier = 1.2;
    switch (activityLevel) {
      case 'sedentary':
        activityMultiplier = 1.2;
        break;
      case 'light':
        activityMultiplier = 1.375;
        break;
      case 'moderate':
        activityMultiplier = 1.55;
        break;
      case 'active':
        activityMultiplier = 1.725;
        break;
      case 'very_active':
        activityMultiplier = 1.9;
        break;
      default:
        activityMultiplier = 1.2;
    }
    const tdee = Math.round(bmr * activityMultiplier);

    // 4. Target Calories based on Goal
    let targetCalories = tdee;
    if (goal === 'weight_loss') {
      targetCalories = Math.max(1200, tdee - 500); // 1200 kcal is generally the safe minimum
    } else if (goal === 'weight_gain') {
      targetCalories = tdee + 500;
    }

    return {
      bmi,
      bmr,
      tdee,
      targetCalories,
    };
  }
}

export const userService = new UserService();
