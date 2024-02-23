import axios from "axios";

export const moeApi = axios.create({
  baseURL:'https://magnets.moe'
})