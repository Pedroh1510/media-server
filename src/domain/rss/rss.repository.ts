import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../infra/database/prisma.service'

@Injectable()
export class RssRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list({ term, limit }: { term?: string; limit?: number }) {
    return this.prisma.torrent.findMany({
      take: limit,
      where: term ? { title: { contains: term.split(/s\d/).pop().trim(), mode: 'insensitive' } } : undefined,
      orderBy: { pubDate: 'desc' },
    })
  }

  async listAll() {
    return this.prisma.torrent.findMany({ take: 100, orderBy: { pubDate: 'desc' } })
  }

  async count() {
    return this.prisma.torrent.count({})
  }
}
