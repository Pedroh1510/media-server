/*
  Warnings:

  - You are about to drop the `AccpetTags` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "AccpetTags";

-- CreateTable
CREATE TABLE "AcceptedTags" (
    "id" SERIAL NOT NULL,
    "tag" TEXT NOT NULL,

    CONSTRAINT "AcceptedTags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AcceptedTags_tag_key" ON "AcceptedTags"("tag");
