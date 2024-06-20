import AdmService from '../domain/adm/admService.js'
import DbService from '../infra/service/dbService.js'
import logger from '../utils/logger.js'

export default async function animeQueueJob() {
  const admService = new AdmService()
  const process = async () => {
    logger.info('startCron')
    await admService.deleteFiles().catch(() => ({}))
    await DbService.connection.$disconnect()
    logger.info('endCron')
  }
  return process()
}
