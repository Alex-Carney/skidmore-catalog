/*
  Warnings:

  - You are about to drop the column `userId` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the `__RoleToAdmin` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `__RoleToPossessor` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Role" DROP CONSTRAINT "Role_userId_fkey";

-- DropForeignKey
ALTER TABLE "__RoleToAdmin" DROP CONSTRAINT "__RoleToAdmin_A_fkey";

-- DropForeignKey
ALTER TABLE "__RoleToAdmin" DROP CONSTRAINT "__RoleToAdmin_B_fkey";

-- DropForeignKey
ALTER TABLE "__RoleToPossessor" DROP CONSTRAINT "__RoleToPossessor_A_fkey";

-- DropForeignKey
ALTER TABLE "__RoleToPossessor" DROP CONSTRAINT "__RoleToPossessor_B_fkey";

-- AlterTable
ALTER TABLE "Role" DROP COLUMN "userId";

-- DropTable
DROP TABLE "__RoleToAdmin";

-- DropTable
DROP TABLE "__RoleToPossessor";

-- CreateTable
CREATE TABLE "_RoleToPossessor" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_RoleToAdmin" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_RoleToPossessor_AB_unique" ON "_RoleToPossessor"("A", "B");

-- CreateIndex
CREATE INDEX "_RoleToPossessor_B_index" ON "_RoleToPossessor"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_RoleToAdmin_AB_unique" ON "_RoleToAdmin"("A", "B");

-- CreateIndex
CREATE INDEX "_RoleToAdmin_B_index" ON "_RoleToAdmin"("B");

-- AddForeignKey
ALTER TABLE "_RoleToPossessor" ADD FOREIGN KEY ("A") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoleToPossessor" ADD FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoleToAdmin" ADD FOREIGN KEY ("A") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoleToAdmin" ADD FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
