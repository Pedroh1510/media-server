import express from 'express'

import AdmService from './admService.js'

const admRouter = express()

const admService = new AdmService()

admRouter.get(
  '/delete',
  async (_req, res) => {
    const response = await admService.deleteFiles()
    res.send(response)
  }
  /* #swagger.tags = ["ADM"] */
)
admRouter.get(
  '/delete-rss',
  async (_req, res) => {
    await admService.deleteRss()
    res.send()
  }
  /* #swagger.tags = ["ADM"] */
)

admRouter.get(
  '/export-data',
  async (req, res) => {
    req.setTimeout(1000 * 60 * 10)
    const { fileName, stream } = admService.exportData()
    res.attachment(fileName)
    stream.pipe(res)
  }
  /* #swagger.tags = ["ADM"] */
)

admRouter.post(
  '/import-data',
  async (req, res) => {
    req.setTimeout(1000 * 60 * 10)
    const data = await admService.importData({ fileStream: req })
    res.send(data)
  }
  /* #swagger.tags = ["ADM"] */
)

const asyncWrapper = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch((err) => next(err))
admRouter.post(
  '/tags',
  asyncWrapper(async (req, res) => {
    await admService.insertTags({ ...req.body })
    res.status(201).end()
  })
  /* #swagger.tags = ["ADM"]
  #swagger.path = '/tags'
  #swagger.parameters['tags'] = {
    in: 'body',
    required: true,
    schema: { 
      $acceptedTags:[],
      $verifyTags:[]
     }
  } 
  */
)

admRouter.get(
  '/tags',
  async (req, res) => {
    const data = await admService.listTags()
    res.send(data)
  }
  /* #swagger.tags = ["ADM"] */
)

export default admRouter
