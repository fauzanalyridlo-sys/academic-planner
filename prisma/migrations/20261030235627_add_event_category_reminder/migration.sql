-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'TA',
ADD COLUMN     "reminderMinutes" INTEGER;
