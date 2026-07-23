import { prisma } from "../../lib/prisma";

export const getCollections = async (tenantId: string) => {
  return await prisma.collection.findMany({
    where: { tenantId, isActive: true },
    orderBy: { displayOrder: 'asc' },
  });
};

export const getCollectionBySlug = async (tenantId: string, slug: string) => {
  return await prisma.collection.findFirst({
    where: { tenantId, slug, isActive: true },
  });
};
