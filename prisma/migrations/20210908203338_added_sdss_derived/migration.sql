/*
  Warnings:

  - The primary key for the `SDSS_OpticalProperties` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `AGC` on the `SDSS_OpticalProperties` table. All the data in the column will be lost.
  - You are about to drop the column `DEC` on the `SDSS_OpticalProperties` table. All the data in the column will be lost.
  - You are about to drop the column `Dist` on the `SDSS_OpticalProperties` table. All the data in the column will be lost.
  - You are about to drop the column `RA` on the `SDSS_OpticalProperties` table. All the data in the column will be lost.
  - You are about to drop the column `Vhelio` on the `SDSS_OpticalProperties` table. All the data in the column will be lost.
  - You are about to drop the column `cModelMagErr_i` on the `SDSS_OpticalProperties` table. All the data in the column will be lost.
  - You are about to drop the column `cModelMag_i` on the `SDSS_OpticalProperties` table. All the data in the column will be lost.
  - You are about to drop the column `expAB_r` on the `SDSS_OpticalProperties` table. All the data in the column will be lost.
  - You are about to drop the column `expAB_r_err` on the `SDSS_OpticalProperties` table. All the data in the column will be lost.
  - You are about to drop the column `sdssPhotFlag` on the `SDSS_OpticalProperties` table. All the data in the column will be lost.
  - You are about to drop the column `sigDist` on the `SDSS_OpticalProperties` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[agc]` on the table `SDSS_OpticalProperties` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `agc` to the `SDSS_OpticalProperties` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dec` to the `SDSS_OpticalProperties` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dist` to the `SDSS_OpticalProperties` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ra` to the `SDSS_OpticalProperties` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sdss_phot_flag` to the `SDSS_OpticalProperties` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sig_dist` to the `SDSS_OpticalProperties` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vhelio` to the `SDSS_OpticalProperties` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "SDSS_OpticalProperties.AGC_unique";

-- AlterTable
ALTER TABLE "SDSS_OpticalProperties" DROP CONSTRAINT "SDSS_OpticalProperties_pkey",
DROP COLUMN "AGC",
DROP COLUMN "DEC",
DROP COLUMN "Dist",
DROP COLUMN "RA",
DROP COLUMN "Vhelio",
DROP COLUMN "cModelMagErr_i",
DROP COLUMN "cModelMag_i",
DROP COLUMN "expAB_r",
DROP COLUMN "expAB_r_err",
DROP COLUMN "sdssPhotFlag",
DROP COLUMN "sigDist",
ADD COLUMN     "agc" INTEGER NOT NULL,
ADD COLUMN     "c_model_mag_err_i" DOUBLE PRECISION,
ADD COLUMN     "c_model_mag_i" DOUBLE PRECISION,
ADD COLUMN     "dec" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "dist" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "exp_ab_r" DOUBLE PRECISION,
ADD COLUMN     "exp_ab_r_err" DOUBLE PRECISION,
ADD COLUMN     "ra" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "sdss_phot_flag" INTEGER NOT NULL,
ADD COLUMN     "sig_dist" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "vhelio" INTEGER NOT NULL,
ADD PRIMARY KEY ("agc");

-- CreateTable
CREATE TABLE "SDSS_DerivedProperties" (
    "agc" INTEGER NOT NULL,
    "gamma_g" DOUBLE PRECISION,
    "gamma_i" DOUBLE PRECISION,
    "abs_mag_i_corr" DOUBLE PRECISION,
    "abs_mag_i_corr_err" DOUBLE PRECISION,
    "gmi_corr" DOUBLE PRECISION,
    "gmi_corr_err" DOUBLE PRECISION,
    "log_mstar_taylor" DOUBLE PRECISION,
    "log_mstar_taylor_err" DOUBLE PRECISION,
    "log_mstar_mcgaugh" DOUBLE PRECISION,
    "log_mstar_mcgaugh_err" DOUBLE PRECISION,
    "log_mstar_gswlc" DOUBLE PRECISION,
    "log_mstar_gswlc_err" DOUBLE PRECISION,
    "log_sfr22" DOUBLE PRECISION,
    "log_sfr22_err" DOUBLE PRECISION,
    "log_sfr_nuvir" DOUBLE PRECISION,
    "log_sfr_nuvir_err" DOUBLE PRECISION,
    "log_sfr_gswlc" DOUBLE PRECISION,
    "log_sfr_gswlc_err" DOUBLE PRECISION,
    "log_mh" DOUBLE PRECISION,
    "log_mh_err" DOUBLE PRECISION,

    PRIMARY KEY ("agc")
);

-- CreateIndex
CREATE UNIQUE INDEX "SDSS_DerivedProperties.agc_unique" ON "SDSS_DerivedProperties"("agc");

-- CreateIndex
CREATE UNIQUE INDEX "SDSS_OpticalProperties.agc_unique" ON "SDSS_OpticalProperties"("agc");
