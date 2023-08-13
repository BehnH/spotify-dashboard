/*
  Warnings:

  - A unique constraint covering the columns `[userId,trackId,playedAt]` on the table `PlayHistory` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PlayHistory_userId_trackId_playedAt_key" ON "PlayHistory"("userId", "trackId", "playedAt");
