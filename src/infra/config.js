import { config } from 'dotenv-safe';
config();

const CONFIG = {
	port: process.env.port || 3000,
	userTorrent: process.env.user_torrent,
	passTorrent: process.env.pass_torrent
};
export default CONFIG;
