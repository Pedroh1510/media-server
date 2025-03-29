import express from 'express'

import ExtractorService from './extractorService.js'

const extractorRouter = express()

const extractorService = new ExtractorService()

extractorRouter.get(
  '/scan',
  async (req, res) => {
    await extractorService.scan(req.query)
    res.send('ok')
  }
  /*
#swagger.tags = ["Extractor"]
#swagger.parameters['total'] = {
            in: 'query',
            description: 'Some description...',
            type: 'number'
    } */
)
extractorRouter.get(
  '/scan-all',
  async (req, res) => {
    req.setTimeout(0)
    const total = await extractorService.scanFull()
    res.send({ total })
  }
  /**
   * #swagger.tags = ["Extractor"]
   */
)

extractorRouter.get(
  '/:site',
  async (req, res) => {
    req.setTimeout(0)
    const total = await extractorService.scanBySite(req.params.site, req.query)
    res.send({ total })
  }
  /**
   * #swagger.tags = ["Extractor"]
   */
)

extractorRouter.get(
  '/:site/list/series',
  async (req, res) => {
    req.setTimeout(0)
    const series = await extractorService.listSeries(req.params.site)
    res.send(series)
  }
  /**
   * #swagger.tags = ["Extractor"]
   * #swagger.path = '/extractor/{site}/list/series'
   */
)

extractorRouter.get(
  '/:site/list/series/eps',
  async (req, res) => {
    req.setTimeout(0)
    const series = await extractorService.scanEps({ ...req.query, ...req.params })

    res.status(200).json({ total: series })
  }
  /**
   * #swagger.tags = ["Extractor"]
   * #swagger.path = '/extractor/{site}/list/series/eps'
#swagger.parameters['name'] = {
  in: 'query',
  type: 'string',
  required:true
}
#swagger.parameters['link'] = {
  in: 'query',
  type: 'string',
  required:true
}
   */
)
export default extractorRouter
