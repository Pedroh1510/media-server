import { admMangaQueue } from '../../../job.js'
import logger from '../../../utils/logger.js'
import Extractor from '../utils/extractor.js'
import { sites } from '../utils/sites.js'
import AdmRepository from './repository/adm.repository.js'

export default class AdmService {
  repository = new AdmRepository()
  extractor = new Extractor()

  updateHeaders({ type, headers }) {
    if (!sites[type]) return
    if (!sites[type].browserContent) {
      sites[type].browserContent = {
        headers: {},
      }
    }
    sites[type].browserContent.headers = {
      ...sites[type].browserContent.headers,
      ...headers,
    }
  }

  getHeaders({ type }) {
    if (!sites[type]) return
    if (!sites[type].browserContent) return
    return sites[type].browserContent.headers
  }

  getTypes() {
    return Object.keys(sites)
  }

  async processItemCatalog(idSite) {
    const site = await this.repository.get(idSite)
    logger.info(`Processing ${site.name}`)
    const browserContent = site.cookie ? { headers: { Cookie: site.cookie } } : undefined
    for await (const mangas of this.extractor.getAllMangas({
      url: site.url,
      baseUrl: new URL(site.url).origin,
      selectors: site.SiteMangaSelector,
      browserContent,
    })) {
      logger.info(`Total ${mangas.length}`)
      await this.repository.registerCatalog(mangas, site.id)
    }

    logger.info(`Finished ${site.name}`)
  }

  async processCatalog(data) {
    const siteNames = data?.sites
    const sites = await this.repository.list(siteNames)

    for (const site of sites) {
      if (!data && (!site.url || !site.autoDownload)) {
        logger.info('skip')
        continue
      }
      await admMangaQueue.add('catalog', site.id)
    }
  }

  async searchInCatalog(term) {
    if (!term) return
    if (Array.isArray(term)) {
      const data = {}
      for (const item of term) {
        data[item] = await this.repository.searchInCatalog(item)
      }
      return data
    }
    return this.repository.searchInCatalog(term)
  }
}
