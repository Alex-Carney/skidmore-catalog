/*
  Warnings:

  - The primary key for the `RolesOnUsers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `roleId` on the `RolesOnUsers` table. All the data in the column will be lost.
  - Added the required column `roleTitle` to the `RolesOnUsers` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RolesOnUsers" DROP CONSTRAINT "RolesOnUsers_roleId_fkey";

-- AlterTable
ALTER TABLE "RolesOnUsers" DROP CONSTRAINT "RolesOnUsers_pkey",
DROP COLUMN "roleId",
ADD COLUMN     "roleTitle" TEXT NOT NULL,
ADD PRIMARY KEY ("roleTitle", "userId");

-- AddForeignKey
ALTER TABLE "RolesOnUsers" ADD FOREIGN KEY ("roleTitle") REFERENCES "Role"("title") ON DELETE CASCADE ON UPDATE CASCADE;
