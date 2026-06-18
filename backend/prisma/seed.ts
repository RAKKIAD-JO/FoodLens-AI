import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Delete all existing records to allow clean re-seed
  await prisma.nutritionScan.deleteMany({});
  await prisma.foodRecord.deleteMany({});
  await prisma.user.deleteMany({});

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create a demo user with a complete profile
  const user = await prisma.user.create({
    data: {
      email: 'demo@foodlens.ai',
      name: 'สมชาย ดีใจ',
      password: hashedPassword,
      age: 28,
      gender: 'male',
      weight: 78.5,
      height: 180,
      activityLevel: 'moderate', // BMR multiplier 1.55
      goal: 'weight_loss', // TDEE - 500
    },
  });

  console.log(`Created seed user: ${user.email}`);

  // 2. Generate 10 days of food records (breakfast, lunch, dinner, snack) in Thai
  const today = new Date();
  const mealTemplates = [
    {
      name: 'อาหารเช้า: โอ๊ตมีลผสมเบอร์รี่',
      calories: 320,
      protein: 10,
      carbohydrates: 54,
      fat: 6,
      weight: 250,
      confidence: 96,
      image: '/placeholder-food.jpg',
    },
    {
      name: 'อาหารเช้า: ไข่คนกับขนมปังปิ้ง',
      calories: 380,
      protein: 18,
      carbohydrates: 28,
      fat: 16,
      weight: 200,
      confidence: 94,
      image: '/placeholder-food.jpg',
    },
    {
      name: 'อาหารกลางวัน: สลัดอกไก่ย่าง',
      calories: 450,
      protein: 38,
      carbohydrates: 15,
      fat: 22,
      weight: 350,
      confidence: 97,
      image: '/placeholder-food.jpg',
    },
    {
      name: 'อาหารกลางวัน: โปเกโบว์ลแซลมอน',
      calories: 580,
      protein: 28,
      carbohydrates: 65,
      fat: 18,
      weight: 400,
      confidence: 92,
      image: '/placeholder-food.jpg',
    },
    {
      name: 'อาหารเย็น: เนื้อผัดบลอกโคลี',
      calories: 520,
      protein: 34,
      carbohydrates: 42,
      fat: 20,
      weight: 380,
      confidence: 95,
      image: '/placeholder-food.jpg',
    },
    {
      name: 'อาหารเย็น: พาสต้าผักรวมกับอกไก่',
      calories: 610,
      protein: 30,
      carbohydrates: 78,
      fat: 14,
      weight: 420,
      confidence: 93,
      image: '/placeholder-food.jpg',
    },
    {
      name: 'ของว่าง: กรีกโยเกิร์ตกับอัลมอนด์',
      calories: 220,
      protein: 15,
      carbohydrates: 12,
      fat: 11,
      weight: 150,
      confidence: 98,
      image: '/placeholder-food.jpg',
    },
    {
      name: 'ของว่าง: เวย์โปรตีนเชคกับแอปเปิ้ล',
      calories: 240,
      protein: 26,
      carbohydrates: 25,
      fat: 3,
      weight: 350,
      confidence: 99,
      image: '/placeholder-food.jpg',
    },
  ];

  for (let i = 0; i < 10; i++) {
    const targetDate = new Date();
    targetDate.setDate(today.getDate() - i);
    
    // Distribute meal times
    const times = [
      { h: 8, m: 30 },  // Breakfast
      { h: 12, m: 45 }, // Lunch
      { h: 19, m: 15 }, // Dinner
      { h: 16, m: 0 }   // Snack (occasional)
    ];

    // Pick a subset of meals for the day
    const breakfast = mealTemplates[i % 2 === 0 ? 0 : 1];
    const lunch = mealTemplates[i % 2 === 0 ? 2 : 3];
    const dinner = mealTemplates[i % 2 === 0 ? 4 : 5];
    const snack = mealTemplates[i % 2 === 0 ? 6 : 7];

    const mealsToCreate = [
      { template: breakfast, time: times[0] },
      { template: lunch, time: times[1] },
      { template: dinner, time: times[2] },
    ];

    // 70% chance of snack
    if (i % 3 !== 0) {
      mealsToCreate.push({ template: snack, time: times[3] });
    }

    for (const meal of mealsToCreate) {
      const mealDate = new Date(targetDate);
      mealDate.setHours(meal.time.h, meal.time.m, 0, 0);

      await prisma.foodRecord.create({
        data: {
          userId: user.id,
          foodName: meal.template.name.split(': ')[1] || meal.template.name,
          calories: meal.template.calories,
          protein: meal.template.protein,
          carbohydrates: meal.template.carbohydrates,
          fat: meal.template.fat,
          estimatedWeight: meal.template.weight,
          confidence: meal.template.confidence,
          imageUrl: meal.template.image,
          createdAt: mealDate,
        },
      });
    }
  }

  // 3. Create a couple of mock nutrition scans
  await prisma.nutritionScan.createMany({
    data: [
      {
        userId: user.id,
        imageUrl: '/placeholder-label.jpg',
        calories: 140,
        protein: 3,
        carbohydrates: 21,
        sugar: 14,
        fat: 4.5,
        sodium: 150,
        createdAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        userId: user.id,
        imageUrl: '/placeholder-label.jpg',
        calories: 220,
        protein: 12,
        carbohydrates: 10,
        sugar: 2,
        fat: 14,
        sodium: 380,
        createdAt: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
