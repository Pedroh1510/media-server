import express from 'express'
import AdmService from './admService.js'

const admRouter = express()

const admService = new AdmService()

admRouter.get('/delete', async (_req, res) => {
  const response = await admService.deleteFiles()
  res.send(response)
}
/* #swagger.tags = ["ADM"] */
)

export default admRouter
