/*
  Warnings:

  - You are about to drop the `BlogPost` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Sponsor" ADD COLUMN     "tier" TEXT NOT NULL DEFAULT 'BRONZE';

-- DropTable
DROP TABLE "public"."BlogPost";
