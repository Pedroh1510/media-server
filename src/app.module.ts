import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { DatabaseModule } from './infra/database/database.module';
import { StatusModule } from './domain/status/status.module';
import { ExtractorModule } from './domain/extractor/extractor.module';
import { SharedModule } from './domain/shared/shared.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    DatabaseModule,
    SharedModule,
    StatusModule,
    ExtractorModule,
  ],
})
export class AppModule {}
