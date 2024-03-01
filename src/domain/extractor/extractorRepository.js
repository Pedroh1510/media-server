import { PrismaClient } from '@prisma/client'

export default class ExtractorRepository {
  #prisma = new PrismaClient()

  /**
   *
   * @param {{title: string, link: string, date: Date}} param
   */
  async save({ title, date, link }) {
    await this.#prisma.torrent
      .create({
        data: {
          title,
          magnet: link,
          pubDate: date,
        },
      })
      .catch(() => {})
  }

  async listTags() {
    return {
      accepted: await this.#prisma.acceptedTags.findMany({ select: { tag: true } }),
      verify: await this.#prisma.verifyTags.findMany({ select: { tag: true } }),
    }
  }
}
