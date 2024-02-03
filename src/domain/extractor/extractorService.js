import logger from '../../utils/logger.js';
import ExtractorRepository from './extractorRepository.js';
import MoeService from './moeService.js';
import NyaaService from './nyaaService.js';

export default class ExtractorService {
	constructor() {
		this.repository = new ExtractorRepository();
		this.moeService = new MoeService();
		this.nyaaService = new NyaaService();
	}
	/**
	 *
	 * @param {Object} param
	 * @param {String} param.total
	 * @returns {Promise<void>}
	 */
	async scan({ total }) {
		logger.info(`scan -> with total ${total}`)

		// TODO verificar se da para paralelizar
		/**
		 * @param {AsyncGenerator} asyncGeneratorFn
		 */
		const executeExtractor = async(asyncGeneratorFn)=>{
			for await (const item of asyncGeneratorFn()) {
				await this.repository.save(item);
			}	
		}

		await Promise.all(
			[
				executeExtractor(()=>this.moeService.extractor(total)),
				executeExtractor(()=>this.moeService.extractor(total))
			]
		)
		for await (const item of this.moeService.extractor(total)) {
			await this.repository.save(item);
		}
		for await (const item of this.nyaaService.extractor()) {
			await this.repository.save(item);
		}
		
		logger.info(`scan -> end`)
	}

	async extractorRss(query){
		if(!query) return
		logger.info(`extractorRss -> start`)
		let counter = 0
		for await (const item of this.nyaaService.extractorRss(query)) {
			await this.repository.save(item);
			counter++
		}	
		logger.info(`extractorRss -> end ${counter}`)
	}
}
