/*
  Warnings:

  - You are about to drop the column `clerkUserId` on the `User` table. All the data in the column will be lost.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/

-- First, add the password column with a temporary value
ALTER TABLE "User" ADD COLUMN "password" TEXT;

-- Update existing users with a temporary password (they'll need to reset it)
UPDATE "User" SET "password" = '$2a$12$temporary.password.hash.for.migration' WHERE "password" IS NULL;

-- Make password column NOT NULL
ALTER TABLE "User" ALTER COLUMN "password" SET NOT NULL;

-- DropIndex
DROP INDEX "User_clerkUserId_key";

-- Drop the clerkUserId column
ALTER TABLE "User" DROP COLUMN "clerkUserId";
