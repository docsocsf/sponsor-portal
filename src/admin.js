const fs = require('fs-extra')
const logger = require('./logger.js')

exports.setup = (app, db) => {
  // PORTAL LOGIN PAGE
  app.get('/admin-login', (req, res) => {
    res.render('admin-login')
  })

  // admin auth
  app.post('/admin-login', (req, res, next) => {
    if (req.session.docsoc) {
      res.redirect('/admin')
    } else {
      next()
    }
  }, (req, res) => {
    var user = req.body.user
    var pass = req.body.pass
    if (user === 'docsoc' && pass === 'docsoc') {
      req.session.docsoc = true
      res.redirect('/admin')
    } else {
      res.redirect('/')
    }
  })

  // PORTAL PAGE
  app.get('/admin', (req, res, next) => {
    if (req.session.docsoc) {
      next()
    } else {
      res.redirect('/admin-login')
    }
  }, (req, res) => {
    db.Sponsor.find((err, s) => {
      res.render('admin', { sponsors: s })
    })
  })

  // Add new sponsor
  app.post('/admin/new-sponsor', (req, res) => {
    // make sponsor
    var sponsor = new db.Sponsor({
      username: req.body.user,
      password: req.body.pass,
      info: {
        name: req.body.name,
        rank: req.body.rank,
        picture: req.body.user + '_logo.png',
        bespoke: (req.body.bespoke === 'true')
      },
      news: [],
      positions: []
    })
    // Make sponsor folder
    var path = './sponsors/' + req.body.user + '/'
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path)
    }
    // save sponsor
    sponsor.save((err, user) => {
      if (err) {

      } else {
        res.redirect('/admin')
      }
    })
  })

  // Edit sponsor
  app.post('/admin/edit-sponsor/:username', (req, res) => {
    db.Sponsor.find({ username: req.params.username }, (err, sponsor) => {
      if (err) return

      sponsor[0].password = req.body['s.password']
      if (req.body['s.info.name']) { sponsor[0].info.name = req.body['s.info.name'] }
      if (req.body['s.info.email']) { sponsor[0].info.email = req.body['s.info.email'] }
      if (req.body['s.info.rank']) { sponsor[0].info.rank = req.body['s.info.rank'] }
      if (req.body['s.info.bespoke']) { sponsor[0].info.bespoke = (req.body['s.info.bespoke'] === 'true') }
      if (req.body['s.info.description']) { sponsor[0].info.description = req.body['s.info.description'] }
      if (req.body['s.info.picture']) { sponsor[0].info.picture = req.body['s.info.picture'] }
      if (req.body['s.info.link']) { sponsor[0].info.link = req.body['s.info.link'] }
      for (let j = 0; j < sponsor[0].positions.length; j++) {
        for (let i = 0; i < sponsor[0].positions.length; i++) {
          if (sponsor[0].positions[j].name === req.body['p.id.' + i]) {
            if (req.body['p.name.' + i]) { sponsor[0].positions[j].name = req.body['p.name.' + i] }
            if (req.body['p.description.' + i]) { sponsor[0].positions[j].description = req.body['p.description.' + i] }
            if (req.body['p.link.' + i]) { sponsor[0].positions[j].link = req.body['p.link.' + i] }
          }
        }
      }

      sponsor[0].save((err, user) => {
        if (err) return
        res.redirect('/admin')
      })
    })
  })

  // Remove Sponsor
  app.post('/admin/remove-sponsor/:user', (req, res) => {
    db.Sponsor.remove({ username: req.params.user }, (err) => {
      if (err) {

      } else {
        if (fs.existsSync('./sponsors/' + req.params.user)) {
          fs.removeSync('./sponsors/' + req.params.user)
        }
        res.redirect('/admin')
      }
    })
  })
}
