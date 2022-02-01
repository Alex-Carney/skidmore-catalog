/*
  Warnings:

  - You are about to drop the column `columns` on the `Resource` table. All the data in the column will be lost.
  - You are about to drop the `_ResourceToRole` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[title]` on the table `Resource` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "_ResourceToRole" DROP CONSTRAINT "_ResourceToRole_A_fkey";

-- DropForeignKey
ALTER TABLE "_ResourceToRole" DROP CONSTRAINT "_ResourceToRole_B_fkey";

-- AlterTable
ALTER TABLE "Resource" DROP COLUMN "columns";

-- DropTable
DROP TABLE "_ResourceToRole";

-- CreateTable
CREATE TABLE "ResourcesOnRoles" (
    "resourceTitle" TEXT NOT NULL,
    "roleTitle" TEXT NOT NULL,

    PRIMARY KEY ("resourceTitle","roleTitle")
);

-- CreateTable
CREATE TABLE "ResourceField" (
    "id" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "dataType" TEXT NOT NULL,
    "localizedName" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Resource.title_unique" ON "Resource"("title");

-- AddForeignKey
ALTER TABLE "ResourcesOnRoles" ADD FOREIGN KEY ("resourceTitle") REFERENCES "Resource"("title") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourcesOnRoles" ADD FOREIGN KEY ("roleTitle") REFERENCES "Role"("title") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceField" ADD FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
