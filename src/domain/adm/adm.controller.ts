import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AdmService } from './adm.service';

@ApiTags('ADM')
@Controller('adm')
export class AdmController {
  constructor(private readonly admService: AdmService) {}

  @Get('delete')
  async deleteFiles() {
    return this.admService.deleteFiles();
  }

  @Get('delete-rss')
  async deleteRss(@Res() res: Response) {
    await this.admService.deleteRss();
    res.send();
  }

  @Get('export-data')
  async exportData(@Req() req: Request, @Res() res: Response) {
    req.setTimeout(1000 * 60 * 10);
    const { fileName, stream } = this.admService.exportData();
    res.attachment(fileName);
    stream.pipe(res);
  }

  @Post('import-data')
  async importData(@Req() req: Request, @Res() res: Response) {
    req.setTimeout(0);
    const data = await this.admService.importData({ fileStream: req });
    res.json(data);
  }

  @Get('tags')
  async listTags() {
    return this.admService.listTags();
  }

  @Post('tags')
  @ApiBody({
    schema: {
      properties: {
        acceptedTags: { type: 'array', items: { type: 'string' } },
        verifyTags: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  async insertTags(@Body() body: { acceptedTags?: string[]; verifyTags?: string[] }, @Res() res: Response) {
    await this.admService.insertTags(body);
    res.status(201).end();
  }

  @Post('cache-clean')
  async clearScanCache(@Res() res: Response) {
    await this.admService.clearScanCache();
    res.status(202).end();
  }
}
