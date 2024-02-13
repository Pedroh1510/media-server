import axios from 'axios';
import cheerio, { load } from 'cheerio';
import logger from '../../utils/logger.js';
import { acceptedTags } from '../../utils/constants.js';

export default class MoeService {
	constructor() {
		this.acceptedTags = acceptedTags
		this.baseUrl = 'https://magnets.moe'
	}

	/**
	 *
	 * @param {String} url
	 * @returns {Promise<{nextUrl:String,listData:{title:String,link:String,pubDate:String,hour:String}[]}>}>}
	 */
	async #process(url) {
		const page = await axios.get(url).then((res) => res.data);
		const html = cheerio.load(page);
		const pageDate = html('body > h3').text();
		const blocks = html('body > div');
		

		const listData = [];
		const isAccept = (text) =>
			this.acceptedTags.some((tag) => text.includes(tag));
		blocks.each(function () {
			const hour = html(this).text();
			const pageTags = html(this).find('a');
			const paragraphs = pageTags
				.map((i, e) => {
					if (e.attribs?.href && e.attribs.href.includes('magnet')) {
						return e.attribs?.href;
					}
					if (e.children.length > 0 && e.children[0]?.data) {
						return e.children[0]?.data;
					}
					return null;
				})
				.toArray()
				.filter((e) => e !== null);
			if (paragraphs.length !== 2) {
				return;
			}
			if (paragraphs[1].trim() === '') {
				return;
			}
			const text = paragraphs[1].toLowerCase();
			if (isAccept(text)) {
				listData.push({
					title: paragraphs[1],
					link: paragraphs[0],
					pubDate: pageDate,
					hour
				});
			}
		});
		const nextUrl = html('body > p:nth-child(3) > a:nth-child(2)').attr('href');
		return { nextUrl, listData };
	}

	/**
	 * @param {{title:String,link:String,pubDate:String,hour:String}} param
	 * @returns {{title:String,link:String,date:Date}}
	 */
	#format({ hour, link, pubDate, title }) {
		const date = pubDate.substring(0, 10);
		const dateFormatted = new Date(`${date} ${hour.substring(0, 5)}:00:000z`);
		return {
			date: dateFormatted,
			link,
			title
		};
	}

	/**
	 *
	 * @param {Number} total
	 * @returns {AsyncGenerator<{title:String,link:String,date:Date}>}
	 */
	async *extractor(total=3) {
		logger.info('Extractor Moe -> start')
		let url = `${this.baseUrl}/new`;

		const mapa = new Set();
		for (let index = 0; index < total; index++) {
			mapa.clear();
			let newurl = '';
			try {
				const { nextUrl, listData } = await this.#process(url);
				if (nextUrl) newurl = nextUrl;
				for (const item of listData) {
					yield this.#format(item);
				}
			} catch (e) {
				logger.error(e);
				continue;
			}
			if (!newurl) {
				break;
			}
			url = `${this.baseUrl}${newurl}`;
		}
		
		logger.info('Extractor Moe -> end')
	}
	async #processInPageShow(uri){
		let page = null
		for (let i = 0; i < 3; i++) {
			try {
				page = await axios.get(`${this.baseUrl}${uri}`).then((res) => res.data);
				break
			} catch (error) {	
			}
		}
		if(!page) throw new Error('Falha na busca')
		const html = load(page);
		const pageDate = html('body > h3').first().text();  
		const blocksAll = html('body > div');
		const blocks = blocksAll.filter((_,block)=>block.children.some(child=>child?.attribs?.href&&child.attribs?.href.startsWith('magnet:?')))
		const regexHour = /(\d){2}:(\d){2} \|/
		const response = []
		for (const block of blocks) {
			const data = {
				pubDate: pageDate
			}
			try{
			for (const child of block.children) {
				if(child.attribs?.href?.startsWith('magnet:?')){
					data.link = child.attribs.href
				}else      if(child.attribs?.href?.startsWith('/torrent')&&child.children?.length){
						data.title = child.children[0]?.data
				}else if(regexHour.test(child?.data)){
					data.hour = regexHour.exec(child.data)[0].replace('|','').trim()
				}
			}
			if(!data.link||!data.title||!data.hour) continue
			if(!this.acceptedTags.some(tag=>data.title.includes(tag))) continue
			response.push(data)
		}catch(e){
			continue
		}
		}
		const nextUrl = html('body > p:nth-child(8) > a:nth-child(2)').attr('href');
		if(!nextUrl) return response
		return response.concat(await this.#processInPageShow(nextUrl))
	}

	async  #listHref(baseUrl){
		const page = await axios.get(`${baseUrl}/shows`).then((res) => res.data);
		const html = load(page);
		const blocks = html('body > div:nth-child(4)');
		const listHref = new Set()
		blocks.children().each((_,i)=>{
			for (const element of i.children) {
				if(!element.attribs?.id) continue
				if(!element.attribs.id?.startsWith('element')) continue
				for (const child of element.children) {
					if(!child.attribs?.href) continue
					if(!child.attribs.href.startsWith('/show/')) continue
					listHref.add(child.attribs.href)
				}
			}
		})
		return [...listHref].sort((a,b)=>{

			const w = parseInt(a.split('/').pop())
			const q = parseInt(b.split('/').pop())
			return w-q
		}
		)
	}


	/**
	 * @returns {AsyncGenerator<{}[]>}
	 */
	async *extractorAll(){
		logger.info('extractorAll - start')
		const list = await this.#listHref(this.baseUrl)
		const limit = 10
		const promises = []
		logger.info(`extractorAll - total ${list.length}`)
		for (let index = 0; index < list.length; index++) {
			const item = list[index];
			promises.push(this.#processInPageShow(item))
			if(promises.length<limit)continue
			const responses = await Promise.all(promises)
			logger.info(`${index+1}/${list.length} -> batch ${limit}`)
			for (const response of responses) {
				if(!response.length) continue
				for (const item of response) {
					yield this.#format(item);
				}
			}
			promises.length = 0
		}
		const responses = await Promise.all(promises)
		for (const response of responses) {
			if(!response.length) continue
			for (const item of response) {
				yield this.#format(item);
			}
		}
		logger.info('extractorAll - end')
	}
}
