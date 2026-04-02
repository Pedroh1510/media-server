export default class ScanTtlRepositoryInMemory {
  #store = new Map()

  async getLastScan(term) {
    return this.#store.get(term) ?? null
  }

  async setLastScan(term) {
    this.#store.set(term, new Date().toISOString())
  }
}
