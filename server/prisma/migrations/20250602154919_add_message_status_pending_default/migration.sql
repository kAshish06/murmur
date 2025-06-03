-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('PENDING', 'SEEN', 'UNSEEN');

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "status" "MessageStatus" NOT NULL DEFAULT 'PENDING';
