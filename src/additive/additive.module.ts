import { Module } from '@nestjs/common';
import { AdditiveService } from './additive.service';
import { AdditiveController } from './additive.controller';
import { DocumentsModule } from 'src/documents/documents.module';
import { PrismaService } from 'src/prisma.service';

@Module({
  imports: [DocumentsModule],
  providers: [AdditiveService, PrismaService],
  controllers: [AdditiveController],
})
export class AdditiveModule {}
