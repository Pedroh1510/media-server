import express from 'express'

import StatusService from './statusService.js'

const statusRouter = express()

export default statusRouter
const statusService = new StatusService()

statusRouter.get('/', async (_req, res) => {
  await statusService.getStatus()
  return res.status(200).json({ message: 'Status' })
})
