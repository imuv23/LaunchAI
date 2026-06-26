/*
  Warnings:

  - You are about to drop the column `title` on the `Roadmap` table. All the data in the column will be lost.
  - Added the required column `description` to the `Roadmap` table without a default value. This is not possible if the table is not empty.
  - Added the required column `industry` to the `Roadmap` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `Roadmap` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timeframe` to the `Roadmap` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Roadmap" DROP COLUMN "title",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "industry" TEXT NOT NULL,
ADD COLUMN     "role" TEXT NOT NULL,
ADD COLUMN     "skills" TEXT[],
ADD COLUMN     "timeframe" INTEGER NOT NULL;
