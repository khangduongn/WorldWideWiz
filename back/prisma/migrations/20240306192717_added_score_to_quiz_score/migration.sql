/*
  Warnings:

  - Added the required column `score` to the `QuizScore` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "QuizScore" ADD COLUMN     "score" INTEGER NOT NULL;
