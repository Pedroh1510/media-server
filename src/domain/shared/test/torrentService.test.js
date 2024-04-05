import { describe, expect, it } from 'vitest'

import TorrentService from '../torrentService.js'

const sut = () => {
  const service = new TorrentService()
  return {
    service,
  }
}

describe('torrentService', () => {
  describe('infoHashToMagnet', () => {
    it('should return the magnet link for the given info hash', () => {
      const { service } = sut()
      const magnet = service.infoHashToMagnet('1234567890123456789012345678901234567890')
      expect(magnet).toBe('magnet:?xt=urn:btih:1234567890123456789012345678901234567890')
    })
  })
  describe('magnetInfo', () => {
    it('should return the info hash for the given magnet link', async () => {
      const { service } = sut()
      const infoHash = await service.magnetInfo('magnet:?xt=urn:btih:1234567890123456789012345678901234567890')
      expect(infoHash).toEqual({ infoHash: '1234567890123456789012345678901234567890' })
    })
  })
})
