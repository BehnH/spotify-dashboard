-- CreateTable
CREATE TABLE "PlayHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "playedAt" INTEGER NOT NULL,
    "trackId" TEXT NOT NULL,

    CONSTRAINT "PlayHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlayHistory_id_key" ON "PlayHistory"("id");

-- CreateIndex
CREATE INDEX "user_track_unique" ON "PlayHistory"("userId", "trackId");

-- CreateIndex
CREATE INDEX "PlayHistory_userId_playedAt_idx" ON "PlayHistory"("userId", "playedAt" DESC);

-- AddForeignKey
ALTER TABLE "PlayHistory" ADD CONSTRAINT "PlayHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayHistory" ADD CONSTRAINT "PlayHistory_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
