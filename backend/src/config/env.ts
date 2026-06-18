import dotenv from 'dotenv';
import path from 'path';

// Load .env file
dotenv.config();

export const ENV = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'fallback-access-secret',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  STORAGE_PROVIDER: process.env.STORAGE_PROVIDER || 'local',
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  SUPABASE_BUCKET: process.env.SUPABASE_BUCKET || 'foodlens-images',
};

// Validate critical configurations
if (!ENV.DATABASE_URL) {
  console.warn('WARNING: DATABASE_URL is not set in environment variables.');
}

if (!ENV.GEMINI_API_KEY) {
  console.warn('WARNING: GEMINI_API_KEY is not set. The backend will use mocked AI data.');
}
