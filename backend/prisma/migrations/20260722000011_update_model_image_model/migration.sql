-- AlterTable
ALTER TABLE "ModelImage" RENAME COLUMN "url" TO "imageUrl";

-- AlterTable
ALTER TABLE "ModelImage" DROP COLUMN "gender",
ADD COLUMN     "categoryId" TEXT NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "title" TEXT NOT NULL DEFAULT 'Untitled';

-- AlterTable
ALTER TABLE "ModelImage" ALTER COLUMN "categoryId" DROP DEFAULT;
ALTER TABLE "ModelImage" ALTER COLUMN "title" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "ModelImage" ADD CONSTRAINT "ModelImage_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
