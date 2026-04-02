import ExtractorService from '../domain/extractor/extractorService.js'
import DbService from '../infra/service/dbService.js'
import logger from '../utils/logger.js'

export default async function scanJob({ data }) {
  const { term, scanAllItems } = data
  const extractorService = new ExtractorService()
  logger.info(`startCron scanJob term=${term} scanAllItems=${scanAllItems}`)
  await extractorService.extractorRss({ q: term }, scanAllItems).catch((error) => {
    logger.warn(`scanJob error: ${error.message}`)
  })
  await DbService.connection.$disconnect()
  logger.info(`endCron scanJob term=${term} scanAllItems=${scanAllItems}`)
}
