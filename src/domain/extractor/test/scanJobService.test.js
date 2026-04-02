import { describe, expect, it, vi } from 'vitest'

import ScanTtlRepositoryInMemory from '../repository/scanTtlRepositoryInMemory.js'
import ScanJobService from '../scanJobService.js'

const makeQueueMock = () => ({
  add: vi.fn().mockResolvedValue(undefined),
})

const sut = () => {
  const ttlRepo = new ScanTtlRepositoryInMemory()
  const queue = makeQueueMock()
  const service = new ScanJobService({ ttlRepo, queue })
  return { service, ttlRepo, queue }
}

describe('ScanJobService', () => {
  describe('enqueueScan', () => {
    it('should enqueue a job when no previous scan exists', async () => {
      const { service, queue } = sut()
      await service.enqueueScan('One Piece')
      expect(queue.add).toHaveBeenCalledOnce()
      expect(queue.add).toHaveBeenCalledWith(
        'scan',
        { term: 'One Piece', scanAllItems: false },
        expect.objectContaining({ jobId: 'scan:One Piece', removeOnComplete: true })
      )
    })

    it('should store the scan timestamp after enqueuing', async () => {
      const { service, ttlRepo } = sut()
      await service.enqueueScan('Naruto')
      const lastScan = await ttlRepo.getLastScan('Naruto')
      expect(lastScan).not.toBeNull()
    })

    it('should skip enqueue if scan is within TTL', async () => {
      const { service, queue, ttlRepo } = sut()
      await ttlRepo.setLastScan('Bleach')
      await service.enqueueScan('Bleach')
      expect(queue.add).not.toHaveBeenCalled()
    })

    it('should enqueue again if previous scan is expired', async () => {
      const { service, queue, ttlRepo } = sut()
      const expired = new Date(Date.now() - 20 * 60 * 1000).toISOString()
      vi.spyOn(ttlRepo, 'getLastScan').mockResolvedValue(expired)
      await service.enqueueScan('Dragon Ball')
      expect(queue.add).toHaveBeenCalledOnce()
    })
  })
})
