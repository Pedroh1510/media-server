const url =
	'magnet:?xt=urn:btih:3124464ceb5e3abc6adaf0ee80c453a2e9b2a30d&dn=[Erai-raws]%20Sousou%20no%20Frieren%20-%2005%20[480p][Multiple%20Subtitle]%20[ENG][POR-BR][SPA-LA][SPA][ARA][FRE][GER][ITA][RUS]&tr=http://nyaa.tracker.wf:7777/announce&tr=udp://open.stealth.si:80/announce&tr=udp://tracker.opentrackr.org:1337/announce&tr=udp://tracker.coppersurfer.tk:6969/announce&tr=udp://exodus.desync.com:6969/announce';

import parseTorrent, { toTorrentFile } from 'parse-torrent';

(async () => {
	const a = await parseTorrent(url);
	console.log(a);
	const b = toTorrentFile({
		infoHash: '75650e78d2bc03351221119616be8ccbd775ba93'
	});
	console.log(b);
	// console.log(a.infoHash);
})();
