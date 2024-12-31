import { PrismaClient } from '@prisma/client'

import CONFIG from '../config.js'

const prisma = new PrismaClient({
  datasourceUrl: CONFIG.dbUrl,
})

export default class DbService {
  static connection = prisma
  static async connect() {
    for (let index = 0; index < 100; index++) {
      try {
        await prisma.$connect()
        break
      } catch {}
    }
  }
}
