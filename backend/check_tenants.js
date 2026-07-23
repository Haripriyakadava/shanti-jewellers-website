const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.tenant.findMany().then(res => console.log(res)).finally(() => prisma.$disconnect());
