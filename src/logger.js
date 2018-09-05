const winston = require('winston')

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log` 
    // - Write all logs error (and below) to `error.log`.
    //
    new winston.transports.Console(),
    new winston.transports.File({ filename: '/portal/logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: '/portal/logs/info.log', level: 'info'}),
    new winston.transports.File({ filename: '/portal/logs/debug.log', level: 'debug' })
  ]
})

exports.default = logger
