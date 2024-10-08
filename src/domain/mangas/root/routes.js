import express from 'express'

import RootService from './root.service.js'
import RootValidator from './validators/root.validator.js'

const rootRouter = express()

export default rootRouter

const service = new RootService()
const validator = new RootValidator()

rootRouter.get(
  '/',
  async (_req, res) => {
    const mangas = await service.list()
    res.send(mangas)
  }
  /* 
  #swagger.tags = ["Mangas"] 
  #swagger.path = '/mangas'
*/
)

rootRouter.get(
  '/:mangaId',
  async (req, res) => {
    const manga = await service.getManga(req.params.mangaId)
    res.send(manga)
  }
  /* 
  #swagger.tags = ["Mangas"] 
  #swagger.path = '/mangas/{mangaId}'
*/
)

rootRouter.get(
  '/:mangaId/:chapterId/images',
  async (req, res) => {
    const images = await service.getChapterImages(req.params.mangaId, req.params.chapterId)
    if (!images) return res.status(204).end()
    res.send(images)
  } /* 
  #swagger.tags = ["Mangas"] 
  #swagger.path = '/mangas/{mangaId}/{chapterId}/images'
*/
)

rootRouter.post(
  '/',
  validator.register(),
  async (req, res) => {
    await service.register(req.body)
    res.status(201).end()
  }
  /* 
  #swagger.tags = ["Mangas"] 
  #swagger.path = '/mangas'
*/
)

rootRouter.post(
  '/process',
  validator.startProcessByType(),
  async (req, res) => {
    await service.startProcessByType(req.body)
    res.status(201).end()
  } /* 
  #swagger.tags = ["Mangas"] 
  #swagger.path = '/mangas/process'
*/
)

rootRouter.post(
  '/:mangaId',
  validator.registerChapters(),
  async (req, res) => {
    await service.registerChapters(req.body, req.params.mangaId)
    res.status(201).end()
  }
  /* 
  #swagger.tags = ["Mangas"] 
  #swagger.path = '/mangas/{mangaId}'
*/
)

rootRouter.post(
  '/:mangaId/process',
  async (req, res) => {
    req.setTimeout(1e3 * 60 * 10)
    await service.processManga(req.params.mangaId)
    res.status(201).end()
  } /* 
  #swagger.tags = ["Mangas"] 
  #swagger.path = '/mangas/{mangaId}/process'
*/
)

rootRouter.post(
  '/:mangaId/process/eps',
  async (req, res) => {
    req.setTimeout(1e3 * 60 * 10)
    await service.processMangaEps(req.params.mangaId)
    res.status(201).end()
  } /* 
  #swagger.tags = ["Mangas"] 
  #swagger.path = '/mangas/{mangaId}/process/eps'
*/
)

rootRouter.post(
  '/:mangaId/process/download',
  async (req, res) => {
    await service.startProcess(req.params.mangaId)
    res.status(201).end()
  } /* 
  #swagger.tags = ["Mangas"] 
  #swagger.path = '/mangas/{mangaId}/process/download'
*/
)

rootRouter.patch(
  '/chapter/:chapterId',
  async (req, res) => {
    const { read, error } = req.body
    await service.updateChapter(req.params.chapterId, read, error)
    res.status(204).end()
  } /* 
  #swagger.tags = ["Mangas"] 
  #swagger.path = '/mangas/chapter/{chapterId}'
*/
)
