const CONFIG = {
  port: process.env.port || 3000,
  host: process.env.host || 'localhost',
  userTorrent: process.env.user_torrent,
  passTorrent: process.env.pass_torrent,
  urlTorrent: process.env.url_torrent,
  loki: process.env.loki || '',
  redis_host: process.env.REDIS_HOST || '127.0.0.1',
  redis_port: process.env.REDIS_PORT || '6379',
  erai: process.env.ERAI,
}
export default CONFIG
