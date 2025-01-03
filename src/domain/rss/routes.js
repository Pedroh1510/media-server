import express from 'express'

import RssService from './rssService.js'

const rssRouter = express()
const service = new RssService()

rssRouter.get(
  '/',
  async (req, res) => {
    const data = await service.listAsXml({ ...req.query })
    res.header('Content-Type', 'application/xml')
    res.header('Cache-Control', 'no-cache, no-store, must-revalidate')
    return res.send(data).end()
  }
  /* #swagger.tags = ["RSS"] 
#swagger.path = '/rss'

#swagger.parameters['term'] = {
  in: 'query',
  type: 'string'
}
#swagger.parameters['q'] = {
  in: 'query',
  type: 'string'
}
#swagger.parameters['scanAllItems'] = {
  in: 'query',
  type: 'boolean'
}
#swagger.parameters['isScan'] = {
  in: 'query',
  type: 'boolean'
}
*/
)

rssRouter.get(
  '/json',
  async (req, res) => {
    const data = await service.list({ ...req.query })
    return res.send(data).end()
  }
  /* #swagger.tags = ["RSS"] 
#swagger.path = '/rss/json'

#swagger.parameters['term'] = {
  in: 'query',
  type: 'string'
}
#swagger.parameters['q'] = {
  in: 'query',
  type: 'string'
}
#swagger.parameters['scanAllItems'] = {
  in: 'query',
  type: 'boolean'
}
#swagger.parameters['isScan'] = {
  in: 'query',
  type: 'boolean'
}
*/
)

rssRouter.get(
  '/all',
  async (_req, res) => {
    const data = await service.listAll()
    return res.send(data).end()
  }
  /* #swagger.tags = ["RSS"]
#swagger.path = '/rss/all'
 */
)

rssRouter.get(
  '/amount',
  async (_req, res) => {
    const data = await service.count()
    return res.send(data).end()
  }
  /* #swagger.tags = ["RSS"] 
#swagger.path = '/rss/amount'
*/
)

export default rssRouter
