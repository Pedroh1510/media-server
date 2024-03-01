-- CreateTable
CREATE TABLE "AccpetTags" (
    "id" SERIAL NOT NULL,
    "tag" TEXT NOT NULL,

    CONSTRAINT "AccpetTags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerifyTags" (
    "id" SERIAL NOT NULL,
    "tag" TEXT NOT NULL,

    CONSTRAINT "VerifyTags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccpetTags_tag_key" ON "AccpetTags"("tag");

-- CreateIndex
CREATE UNIQUE INDEX "VerifyTags_tag_key" ON "VerifyTags"("tag");
