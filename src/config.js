const yaml = require('js-yaml')
const fs = require('fs')
const logger = require('./logger.js')

// Get document, or throw exception on error
try {
  logger.info('Trying to load secrets config...')
  var doc = yaml.safeLoad(fs.readFileSync('/portal/secure/config.yml', 'utf8'))
  logger.info('Successfully loaded secrets config!')
} catch (err) {
  logger.fatal('Failed to load secrets: ' + err)
  throw new Error('Failed to load secrsts file!')
}

module.exports.doc = doc
