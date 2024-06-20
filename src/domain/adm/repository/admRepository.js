import DbService from '../../../infra/service/dbService.js'

export default class AdmRepository {
  #prisma = DbService.connection

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

  async insert({ magnet, pubDate, title }) {
    await this.#prisma.torrent.create({
      data: {
        magnet,
        pubDate,
        title,
      },
    })
  }

  async deleteAll() {
    await this.#prisma.torrent.deleteMany()
  }

  async insertAcceptedTags(data) {
    await this.#prisma.acceptedTags.createMany({ data })
  }

  async insertVerifyTags(data) {
    await this.#prisma.verifyTags.createMany({ data })
  }

  async listAcceptedTags() {
    return this.#prisma.acceptedTags.findMany({ select: { tag: true } })
  }

  async listVerifyTags() {
    return this.#prisma.verifyTags.findMany({ select: { tag: true } })
  }
}
