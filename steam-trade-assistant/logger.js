const logger = require('winston')

logger.remove(logger.transports.Console)
logger.add(logger.transports.Console, {
  level: process.env.NODE_ENV === 'dev' ? 'silly' : 'info',
  colorize: true,
  timestamp: true
})

module.exports = logger
