/*
  Warnings:

  - You are about to drop the `conversation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `conversation_participant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `message` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."conversation_participant" DROP CONSTRAINT "conversation_participant_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."conversation_participant" DROP CONSTRAINT "conversation_participant_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."message" DROP CONSTRAINT "message_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."message" DROP CONSTRAINT "message_senderId_fkey";

-- DropTable
DROP TABLE "public"."conversation";

-- DropTable
DROP TABLE "public"."conversation_participant";

-- DropTable
DROP TABLE "public"."message";

-- CreateTable
CREATE TABLE "public"."Chat" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Message" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Chat_senderId_receiverId_key" ON "public"."Chat"("senderId", "receiverId");

-- AddForeignKey
ALTER TABLE "public"."Chat" ADD CONSTRAINT "Chat_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Chat" ADD CONSTRAINT "Chat_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "public"."Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
