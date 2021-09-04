-- CreateTable
CREATE TABLE "Tully_Group" (
    "nest" INTEGER NOT NULL,
    "num_members" INTEGER NOT NULL,
    "pcg_name" TEXT NOT NULL,
    "sg_lon" DOUBLE PRECISION NOT NULL,
    "sg_lat" DOUBLE PRECISION NOT NULL,
    "log_lk" DOUBLE PRECISION NOT NULL,
    "v_mod" DOUBLE PRECISION NOT NULL,
    "dist_mod" DOUBLE PRECISION NOT NULL,
    "sig_v" DOUBLE PRECISION NOT NULL,
    "r2t" DOUBLE PRECISION NOT NULL,
    "sigmap" DOUBLE PRECISION NOT NULL,
    "mass" BIGINT NOT NULL,
    "cf" DOUBLE PRECISION NOT NULL,

    PRIMARY KEY ("nest")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tully_Group.nest_unique" ON "Tully_Group"("nest");

-- CreateIndex
CREATE UNIQUE INDEX "Tully_Group.pcg_name_unique" ON "Tully_Group"("pcg_name");
