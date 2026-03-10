import { Injectable } from '@nestjs/common';
import { DocumentsService } from '../documents/documents.service';
import { PrismaService } from 'src/prisma.service';
import { ContractStatus, DocType } from 'generated/prisma/enums';
import { CreateContractDto } from './dto/create-contract.dto';
import { updateContractDto } from './dto/update-contract.dto';
import { ContractDateFilter } from 'src/common/enums/contract-filter.enum';
import { ContractFilterDto } from './dto/contract-filter.dto';
import { Prisma } from 'generated/prisma/client';

@Injectable()
export class ContractsService {
  constructor(
    private prisma: PrismaService,
    private documentsService: DocumentsService,
  ) {}

  async create(
    data: CreateContractDto,
    files: { mainFile: Express.Multer.File; ataFile: Express.Multer.File },
    id_user: number,
  ) {
    return await this.prisma.$transaction(async (tx) => {
      const contract = await tx.contract.create({
        data: { ...data, createdByUser: { connect: { idUser: id_user } } },
        include: {
          createdByUser: {
            select: { name: true },
          },
        },
      });

      await this.documentsService.handleFileUpload(
        files.mainFile,
        DocType.CONTRATO_PRINCIPAL,
        { contractId: contract.idContracts },
        tx,
      );

      await this.documentsService.handleFileUpload(
        files.ataFile,
        DocType.ATA_REGISTRO,
        { contractId: contract.idContracts },
        tx,
      );

      return contract;
    });
  }

  async update(id: number, data: updateContractDto) {
    return await this.prisma.contract.update({
      where: { idContracts: id },
      data,
    });
  }

  async findOne(id: number) {
    return await this.prisma.contract.findUnique({
      where: { idContracts: id },
      include: {
        documents: true,
        additives: {
          include: { documents: true },
        },
        apostilles: {
          include: { documents: true },
        },
      },
    });
  }

  async findAll(dto: ContractFilterDto) {
    const { take, cursor, status, dateFilter, search } = dto;

    const limit = Number(take) || 10;

    const where: Prisma.ContractWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { contractor: { contains: search, mode: 'insensitive' } },
        { contractNum: { contains: search, mode: 'insensitive' } },
      ];
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dateFilter === ContractDateFilter.EXPIRED_OVER_30) {
      const dateLimit = new Date(today);
      dateLimit.setDate(today.getDate() - 30);

      where.endDate = {
        lt: dateLimit,
      };
    } else if (dateFilter === ContractDateFilter.EXPIRING_IN_30) {
      const dateLimit = new Date(today);
      dateLimit.setDate(today.getDate() + 30);

      where.endDate = {
        gte: today,
        lte: dateLimit,
      };
    }

    const cursorObj = cursor ? { idContracts: Number(cursor) } : undefined;

    const data = await this.prisma.contract.findMany({
      take: limit + 1,
      skip: cursor ? 1 : 0,
      cursor: cursorObj,
      where,
      orderBy: [{ endDate: 'asc' }, { idContracts: 'desc' }],
      include: {
        documents: true,
      },
    });

    const hasNextPage = data.length > limit;

    if (hasNextPage) {
      data.pop();
    }

    const lastItem = data[data.length - 1];
    const nextCursor = lastItem ? lastItem.idContracts.toString() : null;

    return {
      data,
      meta: {
        nextCursor,
        hasNextPage,
      },
    };
  }

  async getSummary() {
    const [
      totalContracts,
      activeTotalContracts,
      contractsTotalValueResult,
      totalSuspendedContracts,
      closedTotalContracts,
    ] = await Promise.all([
      this.prisma.contract.count(),
      this.prisma.contract.count({ where: { status: ContractStatus.ATIVO } }),
      this.prisma.contract.aggregate({ _sum: { contractValue: true } }),
      this.prisma.contract.count({
        where: { status: ContractStatus.SUSPENSO },
      }),
      this.prisma.contract.count({
        where: { status: ContractStatus.ENCERRADO },
      }),
    ]);

    return {
      total: totalContracts,
      active: activeTotalContracts,
      suspended: totalSuspendedContracts,
      closed: closedTotalContracts,
      totalValue: contractsTotalValueResult._sum.contractValue || 0,
    };
  }
}
