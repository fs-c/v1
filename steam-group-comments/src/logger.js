const logger = require('winston')

logger.setLevels({
  error: 0,
  warn: 1,
  info: 2,
  verbose: 3,
  debug: 4,
  silly: 5
})

logger.addColors({
  error: 'red',
  warn: 'yellow',
  info: 'white',
  verbose: 'gray',
  debug: 'magenta',
  silly: 'grey'
})

logger.remove(logger.transports.Console)
logger.add(logger.transports.Console, { level: 'debug', colorize: true, timestamp: true })

module.exports = logger
