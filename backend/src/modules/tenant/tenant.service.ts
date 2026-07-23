import { prisma } from "../../lib/prisma";

export const getAllTenants = async () => {
  return await prisma.tenant.findMany({
    orderBy: {
      // Prisma doesn't have created_at mapped directly to createdAt if not defined, wait, I need to check Tenant model. Let's just not order or order by id.
      id: 'asc'
    }
  });
};
