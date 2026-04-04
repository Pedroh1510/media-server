import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { QBittorrent } from '@ctrl/qbittorrent'

export type Torrent = {
  hash: string
  name: string
  availability: number
  state: string
  progress: number
  dateCompleted: Date
}

@Injectable()
export class BittorrentService {
  private readonly client: QBittorrent

  constructor(private readonly config: ConfigService) {
    this.client = new QBittorrent({
      baseUrl: this.config.get('url_torrent'),
      username: this.config.get('user_torrent'),
      password: this.config.get('pass_torrent'),
    })
  }

  private mapTorrent(item: any): Torrent {
    return {
      hash: item.hash,
      name: item.name,
      availability: item.availability,
      state: item.state,
      progress: item.progress,
      dateCompleted: new Date(item.completion_on * 1000),
    }
  }

  async listTorrents(): Promise<Torrent[]> {
    const data = await this.client.getAllData()
    return data.torrents.map((item: any) => this.mapTorrent(item))
  }

  async listTorrentsConcluded(): Promise<Torrent[]> {
    const list = await this.listTorrents()
    return list.filter(({ dateCompleted }) => dateCompleted.getUTCFullYear() >= 2024)
  }

  async deleteTorrents(listHashes: string[]): Promise<void> {
    await this.client.removeTorrent(listHashes, true)
  }

  async stopTorrents(hash: string): Promise<void> {
    await this.client.stopTorrent(hash)
  }
}
