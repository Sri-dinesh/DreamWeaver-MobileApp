-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "email" TEXT,
    "reality_check_frequency" TEXT NOT NULL DEFAULT 'daily',
    "lucid_dream_goal" TEXT NOT NULL DEFAULT 'Better dream recall',
    "profile_picture_url" TEXT DEFAULT '/static/images/default_profile_pic.png',
    "bio" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DreamEntry" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,
    "ai_analysis" TEXT,
    "is_lucid" BOOLEAN NOT NULL DEFAULT false,
    "emotion" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'private',

    CONSTRAINT "DreamEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Tag" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AIPrompt" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_input" TEXT NOT NULL,
    "ai_response" TEXT NOT NULL,

    CONSTRAINT "AIPrompt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AudioPrompt" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "original_text" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "description" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ai_prompt_id" INTEGER,

    CONSTRAINT "AudioPrompt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SleepPlan" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "plan_date" DATE NOT NULL,
    "goal" TEXT NOT NULL,
    "bedtime_ritual" TEXT,
    "sleep_time" TIME,
    "wake_time" TIME,
    "ai_ritual_suggestion" TEXT,

    CONSTRAINT "SleepPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LucidTrainerSetting" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "reality_check_time" TIME,
    "rc_frequency" TEXT NOT NULL DEFAULT 'off',
    "rc_method" TEXT NOT NULL DEFAULT 'hand-check',
    "last_rc_reminder" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LucidTrainerSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SpiritGuideChat" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_message" TEXT NOT NULL,
    "ai_response" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpiritGuideChat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DreamArt" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,

    CONSTRAINT "DreamArt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SleepRecording" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_time" TIMESTAMP(3),
    "file_path" TEXT NOT NULL,
    "duration_seconds" INTEGER,
    "notes" TEXT,

    CONSTRAINT "SleepRecording_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FriendRequest" (
    "id" SERIAL NOT NULL,
    "sender_id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'pending',

    CONSTRAINT "FriendRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_UserFollows" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserFollows_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_DreamEntryTags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_DreamEntryTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "public"."Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AudioPrompt_ai_prompt_id_key" ON "public"."AudioPrompt"("ai_prompt_id");

-- CreateIndex
CREATE UNIQUE INDEX "SleepPlan_user_id_plan_date_key" ON "public"."SleepPlan"("user_id", "plan_date");

-- CreateIndex
CREATE UNIQUE INDEX "LucidTrainerSetting_user_id_key" ON "public"."LucidTrainerSetting"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "FriendRequest_sender_id_receiver_id_key" ON "public"."FriendRequest"("sender_id", "receiver_id");

-- CreateIndex
CREATE INDEX "_UserFollows_B_index" ON "public"."_UserFollows"("B");

-- CreateIndex
CREATE INDEX "_DreamEntryTags_B_index" ON "public"."_DreamEntryTags"("B");

-- AddForeignKey
ALTER TABLE "public"."DreamEntry" ADD CONSTRAINT "DreamEntry_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AIPrompt" ADD CONSTRAINT "AIPrompt_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AudioPrompt" ADD CONSTRAINT "AudioPrompt_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AudioPrompt" ADD CONSTRAINT "AudioPrompt_ai_prompt_id_fkey" FOREIGN KEY ("ai_prompt_id") REFERENCES "public"."AIPrompt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SleepPlan" ADD CONSTRAINT "SleepPlan_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LucidTrainerSetting" ADD CONSTRAINT "LucidTrainerSetting_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SpiritGuideChat" ADD CONSTRAINT "SpiritGuideChat_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DreamArt" ADD CONSTRAINT "DreamArt_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SleepRecording" ADD CONSTRAINT "SleepRecording_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FriendRequest" ADD CONSTRAINT "FriendRequest_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FriendRequest" ADD CONSTRAINT "FriendRequest_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_UserFollows" ADD CONSTRAINT "_UserFollows_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_UserFollows" ADD CONSTRAINT "_UserFollows_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_DreamEntryTags" ADD CONSTRAINT "_DreamEntryTags_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."DreamEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_DreamEntryTags" ADD CONSTRAINT "_DreamEntryTags_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
