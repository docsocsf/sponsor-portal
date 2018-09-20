const yaml = require('js-yaml')
const fs = require('fs')
const logger = require('./logger.js')
const args = require('args-parser')(process.argv)

var doc

if (!args['dev']) {
  // Get document, or throw exception on error
  try {
    logger.info('Trying to load secrets config...')
    doc = yaml.safeLoad(fs.readFileSync('/portal/secure/config.yml', 'utf8'))
    logger.info('Successfully loaded secrets config!')
  } catch (err) {
    logger.fatal('Failed to load secrets: ' + err)
    throw new Error('Failed to load secrsts file!')
  }

  module.exports.doc = doc

}