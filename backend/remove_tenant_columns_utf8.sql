-- DropIndex
DROP INDEX "Tenant_domain_key";

-- AlterTable
ALTER TABLE "Tenant" DROP COLUMN "domain",
DROP COLUMN "favicon",
DROP COLUMN "logo";

