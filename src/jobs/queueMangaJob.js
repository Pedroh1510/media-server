import MangaRootService from '../domain/mangas/root/root.service.js'
export default async function queueMangaJob(job) {
  const mangaRoot = new MangaRootService()
  await mangaRoot.queueManga(job.data)
}