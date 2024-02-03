import winston from"winston";
const { combine, timestamp, printf, colorize, align,json } = winston.format;

const logger = winston.createLogger({
  format: combine(
    colorize({ all: true }),
    timestamp({
      format: 'DD/MM/YYYY HH:mm:ss.SSS ',
    }),
    align(),
    // json()
    printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
  ),
  level:'info',
  transports:[new winston.transports.Console()],
  exceptionHandlers: [
    new winston.transports.Console(),
  ],
  rejectionHandlers: [
    new winston.transports.Console(),
  ],
})

export default logger