import winston from 'winston'
import LokiTransport from 'winston-loki'

import CONFIG from '../infra/config.js'
const { combine, timestamp, printf, colorize, align, errors } = winston.format

const logger = winston.createLogger({
  format: combine(
    errors({ stack: true }),
    colorize({ all: true }),
    timestamp({
      format: 'DD/MM/YYYY HH:mm:ss.SSS ',
    }),
    align(),
    printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
  ),
  level: 'info',
  transports: [new winston.transports.Console(), new LokiTransport({ host: CONFIG.loki, batching: false })],
  exceptionHandlers: [new winston.transports.Console(), new LokiTransport({ host: CONFIG.loki, batching: false })],
  rejectionHandlers: [new winston.transports.Console(), new LokiTransport({ host: CONFIG.loki, batching: false })],
})

export default logger
