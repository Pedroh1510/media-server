import DbService from '../../../infra/service/dbService.js'

export default class RssRepository {
  #prisma = DbService.connection
  async list({ term = undefined, limit = undefined }) {
    let where
    if (term) {
      where = {
        title: {
          contains: term.split(/s\d/)[0].trim(),
        },
      }
    }

    return this.#prisma.torrent.findMany({
      take: limit,
      where,
      orderBy: {
        pubDate: 'desc',
      },
    })
  }

  async listAll() {
    return this.#prisma.torrent.findMany({
      take: 100,
      orderBy: {
        pubDate: 'desc',
      },
    })
  }

  async count() {
    return this.#prisma.torrent.count({})
  }
}
