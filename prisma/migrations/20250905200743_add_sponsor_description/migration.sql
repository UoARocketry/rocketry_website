/*
  Warnings:

  - You are about to drop the `Member` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `description` to the `Sponsor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Sponsor" ADD COLUMN     "description" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."Member";
