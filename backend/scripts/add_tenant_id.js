const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

const targetModels = [
  'ProductImage',
  'ProductVariant',
  'ProductOption',
  'ProductMetal',
  'MetalPrice',
  'RefreshToken',
  'CartItem',
  'OrderItem',
  'OrderStatusHistory',
  'PaymentTransaction',
  'Shipment'
];

for (const model of targetModels) {
  const regex = new RegExp(`(model ${model} \\{[\\s\\S]*?)(\\n\\})`, 'g');
  schema = schema.replace(regex, (match, p1, p2) => {
    if (p1.includes('tenantId String')) return match;
    let newFields = '\n  tenantId String\n  tenant   Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)\n\n  @@index([tenantId])';
    return p1 + newFields + p2;
  });
}

fs.writeFileSync('prisma/schema.prisma', schema, 'utf8');
console.log('schema.prisma updated successfully.');
