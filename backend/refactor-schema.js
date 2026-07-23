const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

// 1. Rename User -> Customer and UserRole -> CustomerRole
schema = schema.replace(/model User \{/g, 'model Customer {');
schema = schema.replace(/enum UserRole \{/g, 'enum CustomerRole {');
schema = schema.replace(/UserRole/g, 'CustomerRole');
schema = schema.replace(/ userId String/g, ' customerId String');
schema = schema.replace(/ userId String \@unique/g, ' customerId String @unique');
schema = schema.replace(/user User/g, 'customer Customer');
schema = schema.replace(/userId/g, 'customerId');
schema = schema.replace(/model Customer \{\n  id String \@id \@default\(cuid\(\)\)\n  userCode String\?/g, 'model Customer {\n  id String @id @default(cuid())\n  customerCode String?');

// 2. Remove business models (Tenant, Category, Collection, Product, etc.)
// We will simply slice the string or match and remove.
// Looking at the schema structure, these models are grouped. Let's find the start of TENANT MANAGEMENT and remove from there to the end, 
// wait, we need to keep Order, Payment, Cart, etc. if they are mixed? 
// Let's check where they are located.
