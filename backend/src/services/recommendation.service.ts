import { geminiService, RecommendationResult } from './gemini.service.js';

export class RecommendationService {
  async getAlternatives(foodName: string, calories: number): Promise<RecommendationResult[]> {
    return geminiService.getHealthyRecommendations(foodName, calories);
  }
}

export const recommendationService = new RecommendationService();
