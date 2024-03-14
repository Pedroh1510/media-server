import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import swaggerAutogen from 'swagger-autogen'

import CONFIG from '../config.js'

const host = CONFIG.host.includes(':') ? CONFIG.host : `${CONFIG.host}:${CONFIG.port}`
const doc = {
  info: {
    title: 'My API',
    description: 'Description',
  },
  host,
  schemes: ['http'],
  basePath: '/',
  consumes: ['application/json'],
  produces: ['application/json'],
}

const outputFile = './swagger-output.json'

const filePath = (fileName) => resolve(...['src', fileName])
function listAllRoutes() {
  const domains = readdirSync(filePath('domain'))
  const listRoutes = []
  for (const domain of domains) {
    const route = readdirSync(filePath(`domain/${domain}`))
      .filter((element) => element === 'routes.js')
      .map((element) => filePath(`domain/${domain}/${element}`))
    if (!route.length) continue
    listRoutes.push(...route)
  }
  return listRoutes
}

const routes = listAllRoutes()

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swaggerAutogen({ swagger: '2.0' })(outputFile, routes, doc)
