import ExtractorService from '../domain/extractor/extractorService.js'
import DbService from '../infra/service/dbService.js'
import logger from '../utils/logger.js'

export default async function animeQueueJob({ extractorService = new ExtractorService() } = {}) {
  const process = async () => {
    logger.info('startCron animeQueueJob')
    await extractorService.scan({ total: 5 }).catch((error) => {
      logger.warn(`animeQueueJob error: ${error.message}`)
    })
    await DbService.connection.$disconnect()
    logger.info('endCron animeQueueJob')
  }
  return process()
}
