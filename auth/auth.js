'use strict'
const krb5 = require('node-krb5')
const rp = require('request-promise')
const fs = require('fs')
const yaml = require('js-yaml')
const logger = require('../src/logger.js')
const args = require('args-parser')(process.argv)
const bcrypt = require('bcrypt');
const saltRounds = 10;

const authpath = './auth/auth.json'


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
  if (args['dev']) {
    samplelogin(session, callback)
  } else {
    // EACTIVITIES PORTAL
    const options = require('../src/config.js').doc.eactivities
    logger.info('Member ' + user + ' trying to login...')
    // KERBEROS AUTHENTICATION
    logger.info('Starting Kerberos Authentication...')
    krb5.authenticate(user + '@IC.AC.UK', pass, (err) => {
      if (err) {
        // WRONG PASSWORD/INVALID USER
        logger.info('Kerberos ' + err)
        // res.send('wrong username or password')
        callback({
          member: true,
          err: 'Wrong username or password'
        })
      } else {
        logger.info('Kerberos Authentication success.')
        logger.info('Starting DoCSoc Member Check...')
        // REQUEST EACTIVITIES if auth file older than 24 hours
        if (fs.existsSync(authpath)) {
          var stat = fs.statSync(authpath)
          if (err) {
            return console.error(err)
          }
          var now = new Date().getTime()
          // 86400000 ms is 24 hours
          var endTime = new Date(stat.ctime).getTime() + 86400000
          if (now > endTime) {
            // download new file
            logger.info('Outdated auth file, Updating...')
            rp(options).then((body) => {
              fs.writeFileSync(authpath, body)
              return checkMember(session, user, callback)
            })
          } else {
            return checkMember(session, user, callback)
          }
        } else {
          // download new file
          rp(options).then((body) => {
            logger.info('Downloading auth file')
            fs.writeFileSync(authpath, body)
            return checkMember(session, user, callback)
          })
        }
      }
    })
  }
}

// check member is in DoCSoc
const checkMember = (session, user, callback) => {
  var auth = fs.readFileSync(authpath)
  var data = JSON.parse(auth).find(el => el.Login === user)
  if (data) {
    // VALID USER
    logger.info('User ' + user + ' successfully logged in')
    // setup session
    session.docsoc = false
    session.login = true
    session.type = 'member'
    session.data = data
    session.user = user
    // make folder
    callback(true)
  } else {
    // NON DOCSOC USER
    logger.info('Not a member of DoCSoc')
    callback({
      member: true,
      err: 'Not a DoCSoc Member!'
    })
  }
}

const authsamplepath = './auth/authsample.json'

const samplelogin = (session, callback) => {
  var auth = fs.readFileSync(authsamplepath)
  var data = JSON.parse(auth).find(el => el.Login === 'samp01')
  if (data) {
    // VALID USER
    logger.info('User samp01 successfully logged in')
    // setup session
    session.docsoc = false
    session.login = true
    session.type = 'member'
    session.data = data
    session.user = 'samp01'
    // make folder
    callback(true)
  } else {
    // NON DOCSOC USER
    logger.info('Not a member of DoCSoc')
    callback({
      member: true,
      err: 'Not a DoCSoc Member!'
    })
  }
}