'use strict'
// Setup Express App
const setup = require('./src/setup.js')
const fs = require('fs-extra')
const bcrypt = require('bcrypt')
const saltRounds = 10
const args = require('args-parser')(process.argv)

// =======================LOGGER===========================
const logger = require('./src/logger.js')

// =======================EXPRESS SETUP=====================
const app = setup.app
logger.info('[Express Setup] done')

// =======================MongoDB===========================
const db = require('./src/db.js')
logger.info('[Mongodb Setup] done')

// =======================API===========================
const API = require('./src/API.js')
API.setup(app, db)
logger.info('[API Setup] done')

// =========================Login Page=====================
const login = require('./src/login.js')
var auth
if (args['dev']) { // If development version,
  auth = require('./auth/local-auth.js')
} else {
  auth = require('./auth/auth.js')
}
login.setup(app, db, auth)
logger.info('[Login Setup] done')

// ==========================Member=========================
const member = require('./src/member.js')
member.setup(app, db)
logger.info('[member Setup] done')

// ==========================Sponsor========================
const sponsor = require('./src/sponsor.js')
sponsor.setup(app, db)
logger.info('[Sponsor Setup] done')

// ==========================Portal=========================
const admin = require('./src/admin.js')
admin.setup(app, db)
logger.info('[Admin Setup] done')

// ===========================Other=========================

// Logout
app.post('/logout', (req, res) => {
  logger.info(req.session.user + ' has logged out')
  req.session.destroy()
  res.redirect('/')
})

app.get('*', function (req, res) {
  res.redirect('/')
})

app.post('*', function (req, res) {
  res.redirect('/')
})

// DEV
if (args['dev']) {
  // call this function to make sample sponsors for --dev
  var makesamplesponsor = (user, pass, name, rank, bespoke, news, positions) => {
    var mainsponsorpath = './samplesponsors/'
    db.Sponsor.findOne({
      username: user
    }, (err, sponsor) => {
      if (sponsor) {

      } else {
        bcrypt.hash(pass, saltRounds, (err, pw_hash) => {
          var sponsor = new db.Sponsor({
            username: user,
            password_hash: pw_hash,
            info: {
              name: name,
              rank: rank,
              picture: 'sample_logo.png',
              bespoke: bespoke
            },
            news: news,
            positions: positions
          })
          // Make sponsor folder
          var path = mainsponsorpath + sponsor.username + '/'
          if (!fs.existsSync(path)) {
            fs.mkdirSync(path)
          }
          // save sponsor
          sponsor.save((err, user) => {
            if (err) {
              logger.error('Failed to make sample sponsor: ' + err)
            } else {

            }
          })
        })
      }
    })
  }

  // Make sample sponsors
  makesamplesponsor('gold', 'gold', 'Gold Sponsor', 'Gold', true, [], [])
  makesamplesponsor('silver', 'silver', 'Silver Sponsor', 'Silver', true, [], [])
  makesamplesponsor('bronze', 'bronze', 'Bronze Sponsor', 'Bronze', false, [], [])
}

// App listen
if (args['no-https']) { // If no https then just use app.listen
  logger.info('no-https option selected, running on just http')
  app.listen(app.get('port'), function () {
    logger.info('Server listening on port ' + app.get('port'))
  })
} else { // Use greenlock to force https
  logger.info('HTTPS enforced')
  require('greenlock-express').create({

    // Let's Encrypt v2 is ACME draft 11
    version: 'draft-11',

    // Note: If at first you don't succeed, switch to staging to debug
    // https://acme-staging-v02.api.letsencrypt.org/directory
    server: 'https://acme-v02.api.letsencrypt.org/directory',

    // Where the certs will be saved, MUST have write access
    configDir: './secure/',

    // You MUST change this to a valid email address
    email: 'docsoc@imperial.ac.uk',

    // You MUST change these to valid domains
    // NOTE: all domains will validated and listed on the certificate
    approveDomains: ['portal.docsoc.co.uk'],

    // You MUST NOT build clients that accept the ToS without asking the user
    agreeTos: true,

    app: app,

    // Join the community to get notified of important updates
    communityMember: false,

    // Contribute telemetry data to the project
    telemetry: false

    //, debug: true

  }).listen(80, 443)
}
