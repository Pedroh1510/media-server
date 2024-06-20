import MangaRootService from '../domain/mangas/root/root.service.js'
import DbService from '../infra/service/dbService.js'
export default async function queueMangaJob(job) {
  const mangaRoot = new MangaRootService()
  await mangaRoot.queueManga(job.data)
  await DbService.connection.$disconnect()
}
