import { PrismaClient } from '@prisma/client'

import CONFIG from '../config.js'

const prisma = new PrismaClient({
  datasourceUrl: CONFIG.dbUrl,
})

export default class DbService {
  static connection = prisma
}
