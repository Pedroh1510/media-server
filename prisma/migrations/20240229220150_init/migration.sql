-- CreateTable
CREATE TABLE "Torrent" (
    "id" SERIAL NOT NULL,
    "magnet" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "pubDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Torrent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Torrent_title_key" ON "Torrent"("title");
