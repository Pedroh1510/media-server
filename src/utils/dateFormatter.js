import dayjs from 'dayjs';

export default class DateFormatter {
	/**
	 *
	 * @param {date} date
	 * @param {date} date2
	 * @param {('hour'|'minute'|'day')} unit
	 * @returns {number}
	 */
	static diff(date, date2, unit = 'h') {
		return dayjs(date).diff(dayjs(date2), unit);
	}
	/**
	 *
	 * @param {date} date
	 * @param {String} format
	 * @returns {String}
	 */
	static format(date, format) {
		return dayjs(date).format(format);
	}
}
