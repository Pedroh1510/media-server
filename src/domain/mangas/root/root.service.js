import { mkdir, stat, writeFile } from 'node:fs/promises'
import { setTimeout } from 'node:timers/promises'
import AdmZip from 'adm-zip'

import { mangaQueue } from '../../../job.js'
import logger from '../../../utils/logger.js'
import Extractor from '../utils/extractor.js'
import { sites } from '../utils/sites.js'
import RootRepository from './repository/root.repository.js'

export default class RootService {
  repository = new RootRepository()
  extractor = new Extractor()

  /**
   * @typedef {{name:String,link,type:String}} Manga
   * @param {Manga} manga
   */
  async register(manga) {
    await this.repository.register(manga).catch(() => null)
  }

  /**
   * @typedef {{name:String,link:String, images:String[]}} Chapter
   * @param {Chapter[]} chapters
   * @param {String} mangaId
   */
  async registerChapters(chapters, mangaId) {
    for (const chapter of chapters) {
      await this.repository.registerChapter({ ...chapter, mangaId })
    }
  }

  async list() {
    return (await this.repository.list()).map((manga) => ({
      ...manga,
      Chapters: manga.Chapters.map((chapter) => ({ ...chapter, downloaded: !!chapter.filePath, filePath: undefined })),
    }))
  }

  async updateChapter(id, read, error) {
    await this.repository.updateChapter(parseInt(id), read, error)
  }

  async getManga(mangaId) {
    return this.repository.getManga(mangaId)
  }

  async getChapterImages(mangaId, chapterId) {
    mangaId = parseInt(mangaId)
    chapterId = parseInt(chapterId)
    const chapter = await this.repository.getChapter(mangaId, undefined, chapterId)
    try {
      await stat(chapter.filePath)
      const zip = new AdmZip(chapter.filePath)
      const images = []
      for (const entry of zip.getEntries()) {
        images.push({
          name: entry.name,
          data: entry.getData(),
        })
      }
      return images
    } catch {
      return null
    }
  }

  async startProcessByType({ type, onlyImages = true }) {
    const mangas = await this.repository.list(type)
    if (!mangas.length) return
    for (const manga of mangas) {
      if (!onlyImages) {
        await this.addQueueManga(manga.id)
        continue
      }
      for (const chapter of manga.Chapters) {
        await this.addQueueImage(manga.id, chapter.id)
      }
    }
  }

  async queueManga({ mangaId, chapterId, all = false }) {
    if (all) {
      return this.processAllMangas()
    }
    if (chapterId) {
      await this.downloadMangaEps({ mangaId, chapterId })
      return
    }
    await this.processManga(mangaId)
    await this.processMangaEps(mangaId)
  }

  async processAllMangas() {
    const mangas = await this.repository.listDownloadEnable()
    for (const manga of mangas.sort((p, c) => p.type.localeCompare(c.type))) {
      await this.addQueueManga(manga.id)
    }
  }

  async processManga(mangaId) {
    mangaId = parseInt(mangaId)
    const { link, siteManga } = await this.repository.getManga(mangaId)
    const headers = !siteManga.cookie ? undefined : { headers: { Cookie: siteManga.cookie } }
    const eps = await this.extractor.listEp({
      browserContent: {
        headers,
      },
      selectors: siteManga.SiteMangaSelector,
      url: link,
      baseUrl: new URL(siteManga.url).origin,
    })
    for (const ep of eps) {
      await this.repository.registerChapter({ ...ep, mangaId })
    }
  }

  async processMangaEps(mangaId) {
    mangaId = parseInt(mangaId)
    const { Chapters: eps, type, id } = await this.repository.getManga(mangaId)
    const site = sites[type]
    for (const ep of eps) {
      logger.info(`Processing ${id} image by ep: ${ep.name}`)
      const { images } = await this.repository.getChapter(mangaId, ep.name)
      if (images?.length) continue
      const imagesLink = await this.extractor.listImageByEp({ ...site, epUrl: ep.link })
      await this.repository.registerChapter({
        ...ep,
        mangaId,
        images: imagesLink.map((image) => image.replace(/[\n|\t]/, '').trim()),
      })
    }
    for (const ep of eps) {
      await this.startProcessByChapter(mangaId, ep.id)
    }
  }

  async downloadMangaEps({ mangaId, chapterId }) {
    mangaId = parseInt(mangaId)
    chapterId = parseInt(chapterId)

    const { type, name: mangaName } = await this.repository.getManga(mangaId)
    const { images, name, filePath } = await this.repository.getChapter(mangaId, undefined, chapterId)
    const site = sites[type]
    logger.info(`Download ${mangaId} images by ep: ${name}`)
    if (filePath) {
      logger.info(`Download Exist ${mangaId} images by ep: ${name}`)
      return
    }
    const start = new Date().getTime()
    const headers = site.browserContent?.headers ?? {}
    const zip = await this.extractor.download(
      images
        .map((image) => image.replace(/[\n|\t]/, '').trim())
        .map((image, index) => ({ link: image, name: `${index}.${image.split('.').pop()}` })),
      headers
    )
    const cleanFileName = (name) => name.replace(/\W/g, '_').replace(/\//g, '')
    const path = `./downloads/${cleanFileName(mangaName)}`
    await mkdir(path, { recursive: true })
    const pathFile = `${path}/${cleanFileName(name)}.zip`
    await writeFile(pathFile, zip)
    const totalTime = (new Date().getTime() - start) / 1000
    const minTime = 2000
    if (totalTime < minTime) {
      await setTimeout(Math.abs(totalTime - minTime))
    }
    await this.repository.updateChapterFile(chapterId, pathFile)
    logger.info(`Downloaded ${mangaId} images by ep: ${name}`)
  }

  async startProcess(mangaId) {
    mangaId = parseInt(mangaId)

    await this.repository.getManga(mangaId)
    await this.queueManga({ mangaId })
  }

  async startProcessByChapter(mangaId, chapterId) {
    mangaId = parseInt(mangaId)
    chapterId = parseInt(chapterId)

    await this.repository.getManga(mangaId)
    await this.repository.getChapter(mangaId, undefined, chapterId)

    await this.addQueueImage(mangaId, chapterId)
  }

  async addQueueManga(mangaId) {
    await mangaQueue.add(
      'process manga',
      { mangaId },
      {
        removeOnComplete: { age: 60 },
        delay: 200,
        attempts: 3,
      }
    )
  }

  async addQueueImage(mangaId, chapterId) {
    await mangaQueue.add(
      'process manga image',
      { mangaId, chapterId },
      {
        removeOnComplete: { age: 60 },
        delay: 200,
        attempts: 3,
      }
    )
  }
}
