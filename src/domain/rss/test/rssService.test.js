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
})
