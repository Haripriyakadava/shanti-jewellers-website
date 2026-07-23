import { prisma } from "../../lib/prisma";

export const getCategories = async (tenantId: string) => {
  return await prisma.category.findMany({
    where: { tenantId, isActive: true },
    orderBy: { displayOrder: 'asc' },
  });
};

export const getCategoryBySlug = async (tenantId: string, slug: string) => {
  return await prisma.category.findFirst({
    where: { tenantId, slug, isActive: true },
  });
};
