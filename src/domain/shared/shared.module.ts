import { Global, Module } from '@nestjs/common';
import { XmlService } from './xml.service';
import { TorrentService } from './torrent.service';
import { CsvService } from './csv.service';
import { DownloadImgService } from './download-img.service';

@Global()
@Module({
  providers: [XmlService, TorrentService, CsvService, DownloadImgService],
  exports: [XmlService, TorrentService, CsvService, DownloadImgService],
})
export class SharedModule {}
