/*
  Warnings:

  - You are about to drop the column `adminId` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the `_RoleToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Role" DROP CONSTRAINT "Role_adminId_fkey";

-- DropForeignKey
ALTER TABLE "_RoleToUser" DROP CONSTRAINT "_RoleToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_RoleToUser" DROP CONSTRAINT "_RoleToUser_B_fkey";

-- AlterTable
ALTER TABLE "Role" DROP COLUMN "adminId",
ADD COLUMN     "userId" TEXT;

-- DropTable
DROP TABLE "_RoleToUser";

-- CreateTable
CREATE TABLE "__RoleToPossessor" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "__RoleToAdmin" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "__RoleToPossessor_AB_unique" ON "__RoleToPossessor"("A", "B");

-- CreateIndex
CREATE INDEX "__RoleToPossessor_B_index" ON "__RoleToPossessor"("B");

-- CreateIndex
CREATE UNIQUE INDEX "__RoleToAdmin_AB_unique" ON "__RoleToAdmin"("A", "B");

-- CreateIndex
CREATE INDEX "__RoleToAdmin_B_index" ON "__RoleToAdmin"("B");

-- AddForeignKey
ALTER TABLE "Role" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "__RoleToPossessor" ADD FOREIGN KEY ("A") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "__RoleToPossessor" ADD FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "__RoleToAdmin" ADD FOREIGN KEY ("A") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "__RoleToAdmin" ADD FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
