/*
  Warnings:

  - The primary key for the `Odekon_Catalog` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[objid_new_1_1]` on the table `Odekon_Catalog` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Odekon_Catalog.agcnum_unique";

-- AlterTable
ALTER TABLE "Odekon_Catalog" DROP CONSTRAINT "Odekon_Catalog_pkey",
ALTER COLUMN "agcnum" DROP NOT NULL,
ADD PRIMARY KEY ("objid_new_1_1");

-- CreateIndex
CREATE UNIQUE INDEX "Odekon_Catalog.objid_new_1_1_unique" ON "Odekon_Catalog"("objid_new_1_1");
