import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AnimeQueueProcessor } from './anime-queue.processor';
import { AdmAnimeQueueProcessor } from './adm-anime-queue.processor';
import { ScanQueueProcessor } from './scan-queue.processor';
import { QueueSchedulerService } from './queue-scheduler.service';
import { ExtractorModule } from '../domain/extractor/extractor.module';
import { AdmModule } from '../domain/adm/adm.module';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'Anime process' },
      { name: 'Adm Anime' },
      { name: 'Scan process' },
    ),
    ExtractorModule,
    AdmModule,
  ],
  providers: [
    AnimeQueueProcessor,
    AdmAnimeQueueProcessor,
    ScanQueueProcessor,
    QueueSchedulerService,
  ],
  exports: [QueueSchedulerService],
})
export class JobsModule {}
