const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  const tenantId = '25ba86ec-5332-4299-9247-ca3b1071d74d';
  
  await prisma.tenant.upsert({
    where: { businessName: 'goldos' },
    update: {},
    create: {
      id: tenantId,
      businessName: 'goldos',
      ownerName: 'Admin',
      email: 'admin2@gold.com',
      phone: '1234567890'
    }
  });
  
  const gateway = await prisma.paymentGateway.findFirst({ where: { tenantId } });
  if (!gateway) {
    await prisma.paymentGateway.create({
      data: {
        tenantId,
        provider: 'RAZORPAY',
        keyId: 'rzp_test_TCF281nxIXxDvh',
        keySecret: 'hrhrP2GgJ7Mjuw361VphYuGp',
        isActive: true
      }
    });
  }
  
  await prisma.user.upsert({
    where: { id: 'test-user-id' },
    update: {},
    create: {
      id: 'test-user-id',
      tenantId,
      fullName: 'Test User',
      email: 'test@example.com',
      passwordHash: 'hash'
    }
  });
  
  console.log('Seeded successfully!');
}

seed()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
