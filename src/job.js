import { createBullBoard } from '@bull-board/api'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js'
import { ExpressAdapter } from '@bull-board/express'
import { Queue, Worker } from 'bullmq'
import path from 'node:path'

import CONFIG from './infra/config.js'
import logger from './utils/logger.js'

const connection = { host: CONFIG.redis_host, port: CONFIG.redis_port }

export const animeQueue = new Queue('Anime process', { connection })
export const admAnimeQueue = new Queue('Adm Anime', { connection })
export const scanQueue = new Queue('Scan process', { connection })

export default class QueueService {
  workers = {}
  execute() {
    logger.info('Start jobs')
    const workersJobsPath = path.resolve('src', 'jobs')
    this.workers = {
      animeQueue: new Worker(animeQueue.name, path.resolve(workersJobsPath, 'animeQueueJob.js'), {
        concurrency: 1,
        connection,
        useWorkerThreads: true,
      }),
      admAnimeQueue: new Worker(admAnimeQueue.name, path.resolve(workersJobsPath, 'admAnimeQueueJob.js'), {
        concurrency: 1,
        connection,
        useWorkerThreads: true,
      }),
      scanQueue: new Worker(scanQueue.name, path.resolve(workersJobsPath, 'scanJob.js'), {
        concurrency: 2,
        connection,
        useWorkerThreads: true,
      }),
    }

    animeQueue.add('cron', null, {
      repeat: { cron: '30 * * * *' },
      removeOnComplete: true,
      removeOnFail: { age: 1800 },
    })
    admAnimeQueue.add('cron', null, {
      repeat: { pattern: '1 * * * *' },
      removeOnComplete: true,
      removeOnFail: { age: 60 },
    })
  }
}

const serverAdapter = new ExpressAdapter()
createBullBoard({
  queues: [new BullMQAdapter(animeQueue), new BullMQAdapter(admAnimeQueue), new BullMQAdapter(scanQueue)],
  serverAdapter,
})

serverAdapter.setBasePath('/queues')

export const queueRoute = serverAdapter.getRouter()
