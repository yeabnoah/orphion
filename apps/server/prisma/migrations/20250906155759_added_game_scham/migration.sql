-- CreateEnum
CREATE TYPE "public"."GameTypes" AS ENUM ('INDIVIDUAL', 'GROUP');

-- CreateTable
CREATE TABLE "public"."Game" (
    "Id" TEXT NOT NULL,
    "gameName" TEXT NOT NULL,
    "gameType" "public"."GameTypes" NOT NULL,
    "imageUrls" TEXT[],
    "answer" TEXT NOT NULL,
    "hint" TEXT NOT NULL,
    "time" INTEGER NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("Id")
);
