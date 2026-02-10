/*
  Warnings:

  - Added the required column `dateApostille` to the `APOSTILLE` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "APOSTILLE" ADD COLUMN     "dateApostille" DATE NOT NULL;
