'use strict'
const { createLogger, format, transports, addColors } = require('winston')

const myCustomLevels = {
  levels: {
    error: 0,
    warning: 1,
    info: 2,
    debug: 3
  },
  colors: {
    error: 'red',
    warning: 'yellow',
    info: 'blue',
    debug: 'green'
  }
}

addColors(myCustomLevels.colors)

const logger = createLogger({
  level: 'info',
  levels: myCustomLevels.levels,
  format: format.combine(
    format.colorize(),
    format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
    format.align(),
    format.printf(info => `[${info.timestamp}] ${info.level}: ${info.message}`)
  ),
  transports: [
    //
    // - Write to all logs to their resepctive files
    //
    new transports.Console({ level: 'info' }),
    new transports.File({ filename: '/portal/logs/error.log', level: 'error' }),
    new transports.File({ filename: '/portal/logs/info.log', level: 'info' }),
    new transports.File({ filename: '/portal/logs/debug.log' })
  ],
  exceptionHandlers: [
    new transports.Console(),
    new transports.File({ filename: '/portal/logs/exceptions.log' })
  ]
})

logger.stream = {
  write: function (message, encoding) {
    logger.debug(message)
  }
}

module.exports = logger
