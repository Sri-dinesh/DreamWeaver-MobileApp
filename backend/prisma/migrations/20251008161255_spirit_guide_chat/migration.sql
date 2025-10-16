/*
  Warnings:

  - You are about to drop the `SpiritGuideChat` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."SpiritGuideChat" DROP CONSTRAINT "SpiritGuideChat_user_id_fkey";

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "profile_picture_url" SET DEFAULT '/assets/user_profile.png';

-- DropTable
DROP TABLE "public"."SpiritGuideChat";

-- CreateTable
CREATE TABLE "public"."SpiritChat" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_message" TEXT NOT NULL,
    "ai_response" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpiritChat_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."SpiritChat" ADD CONSTRAINT "SpiritChat_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
