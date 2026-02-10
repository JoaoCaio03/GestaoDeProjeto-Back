import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { S3Module } from './s3/s3.module';
import { DocumentsModule } from './documents/documents.module';
import { AdditiveModule } from './additive/additive.module';
import { ApostilleModule } from './apostille/apostille.module';
import { ContractsModule } from './contracts/contracts.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    S3Module,
    DocumentsModule,
    AdditiveModule,
    ApostilleModule,
    ContractsModule,
    DashboardModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
