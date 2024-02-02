import ExtractorRepository from './extractorRepository.js';
import MoeService from './moeService.js';

export default class ExtractorService {
	constructor() {
		this.moeService = new MoeService();
		this.repository = new ExtractorRepository();
	}
	/**
	 *
	 * @param {Object} param
	 * @param {String} param.total
	 * @returns {Promise<void>}
	 */
	async scan({ total }) {
		for await (const item of this.moeService.extractor(total)) {
			await this.repository.save(item);
		}
	}
}
