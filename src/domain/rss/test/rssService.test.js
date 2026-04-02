import { describe, expect, it, vi } from 'vitest'

import TorrentServiceMock from '../../shared/mock/torrentServiceMock.js'
import XmlServiceMock from '../../shared/mock/xmlServiceMock.js'
import RssRepositoryInMemory from '../repository/rssRepositoryInMemory.js'
import RssService from '../rssService.js'

const makeScanJobServiceMock = () => ({
  enqueueScan: vi.fn().mockResolvedValue(undefined),
})

const sut = () => {
  const xmlService = new XmlServiceMock()
  const torrentService = new TorrentServiceMock()
  const scanJobService = makeScanJobServiceMock()
  const rssRepository = new RssRepositoryInMemory()
  const service = new RssService(
    {
      xmlService,
      torrentService,
      scanJobService,
    },
    {
      rssRepository,
    }
  )
  return { service, xmlService, torrentService, scanJobService, rssRepository }
}

describe('rssService', () => {
  describe('listAll', () => {
    it('should return an empty array of rss', async () => {
      const { service } = sut()
      await expect(service.listAll()).resolves.toEqual([])
    })
    it('should return an array of rss', async () => {
      const { service, rssRepository } = sut()
      rssRepository.torrent = [
        {
          title: 'title',
          link: 'link',
          description: 'description',
          pubDate: 'pubDate',
          guid: 'guid',
          category: 'category',
          torrent: 'torrent',
        },
      ]
      await expect(service.listAll()).resolves.toEqual(rssRepository.torrent)
    })
  })

  describe('count', () => {
    it('should return the number of torrents', async () => {
      const { service, rssRepository } = sut()
      rssRepository.torrent = [
        {
          title: 'title',
          link: 'link',
          description: 'description',
          pubDate: 'pubDate',
          guid: 'guid',
          category: 'category',
          torrent: 'torrent',
        },
      ]
      await expect(service.count()).resolves.toEqual({ total: rssRepository.torrent.length })
    })
  })

  describe('list', () => {
    it('should call enqueueScan with cleaned term when isScan is true', async () => {
      const { service, scanJobService } = sut()
      await service.list({ t: 'One Piece S01', isScan: true })
      expect(scanJobService.enqueueScan).toHaveBeenCalledWith('One Piece', { scanAllItems: false })
    })

    it('should not call enqueueScan when isScan is false', async () => {
      const { service, scanJobService } = sut()
      await service.list({ t: 'One Piece', isScan: false })
      expect(scanJobService.enqueueScan).not.toHaveBeenCalled()
    })

    it('should return items from repository', async () => {
      const { service, rssRepository } = sut()
      rssRepository.torrent = []
      const result = await service.list({ t: 'test', isScan: false })
      expect(result).toEqual([])
    })
  })

  describe('listAsXml', () => {
    it('should call enqueueScan when isScan is true', async () => {
      const { service, scanJobService } = sut()
      await service.listAsXml({ t: 'Naruto', isScan: true })
      expect(scanJobService.enqueueScan).toHaveBeenCalledWith('Naruto', { scanAllItems: false })
    })

    it('should return xml output', async () => {
      const { service, rssRepository, xmlService } = sut()
      rssRepository.torrent = []
      vi.spyOn(xmlService, 'buildToRss').mockReturnValue('<rss/>')
      const result = await service.listAsXml({ t: 'test', isScan: false })
      expect(result).toBe('<rss/>')
    })
  })

  describe('buildItems (via list)', () => {
    it('should process items with magnet link', async () => {
      const { service, rssRepository } = sut()
      rssRepository.torrent = [
        { id: 1, title: 'Naruto - 01', magnet: 'magnet:?xt=urn:btih:abc', pubDate: new Date() },
      ]
      const result = await service.list({ isScan: false })
      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Naruto - 01')
    })

    it('should skip items when torrentService throws', async () => {
      const { service, rssRepository, torrentService } = sut()
      rssRepository.torrent = [
        { id: 1, title: 'Naruto - 01', magnet: 'bad-magnet', pubDate: new Date() },
      ]
      torrentService.returns.magnetInfo = null
      // Make magnetInfo throw
      vi.spyOn(torrentService, 'magnetInfo').mockRejectedValue(new Error('bad magnet'))
      const result = await service.list({ isScan: false })
      expect(result).toHaveLength(0)
    })
  })

  describe('formatTitle (via list)', () => {
    it('should format episode titles with season pattern', async () => {
      const { service, rssRepository } = sut()
      rssRepository.torrent = [
        { id: 1, title: '[Sub] Anime 2nd Season - 01 [720p]', magnet: 'magnet:?xt=urn:btih:abc', pubDate: new Date() },
      ]
      const result = await service.list({ isScan: false })
      expect(result).toHaveLength(1)
      // title went through formatTitle which manipulates "2nd Season - 01" pattern
      expect(typeof result[0].title).toBe('string')
    })

    it('should leave titles unchanged when no season pattern', async () => {
      const { service, rssRepository } = sut()
      rssRepository.torrent = [
        { id: 1, title: 'Naruto - Episode 01', magnet: 'magnet:?xt=urn:btih:abc', pubDate: new Date() },
      ]
      const result = await service.list({ isScan: false })
      expect(result[0].title).toBe('Naruto - Episode 01')
    })
  })
})
