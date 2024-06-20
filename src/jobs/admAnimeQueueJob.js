import AdmService from "../domain/adm/admService.js"

export default async function animeQueueJob() {
  const admService = new AdmService()
  const process = async () => {
    logger.info('startCron')
    await admService.deleteFiles().catch(() => ({}))
    logger.info('endCron')
  }
  return process()
}