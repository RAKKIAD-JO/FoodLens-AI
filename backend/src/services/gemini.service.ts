import { GoogleGenerativeAI } from '@google/generative-ai';
import { ENV } from '../config/env.js';

export interface FoodAnalysisResult {
  food_name: string;
  confidence: number;
  estimated_weight_grams: number;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
}

export interface RecommendationResult {
  food_name: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  benefits: string;
  nutrition_comparison: string;
}

export interface NutritionScanResult {
  calories: number;
  protein: number;
  carbohydrates: number;
  sugar: number;
  fat: number;
  sodium: number;
}

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private modelName: string;

  constructor() {
    this.modelName = ENV.GEMINI_MODEL || 'gemini-1.5-flash';
    if (ENV.GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);
    } else {
      console.warn('Gemini Service: No GEMINI_API_KEY found. Running in mock mode.');
    }
  }

  private isMockMode(): boolean {
    return !this.genAI;
  }

  async analyzeFoodImage(imageBuffer: Buffer, mimeType: string): Promise<FoodAnalysisResult> {
    if (this.isMockMode()) {
      return this.getMockFoodAnalysis();
    }

    try {
      const model = this.genAI!.getGenerativeModel({
        model: this.modelName,
        generationConfig: { responseMimeType: 'application/json' },
      });

      const prompt = `
        Analyze the food in this image.
        Identify:
        1. Food name (Thai language, standard terms)
        2. Portions/confidence
        3. Estimated weight in grams
        4. Calories (kcal)
        5. Protein (g)
        6. Carbohydrates (g)
        7. Fat (g)
        
        Return ONLY a JSON object with this exact structure:
        {
          "food_name": "ชื่ออาหารภาษาไทย",
          "confidence": 95,
          "estimated_weight_grams": 250,
          "calories": 450,
          "protein": 15,
          "carbohydrates": 50,
          "fat": 12
        }
      `;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: imageBuffer.toString('base64'),
            mimeType: mimeType,
          },
        },
      ]);

      const responseText = result.response.text();
      return JSON.parse(responseText.trim()) as FoodAnalysisResult;
    } catch (error) {
      console.error('Gemini food analysis error:', error);
      console.log('Falling back to mock food analysis');
      return this.getMockFoodAnalysis();
    }
  }

  async scanNutritionLabel(imageBuffer: Buffer, mimeType: string): Promise<NutritionScanResult> {
    if (this.isMockMode()) {
      return this.getMockLabelScan();
    }

    try {
      const model = this.genAI!.getGenerativeModel({
        model: this.modelName,
        generationConfig: { responseMimeType: 'application/json' },
      });

      const prompt = `
        Analyze this nutrition label image. Extract the nutritional values per serving or container size.
        Extract:
        1. Calories (kcal)
        2. Protein (grams)
        3. Carbohydrates (grams)
        4. Sugar (grams)
        5. Fat (grams)
        6. Sodium (mg)

        If values are not present, estimate them to your best ability based on standard facts for the item.
        Return ONLY a JSON object with this exact structure:
        {
          "calories": 200,
          "protein": 8,
          "carbohydrates": 25,
          "sugar": 5,
          "fat": 7,
          "sodium": 280
        }
      `;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: imageBuffer.toString('base64'),
            mimeType: mimeType,
          },
        },
      ]);

      const responseText = result.response.text();
      return JSON.parse(responseText.trim()) as NutritionScanResult;
    } catch (error) {
      console.error('Gemini label scan error:', error);
      console.log('Falling back to mock nutrition scan');
      return this.getMockLabelScan();
    }
  }

  async getHealthyRecommendations(foodName: string, calories: number): Promise<RecommendationResult[]> {
    if (this.isMockMode()) {
      return this.getMockRecommendations(foodName, calories);
    }

    try {
      const model = this.genAI!.getGenerativeModel({
        model: this.modelName,
        generationConfig: { responseMimeType: 'application/json' },
      });

      const prompt = `
        Based on the food item "${foodName}" containing approximately ${calories} calories,
        recommend 3 healthier alternative food choices.
        For each alternative, provide:
        - food_name (Thai language)
        - calories (kcal)
        - protein (g)
        - carbohydrates (g)
        - fat (g)
        - benefits (short explanation of why it is healthier in Thai language)
        - nutrition_comparison (direct comparison of calorie savings or nutrient improvement in Thai language)

        Return ONLY a JSON array with this exact structure:
        [
          {
            "food_name": "ชื่ออาหารทางเลือกภาษาไทย",
            "calories": 250,
            "protein": 20,
            "carbohydrates": 15,
            "fat": 5,
            "benefits": "อธิบายประโยชน์สั้นๆ เป็นภาษาไทย",
            "nutrition_comparison": "เปรียบเทียบแคลอรี่และสารอาหารเป็นภาษาไทย"
          }
        ]
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      return JSON.parse(responseText.trim()) as RecommendationResult[];
    } catch (error) {
      console.error('Gemini recommendation error:', error);
      console.log('Falling back to mock recommendations');
      return this.getMockRecommendations(foodName, calories);
    }
  }

  // --- MOCK FALLBACKS ---
  private getMockFoodAnalysis(): FoodAnalysisResult {
    const mocks = [
      { food_name: 'แซลมอนย่างกับหน่อไม้ฝรั่ง', confidence: 94, estimated_weight_grams: 300, calories: 420, protein: 36, carbohydrates: 8, fat: 26 },
      { food_name: 'ขนมปังหน้าอะโวคาโดและไข่ต้ม', confidence: 91, estimated_weight_grams: 180, calories: 350, protein: 14, carbohydrates: 24, fat: 22 },
      { food_name: 'ผัดไทยไก่', confidence: 88, estimated_weight_grams: 350, calories: 650, protein: 24, carbohydrates: 80, fat: 25 },
      { food_name: 'ดับเบิ้ลชีสเบอร์เกอร์', confidence: 96, estimated_weight_grams: 220, calories: 590, protein: 32, carbohydrates: 40, fat: 34 },
      { food_name: 'พิซซ่าเปปเปอโรนี 1 ชิ้น', confidence: 95, estimated_weight_grams: 120, calories: 290, protein: 12, carbohydrates: 32, fat: 12 }
    ];
    return mocks[Math.floor(Math.random() * mocks.length)];
  }

  private getMockLabelScan(): NutritionScanResult {
    return {
      calories: 180,
      protein: 6,
      carbohydrates: 22,
      sugar: 8,
      fat: 7,
      sodium: 190
    };
  }

  private getMockRecommendations(foodName: string, calories: number): RecommendationResult[] {
    const cleanName = foodName.replace(/ทอด |กรอบ /i, '') || 'อกไก่ย่างกับบลอกโคลี';
    return [
      {
        food_name: `${cleanName}ย่าง`,
        calories: Math.round(calories * 0.55),
        protein: 28,
        carbohydrates: 12,
        fat: 6,
        benefits: 'ปรุงด้วยน้ำมันน้อยและมีโปรตีนสูงจากเนื้อสัตว์ไขมันต่ำ',
        nutrition_comparison: `ประหยัดพลังงานได้ประมาณ ${Math.round(calories * 0.45)} kcal และช่วยลดปริมาณไขมันอิ่มตัวลง`
      },
      {
        food_name: 'สลัดควินัวกับผักรวมย่าง',
        calories: Math.round(calories * 0.45),
        protein: 10,
        carbohydrates: 45,
        fat: 8,
        benefits: 'อุดมไปด้วยใยอาหาร วิตามิน และไขมันดีจากน้ำมันมะกอก',
        nutrition_comparison: `ให้คาร์โบไฮเดรตเชิงซ้อนและช่วยประหยัดแคลอรีไปได้ถึง ${Math.round(calories * 0.55)} kcal`
      },
      {
        food_name: 'กรีกโยเกิร์ตผสมผลเบอร์รี่รวมและน้ำผึ้ง',
        calories: 180,
        protein: 15,
        carbohydrates: 22,
        fat: 2,
        benefits: 'มีโพรไบโอติกส์ที่ดีต่อระบบขับถ่ายและสารต้านอนุมูลอิสระ ปราศจากน้ำตาลขัดสี',
        nutrition_comparison: `ให้รสชาติหวานสดชื่นแต่จำกัดแคลอรีลงเหลือเพียง 180 kcal`
      }
    ];
  }
}

export const geminiService = new GeminiService();
