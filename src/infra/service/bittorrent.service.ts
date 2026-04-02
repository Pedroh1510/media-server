import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { qBittorrentClient as QBittorrent } from '@robertklep/qbittorrent';

@Injectable()
export class BittorrentService {
  private readonly client: any;

  constructor(private readonly config: ConfigService) {
    this.client = new QBittorrent(
      this.config.get('url_torrent'),
      this.config.get('user_torrent'),
      this.config.get('pass_torrent'),
    );
  }

  async listTorrentsConcluded(): Promise<{ hash: string; dateCompleted: Date; name: string }[]> {
    const list = await this.client.torrents.info();
    return list
      .map((item: any) => ({ ...item, dateCompleted: new Date(item.completion_on * 1000) }))
      .filter(({ dateCompleted }: { dateCompleted: Date }) => dateCompleted.getFullYear() >= 2024);
  }

  async deleteTorrents(listHashes: string[]): Promise<void> {
    await this.client.torrents.delete(listHashes, true);
  }

  async stopTorrents(hash: string): Promise<void> {
    await this.client.torrents.pause(hash);
  }
}
