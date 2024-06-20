import ExtractorService from '../domain/extractor/extractorService.js'
import logger from '../utils/logger.js'

export default async function animeQueueJob() {
  const extractorService = new ExtractorService()
  const process = async () => {
    logger.info('startCron')
    await extractorService.scan({ total: 5 }).catch(() => ({}))
    logger.info('endCron')
  }
  return process()
}
