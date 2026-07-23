import { PrismaClient } from '@prisma/client';
import { BusinessCodeGenerator } from '../src/utils/BusinessCodeGenerator';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting Business Code Backfill...');

  // 1. Backfill Tenants
  const tenants = await prisma.tenant.findMany({
    where: { tenantCode: null }
  });
  console.log(`Found ${tenants.length} tenants without a tenant code.`);

  for (const tenant of tenants) {
    const prefix = BusinessCodeGenerator.derivePrefixFromBusinessName(tenant.businessName);
    
    // For the tenant itself, we might generate something like "SHANTI001"
    // Let's use the sequence table for entity "TENANT" globally. We can use a dummy tenantId like "SYSTEM"
    // since tenant codes are global.
    await prisma.$transaction(async (tx) => {
      const code = await BusinessCodeGenerator.generateCode(
        tx,
        "SYSTEM", // global
        "TENANT",
        prefix,
        "", // no entity prefix
        3 // e.g. 001
      );

      await tx.tenant.update({
        where: { id: tenant.id },
        data: { tenantCode: code }
      });
      console.log(`Updated Tenant ${tenant.businessName} -> ${code}`);
    });
  }

  // Reload tenants to get the newly generated codes
  const allTenants = await prisma.tenant.findMany();

  // 2. Backfill Users
  console.log('\nBackfilling Users...');
  for (const tenant of allTenants) {
    if (!tenant.tenantCode) continue;
    const prefix = tenant.tenantCode.replace(/\d+$/, ''); // Extract "SHANTI" from "SHANTI001"
    
    const users = await prisma.user.findMany({
      where: { tenantId: tenant.id, userCode: null }
    });

    for (const user of users) {
      await prisma.$transaction(async (tx) => {
        const code = await BusinessCodeGenerator.generateCode(
          tx,
          tenant.id,
          "USER",
          prefix,
          "USR",
          6
        );
        await tx.user.update({
          where: { id: user.id },
          data: { userCode: code }
        });
        console.log(`Updated User ${user.email} -> ${code}`);
      });
    }

    // 3. Backfill Products
    const products = await prisma.product.findMany({
      where: { tenantId: tenant.id, productCode: null }
    });
    for (const product of products) {
      await prisma.$transaction(async (tx) => {
        const code = await BusinessCodeGenerator.generateCode(
          tx, tenant.id, "PRODUCT", prefix, "PRD", 6
        );
        await tx.product.update({
          where: { id: product.id },
          data: { productCode: code }
        });
      });
    }

    // You can add more entities here (Categories, Carts, etc.) if they have existing data
  }

  console.log('Backfill completed successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
