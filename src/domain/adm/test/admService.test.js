import { describe, expect, it } from 'vitest'

import BittorrentServiceMock from '../../../infra/service/mock/bittorrentServiceMock.js'
import CsvServiceMock from '../../shared/mock/csvServiceMock.js'
import AdmService from '../admService.js'
import AdmRepositoryInMemory from '../repository/admRepositoryInMemory.js'

const sut = () => {
  const csvService = new CsvServiceMock()
  const bittorrentService = new BittorrentServiceMock()
  const repository = new AdmRepositoryInMemory()

  const service = new AdmService(
    {
      csvService,
      bittorrentService,
    },
    {
      repository,
    }
  )
  return {
    service,
    csvService,
    bittorrentService,
    repository,
  }
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
})
