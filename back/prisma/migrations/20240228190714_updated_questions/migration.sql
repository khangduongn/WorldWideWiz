/*
  Warnings:

  - Added the required column `quizid` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "quizid" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_quizid_fkey" FOREIGN KEY ("quizid") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
