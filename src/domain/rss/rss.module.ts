import { Module } from '@nestjs/common';
import { RssController } from './rss.controller';
import { RssService } from './rss.service';
import { RssRepository } from './rss.repository';
import { ExtractorModule } from '../extractor/extractor.module';

@Module({
  imports: [ExtractorModule],
  controllers: [RssController],
  providers: [RssService, RssRepository],
})
export class RssModule {}
