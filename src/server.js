import cors from 'cors'
import express from 'express'

import admRouter from './domain/adm/routes.js'
import extractorRouter from './domain/extractor/routes.js'
import rssRouter from './domain/rss/routes.js'
import CONFIG from './infra/config.js'
import SwaggerDoc from './infra/swagger/swaggerDoc.js'
import jobs from './job.js'
import logger from './utils/logger.js'

const server = express()
server.use(express.json({}))
server.use(express.urlencoded({ extended: true }))

server.use(
  cors({
    origin: '*',
  })
)

server.use('/docs', SwaggerDoc.middleware(), SwaggerDoc.doc())

server.use(rssRouter)

server.use(extractorRouter)

server.use(admRouter)

function error(err, req, res, next) {
  logger.error({ err })

  res.status(500)
  res.send('Internal Server Error')
}

server.use(error)

server.listen(CONFIG.port, () => logger.info(`listen ${CONFIG.port}`))

jobs()
