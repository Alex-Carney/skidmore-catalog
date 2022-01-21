/*
  Warnings:

  - Made the column `adminId` on table `Role` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Role" ALTER COLUMN "adminId" SET NOT NULL;
