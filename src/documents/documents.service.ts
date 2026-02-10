import { Injectable, BadRequestException } from '@nestjs/common';
import { S3Service } from 'src/s3/s3.service';
import { DocType } from 'generated/prisma/enums';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from 'generated/prisma/browser';
import { DocumentFilterDto } from './dto/document-filter.dto';

interface OwnerIds {
  contractId?: number;
  additiveId?: number;
  apostilleId?: number;
}

@Injectable()
export class DocumentsService {
  constructor(
    private prisma: PrismaService,
    private storage: S3Service,
  ) {}

  async handleFileUpload(
    file: Express.Multer.File,
    type: DocType,
    owners: OwnerIds,
    prisma?: Prisma.TransactionClient | PrismaService,
  ) {
    if (!file) throw new BadRequestException('Arquivo não enviado');

    let folder = 'others';
    if (owners.contractId) folder = `contracts/${owners.contractId}`;
    else if (owners.additiveId) folder = `additives/${owners.additiveId}`;
    else if (owners.apostilleId) folder = `apostilles/${owners.apostilleId}`;

    const { key, url } = await this.storage.uploadFile(file, folder);

    const db = prisma ?? this.prisma;

    return await db.document.create({
      data: {
        fileName: file.originalname,
        fileKey: key,
        fileUrl: url,
        mimeType: file.mimetype,
        docType: type,
        idContract: owners.contractId,
        idAdditive: owners.additiveId,
        idApostille: owners.apostilleId,
      },
    });
  }

  async getViewUrl(idDocument: number) {
    const doc = await this.prisma.document.findUnique({
      where: { idDocument },
      select: { fileKey: true, fileName: true },
    });
    if (!doc) throw new BadRequestException('Documento não encontrado');

    return {
      url: await this.storage.getPreSignedUrl(doc.fileKey),
      fileName: doc.fileName,
    };
  }

  async findAll(dto: DocumentFilterDto) {
    const { take, cursor, search, docType } = dto;

    const where: Prisma.DocumentWhereInput = {};

    if (docType) {
      where.docType = docType;
    }

    if (search) {
      where.OR = [
        { fileName: { contains: search, mode: 'insensitive' } },
        { fileKey: { contains: search, mode: 'insensitive' } },
      ];
    }

    const cursorObj = cursor ? { idDocument: Number(cursor) } : undefined;

    const data = await this.prisma.document.findMany({
      take,
      skip: cursor ? 1 : 0,
      cursor: cursorObj,
      where,
      orderBy: [{ createdAt: 'desc' }, { idDocument: 'desc' }],
      include: {
        contract: true,
        additive: true,
        apostille: true,
      },
    });

    const lastItem = data[data.length - 1];
    const nextCursor = lastItem ? lastItem.idDocument.toString() : null;

    return {
      data,
      meta: {
        nextCursor,
        hasNextPage: data.length === take,
      },
    };
  }

  async findOne(idDocument: number) {
    const document = await this.prisma.document.findUniqueOrThrow({
      where: { idDocument },
      include: {
        contract: true,
        additive: true,
        apostille: true,
      },
    });
    return document;
  }
}
