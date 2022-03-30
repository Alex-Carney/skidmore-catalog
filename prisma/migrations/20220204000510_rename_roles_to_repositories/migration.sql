/*
  Warnings:

  - You are about to drop the `ResourcesOnRoles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RolesOnUsers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ResourcesOnRoles" DROP CONSTRAINT "ResourcesOnRoles_resourceTitle_fkey";

-- DropForeignKey
ALTER TABLE "ResourcesOnRoles" DROP CONSTRAINT "ResourcesOnRoles_roleTitle_fkey";

-- DropForeignKey
ALTER TABLE "RolesOnUsers" DROP CONSTRAINT "RolesOnUsers_roleTitle_fkey";

-- DropForeignKey
ALTER TABLE "RolesOnUsers" DROP CONSTRAINT "RolesOnUsers_userId_fkey";

-- DropTable
DROP TABLE "ResourcesOnRoles";

-- DropTable
DROP TABLE "Role";

-- DropTable
DROP TABLE "RolesOnUsers";

-- CreateTable
CREATE TABLE "Repository" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepositoriesOnUsers" (
    "repositoryTitle" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "permissionLevel" INTEGER NOT NULL,

    PRIMARY KEY ("repositoryTitle","userId")
);

-- CreateTable
CREATE TABLE "ResourcesOnRepositories" (
    "resourceTitle" TEXT NOT NULL,
    "repositoryTitle" TEXT NOT NULL,

    PRIMARY KEY ("resourceTitle","repositoryTitle")
);

-- CreateIndex
CREATE UNIQUE INDEX "Repository.title_unique" ON "Repository"("title");

-- AddForeignKey
ALTER TABLE "RepositoriesOnUsers" ADD FOREIGN KEY ("repositoryTitle") REFERENCES "Repository"("title") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepositoriesOnUsers" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourcesOnRepositories" ADD FOREIGN KEY ("resourceTitle") REFERENCES "Resource"("title") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourcesOnRepositories" ADD FOREIGN KEY ("repositoryTitle") REFERENCES "Repository"("title") ON DELETE CASCADE ON UPDATE CASCADE;
