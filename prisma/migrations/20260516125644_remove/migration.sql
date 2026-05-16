/*
  Warnings:

  - You are about to drop the column `is_sharable` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `skills` on the `Project` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_profileId_fkey";

-- DropForeignKey
ALTER TABLE "SocialLink" DROP CONSTRAINT "SocialLink_profileId_fkey";

-- DropIndex
DROP INDEX "Profile_id_key";

-- DropIndex
DROP INDEX "Project_id_key";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "is_sharable",
DROP COLUMN "skills";

-- AddForeignKey
ALTER TABLE "SocialLink" ADD CONSTRAINT "SocialLink_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
