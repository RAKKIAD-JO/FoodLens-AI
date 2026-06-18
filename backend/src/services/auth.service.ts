import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { ENV } from '../config/env.js';
import { userRepository } from '../repositories/user.repository.js';
import { AppError } from '../middlewares/error.middleware.js';
import { RegisterDTO, LoginDTO } from '../dtos/auth.dto.js';
import { User } from '@prisma/client';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private accessSecret = ENV.JWT_ACCESS_SECRET;
  private refreshSecret = ENV.JWT_REFRESH_SECRET;

  async register(dto: RegisterDTO): Promise<Omit<User, 'password'>> {
    const existingUser = await userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new AppError('Email is already registered', 400);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const newUser = await userRepository.create({
      email: dto.email,
      name: dto.name,
      password: hashedPassword,
      age: null,
      gender: null,
      weight: null,
      height: null,
      activityLevel: null,
      goal: null,
    });

    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async login(dto: LoginDTO): Promise<{ user: Omit<User, 'password'>; tokens: AuthTokens }> {
    const user = await userRepository.findByEmail(dto.email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const tokens = this.generateTokens({ id: user.id, email: user.email, name: user.name });
    
    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, tokens };
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = jwt.verify(refreshToken, this.refreshSecret) as { id: string; email: string; name: string };
      
      const user = await userRepository.findById(payload.id);
      if (!user) {
        throw new AppError('User not found', 401);
      }

      // Reissue BOTH tokens for security (token rotation)
      return this.generateTokens({ id: user.id, email: user.email, name: user.name });
    } catch (error) {
      throw new AppError('Invalid or expired refresh token', 401);
    }
  }

  private generateTokens(payload: { id: string; email: string; name: string }): AuthTokens {
    const accessToken = jwt.sign(payload, this.accessSecret, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, this.refreshSecret, { expiresIn: '7d' });
    
    return { accessToken, refreshToken };
  }

  verifyAccessToken(token: string) {
    try {
      return jwt.verify(token, this.accessSecret) as { id: string; email: string; name: string };
    } catch (error) {
      throw new AppError('Invalid or expired access token', 401);
    }
  }
}

export const authService = new AuthService();
