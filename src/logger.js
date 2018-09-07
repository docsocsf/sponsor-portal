const { createLogger, format, transports, addColors } = require('winston');

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
    debug: 'green',
  }
};

addColors(myCustomLevels.colors);

module.exports = createLogger({
  level: 'info',
  levels: myCustomLevels.levels,
  format: format.combine(
    format.colorize(),
    format.timestamp({format: 'DD-MM-YYYY HH:MM:SS'}),
    format.align(),
    format.printf(info => `[${info.timestamp}] ${info.level}: ${info.message}`)
  ),
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log` 
    // - Write all logs error (and below) to `error.log`.
    //
    new transports.Console({level: 'debug'}),
    new transports.File({filename: '/portal/logs/error.log', level: 'error'}),
    new transports.File({filename: '/portal/logs/info.log', level: 'info'}),
    new transports.File({filename: '/portal/logs/debug.log', level: 'debug' })
  ]
})