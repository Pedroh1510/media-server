import QueueService from './job.js'
import logger from './utils/logger.js'

const queue = new QueueService()

queue.execute()
async function gracefull() {
  logger.info('gracefull')
  const promises = []
  for (const key in queue.workers) {
    promises.push(queue.workers[key].close())
  }
  logger.close()
  await Promise.all(promises)
  process.exit(1)
}
process.on('SIGINT', () => {
  gracefull()
})
process.on('SIGTERM', () => {
  // biome-ignore lint/suspicious/noConsole: <explanation>
  console.log('SIGTERM signal received.')
  process.exit(1)
})
process.on('exit', () => {
  // biome-ignore lint/suspicious/noConsole: <explanation>
  console.log('exit.')
})

process.on('uncaughtException', () => {
  // biome-ignore lint/suspicious/noConsole: <explanation>
  console.log('SIGTERM signal received.')
})
