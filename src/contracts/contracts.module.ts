import { Module } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { ContractsController } from './contracts.controller';
import { DocumentsModule } from 'src/documents/documents.module';
import { PrismaService } from 'src/prisma.service';

@Module({
  imports: [DocumentsModule],
  providers: [ContractsService, PrismaService],
  controllers: [ContractsController],
})
export class ContractsModule {}
