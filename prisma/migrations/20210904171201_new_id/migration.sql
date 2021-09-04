/*
  Warnings:

  - The primary key for the `SDSS_OpticalProperties` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[AGC]` on the table `SDSS_OpticalProperties` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "SDSS_OpticalProperties.sdss_objid_unique";

-- AlterTable
ALTER TABLE "SDSS_OpticalProperties" DROP CONSTRAINT "SDSS_OpticalProperties_pkey",
ADD PRIMARY KEY ("AGC");

-- CreateIndex
CREATE UNIQUE INDEX "SDSS_OpticalProperties.AGC_unique" ON "SDSS_OpticalProperties"("AGC");
