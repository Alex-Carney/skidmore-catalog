-- CreateTable
CREATE TABLE "SDSS_OpticalProperties" (
    "AGC" INTEGER NOT NULL,
    "sdssPhotFlag" INTEGER NOT NULL,
    "sdss_objid" TEXT NOT NULL,
    "RA" DOUBLE PRECISION NOT NULL,
    "DEC" DOUBLE PRECISION NOT NULL,
    "Vhelio" INTEGER NOT NULL,
    "Dist" DOUBLE PRECISION NOT NULL,
    "sigDist" DOUBLE PRECISION NOT NULL,
    "extinction_g" DOUBLE PRECISION NOT NULL,
    "extinction_i" DOUBLE PRECISION NOT NULL,
    "expAB_r" DOUBLE PRECISION NOT NULL,
    "expAB_r_err" DOUBLE PRECISION NOT NULL,
    "cModelMag_i" DOUBLE PRECISION NOT NULL,
    "cModelMagErr_i" DOUBLE PRECISION NOT NULL,

    PRIMARY KEY ("sdss_objid")
);

-- CreateIndex
CREATE UNIQUE INDEX "SDSS_OpticalProperties.sdss_objid_unique" ON "SDSS_OpticalProperties"("sdss_objid");
