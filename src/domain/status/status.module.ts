import { Module } from '@nestjs/common';
import { StatusController } from './status.controller';
import { StatusService } from './status.service';
import { BittorrentService } from '../../infra/service/bittorrent.service';

@Module({
  controllers: [StatusController],
  providers: [StatusService, BittorrentService],
})
export class StatusModule {}
