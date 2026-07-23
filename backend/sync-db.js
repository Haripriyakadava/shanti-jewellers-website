const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Haripriya@123@localhost:5432/shanti_backend'
  });

  await client.connect();

  const queries = [
    `ALTER TABLE "Customer" RENAME CONSTRAINT "User_pkey" TO "Customer_pkey";`,
    `ALTER INDEX "User_userCode_key" RENAME TO "Customer_customerCode_key";`,
    `ALTER INDEX "User_tenantId_email_key" RENAME TO "Customer_tenantId_email_key";`,
    `ALTER INDEX "User_tenantId_idx" RENAME TO "Customer_tenantId_idx";`,
    `ALTER INDEX "User_email_idx" RENAME TO "Customer_email_idx";`,
    
    // Also the primary key on Wishlist? The ID didn't change, but userId became customerId
    // Prisma might try to rename Wishlist_userId_productId_key which we dropped, so it will just recreate it.
  ];

  for (const query of queries) {
    try {
      console.log(`Executing: ${query}`);
      await client.query(query);
      console.log('Success.');
    } catch (err) {
      console.error(`Error executing ${query}:`, err.message);
    }
  }

  await client.end();
}

main();
