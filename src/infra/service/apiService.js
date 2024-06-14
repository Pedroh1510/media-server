import axios from 'axios'

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
  baseURL: 'https://www.erai-raws.info/feed/?type=magnet&d157edc6b50f28b2776442c03d067d56',
})
