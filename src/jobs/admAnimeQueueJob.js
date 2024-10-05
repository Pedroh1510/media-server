import AdmService from '../domain/adm/admService.js'
import DbService from '../infra/service/dbService.js'
import logger from '../utils/logger.js'

export default async function animeQueueJob() {
  const admService = new AdmService()
  const process = async () => {
    logger.info('startCron animeQueueJob')
    await admService.deleteFiles().catch((error) => {
      logger.error(error)
    })
    await DbService.connection.$disconnect()
    logger.info('endCron animeQueueJob')
  }
  return process()
}
