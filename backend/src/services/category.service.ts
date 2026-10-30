import { prisma } from '../config/prisma.js';

export class CategoryService {
  static async listCategories() {
    return prisma.category.findMany({
      include: {
        _count: {
          select: { documents: true, courses: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  static async createCategory(data: { name: string; slug: string; description?: string }) {
    return prisma.category.create({ data });
  }

  static async updateCategory(id: string, data: { name?: string; slug?: string; description?: string }) {
    return prisma.category.update({ where: { id }, data });
  }

  static async deleteCategory(id: string) {
    return prisma.category.delete({ where: { id } });
  }
}
