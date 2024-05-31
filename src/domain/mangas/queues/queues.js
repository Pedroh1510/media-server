import { createBullBoard } from '@bull-board/api'
import { BullAdapter } from '@bull-board/api/bullAdapter.js'
import { ExpressAdapter } from '@bull-board/express'
import Queue from 'bull'

import CONFIG from '../../../infra/config.js'
import RootService from '../root/root.service.js'

export const mangaQueue = new Queue('Manga process', `redis://${CONFIG.redis}`)

export default class QueueService {
  root = new RootService()
  execute() {
    mangaQueue.process((job) => {
      return this.root.queueManga(job.data)
    })
  }
}

const serverAdapter = new ExpressAdapter()
createBullBoard({
  queues: [new BullAdapter(mangaQueue)],
  serverAdapter,
})

serverAdapter.setBasePath('/api')

export const queueRoute = serverAdapter.getRouter()
