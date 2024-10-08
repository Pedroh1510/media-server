import express from 'express'

import AdmService from './adm.service.js'
import AdmValidator from './adm.validator.js'

const admRouter = express()

export default admRouter
const service = new AdmService()
const validator = new AdmValidator()

admRouter.post('/', validator.updateHeaders(), (req, res) => {
  service.updateHeaders({ ...req.body })
  res.send()
})

admRouter.get(
  '/',
  (_req, res) => {
    res.send(service.getTypes())
  } /* 
  #swagger.tags = ["Adm Mangas"] 
  #swagger.path = '/mangas/adm'
*/
)

admRouter.post(
  '/catalog',
  async (req, res) => {
    await service.processCatalog(req.body)
    res.send()
  }
  /* 
  #swagger.tags = ["Adm Mangas"] 
  #swagger.path = '/mangas/adm/catalog'
*/
)
admRouter.get(
  '/catalog',
  async (req, res) => {
    const data = await service.searchInCatalog(req.query?.term)
    res.send(data)
  }
  /* 
  #swagger.tags = ["Adm Mangas"] 
  #swagger.path = '/mangas/adm/catalog'
*/
)

admRouter.get(
  '/:type',
  (req, res) => {
    const headers = service.getHeaders({ type: req.params.type })
    res.send(headers)
  }
  /* 
  #swagger.tags = ["Adm Mangas"] 
  #swagger.path = '/mangas/adm/{type}'
*/
)
