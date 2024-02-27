import winston from 'winston'
import LokiTransport from 'winston-loki'

import CONFIG from '../infra/config.js'
const { combine, timestamp, printf, colorize, align, errors } = winston.format

const formatLog = () =>
  combine(
    errors({ stack: true }),
    colorize({ all: true }),
    timestamp({
      format: 'DD/MM/YYYY HH:mm:ss.SSS ',
    }),
    align(),
    printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
  )
const makeTransportLoki = () =>
  new LokiTransport({
    host: CONFIG.loki,
    batching: false,
    gracefulShutdown: true,
    format: formatLog(),
    replaceTimestamp: true,
    labels: {
      job: 'rss',
    },
  })

const logger = winston.createLogger({
  format: formatLog(),
  level: 'info',
  transports: [new winston.transports.Console(), makeTransportLoki()],
  exceptionHandlers: [new winston.transports.Console(), makeTransportLoki()],
  rejectionHandlers: [new winston.transports.Console(), makeTransportLoki()],
})

export default logger
