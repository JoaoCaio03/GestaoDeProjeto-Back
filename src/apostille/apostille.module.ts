import { Module } from '@nestjs/common';
import { ApostilleController } from './apostille.controller';
import { ApostilleService } from './apostille.service';
import { DocumentsModule } from 'src/documents/documents.module';
import { PrismaService } from 'src/prisma.service';

@Module({
  imports: [DocumentsModule],
  controllers: [ApostilleController],
  providers: [ApostilleService, PrismaService],
})
export class ApostilleModule {}
