import axios from "axios";
import XmlService from "../shared/xmlService.js";
import TorrentService from "../shared/torrentService.js";
import DateFormatter from "../../utils/dateFormatter.js";

export default class NyaaService {
  constructor() {
    this.xmlService = new XmlService()
    this.torrentService = new TorrentService()
    this.acceptedTags = ['pt-bt', 'por-br','pt-br'];
  }

  /**
   * @param {Object} objectTerm 
   */
    async #searchXml(objectTerm={}){
      return axios.get('https://nyaa.si',{
        params:{
          page:'rss',
          c:"1_0",
          ...objectTerm
        }
      }).then(response=>response.data)
      .catch(()=>null)
    }

    /**
     * @param {String} title 
     */
    #isAcceptedTitle(title){
      return !this.acceptedTags.some((tag) => title.toLowerCase().includes(tag))
    }
    
    /**
     * @returns {AsyncGenerator<{title:String,link:String,date:Date}>}
    */
   async *extractor() {
    const xml = await this.#searchXml()
    if(!xml) return 
    const json = this.xmlService.parserToJson(xml)
    const isValidXml = json?.rss&&json.rss?.channel&&Array.isArray(json.rss.channel?.item)
    if(!isValidXml) return
    for (const item of json.rss.channel.item) {
      if(this.#isAcceptedTitle(item.title)) continue
      const dateIgnoreWeekday = item.pubDate.split(', ').slice(1).join(', ')
      yield {
        title:item.title,
        link:this.torrentService.infoHashToMagnet(item['nyaa:infoHash']),
        date:DateFormatter.toDate(dateIgnoreWeekday,'DD MMM YYYY HH:mm:ss ZZ')
      }
    }
  }

  /**
   * 
   * @param {Object} objectTerm 
   * @returns {AsyncGenerator<{title:String,link:String,date:Date}>}
   */
  async *extractorRss(objectTerm) {
    const xml = await this.#searchXml(objectTerm)
    if(!xml) return 
    const json = this.xmlService.parserToJson(xml)
    const isValidXml = json?.rss&&json.rss?.channel&&Array.isArray(json.rss.channel?.item)
    if(!isValidXml) return
    for (const item of json.rss.channel.item) {
      if(this.#isAcceptedTitle(item.title)) continue
      const dateIgnoreWeekday = item.pubDate.split(', ').slice(1).join(', ')
      yield {
        title:item.title,
        link:this.torrentService.infoHashToMagnet(item['nyaa:infoHash']),
        date:DateFormatter.toDate(dateIgnoreWeekday,'DD MMM YYYY HH:mm:ss ZZ')
      }
    }
  }
}
