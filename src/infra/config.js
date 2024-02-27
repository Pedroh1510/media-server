// import { config } from 'dotenv-safe'
// config()

const CONFIG = {
  port: process.env.port || 3000,
  host: process.env.host || 'localhost',
  userTorrent: process.env.user_torrent,
  passTorrent: process.env.pass_torrent,
  loki: process.env.loki,
}
export default CONFIG
