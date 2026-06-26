-- AlterTable
ALTER TABLE "Roadmap" ADD COLUMN     "progress" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'not_started';
