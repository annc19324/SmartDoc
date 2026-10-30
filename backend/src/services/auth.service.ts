import { prisma } from '../config/prisma.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { Role } from '@prisma/client';

export class AuthService {
  static async register(data: { email: string; password: string; fullName: string; role?: Role }) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });

    if (existing) {
      throw new Error('Email này đã được sử dụng trên hệ thống.');
    }

    const hashedPassword = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase().trim(),
        password: hashedPassword,
        fullName: data.fullName.trim(),
        role: data.role || Role.STUDENT,
      },
    });

    // Initialize analytics for student
    if (user.role === Role.STUDENT) {
      await prisma.learningAnalytics.create({
        data: {
          userId: user.id,
          strongTopics: [],
          weakTopics: [],
          aiRecommendation: 'Chào mừng bạn đến với SmartDoc! Hãy bắt đầu khám phá tài liệu.',
        },
      });
    }

    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Save refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatar: user.avatar,
      },
      accessToken,
      refreshToken,
    };
  }

  static async login(data: { email: string; password: string }) {
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });

    if (!user) {
      throw new Error('Email hoặc mật khẩu không chính xác.');
    }

    const isMatch = await comparePassword(data.password, user.password);
    if (!isMatch) {
      throw new Error('Email hoặc mật khẩu không chính xác.');
    }

    if (!user.isActive) {
      throw new Error('Tài khoản đã bị tạm khóa. Vui lòng liên hệ Admin.');
    }

    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatar: user.avatar,
      },
      accessToken,
      refreshToken,
    };
  }

  static async refresh(refreshToken: string) {
    const decoded = verifyRefreshToken(refreshToken);
    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }

    const payload = {
      userId: stored.user.id,
      email: stored.user.email,
      role: stored.user.role,
    };
    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    // Rotate refresh token
    await prisma.refreshToken.delete({ where: { id: stored.id } });
    await prisma.refreshToken.create({
      data: {
        userId: stored.user.id,
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: stored.user.id,
        email: stored.user.email,
        fullName: stored.user.fullName,
        role: stored.user.role,
        avatar: stored.user.avatar,
      },
    };
  }

  static async logout(refreshToken: string) {
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    }
    return true;
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });
    if (!user) throw new Error('Không tìm thấy thông tin người dùng.');
    return user;
  }
}
