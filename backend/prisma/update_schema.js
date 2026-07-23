const fs = require('fs');

let schema = fs.readFileSync('schema.prisma', 'utf8');

const newModels = `
//////////////////////////////////////////////////////////
// NEW ENUMS
//////////////////////////////////////////////////////////

enum AdminRole {
  SUPER_ADMIN
  ADMIN
  MANAGER
}

enum DiscountType {
  PERCENTAGE
  FIXED
}

//////////////////////////////////////////////////////////
// TENANT
//////////////////////////////////////////////////////////

model Tenant {
  id        String   @id @default(uuid())
  name      String
  domain    String?  @unique
  logo      String?
  isActive  Boolean  @default(true)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  adminUsers      AdminUser[]
  categories      Category[]
  collections     Collection[]
  products        Product[]
  metals          Metal[]
  ringSizes       RingSize[]
  stones          Stone[]
  modelImages     ModelImage[]
  coupons         Coupon[]
  reviews         Review[]
  
  customers       Customer[]
  addresses       Address[]
  carts           Cart[]
  checkoutSessions CheckoutSession[]
  orders          Order[]
  payments        Payment[]
  paymentAttempts PaymentAttempt[]
  paymentWebhooks PaymentWebhook[]
  webhookEvents   WebhookEvent[]
  invoices        Invoice[]
  refunds         Refund[]
  wishlists       Wishlist[]
}

//////////////////////////////////////////////////////////
// ADMIN USER
//////////////////////////////////////////////////////////

model AdminUser {
  id           String    @id @default(uuid())
  tenantId     String
  email        String    @unique
  passwordHash String
  role         AdminRole @default(MANAGER)
  isActive     Boolean   @default(true)
  
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  tenant       Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId])
  @@index([email])
}

//////////////////////////////////////////////////////////
// CATEGORY
//////////////////////////////////////////////////////////

model Category {
  id          String     @id @default(uuid())
  tenantId    String
  parentId    String?
  name        String
  slug        String     @unique
  image       String?
  icon        String?
  
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  tenant      Tenant     @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  parent      Category?  @relation("CategoryToCategory", fields: [parentId], references: [id], onDelete: SetNull)
  children    Category[] @relation("CategoryToCategory")
  products    Product[]

  @@index([tenantId])
  @@index([parentId])
}

//////////////////////////////////////////////////////////
// COLLECTION
//////////////////////////////////////////////////////////

model Collection {
  id          String    @id @default(uuid())
  tenantId    String
  name        String
  slug        String    @unique
  description String?
  banner      String?
  image       String?
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  tenant      Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  products    Product[]

  @@index([tenantId])
}

//////////////////////////////////////////////////////////
// PRODUCT
//////////////////////////////////////////////////////////

model Product {
  id               String    @id @default(uuid())
  tenantId         String
  categoryId       String
  collectionId     String?
  
  name             String
  slug             String    @unique
  sku              String    @unique
  description      String?
  shortDescription String?
  purity           String?
  makingCharges    Decimal?  @db.Decimal(12, 2)
  wastage          Decimal?  @db.Decimal(5, 2)
  weight           Decimal?  @db.Decimal(12, 3)
  gender           String?
  occasion         String?
  certification    String?
  stock            Int       @default(0)
  
  featured         Boolean   @default(false)
  bestseller       Boolean   @default(false)
  newArrival       Boolean   @default(false)
  active           Boolean   @default(true)
  
  seoTitle         String?
  seoDescription   String?
  
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  deletedAt        DateTime?

  tenant           Tenant          @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  category         Category        @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  collection       Collection?     @relation(fields: [collectionId], references: [id], onDelete: SetNull)
  
  images           ProductImage[]
  variants         ProductVariant[]
  options          ProductOption[]
  metals           ProductMetal[]
  reviews          Review[]
  
  cartItems        CartItem[]
  wishlistItems    Wishlist[]
  orderItems       OrderItem[]

  @@index([tenantId])
  @@index([categoryId])
  @@index([collectionId])
  @@index([slug])
  @@index([sku])
}

//////////////////////////////////////////////////////////
// PRODUCT IMAGE
//////////////////////////////////////////////////////////

model ProductImage {
  id           String   @id @default(uuid())
  productId    String
  url          String
  altText      String?
  displayOrder Int      @default(0)
  isPrimary    Boolean  @default(false)
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  product      Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@index([productId])
}

//////////////////////////////////////////////////////////
// PRODUCT VARIANT
//////////////////////////////////////////////////////////

model ProductVariant {
  id          String    @id @default(uuid())
  productId   String
  size        String?
  color       String?
  weight      Decimal?  @db.Decimal(12, 3)
  price       Decimal   @db.Decimal(12, 2)
  stock       Int       @default(0)
  sku         String?   @unique
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime?

  product     Product   @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  cartItems   CartItem[]
  wishlistItems Wishlist[]
  orderItems  OrderItem[]

  @@index([productId])
}

//////////////////////////////////////////////////////////
// PRODUCT OPTION
//////////////////////////////////////////////////////////

model ProductOption {
  id        String   @id @default(uuid())
  productId String
  name      String
  value     String
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@index([productId])
}

//////////////////////////////////////////////////////////
// PRODUCT METAL
//////////////////////////////////////////////////////////

model ProductMetal {
  id        String   @id @default(uuid())
  productId String
  metalId   String
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  metal     Metal    @relation(fields: [metalId], references: [id], onDelete: Restrict)

  @@unique([productId, metalId])
  @@index([productId])
  @@index([metalId])
}

//////////////////////////////////////////////////////////
// METAL
//////////////////////////////////////////////////////////

model Metal {
  id        String         @id @default(uuid())
  tenantId  String
  name      String
  purity    String
  
  createdAt DateTime       @default(now())
  updatedAt DateTime       @updatedAt

  tenant    Tenant         @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  prices    MetalPrice[]
  products  ProductMetal[]

  @@index([tenantId])
}

//////////////////////////////////////////////////////////
// METAL PRICE
//////////////////////////////////////////////////////////

model MetalPrice {
  id        String   @id @default(uuid())
  metalId   String
  price     Decimal  @db.Decimal(12, 2)
  currency  String   @default("INR")
  timestamp DateTime @default(now())
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  metal     Metal    @relation(fields: [metalId], references: [id], onDelete: Cascade)

  @@index([metalId])
}

//////////////////////////////////////////////////////////
// RING SIZE
//////////////////////////////////////////////////////////

model RingSize {
  id            String   @id @default(uuid())
  tenantId      String
  indianSize    String
  usSize        String?
  diameter      Decimal? @db.Decimal(5, 2)
  circumference Decimal? @db.Decimal(5, 2)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  tenant        Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId])
}

//////////////////////////////////////////////////////////
// STONE
//////////////////////////////////////////////////////////

model Stone {
  id        String   @id @default(uuid())
  tenantId  String
  name      String
  type      String
  color     String?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId])
}

//////////////////////////////////////////////////////////
// MODEL IMAGE
//////////////////////////////////////////////////////////

model ModelImage {
  id           String   @id @default(uuid())
  tenantId     String
  url          String
  gender       String?
  displayOrder Int      @default(0)
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  tenant       Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId])
}

//////////////////////////////////////////////////////////
// COUPON
//////////////////////////////////////////////////////////

model Coupon {
  id            String       @id @default(uuid())
  tenantId      String
  code          String       @unique
  description   String?
  discountType  DiscountType
  discountValue Decimal      @db.Decimal(12, 2)
  minOrderValue Decimal?     @db.Decimal(12, 2)
  maxDiscount   Decimal?     @db.Decimal(12, 2)
  usageLimit    Int?
  usedCount     Int          @default(0)
  active        Boolean      @default(true)
  startDate     DateTime?
  expiryDate    DateTime?
  
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  tenant        Tenant       @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId])
  @@index([code])
}

//////////////////////////////////////////////////////////
// REVIEW
//////////////////////////////////////////////////////////

model Review {
  id         String   @id @default(uuid())
  tenantId   String
  productId  String
  customerId String
  rating     Int
  title      String?
  comment    String?
  isApproved Boolean  @default(false)
  
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  tenant     Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  product    Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  customer   Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)

  @@index([tenantId])
  @@index([productId])
  @@index([customerId])
}

//////////////////////////////////////////////////////////
// CUSTOMER`;

