import express from 'express'

import admRouter from './adm/routes.js'
import rootRouter from './root/routes.js'

const mangasRouter = express()

export default mangasRouter

mangasRouter.use('/adm', admRouter)
mangasRouter.use(rootRouter)
