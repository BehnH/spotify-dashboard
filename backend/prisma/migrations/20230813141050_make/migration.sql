/*
  Warnings:

  - The values [ALBUM,SINGLE,COMPILATION] on the enum `AlbumType` will be removed. If these variants are still used in the database, this will fail.
  - The values [YEAR,MONTH,DAY] on the enum `ReleaseDatePrecision` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[artistId,url]` on the table `Image` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[albumId,url]` on the table `Image` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AlbumType_new" AS ENUM ('album', 'single', 'compilation');
ALTER TABLE "Album" ALTER COLUMN "albumType" TYPE "AlbumType_new" USING ("albumType"::text::"AlbumType_new");
ALTER TYPE "AlbumType" RENAME TO "AlbumType_old";
ALTER TYPE "AlbumType_new" RENAME TO "AlbumType";
DROP TYPE "AlbumType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ReleaseDatePrecision_new" AS ENUM ('year', 'month', 'day');
ALTER TABLE "Album" ALTER COLUMN "releaseDatePrecision" TYPE "ReleaseDatePrecision_new" USING ("releaseDatePrecision"::text::"ReleaseDatePrecision_new");
ALTER TYPE "ReleaseDatePrecision" RENAME TO "ReleaseDatePrecision_old";
ALTER TYPE "ReleaseDatePrecision_new" RENAME TO "ReleaseDatePrecision";
DROP TYPE "ReleaseDatePrecision_old";
COMMIT;

-- CreateIndex
CREATE UNIQUE INDEX "Image_artistId_url_key" ON "Image"("artistId", "url");

-- CreateIndex
CREATE UNIQUE INDEX "Image_albumId_url_key" ON "Image"("albumId", "url");
