import { describe, expect, it, vi } from 'vitest'
import StatusService from '../statusService.js'

vi.mock('../../../infra/service/dbService.js', () => ({
  default: {
    connect: vi.fn().mockResolvedValue(undefined),
  },
}))

describe('StatusService', () => {
  describe('getStatus', () => {
    it('should call dbService connect without throwing', async () => {
      const service = new StatusService()
      await expect(service.getStatus()).resolves.toBeUndefined()
    })
  })
})
