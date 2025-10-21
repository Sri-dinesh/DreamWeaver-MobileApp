/*
  Warnings:

  - You are about to drop the column `title` on the `DreamEntry` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."DreamEntry" DROP COLUMN "title";

-- CreateTable
CREATE TABLE "public"."AudioLibrary" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'meditation',
    "file_path" TEXT NOT NULL,
    "storage_url" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_size" INTEGER,
    "duration_seconds" INTEGER NOT NULL DEFAULT 0,
    "visibility" TEXT NOT NULL DEFAULT 'private',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AudioLibrary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AudioLibrary_user_id_idx" ON "public"."AudioLibrary"("user_id");

-- CreateIndex
CREATE INDEX "AudioLibrary_category_idx" ON "public"."AudioLibrary"("category");

-- AddForeignKey
ALTER TABLE "public"."AudioLibrary" ADD CONSTRAINT "AudioLibrary_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
