import { prisma } from '../config/prisma.js';
import { Role } from '@prisma/client';

export class AdminService {
  static async getDashboardMetrics() {
    const [
      totalUsers,
      totalStudents,
      totalTeachers,
      totalDocuments,
      totalCourses,
      totalQuizzes,
      totalQuizAttempts,
      totalChatSessions,
      totalChunks,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: Role.STUDENT } }),
      prisma.user.count({ where: { role: Role.TEACHER } }),
      prisma.document.count(),
      prisma.course.count(),
      prisma.quiz.count(),
      prisma.quizAttempt.count(),
      prisma.chatSession.count(),
      prisma.documentChunk.count(),
    ]);

    // Fetch recent users
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
    });

    // Fetch recent documents
    const recentDocuments = await prisma.document.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        fileType: true,
        status: true,
        createdAt: true,
        uploadedBy: { select: { fullName: true } },
      },
    });

    return {
      stats: {
        totalUsers,
        totalStudents,
        totalTeachers,
        totalDocuments,
        totalCourses,
        totalQuizzes,
        totalQuizAttempts,
        totalChatSessions,
        totalChunks,
      },
      recentUsers,
      recentDocuments,
    };
  }

  static async listUsers(search?: string, role?: Role) {
    const where: any = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
      ];
    }

    return prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: {
            documents: true,
            quizAttempts: true,
            chatSessions: true,
          },
        },
      },
    });
  }

  static async updateUserStatus(userId: string, isActive: boolean) {
    return prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });
  }

  static async updateUserRole(userId: string, role: Role) {
    return prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  }
}
