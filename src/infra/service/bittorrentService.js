import { qBittorrentClient } from '@robertklep/qbittorrent';
import CONFIG from '../config.js';
export default class BittorrentService {
  constructor() {
    const url = 'http://192.168.1.23:8080'
    this.client = new qBittorrentClient(url,CONFIG.userTorrent,CONFIG.passTorrent)
  }
  /**
   * @returns {Promise<{hash:String,dateCompleted:Date,name:String}[]>}
   */
  async listTorrentsConcluded(){
    const list = await this.client.torrents.info()
    return list.map(item=>({
      ...item,
      dateCompleted:new Date(item.completion_on*1000),
    })).filter(({dateCompleted})=>dateCompleted.getFullYear()>=2024)
  }
  async deleteTorrents(listHashes){
    for (const hash of listHashes) {
      await this.client.torrents.delete(hash,true)
    }
  }
}