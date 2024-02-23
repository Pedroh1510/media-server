import axios from "axios";

export const moeApi = axios.create({
  baseURL:'https://magnets.moe'
})

export const nyaaApi = axios.create({
  baseURL:'https://nyaa.si'
})
export const animeToshoApi = axios.create({
  baseURL:'https://feed.animetosho.org/rss2'
})