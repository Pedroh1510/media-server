import { describe, expect, it, vi } from 'vitest'
import { Readable } from 'node:stream'

import BittorrentServiceMock from '../../../infra/service/mock/bittorrentServiceMock.js'
import CsvServiceMock from '../../shared/mock/csvServiceMock.js'
import AdmService from '../admService.js'
import AdmRepositoryInMemory from '../repository/admRepositoryInMemory.js'
import ScanTtlRepositoryInMemory from '../../extractor/repository/scanTtlRepositoryInMemory.js'

const sut = () => {
  const csvService = new CsvServiceMock()
  const bittorrentService = new BittorrentServiceMock()
  const repository = new AdmRepositoryInMemory()
  const scanTtlRepository = new ScanTtlRepositoryInMemory()

  const service = new AdmService(
    { csvService, bittorrentService },
    { repository, scanTtlRepository }
  )
  return { service, csvService, bittorrentService, repository, scanTtlRepository }
}

describe('admService', () => {
  describe('deleteRss', () => {
    it('should delete rss', async () => {
      const { service, repository } = sut()
      repository.torrent = [
        {
          id: 1,
          name: 'test',
          url: 'http://test.com',
          category: 'test',
          description: 'test',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]
      await expect(service.deleteRss()).resolves.toBeUndefined()
      expect(repository.torrent).toHaveLength(0)
    })
  })
  describe('insertTags', () => {
    it('should insert tags', async () => {
      const { service, repository } = sut()
      await expect(
        service.insertTags({
          verifyTags: ['test'],
          acceptedTags: ['test1'],
        })
      ).resolves.toBeUndefined()
      expect(repository.acceptedTags).toHaveLength(1)
      expect(repository.verifyTags).toHaveLength(1)
    })
    it('should not insert tags', async () => {
      const { service, repository } = sut()
      await expect(service.insertTags({})).resolves.toBeUndefined()
      expect(repository.acceptedTags).toHaveLength(0)
      expect(repository.verifyTags).toHaveLength(0)
    })
  })
  describe('listTags', () => {
    it('should list tags', async () => {
      const { service, repository } = sut()
      repository.acceptedTags = ['test']
      repository.verifyTags = ['test1']
      await expect(service.listTags()).resolves.toEqual({
        acceptedTags: repository.acceptedTags,
        verifyTags: repository.verifyTags,
      })
    })
  })

  describe('deleteFiles', () => {
    it('should return totals when no concluded torrents', async () => {
      const { service } = sut()
      const result = await service.deleteFiles()
      expect(result).toEqual({ total: 0, totalDeleted: 0 })
    })

    it('should stop and delete expired torrents', async () => {
      const { service, bittorrentService } = sut()
      const expiredDate = new Date(Date.now() - 3 * 60 * 60 * 1000) // 3h atrás
      bittorrentService.returns.listTorrentsConcluded = [
        { hash: 'abc123', name: 'Anime.ep01', dateCompleted: expiredDate },
      ]
      const result = await service.deleteFiles()
      expect(result.totalDeleted).toBe(1)
      expect(result.deleled).toContain('Anime.ep01')
    })

    it('should not delete torrents completed less than 2h ago', async () => {
      const { service, bittorrentService } = sut()
      const recentDate = new Date(Date.now() - 1 * 60 * 60 * 1000) // 1h atrás
      bittorrentService.returns.listTorrentsConcluded = [
        { hash: 'abc123', name: 'Anime.ep01', dateCompleted: recentDate },
      ]
      const result = await service.deleteFiles()
      expect(result.totalDeleted).toBe(0)
    })
  })

  describe('clearScanCache', () => {
    it('should clear all scan TTL entries', async () => {
      const { service, scanTtlRepository } = sut()
      await scanTtlRepository.setLastScan('Naruto')
      await scanTtlRepository.setLastScan('Bleach')
      await service.clearScanCache()
      expect(await scanTtlRepository.getLastScan('Naruto')).toBeNull()
      expect(await scanTtlRepository.getLastScan('Bleach')).toBeNull()
    })
  })

  describe('exportData', () => {
    it('should return filename and a stream', () => {
      const { service } = sut()
      const result = service.exportData()
      expect(result.fileName).toBe('data.csv')
      expect(typeof result.stream.pipe).toBe('function')
    })
  })
})
