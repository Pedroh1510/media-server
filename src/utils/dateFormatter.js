import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'
dayjs.extend(customParseFormat)

export default class DateFormatter {
  /**
   *
   * @param {Date} date data para ser comparada
   * @param {Date} date2 data para ser comparada
   * @param {('hour'|'minute'|'day')} unit unidade de comparação
   * @returns {number}
   */
  static diff(date, date2, unit = 'h') {
    return dayjs(date).diff(dayjs(date2), unit)
  }

  /**
   *
   * @param {Date} date
   * @param {string} format
   * @returns {string}
   */
  static format(date, format) {
    return dayjs(date).format(format)
  }

  static toDate(date, format) {
    return dayjs(date, format).toDate()
  }
}
