import DbService from '../../infra/service/dbService.js'

export default class StatusService {
  #dbService = DbService

  async getStatus() {
    await this.#dbService.connect()
  }
}
