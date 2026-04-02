import CONFIG from '../../infra/config.js'
import { scanQueue } from '../../job.js'
import ScanTtlRepository from './repository/scanTtlRepository.js'

function isWithinTtl(lastScan, ttlMinutes) {
  const lastScanTime = new Date(lastScan).getTime()
  const ttlMs = ttlMinutes * 60 * 1000
  return Date.now() - lastScanTime < ttlMs
}

export default class ScanJobService {
  constructor({ ttlRepo = new ScanTtlRepository(), queue = scanQueue } = {}) {
    this.ttlRepo = ttlRepo
    this.queue = queue
  }

  async enqueueScan(term, options = { scanAllItems: false }) {
    const lastScan = await this.ttlRepo.getLastScan(term)
    if (lastScan && isWithinTtl(lastScan, CONFIG.scanTtlMinutes)) return

    await this.queue.add(
      'scan',
      { term, ...options },
      {
        jobId: `scan:${term}`,
        removeOnComplete: true,
      }
    )

    await this.ttlRepo.setLastScan(term)
  }
}
