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
export default extractorRouter
