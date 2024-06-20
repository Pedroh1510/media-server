import DbService from '../../../../infra/service/dbService.js'

export default class AdmRepository {
  #prisma = DbService.connection
  async list(names) {
    return this.#prisma.siteManga.findMany({
      include: {
        SiteMangaSelector: true,
      },
      where: {
        name: names ? { in: names } : undefined,
      },
    })
  }

  async get(id) {
    return this.#prisma.siteManga.findFirst({
      include: {
        SiteMangaSelector: true,
      },
      where: {
        id,
      },
    })
  }

  async registerCatalog(data, idSiteManga) {
    const dataArray = Array.isArray(data) ? data : [data]
    await this.#prisma.mangasCatalog.createMany({
      skipDuplicates: true,
      data: dataArray.map((item) => ({ ...item, idSiteManga })),
    })
  }

  async searchInCatalog(term) {
    return this.#prisma.mangasCatalog.findMany({
      where: {
        name: {
          contains: term,
          mode: 'insensitive',
        },
      },
    })
  }
}
