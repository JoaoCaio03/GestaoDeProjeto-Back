import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateAdditiveDto } from './dto/create-additive.dto';
import { DocumentsService } from 'src/documents/documents.service';
import { PrismaService } from 'src/prisma.service';
import { AdditiveType, DocType } from 'generated/prisma/enums';
import { UpdateAdditiveDto } from './dto/update-additive.dto';
import { Prisma } from 'generated/prisma/client';
import { AdditiveFilterDto } from './dto/additive-filter.dto';

@Injectable()
export class AdditiveService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly documentsService: DocumentsService,
  ) {}

  async create(data: CreateAdditiveDto, file: Express.Multer.File) {
    const { idContract, ...createAdditiveData } = data;

    if (
      createAdditiveData.typeAdditive === AdditiveType.Aditivo_de_Prazo &&
      !createAdditiveData.newEndDate
    ) {
      throw new BadRequestException(
        'A data de término deve ser fornecida para aditivos de prazo',
      );
    }
    if (
      createAdditiveData.typeAdditive === AdditiveType.Aditivo_de_Valor &&
      !createAdditiveData.valueChange
    ) {
      throw new BadRequestException(
        'O novo valor deve ser fornecido para aditivos de valor',
      );
    }

    return await this.prisma.$transaction(async (tx) => {
      const additive = await tx.additive.create({
        data: {
          ...createAdditiveData,
          newEndDate: createAdditiveData.newEndDate
            ? new Date(createAdditiveData.newEndDate)
            : null,
          dateSigned: new Date(createAdditiveData.dateSigned),
          contract: {
            connect: { idContracts: idContract },
          },
        },
      });

      await this.documentsService.handleFileUpload(
        file,
        DocType.ADITIVO,
        { additiveId: additive.idAdditive },
        tx,
      );

      return additive;
    });
  }

  async findAll(dto: AdditiveFilterDto) {
    const { take, cursor, typeAdditive, idContract, search } = dto;

    const where: Prisma.AdditiveWhereInput = {};

    if (search) {
      where.OR = [
        { contract: { contractor: { contains: search, mode: 'insensitive' } } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (typeAdditive) {
      where.typeAdditive = typeAdditive;
    }

    if (idContract) {
      where.idContract = idContract;
    }

    const cursorObj = cursor ? { idAdditive: Number(cursor) } : undefined;

    const data = await this.prisma.additive.findMany({
      take,
      skip: cursor ? 1 : 0,
      cursor: cursorObj,
      where,
      orderBy: [{ dateSigned: 'desc' }, { idAdditive: 'desc' }],
      include: {
        contract: true,
        documents: true,
      },
    });

    const lastItem = data[data.length - 1];
    const nextCursor = lastItem ? lastItem.idAdditive.toString() : null;

    return {
      data,
      meta: {
        nextCursor,
        hasNextPage: data.length === take,
      },
    };
  }

  async findOne(id: number) {
    return await this.prisma.additive.findUniqueOrThrow({
      where: { idAdditive: id },
      include: {
        contract: true,
        documents: true,
      },
    });
  }

  async update(id: number, data: UpdateAdditiveDto) {
    return await this.prisma.additive.update({
      where: { idAdditive: id },
      data,
    });
  }
}
