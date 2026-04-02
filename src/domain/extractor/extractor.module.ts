import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ScanJobService } from './scan-job.service';
import { ScanTtlRepository } from './repository/scan-ttl.repository';

@Module({
  imports: [BullModule.registerQueue({ name: 'Scan process' })],
  providers: [ScanJobService, ScanTtlRepository],
  exports: [ScanJobService],
})
export class ExtractorModule {}
