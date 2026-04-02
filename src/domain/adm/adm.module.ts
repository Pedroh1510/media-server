import { Module } from '@nestjs/common';
import { AdmController } from './adm.controller';
import { AdmService } from './adm.service';
import { AdmRepository } from './adm.repository';
import { BittorrentModule } from '../../infra/service/bittorrent.module';
import { ScanTtlRepository } from '../extractor/repository/scan-ttl.repository';

@Module({
  imports: [BittorrentModule],
  controllers: [AdmController],
  providers: [AdmService, AdmRepository, ScanTtlRepository],
})
export class AdmModule {}
