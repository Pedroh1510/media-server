import { PrismaClient } from '@prisma/client'

export default class AdmRepository {
  #prisma = new PrismaClient()

  async *listAll() {
    const total = await this.count()
    const totalInPage = 100
    for (let index = 0; index < total; index += totalInPage) {
      const response = await this.#prisma.torrent.findMany({
        take: totalInPage,
        skip: index,
      })
      for (const item of response) {
        yield item
      }
    }
  }

  async count() {
    return this.#prisma.torrent.count({})
  }
}
