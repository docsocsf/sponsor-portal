'use strict'
const rp = require('request-promise')
const logger = require('../src/logger.js')
const bcrypt = require('bcrypt');

exports.authSponsor = (user, pass, db, session, callback) => {
  db.Sponsor.find({
    username: user
  }, (err, result) => {
    if (err || !result[0]) {
      logger.error('Unable to find sponsor: ' + user)
      callback({
        member: false,
        err: 'Wrong username or password'
      })
    } else {
      bcrypt.compare(pass, result[0].password_hash, (err, checkpass) => {
        if (checkpass) {
          // VALID USER
          logger.info('sponsor ' + user + ' has successfully logged in')
          session.docsoc = false
          session.login = true
          session.type = 'sponsor'
          session.user = user
          callback(true)
        } else {
          logger.info('sponsor ' + user + ' has failed logging in')
          callback({
            member: false,
            err: 'Wrong username or password'
          })
        }
      })
    }
  })
}

exports.authUser = (user, pass, session, callback) => {
  var options = {
    method: 'POST',
    uri: 'https://auth.docsoc.co.uk/authorize',
    body: {
      "user": user,
      "pass": pass
    },
    json: true
  }

  rp(options).then(function (parsedBody) {
    if (parsedBody.auth) {
      if (parsedBody.membership) {
        logger.info('User ' + user + ' successfully logged in')
        // setup session
        session.docsoc = false
        session.login = true
        session.type = 'member'
        session.data = parsedBody.data
        session.user = user
        callback(true)
      } else {
        logger.info('User ' + user + ' not DoCSoc member')
        callback({
          member: true,
          err: 'Not a DoCSoc Member'
        })
      }
    } else {
      logger.info('User ' + user + ' failed logged in')
      callback({
        member: true,
        err: 'Wrong Username or Password'
      })
    }
  }).catch(function (err) {
    callback({
      member: true,
      err: 'Authentication server down. Try again later'
    })
  })
}