import axios from "axios";
import XmlService from "../shared/xmlService.js";
import TorrentService from "../shared/torrentService.js";
import DateFormatter from "../../utils/dateFormatter.js";
import logger from "../../utils/logger.js";

export default class AnimeToshoService {
  constructor() {
    this.xmlService = new XmlService()
    this.torrentService = new TorrentService()
    this.acceptedTags = ['pt-bt', 'por-br','pt-br'];
  }

  /**
   * @param {String} term 
   */
    async #searchXml(term=undefined){
      return axios.get('https://feed.animetosho.org/rss2',{
        params:{
          only_tor:`1`,
          reversepolarity:1,
          q:term
        }
      }).then(response=>response.data)
      .catch((e)=>{
        return null
      })
    }

    /**
     * @param {String} title 
     */
    #isAcceptedTitle(title){
      const titleLow =title.toLowerCase()
      return this.acceptedTags.some((tag) => titleLow.includes(tag))
    }

    #getMagnetLink(description=''){
      const array = description.split('"')
      return array.find(item=>item.includes('magnet:'))
    }

    /**
     * @returns {AsyncGenerator<{title:String,link:String,date:Date}>}
    */
  async *extractor(term=undefined){
    logger.info('Extractor AnimeTosho -> start')
    const xml = await this.#searchXml(term)
    if(!xml) {
      logger.info('Extractor AnimeTosho -> end')
      return 
    }
    const json = this.xmlService.parserToJson(xml)
    const isValidXml = json?.rss&&json.rss?.channel&&Array.isArray(json.rss.channel?.item)
    if(!isValidXml) {
      logger.info('Extractor AnimeTosho -> end')
      return 
    }
    for (const item of json.rss.channel.item) {
      if(!this.#isAcceptedTitle(item.title)) continue
      const link = this.#getMagnetLink(item.description)
      if(!link) continue
      const dateIgnoreWeekday = item.pubDate.split(', ').slice(1).join(', ')
      yield {
        title:item.title,
        link:this.torrentService.infoHashToMagnet(item['nyaa:infoHash']),
        date:DateFormatter.toDate(dateIgnoreWeekday,'DD MMM YYYY HH:mm:ss ZZ')
      }
    }
    
    logger.info('Extractor AnimeTosho -> end')
  }
}
