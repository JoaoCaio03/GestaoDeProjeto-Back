import { Injectable } from '@nestjs/common';
import { CreateApostilleDto } from './dto/create-apostille.dto';
import { PrismaService } from 'src/prisma.service';
import { DocumentsService } from 'src/documents/documents.service';
import { DocType } from 'generated/prisma/enums';
import { UpdateAPostilleDto } from './dto/update-apostille.dto';
import { Prisma } from 'generated/prisma/client';
import { ApostilleFilterDto } from './dto/apostille-fitler.dto';

@Injectable()
export class ApostilleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly documentsService: DocumentsService,
  ) {}

  async create(data: CreateApostilleDto, file: Express.Multer.File) {
    const { idContract, ...createApostilleData } = data;
    return await this.prisma.$transaction(async (tx) => {
      const apostille = await tx.apostille.create({
        data: {
          ...createApostilleData,
          contract: {
            connect: { idContracts: idContract },
          },
        },
      });

      await this.documentsService.handleFileUpload(
        file,
        DocType.APOSTILAMENTO,
        { apostilleId: apostille.idApostille },
        tx,
      );

      return apostille;
    });
  }

  async findAll(dto: ApostilleFilterDto) {
    const { take, cursor, idContract, supplierName, search } = dto;

    const where: Prisma.ApostilleWhereInput = {};

    if (search) {
      where.OR = [
        { supplierName: { contains: search, mode: 'insensitive' } },
        { contract: { contractor: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (idContract) {
      where.idContract = idContract;
    }

    if (supplierName) {
      where.supplierName = {
        contains: supplierName,
        mode: 'insensitive',
      };
    }

    const cursorObj = cursor ? { idApostille: Number(cursor) } : undefined;

    const data = await this.prisma.apostille.findMany({
      take,
      skip: cursor ? 1 : 0,
      cursor: cursorObj,
      where,
      orderBy: [{ orderApostille: 'asc' }, { idApostille: 'asc' }],
      include: {
        contract: true,
        documents: true,
      },
    });

    const lastItem = data[data.length - 1];
    const nextCursor = lastItem ? lastItem.idApostille.toString() : null;

    return {
      data,
      meta: {
        nextCursor,
        hasNextPage: data.length === take,
      },
    };
  }

  async findOne(id: number) {
    return await this.prisma.apostille.findUniqueOrThrow({
      where: { idApostille: id },
      include: {
        contract: true,
        documents: true,
      },
    });
  }

  async update(id: number, data: UpdateAPostilleDto) {
    return await this.prisma.apostille.update({
      where: { idApostille: id },
      data,
    });
  }
}
