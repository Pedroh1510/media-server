import { sites } from '../utils/sites.js'

export default class AdmService {
  updateHeaders({ type, headers }) {
    if (!sites[type]) return
    if (!sites[type].browserContent) {
      sites[type].browserContent = {
        headers: {},
      }
    }
    sites[type].browserContent.headers = {
      ...sites[type].browserContent.headers,
      ...headers,
    }
  }

  getHeaders({ type }) {
    if (!sites[type]) return
    if (!sites[type].browserContent) return
    return sites[type].browserContent.headers
  }

  getTypes() {
    return Object.keys(sites)
  }
}
