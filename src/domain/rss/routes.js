import express from 'express'
import RssService from './rssService.js'

const rssRouter = express()
const service = new RssService()

rssRouter.get('/', async (req, res) => {
  const data = await service.list({ ...req.query })
  res.header('Content-Type', 'application/xml')
  res.header('Cache-Control', 'no-cache, no-store, must-revalidate')
  return res.send(data).end()
})

rssRouter.get('/all', async (req, res) => {
  const data = await service.listAll()
  return res.send(data).end()
})

rssRouter.get('/amount', async (req, res) => {
  const data = await service.count()
  return res.send(data).end()
})

export default rssRouter
