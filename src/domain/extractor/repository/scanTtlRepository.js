import { Redis } from 'ioredis'

import CONFIG from '../../../infra/config.js'

const redis = new Redis({ host: CONFIG.redis_host, port: CONFIG.redis_port })

export default class ScanTtlRepository {
  #redis

  constructor(redisClient = redis) {
    this.#redis = redisClient
  }

  async getLastScan(term) {
    return this.#redis.get(`scan:ttl:${term}`)
  }

  async setLastScan(term) {
    const ttlSeconds = CONFIG.scanTtlMinutes * 60
    await this.#redis.set(`scan:ttl:${term}`, new Date().toISOString(), 'EX', ttlSeconds)
  }

  async clearAll() {
    const keys = await this.#redis.keys('scan:ttl:*')
    if (keys.length) await this.#redis.del(keys)
  }
}
