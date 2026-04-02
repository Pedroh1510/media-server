import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { XmlService } from '../shared/xml.service'
import { TorrentService } from '../shared/torrent.service'
import { ScanJobService } from '../extractor/scan-job.service'
import { RssRepository } from './rss.repository'

@Injectable()
export class RssService {
  private readonly logger = new Logger(RssService.name)

  constructor(
    private readonly xmlService: XmlService,
    private readonly torrentService: TorrentService,
    private readonly scanJobService: ScanJobService,
    private readonly repository: RssRepository,
    private readonly config: ConfigService
  ) {}

  async list(data: {
    term?: string
    t?: string
    q?: string
    scanAllItems?: string | boolean
    isScan?: string | boolean
  }) {
    const { scanAllItems, isScan = true } = data
    let term = data.q ?? data.term
    if (term) term = term.replace(/ [sS]\d{1,}(.*)/g, '')

    this.logger.log(`List -> with term ${term}`)

    if (isScan === 'true' || isScan === true) {
      await this.scanJobService.enqueueScan(term, {
        scanAllItems: scanAllItems === 'true' || scanAllItems === true,
      })
    }

    const response = await this.repository.list({ term, limit: term ? undefined : 100 })
    return this.buildItems(response)
  }

  async listAsXml(data: {
    term?: string
    t?: string
    q?: string
    scanAllItems?: string | boolean
    isScan?: string | boolean
  }) {
    const items = await this.list(data)
    return this.xmlService.buildToRss({ items })
  }

  async listAll() {
    return this.repository.listAll()
  }

  async count() {
    return { total: await this.repository.count() }
  }

  private async buildItems(response: any[]) {
    const host = this.config.get('host', 'localhost')
    const port = this.config.get('port', 3033)
    const items = []
    for (const item of response) {
      try {
        items.push({
          ...item,
          page: `http://${host}:${port}/${item.id}`,
          id: await this.torrentService.magnetInfo(item.magnet),
          title: this.formatTitle(item),
        })
      } catch (error) {
        this.logger.warn(`buildItems error: ${(error as Error)?.message}`)
      }
    }
    return items
  }

  private formatTitle({ title }: { title: string }): string {
    const reg = /\dnd Season - (\d){2}/
    const result = title.match(reg)
    if (result !== null) {
      const q = result[0]
      const ep = q.split(' - ').pop()
      const session = q.split('nd').shift()
      title = title.replace(q, `${result[0]} - ${session}x${ep}`)
      title = title.replace(reg, '')
    }
    return title
  }
}
