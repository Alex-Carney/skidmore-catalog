/*
  Warnings:

  - You are about to drop the column `authorId` on the `Role` table. All the data in the column will be lost.
  - Added the required column `adminId` to the `Role` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Role" DROP CONSTRAINT "Role_authorId_fkey";

-- AlterTable
ALTER TABLE "Role" DROP COLUMN "authorId",
ADD COLUMN     "adminId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Resource" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "columns" TEXT[],

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ResourceToRole" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ResourceToRole_AB_unique" ON "_ResourceToRole"("A", "B");

-- CreateIndex
CREATE INDEX "_ResourceToRole_B_index" ON "_ResourceToRole"("B");

-- AddForeignKey
ALTER TABLE "Role" ADD FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ResourceToRole" ADD FOREIGN KEY ("A") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ResourceToRole" ADD FOREIGN KEY ("B") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
