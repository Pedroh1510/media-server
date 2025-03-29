import axios from 'axios'

import CONFIG from '../config.js'

export const moeApi = axios.create({
  baseURL: 'https://magnets.moe',
})

export const nyaaApi = axios.create({
  baseURL: 'https://nyaa.si',
})
export const animeToshoApi = axios.create({
  baseURL: 'https://feed.animetosho.org/rss2',
})
export const eraiApi = axios.create({
  baseURL: CONFIG.erai,
})

export const n8nApi = axios.create({
  baseURL: CONFIG.n8nUrl,
})
