/*
  Warnings:

  - You are about to drop the column `expiresIn` on the `User` table. All the data in the column will be lost.
  - Added the required column `expiresAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "expiresIn",
ADD COLUMN     "expiresAt" INTEGER NOT NULL;
