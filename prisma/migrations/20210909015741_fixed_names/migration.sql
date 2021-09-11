/*
  Warnings:

  - You are about to drop the column `gmi_corr` on the `SDSS_DerivedProperties` table. All the data in the column will be lost.
  - You are about to drop the column `log_mh` on the `SDSS_DerivedProperties` table. All the data in the column will be lost.
  - You are about to drop the column `log_mh_err` on the `SDSS_DerivedProperties` table. All the data in the column will be lost.
  - You are about to drop the column `log_mstar_gswlc` on the `SDSS_DerivedProperties` table. All the data in the column will be lost.
  - You are about to drop the column `log_mstar_gswlc_err` on the `SDSS_DerivedProperties` table. All the data in the column will be lost.
  - You are about to drop the column `log_mstar_mcgaugh` on the `SDSS_DerivedProperties` table. All the data in the column will be lost.
  - You are about to drop the column `log_mstar_mcgaugh_err` on the `SDSS_DerivedProperties` table. All the data in the column will be lost.
  - You are about to drop the column `log_sfr22` on the `SDSS_DerivedProperties` table. All the data in the column will be lost.
  - You are about to drop the column `log_sfr22_err` on the `SDSS_DerivedProperties` table. All the data in the column will be lost.
  - You are about to drop the column `log_sfr_gswlc` on the `SDSS_DerivedProperties` table. All the data in the column will be lost.
  - You are about to drop the column `log_sfr_gswlc_err` on the `SDSS_DerivedProperties` table. All the data in the column will be lost.
  - You are about to drop the column `log_sfr_nuvir` on the `SDSS_DerivedProperties` table. All the data in the column will be lost.
  - You are about to drop the column `log_sfr_nuvir_err` on the `SDSS_DerivedProperties` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SDSS_DerivedProperties" DROP COLUMN "gmi_corr",
DROP COLUMN "log_mh",
DROP COLUMN "log_mh_err",
DROP COLUMN "log_mstar_gswlc",
DROP COLUMN "log_mstar_gswlc_err",
DROP COLUMN "log_mstar_mcgaugh",
DROP COLUMN "log_mstar_mcgaugh_err",
DROP COLUMN "log_sfr22",
DROP COLUMN "log_sfr22_err",
DROP COLUMN "log_sfr_gswlc",
DROP COLUMN "log_sfr_gswlc_err",
DROP COLUMN "log_sfr_nuvir",
DROP COLUMN "log_sfr_nuvir_err",
ADD COLUMN     "log_mstar_mc_gaugh" DOUBLE PRECISION,
ADD COLUMN     "log_mstar_mc_gaugh_err" DOUBLE PRECISION,
ADD COLUMN     "log_mstargswlc" DOUBLE PRECISION,
ADD COLUMN     "log_mstargswlc_err" DOUBLE PRECISION,
ADD COLUMN     "logmh" DOUBLE PRECISION,
ADD COLUMN     "logmh_err" DOUBLE PRECISION,
ADD COLUMN     "logsfr22" DOUBLE PRECISION,
ADD COLUMN     "logsfr22_err" DOUBLE PRECISION,
ADD COLUMN     "logsfrgswlc" DOUBLE PRECISION,
ADD COLUMN     "logsfrgswlc_err" DOUBLE PRECISION,
ADD COLUMN     "logsfrnuvir" DOUBLE PRECISION,
ADD COLUMN     "logsfrnuvir_err" DOUBLE PRECISION;
