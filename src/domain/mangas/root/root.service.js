import AdmZip from 'adm-zip'
import { mkdir, writeFile, stat } from 'node:fs/promises'
import { setTimeout } from 'node:timers/promises'

import logger from '../../../utils/logger.js'
import { mangaQueue } from '../queues/queues.js'
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
    return this.repository.list()
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
    const manga = await this.repository.getManga(mangaId)
    const chapter = await this.repository.getChapter(mangaId, undefined, chapterId)
    const path = `./downloads/${manga.name}/${chapter.name}.zip`
    try {
      await stat(path)
      const zip = new AdmZip(path)
      const images = []
      for (const entry of zip.getEntries()) {
        images.push({
          name: entry.name,
          data: entry.getData(),
        })
      }
      return images
    } catch (error) {
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

  async queueManga({ mangaId, chapterId }) {
    if (chapterId) {
      await this.downloadMangaEps({ mangaId, chapterId })
      return
    }
    await this.processManga(mangaId)
    await this.processMangaEps(mangaId)
  }

  async processManga(mangaId) {
    mangaId = parseInt(mangaId)
    const { type, link } = await this.repository.getManga(mangaId)
    const site = sites[type]
    const eps = await this.extractor.listEp({ ...site, url: link })
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
    const { images, name } = await this.repository.getChapter(mangaId, undefined, chapterId)
    const site = sites[type]
    logger.info(`Download ${mangaId} images by ep: ${name}`)
    const start = new Date().getTime()
    const headers = site.browserContent?.headers ?? {}
    const zip = await this.extractor.download(
      images
        .map((image) => image.replace(/[\n|\t]/, '').trim())
        .map((image, index) => ({ link: image, name: `${index}.${image.split('.').pop()}` })),
      headers
    )
    const path = `./downloads/${mangaName}`
    await mkdir(path, { recursive: true })
    await writeFile(`${path}/${name}.zip`, zip)
    const totalTime = (new Date().getTime() - start) / 1000
    const minTime = 2000
    if (totalTime < minTime) {
      await setTimeout(Math.abs(totalTime - minTime))
    }
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
      { mangaId },
      {
        removeOnComplete: true,
        delay: 200,
      }
    )
  }

  async addQueueImage(mangaId, chapterId) {
    await mangaQueue.add(
      { mangaId, chapterId },
      {
        removeOnComplete: true,
        delay: 200,
      }
    )
  }
}
