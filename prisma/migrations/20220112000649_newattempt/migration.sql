/*
  Warnings:

  - You are about to drop the `_RoleToAdmin` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_RoleToPossessor` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_RoleToAdmin" DROP CONSTRAINT "_RoleToAdmin_A_fkey";

-- DropForeignKey
ALTER TABLE "_RoleToAdmin" DROP CONSTRAINT "_RoleToAdmin_B_fkey";

-- DropForeignKey
ALTER TABLE "_RoleToPossessor" DROP CONSTRAINT "_RoleToPossessor_A_fkey";

-- DropForeignKey
ALTER TABLE "_RoleToPossessor" DROP CONSTRAINT "_RoleToPossessor_B_fkey";

-- DropTable
DROP TABLE "_RoleToAdmin";

-- DropTable
DROP TABLE "_RoleToPossessor";

-- CreateTable
CREATE TABLE "RolesOnUsers" (
    "roleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "permissionLevel" INTEGER NOT NULL,

    PRIMARY KEY ("roleId","userId")
);

-- AddForeignKey
ALTER TABLE "RolesOnUsers" ADD FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolesOnUsers" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
