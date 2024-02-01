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
		const a = dayjs(date);
		const b = dayjs(date2);
		return a.diff(b, unit);
	}
}
