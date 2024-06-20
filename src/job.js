/* eslint-disable no-new */
import { createBullBoard } from '@bull-board/api'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js'
import { ExpressAdapter } from '@bull-board/express'
import { Queue, Worker } from 'bullmq'
import path from 'node:path'
import logger from './utils/logger.js'



const connection = { host: '10.0.0.2', port: 6379 }
const configJob = {
  attempts: 4,
  removeOnComplete: { age: 60 },
  removeOnFail: { age: 3600 },
}

export const mangaQueue = new Queue('Manga process', {
  connection,
  defaultJobOptions: configJob
})
export const admMangaQueue = new Queue('Adm Manga', { connection, defaultJobOptions: configJob })
export const animeQueue = new Queue('Anime process', { connection })
export const admAnimeQueue = new Queue('Adm Anime', { connection })

export default class QueueService {
  workers = {}
  execute() {
    logger.info('Start jobs')
    const wokersJobsPath = path.resolve('src', 'jobs')
    this.workers = {
      processItemCatalogMangaAdm: new Worker(admMangaQueue.name, path.resolve(wokersJobsPath, 'processItemCatalogMangaAdmJob.js'), { concurrency: 4, connection, useWorkerThreads: true }),
      queueManga: new Worker(mangaQueue.name, path.resolve(wokersJobsPath, 'queueMangaJob.js'), { concurrency: 1, connection, useWorkerThreads: true }),
      animeQueue: new Worker(animeQueue.name, path.resolve(wokersJobsPath, 'animeQueueJob.js'), { concurrency: 1, connection, useWorkerThreads: true }),
      admAnimeQueue: new Worker(admAnimeQueue.name, path.resolve(wokersJobsPath, 'admAnimeQueueJob.js'), { concurrency: 1, connection, useWorkerThreads: true })
    }

    // admAnimeQueue.add('', {}, { repeat })
    animeQueue.add('', null, { repeat: { cron: '30 * * * *' }, removeOnComplete: true, removeOnFail: { age: 1800 } })
    admAnimeQueue.add('', null, { repeat: { pattern: '1 * * * *' }, removeOnComplete: true, removeOnFail: { age: 60 } })
  }
}

const serverAdapter = new ExpressAdapter()
createBullBoard({
  queues: [new BullMQAdapter(mangaQueue), new BullMQAdapter(admMangaQueue), new BullMQAdapter(animeQueue), new BullMQAdapter(admAnimeQueue)],
  serverAdapter,
})

serverAdapter.setBasePath('/queues')

export const queueRoute = serverAdapter.getRouter()
