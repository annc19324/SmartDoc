import { prisma } from '../config/prisma.js';

export class CourseService {
  static async listCourses(search?: string) {
    return prisma.course.findMany({
      where: search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { code: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {},
      include: {
        teacher: { select: { id: true, fullName: true, avatar: true } },
        category: true,
        _count: { select: { documents: true, quizzes: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getCourseById(id: string) {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        teacher: { select: { id: true, fullName: true, avatar: true, email: true } },
        category: true,
        documents: {
          include: {
            uploadedBy: { select: { id: true, fullName: true } },
          },
        },
        quizzes: {
          include: {
            _count: { select: { questions: true, attempts: true } },
          },
        },
      },
    });

    if (!course) throw new Error('Không tìm thấy khóa học.');
    return course;
  }

  static async createCourse(data: {
    title: string;
    code: string;
    description?: string;
    thumbnail?: string;
    teacherId: string;
    categoryId?: string;
  }) {
    return prisma.course.create({ data });
  }

  static async updateCourse(
    id: string,
    data: { title?: string; code?: string; description?: string; categoryId?: string }
  ) {
    return prisma.course.update({ where: { id }, data });
  }

  static async deleteCourse(id: string) {
    return prisma.course.delete({ where: { id } });
  }
}
