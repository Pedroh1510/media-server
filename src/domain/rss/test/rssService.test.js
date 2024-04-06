import { describe, expect, it } from 'vitest'

import CsvServiceMock from '../../shared/mock/csvServiceMock.js'
import TorrentServiceMock from '../../shared/mock/torrentServiceMock.js'
import XmlServiceMock from '../../shared/mock/xmlServiceMock.js'
import RssRepositoryInMemory from '../repository/rssRepositoryInMemory.js'
import RssService from '../rssService.js'

const sut = () => {
  const xmlService = new XmlServiceMock()
  const csvService = new CsvServiceMock()
  const torrentService = new TorrentServiceMock()
  const rssRepository = new RssRepositoryInMemory()
  const service = new RssService(
    {
      xmlService,
      csvService,
      torrentService,
    },
    {
      rssRepository,
    }
  )
  return { service, xmlService, csvService, torrentService, rssRepository }
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
})
