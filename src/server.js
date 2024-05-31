import { errors } from 'celebrate'
import cors from 'cors'
import express from 'express'
import morgan from 'morgan'

import admRouter from './domain/adm/routes.js'
import extractorRouter from './domain/extractor/routes.js'
import QueueService, { queueRoute } from './domain/mangas/queues/queues.js'
import mangasRouter from './domain/mangas/routes.js'
import rssRouter from './domain/rss/routes.js'
import CONFIG from './infra/config.js'
import SwaggerDoc from './infra/swagger/swaggerDoc.js'
import jobs from './job.js'
import logger from './utils/logger.js'

const server = express()
server.use(express.json({}))
server.use(express.urlencoded({ extended: true }))
server.use(
  morgan('tiny', {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
)

server.use(
  cors({
    origin: '*',
  })
)
server.use(express.static('dist'))
server.use('/docs', SwaggerDoc.middleware(), SwaggerDoc.doc())
server.use('/mangas', mangasRouter)

server.use(rssRouter)

server.use(extractorRouter)

server.use(admRouter)
server.use('/api', queueRoute)
server.get('/api', (_, res) => res.send('OK'))

function error(err, req, res, next) {
  logger.error({ err })

  res.status(500).send('Internal Server Error')
}

server.use(errors())
server.use(error)

server.listen(CONFIG.port, () => logger.info(`listen ${CONFIG.port}`))

jobs()

const queue = new QueueService()
queue.execute()
