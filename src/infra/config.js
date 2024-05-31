import { config } from 'dotenv'
config()

const CONFIG = {
  port: process.env.port || 3000,
  host: process.env.host || 'localhost',
  userTorrent: process.env.user_torrent,
  passTorrent: process.env.pass_torrent,
  loki: process.env.loki || '',
  redis: process.env.REDIS || '127.0.0.1:6379',
}
export default CONFIG
