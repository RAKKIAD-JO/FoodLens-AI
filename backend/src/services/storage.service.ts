import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ENV } from '../config/env.js';
import { AppError } from '../middlewares/error.middleware.js';

export interface StorageService {
  uploadFile(file: Express.Multer.File): Promise<string>;
  deleteFile(fileUrl: string): Promise<void>;
}

class LocalStorageService implements StorageService {
  private uploadDir = path.join(process.cwd(), 'public', 'uploads');

  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const extension = path.extname(file.originalname) || '.jpg';
    const fileName = `${crypto.randomUUID()}${extension}`;
    const filePath = path.join(this.uploadDir, fileName);

    await fs.promises.writeFile(filePath, file.buffer);
    
    // Return relative url or absolute url based on server configs
    return `/uploads/${fileName}`;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    const fileName = path.basename(fileUrl);
    const filePath = path.join(this.uploadDir, fileName);
    
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }
}

class SupabaseStorageService implements StorageService {
  private supabase: SupabaseClient;

  constructor() {
    if (!ENV.SUPABASE_URL || !ENV.SUPABASE_ANON_KEY) {
      throw new Error('Supabase URL and Anon Key must be configured for Supabase storage');
    }
    this.supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY);
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const extension = path.extname(file.originalname) || '.jpg';
    const fileName = `${crypto.randomUUID()}${extension}`;
    const bucket = ENV.SUPABASE_BUCKET;

    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new AppError(`Supabase storage upload failed: ${error.message}`, 500);
    }

    const { data: urlData } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const bucket = ENV.SUPABASE_BUCKET;
      // Extract file name from Supabase URL
      // E.g., https://xxx.supabase.co/storage/v1/object/public/bucket/filename.jpg
      const parts = fileUrl.split('/');
      const fileName = parts[parts.length - 1];

      const { error } = await this.supabase.storage
        .from(bucket)
        .remove([fileName]);

      if (error) {
        console.error(`Failed to delete file from Supabase: ${error.message}`);
      }
    } catch (err) {
      console.error('Error parsing file URL for deletion:', err);
    }
  }
}

// Factory instantiation
export const storageService: StorageService =
  ENV.STORAGE_PROVIDER === 'supabase'
    ? new SupabaseStorageService()
    : new LocalStorageService();
