-- CreateTable
CREATE TABLE "Torrent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "magnet" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "pubDate" DATETIME NOT NULL
);
