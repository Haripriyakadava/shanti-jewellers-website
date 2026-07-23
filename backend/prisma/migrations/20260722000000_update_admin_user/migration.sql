-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AdminRole" ADD VALUE 'OWNER';
ALTER TYPE "AdminRole" ADD VALUE 'SALES';
ALTER TYPE "AdminRole" ADD VALUE 'ACCOUNTANT';
ALTER TYPE "AdminRole" ADD VALUE 'INVENTORY_MANAGER';
ALTER TYPE "AdminRole" ADD VALUE 'STAFF';

-- AlterTable
ALTER TABLE "AdminUser" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "department" TEXT,
ADD COLUMN     "designation" TEXT,
ADD COLUMN     "employeeCode" TEXT,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "fullName" TEXT,
ADD COLUMN     "isOwner" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastLogin" TIMESTAMP(3),
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "passwordChangedAt" TIMESTAMP(3),
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "profileImage" TEXT,
ALTER COLUMN "passwordHash" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_employeeCode_key" ON "AdminUser"("employeeCode");

-- CreateIndex
CREATE INDEX "AdminUser_employeeCode_idx" ON "AdminUser"("employeeCode");

-- CreateIndex
CREATE INDEX "AdminUser_role_idx" ON "AdminUser"("role");

