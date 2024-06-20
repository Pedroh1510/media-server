// import { parentPort, workerData } from 'node:worker_threads'

import AdmService from '../domain/mangas/adm/adm.service.js'
import DbService from '../infra/service/dbService.js'

export default async function processItemCatalogMangaAdmJob(job) {
  const service = new AdmService()
  await service.processItemCatalog(job.data)
  await DbService.connection.$disconnect()
}
