import DbService from '../../../../infra/service/dbService.js'

export default class RootRepository {
  #prisma = DbService.connection
  async register({ link, name, type }) {
    return this.#prisma.mangas.create({
      data: {
        link,
        name,
        type,
      },
    })
  }

  async registerChapter({ link, name, mangaId, images }) {
    return this.#prisma.chapters.upsert({
      create: {
        link,
        name,
        mangaId,
        images,
      },
      update: {
        images,
      },
      where: {
        name_mangaId: {
          mangaId,
          name,
        },
      },
    })
  }

  async list(type) {
    const filter = {
      type: {
        in: type,
      },
    }
    const where = type ? filter : undefined
    return this.#prisma.mangas.findMany({
      include: {
        _count: true,
        Chapters: {
          select: {
            id: true,
            name: true,
            error: true,
            read: true,
            filePath: true,
          },
          orderBy: {
            name: 'asc',
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
      where,
    })
  }

  async listDownloadEnable() {
    return this.#prisma.mangas.findMany({
      include: {
        _count: true,
        Chapters: {
          select: {
            id: true,
            name: true,
            error: true,
            read: true,
            filePath: true,
          },
          orderBy: {
            name: 'asc',
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
      where: {
        siteManga: {
          autoDownload: true,
        },
      },
    })
  }

  async listChapterByNameAndManga(names, mangaId) {
    return this.#prisma.chapters.findMany({
      where: {
        name: {
          in: names,
        },
        AND: {
          mangaId,
        },
      },
    })
  }

  async getManga(mangaId) {
    return this.#prisma.mangas.findFirstOrThrow({
      include: {
        Chapters: true,
        siteManga: {
          include: { SiteMangaSelector: true },
        },
      },
      where: {
        id: mangaId,
      },
    })
  }

  async getChapter(mangaId, name, id) {
    const where = {
      mangaId,
    }
    if (name) {
      where.name = name
    } else {
      where.id = id
    }
    return this.#prisma.chapters.findFirstOrThrow({
      where,
    })
  }

  async updateChapter(id, read, error) {
    await this.#prisma.chapters.update({
      data: {
        error,
        read,
      },
      where: {
        id,
      },
    })
  }

  async updateChapterFile(id, filePath) {
    await this.#prisma.chapters.update({
      data: {
        filePath,
      },
      where: {
        id,
      },
    })
  }
}
