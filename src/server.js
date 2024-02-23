import express from 'express'
import rssRouter from './domain/rss/routes.js'
import extractorRouter from './domain/extractor/routes.js'
import admRouter from './domain/adm/routes.js'
import CONFIG from './infra/config.js'
import jobs from './job.js'
import logger from './utils/logger.js'
import SwaggerDoc from './infra/swagger/swaggerDoc.js'
import cors from 'cors'

const server = express()

server.use(cors({
  origin:"*"
}))

server.use('/docs',SwaggerDoc.middleware(),SwaggerDoc.doc())

server.use(rssRouter)

server.use(extractorRouter)

server.use(admRouter)

server.listen(CONFIG.port, () => logger.info(`listen ${CONFIG.port}`))

jobs()