schema = schema.replace('//////////////////////////////////////////////////////////\n// CUSTOMER', newModels);

schema = schema.replace(/role CustomerRole @default\(CUSTOMER\)/g, 'role CustomerRole @default(CUSTOMER)\n\n  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Restrict)\n\n  reviews Review[]');
schema = schema.replace(/customerId String\n\n  fullName String/g, 'customerId String\n\n  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Restrict)\n\n  fullName String');
schema = schema.replace(/customerId String @unique\n\n  createdAt/g, 'customerId String @unique\n\n  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Restrict)\n\n  createdAt');
schema = schema.replace(/productVariantId String\?\n\n  createdAt/g, 'productVariantId String?\n\n  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Restrict)\n  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)\n  productVariant ProductVariant? @relation(fields: [productVariantId], references: [id], onDelete: SetNull)\n\n  createdAt');
schema = schema.replace(/cartId String @unique\n\n  addressId String\?/g, 'cartId String @unique\n\n  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Restrict)\n\n  addressId String?');
schema = schema.replace(/customerId String\n\n  orderNumber String @unique/g, 'customerId String\n\n  orderNumber String @unique\n\n  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Restrict)');
schema = schema.replace(/customerId String\n\n  paymentGatewayId String/g, 'customerId String\n\n  paymentGatewayId String\n\n  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Restrict)');
schema = schema.replace(/amount         Decimal  @db.Decimal\(12, 2\)/g, 'amount         Decimal  @db.Decimal(12, 2)\n  tenant         Tenant   @relation(fields: [tenantId], references: [id], onDelete: Restrict)');
schema = schema.replace(/event String\n\n  payload/g, 'event String\n\n  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Restrict)\n\n  payload');
schema = schema.replace(/eventType    String/g, 'eventType    String\n  tenant       Tenant   @relation(fields: [tenantId], references: [id], onDelete: Restrict)');
schema = schema.replace(/orderId String\n\n  invoiceNumber String @unique/g, 'orderId String\n\n  invoiceNumber String @unique\n\n  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Restrict)');
schema = schema.replace(/paymentId String\n\n  amount Decimal @db.Decimal\(12, 2\)/g, 'paymentId String\n\n  amount Decimal @db.Decimal(12, 2)\n\n  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Restrict)');
schema = schema.replace(/productVariantId String\?\n\n  \/\/ Product Snapshot/g, 'productVariantId String?\n\n  product          Product         @relation(fields: [productId], references: [id], onDelete: Cascade)\n  productVariant   ProductVariant? @relation(fields: [productVariantId], references: [id], onDelete: SetNull)\n\n  // Product Snapshot');
schema = schema.replace(/productId String\n\n  \/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\n\n  \/\/\/ Snapshot fields/g, 'productId String\n\n  productVariantId String?\n\n  product Product @relation(fields: [productId], references: [id], onDelete: Restrict)\n  productVariant ProductVariant? @relation(fields: [productVariantId], references: [id], onDelete: SetNull)\n\n  /////////////////////////////////////////////////////\n\n  /// Snapshot fields');
schema = schema.replace(/@@index\(\[productId\]\)/g, '@@index([productId])\n  @@index([productVariantId])');

fs.writeFileSync('schema.prisma', schema);
