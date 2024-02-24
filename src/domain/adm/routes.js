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
  async (_req, res) => {
    const { fileName, stream } = admService.exportData()
    res.attachment(fileName)
    stream.pipe(res)
  }
  /* #swagger.tags = ["ADM"] */
)

admRouter.post(
  '/import-data',
  async (req, res) => {
    const data = await admService.importData({ fileStream: req })
    res.send(data)
  }
  /* #swagger.tags = ["ADM"] */
)

export default admRouter
