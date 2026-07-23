const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Haripriya@123@localhost:5432/shanti_backend'
  });

  await client.connect();

  const queries = [
    `ALTER TABLE "User" RENAME TO "Customer";`,
    `ALTER TABLE "Address" RENAME COLUMN "userId" TO "customerId";`,
    `ALTER TABLE "Cart" RENAME COLUMN "userId" TO "customerId";`,
    `ALTER TABLE "Order" RENAME COLUMN "userId" TO "customerId";`,
    `ALTER TABLE "Payment" RENAME COLUMN "userId" TO "customerId";`,
    `ALTER TABLE "RefreshToken" RENAME COLUMN "userId" TO "customerId";`,
    `ALTER TABLE "Wishlist" RENAME COLUMN "userId" TO "customerId";`,
    `ALTER TABLE "CheckoutSession" RENAME COLUMN "userId" TO "customerId";`
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
