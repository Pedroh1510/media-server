import AdmService from '../domain/adm/admService.js'
import DbService from '../infra/service/dbService.js'
import logger from '../utils/logger.js'

export default async function admAnimeQueueJob() {
  const admService = new AdmService()
  const process = async () => {
    logger.info('startCron admAnimeQueueJob')
    await admService.deleteFiles().catch((error) => {
      logger.error(`${error.message}\n${error.stack}`)
    })
    await DbService.connection.$disconnect()
    logger.info('endCron admAnimeQueueJob')
  }
  return process()
}
