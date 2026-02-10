/*
  Warnings:

  - The values [Apostilamento] on the enum `AdditiveType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `id_Contract` on the `ADDITIVES` table. All the data in the column will be lost.
  - You are about to drop the column `categories` on the `CONTRACTS` table. All the data in the column will be lost.
  - You are about to drop the column `contractUrl` on the `CONTRACTS` table. All the data in the column will be lost.
  - You are about to drop the column `id_User` on the `CONTRACTS` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `DOCUMENTS` table. All the data in the column will be lost.
  - You are about to drop the column `fileSize` on the `DOCUMENTS` table. All the data in the column will be lost.
  - You are about to drop the column `id_Additive` on the `DOCUMENTS` table. All the data in the column will be lost.
  - You are about to drop the column `id_Contract` on the `DOCUMENTS` table. All the data in the column will be lost.
  - You are about to drop the column `uploaded_at` on the `DOCUMENTS` table. All the data in the column will be lost.
  - You are about to drop the `CONTRACT_ITEMS` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `id_contract` to the `ADDITIVES` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `CONTRACTS` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileKey` to the `DOCUMENTS` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mimeType` to the `DOCUMENTS` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DocType" AS ENUM ('CONTRATO_PRINCIPAL', 'ATA_REGISTRO', 'APOSTILAMENTO', 'ADITIVO', 'DOCUMENTO_AUXILIAR', 'OUTROS');

-- AlterEnum
BEGIN;
CREATE TYPE "AdditiveType_new" AS ENUM ('Aditivo_de_Prazo', 'Aditivo_de_Valor');
ALTER TABLE "ADDITIVES" ALTER COLUMN "typeAdditive" TYPE "AdditiveType_new" USING ("typeAdditive"::text::"AdditiveType_new");
ALTER TYPE "AdditiveType" RENAME TO "AdditiveType_old";
ALTER TYPE "AdditiveType_new" RENAME TO "AdditiveType";
DROP TYPE "public"."AdditiveType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "ADDITIVES" DROP CONSTRAINT "FK_CONTRACT_ADDITIVE";

-- DropForeignKey
ALTER TABLE "CONTRACTS" DROP CONSTRAINT "FK_USERS_CONTRACTS";

-- DropForeignKey
ALTER TABLE "CONTRACT_ITEMS" DROP CONSTRAINT "FK_CONTRACT_ITEMS";

-- DropForeignKey
ALTER TABLE "DOCUMENTS" DROP CONSTRAINT "FK_ADDITIVE_DOCS";

-- DropForeignKey
ALTER TABLE "DOCUMENTS" DROP CONSTRAINT "FK_CONTRACT_DOCS";

-- AlterTable
ALTER TABLE "ADDITIVES" DROP COLUMN "id_Contract",
ADD COLUMN     "id_contract" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "CONTRACTS" DROP COLUMN "categories",
DROP COLUMN "contractUrl",
DROP COLUMN "id_User",
ADD COLUMN     "category" "Category" NOT NULL,
ADD COLUMN     "id_user" INTEGER;

-- AlterTable
ALTER TABLE "DOCUMENTS" DROP COLUMN "category",
DROP COLUMN "fileSize",
DROP COLUMN "id_Additive",
DROP COLUMN "id_Contract",
DROP COLUMN "uploaded_at",
ADD COLUMN     "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "docType" "DocType" NOT NULL DEFAULT 'OUTROS',
ADD COLUMN     "fileKey" TEXT NOT NULL,
ADD COLUMN     "id_additive" INTEGER,
ADD COLUMN     "id_apostille" INTEGER,
ADD COLUMN     "id_contract" INTEGER,
ADD COLUMN     "mimeType" VARCHAR(50) NOT NULL;

-- DropTable
DROP TABLE "CONTRACT_ITEMS";

-- CreateTable
CREATE TABLE "APOSTILLE" (
    "idApostille" SERIAL NOT NULL,
    "supplierName" VARCHAR(255) NOT NULL,
    "orderApostille" SMALLINT NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_contract" INTEGER NOT NULL,

    CONSTRAINT "APOSTILLE_pkey" PRIMARY KEY ("idApostille")
);

-- AddForeignKey
ALTER TABLE "DOCUMENTS" ADD CONSTRAINT "DOCUMENTS_id_contract_fkey" FOREIGN KEY ("id_contract") REFERENCES "CONTRACTS"("idContracts") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DOCUMENTS" ADD CONSTRAINT "DOCUMENTS_id_additive_fkey" FOREIGN KEY ("id_additive") REFERENCES "ADDITIVES"("idAdditive") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DOCUMENTS" ADD CONSTRAINT "DOCUMENTS_id_apostille_fkey" FOREIGN KEY ("id_apostille") REFERENCES "APOSTILLE"("idApostille") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CONTRACTS" ADD CONSTRAINT "CONTRACTS_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "USERS"("idUser") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ADDITIVES" ADD CONSTRAINT "ADDITIVES_id_contract_fkey" FOREIGN KEY ("id_contract") REFERENCES "CONTRACTS"("idContracts") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "APOSTILLE" ADD CONSTRAINT "APOSTILLE_id_contract_fkey" FOREIGN KEY ("id_contract") REFERENCES "CONTRACTS"("idContracts") ON DELETE CASCADE ON UPDATE CASCADE;
