/*
  Warnings:

  - You are about to drop the `SpiritChat` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."SpiritChat" DROP CONSTRAINT "SpiritChat_user_id_fkey";

-- DropTable
DROP TABLE "public"."SpiritChat";

-- CreateTable
CREATE TABLE "public"."SpiritGuideChat" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_message" TEXT NOT NULL,
    "ai_response" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpiritGuideChat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SpiritGuideChat_user_id_idx" ON "public"."SpiritGuideChat"("user_id");

-- AddForeignKey
ALTER TABLE "public"."SpiritGuideChat" ADD CONSTRAINT "SpiritGuideChat_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
