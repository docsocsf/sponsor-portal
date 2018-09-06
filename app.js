// setup express app
const setup = require('./src/setup.js')
const args = require('args-parser')(process.argv)

//========================LOGGER===========================
const logger = require('./src/logger.js')

//========================EXPRESS SETUP=====================
const app = setup.app
logger.info('(express setup) done')

//========================mongoDB===========================
const db = require('./src/db.js')
logger.info('(mongodb setup) done')

//= =========================LOGIN PAGE=====================
const login = require('./src/login.js')
login.setup(app, db, logger)
logger.info('(login setup) done')

//= ==========================MEMBER=========================
const member = require('./src/member.js')
member.setup(app, db, logger)
logger.info('(member setup) done')

//= ==========================SPONSOR========================
const sponsor = require('./src/sponsor.js')
sponsor.setup(app, db, logger)
logger.info('(sponsor setup) done')

//= ==========================PORTAL=========================
const admin = require('./src/admin.js')
admin.setup(app, db, logger)
logger.info('(admin setup) done')

//= ===========================OTHER=========================

// LOGOUT
app.post('/logout', (req, res) => {
  logger.info(req.session.user + ' has logged out')
  req.session.destroy()
  res.redirect('/')
})

app.get('*', function (req, res) {
  res.redirect('/')
})

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
