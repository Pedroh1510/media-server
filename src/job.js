/* eslint-disable no-new */
import { createBullBoard } from '@bull-board/api'
import { BullAdapter } from '@bull-board/api/bullAdapter.js'
import { ExpressAdapter } from '@bull-board/express'
import Queue from 'bull'

import AdmService from './domain/adm/admService.js'
import ExtractorService from './domain/extractor/extractorService.js'
import MangaRootService from './domain/mangas/root/root.service.js'
import CONFIG from './infra/config.js'
import logger from './utils/logger.js'

const admService = new AdmService()
const extractorService = new ExtractorService()

console.log(CONFIG.redis)
export const mangaQueue = new Queue('Manga process', CONFIG.redis)
export const animeQueue = new Queue('Anime process', CONFIG.redis)
export const admAnimeQueue = new Queue('Adm Anime', CONFIG.redis)

export default class QueueService {
  mangaRoot = new MangaRootService()
  execute() {
    mangaQueue.process((job) => this.mangaRoot.queueManga(job.data))
    animeQueue.process((_job) => {
      const process = async () => {
        logger.info('startCron')
        await extractorService.scan({ total: 5 }).catch(() => ({}))
        logger.info('endCron')
      }
      return process()
    })
    admAnimeQueue.process(() => {
      const process = async () => {
        logger.info('startCron')
        await admService.deleteFiles().catch(() => ({}))
        logger.info('endCron')
      }
      return process()
    })

    mangaQueue.add(
      { all: true },
      { repeat: { cron: '0 21 * * *' }, removeOnComplete: true, removeOnFail: { age: 1800 } }
    )

    animeQueue.add('', { repeat: { cron: '30 * * * *' }, removeOnComplete: true, removeOnFail: { age: 1800 } })
    admAnimeQueue.add('', { repeat: { cron: '1 * * * *' }, removeOnComplete: true, removeOnFail: { age: 60 } })
  }
}

const serverAdapter = new ExpressAdapter()
createBullBoard({
  queues: [new BullAdapter(mangaQueue), new BullAdapter(animeQueue), new BullAdapter(admAnimeQueue)],
  serverAdapter,
})

serverAdapter.setBasePath('/queues')

export const queueRoute = serverAdapter.getRouter()
