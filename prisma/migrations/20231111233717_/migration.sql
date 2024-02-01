/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `Torrent` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Torrent_title_key" ON "Torrent"("title");
