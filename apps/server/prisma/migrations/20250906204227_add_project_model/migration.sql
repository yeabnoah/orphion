-- AlterTable
ALTER TABLE "public"."Game" ADD COLUMN     "projectId" TEXT;

-- CreateTable
CREATE TABLE "public"."Project" (
    "Id" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("Id")
);

-- AddForeignKey
ALTER TABLE "public"."Game" ADD CONSTRAINT "Game_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("Id") ON DELETE SET NULL ON UPDATE CASCADE;
