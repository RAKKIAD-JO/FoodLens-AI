import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    age: z.number().int().min(1, 'Age must be positive').max(120).optional().nullable(),
    gender: z.enum(['male', 'female', 'other']).optional().nullable(),
    weight: z.number().positive('Weight must be positive').optional().nullable(), // in kg
    height: z.number().positive('Height must be positive').optional().nullable(), // in cm
    activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']).optional().nullable(),
    goal: z.enum(['weight_loss', 'maintain', 'weight_gain']).optional().nullable(),
  }),
});

export type UpdateProfileDTO = z.infer<typeof updateProfileSchema>['body'];
