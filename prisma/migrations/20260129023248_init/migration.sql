-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'EDITOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('ATIVO', 'SUSPENSO', 'ENCERRADO', 'ATENCAO');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('MATERIAL', 'SERVICOS', 'LOCACAO_DE_IMOVEL', 'TECNOLOGIA', 'OBRAS', 'CONSULTORIA', 'OUTROS');

-- CreateEnum
CREATE TYPE "AdditiveType" AS ENUM ('Aditivo_de_Prazo', 'Aditivo_de_Valor', 'Apostilamento');

-- CreateTable
CREATE TABLE "USERS" (
    "idUser" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'VIEWER',
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "USERS_pkey" PRIMARY KEY ("idUser")
);

-- CreateTable
CREATE TABLE "CONTRACTS" (
    "idContracts" SERIAL NOT NULL,
    "contractNum" VARCHAR(50) NOT NULL,
    "objects" TEXT NOT NULL,
    "contractor" VARCHAR(150) NOT NULL,
    "contractValue" DECIMAL(15,2) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "status" "ContractStatus" NOT NULL DEFAULT 'ATIVO',
    "categories" "Category" NOT NULL,
    "contractUrl" TEXT,
    "id_User" INTEGER,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CONTRACTS_pkey" PRIMARY KEY ("idContracts")
);

-- CreateTable
CREATE TABLE "ADDITIVES" (
    "idAdditive" SERIAL NOT NULL,
    "id_Contract" INTEGER NOT NULL,
    "typeAdditive" "AdditiveType" NOT NULL,
    "description" TEXT NOT NULL,
    "valueChange" DECIMAL(15,2) DEFAULT 0.00,
    "newEndDate" DATE,
    "dateSigned" DATE NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ADDITIVES_pkey" PRIMARY KEY ("idAdditive")
);

-- CreateTable
CREATE TABLE "CONTRACT_ITEMS" (
    "idItem" SERIAL NOT NULL,
    "id_Contract" INTEGER NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unit_price" DECIMAL(15,2) NOT NULL,
    "total_price" DECIMAL(15,2) NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CONTRACT_ITEMS_pkey" PRIMARY KEY ("idItem")
);

-- CreateTable
CREATE TABLE "DOCUMENTS" (
    "idDocument" SERIAL NOT NULL,
    "id_Contract" INTEGER NOT NULL,
    "id_Additive" INTEGER,
    "fileName" VARCHAR(255) NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" VARCHAR(50),
    "category" VARCHAR(50),
    "uploaded_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DOCUMENTS_pkey" PRIMARY KEY ("idDocument")
);

-- CreateIndex
CREATE UNIQUE INDEX "USERS_email_key" ON "USERS"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CONTRACTS_contractNum_key" ON "CONTRACTS"("contractNum");

-- AddForeignKey
ALTER TABLE "CONTRACTS" ADD CONSTRAINT "FK_USERS_CONTRACTS" FOREIGN KEY ("id_User") REFERENCES "USERS"("idUser") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ADDITIVES" ADD CONSTRAINT "FK_CONTRACT_ADDITIVE" FOREIGN KEY ("id_Contract") REFERENCES "CONTRACTS"("idContracts") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CONTRACT_ITEMS" ADD CONSTRAINT "FK_CONTRACT_ITEMS" FOREIGN KEY ("id_Contract") REFERENCES "CONTRACTS"("idContracts") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DOCUMENTS" ADD CONSTRAINT "FK_CONTRACT_DOCS" FOREIGN KEY ("id_Contract") REFERENCES "CONTRACTS"("idContracts") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DOCUMENTS" ADD CONSTRAINT "FK_ADDITIVE_DOCS" FOREIGN KEY ("id_Additive") REFERENCES "ADDITIVES"("idAdditive") ON DELETE SET NULL ON UPDATE CASCADE;
