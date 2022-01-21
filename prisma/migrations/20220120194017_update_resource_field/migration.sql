/*
  Warnings:

  - You are about to drop the column `resourceId` on the `ResourceField` table. All the data in the column will be lost.
  - Added the required column `resourceTitle` to the `ResourceField` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ResourceField" DROP CONSTRAINT "ResourceField_resourceId_fkey";

-- AlterTable
ALTER TABLE "ResourceField" DROP COLUMN "resourceId",
ADD COLUMN     "resourceTitle" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "ResourceField" ADD FOREIGN KEY ("resourceTitle") REFERENCES "Resource"("title") ON DELETE CASCADE ON UPDATE CASCADE;
