import { describe, expect, it, vi } from 'vitest'

import ExtractorService from '../extractorService.js'

const makeItem = () => ({ title: 'Test Anime - 01', link: 'magnet:?xt=test', date: new Date() })

const makeAsyncGen = (...items) =>
  async function* () {
    for (const item of items) yield item
  }

const makeRepositoryMock = () => ({
  save: vi.fn().mockResolvedValue(undefined),
})

const makeTorrentServiceMock = () => ({
  magnetInfo: vi.fn().mockResolvedValue('info-hash'),
})

const makeExtractorServiceMock = () => ({
  extractor: vi.fn().mockImplementation(makeAsyncGen()),
  extractorAll: vi.fn().mockImplementation(makeAsyncGen()),
  listSeries: vi.fn().mockResolvedValue([]),
  listEps: vi.fn().mockImplementation(makeAsyncGen()),
})

const sut = (overrides = {}) => {
  const repository = makeRepositoryMock()
  const torrentService = makeTorrentServiceMock()
  const nyaaService = makeExtractorServiceMock()
  const moeService = makeExtractorServiceMock()
  const animeToshoService = makeExtractorServiceMock()
  const eraiService = makeExtractorServiceMock()
  const n8nService = { ...makeExtractorServiceMock(), listSeries: vi.fn().mockResolvedValue([]) }

  const service = new ExtractorService({
    repository,
    torrentService,
    nyaaService,
    moeService,
    animeToshoService,
    eraiService,
    n8nService,
    ...overrides,
  })

  return { service, repository, torrentService, nyaaService, moeService, animeToshoService, eraiService, n8nService }
}

describe('ExtractorService', () => {
  describe('scan', () => {
    it('should call moe, nyaa, animeTosho, and erai extractors', async () => {
      const { service, moeService, nyaaService, animeToshoService, eraiService } = sut()
      await service.scan({ total: 5 })
      expect(moeService.extractor).toHaveBeenCalledWith(5)
      expect(nyaaService.extractor).toHaveBeenCalledWith(undefined, true)
      expect(animeToshoService.extractor).toHaveBeenCalled()
      expect(eraiService.extractor).toHaveBeenCalled()
    })

    it('should save items yielded by extractors', async () => {
      const item = makeItem()
      const { service, repository, torrentService, moeService } = sut()
      moeService.extractor.mockImplementation(makeAsyncGen(item))
      torrentService.magnetInfo.mockResolvedValue('hash')
      await service.scan({ total: 5 })
      expect(repository.save).toHaveBeenCalledWith(item)
    })
  })

  describe('extractorRss', () => {
    it('should call nyaa, animeTosho, and n8n extractors', async () => {
      const { service, nyaaService, animeToshoService, n8nService } = sut()
      await service.extractorRss({ q: 'One Piece' }, false)
      expect(nyaaService.extractor).toHaveBeenCalledWith({ q: 'One Piece' }, false)
      expect(animeToshoService.extractor).toHaveBeenCalledWith({ q: 'One Piece' })
      expect(n8nService.extractor).toHaveBeenCalled()
    })

    it('should return early if no query provided', async () => {
      const { service, nyaaService } = sut()
      await service.extractorRss(null)
      expect(nyaaService.extractor).not.toHaveBeenCalled()
    })
  })

  describe('scanBySite', () => {
    it('should throw for unsupported site', async () => {
      const { service } = sut()
      await expect(service.scanBySite('unknown', {})).rejects.toThrow('Site not supported')
    })

    it('should call the nyaa extractor for site=nyaa', async () => {
      const { service, nyaaService } = sut()
      await service.scanBySite('nyaa', { q: 'test' })
      expect(nyaaService.extractor).toHaveBeenCalled()
    })
  })
})
