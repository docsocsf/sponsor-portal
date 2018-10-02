'use strict'
const fs = require('fs-extra')
const logger = require('./logger.js')
const markdown = require('markdown').markdown
const args = require('args-parser')(process.argv)

var check = (req, res, callback) => {
  if (req.session.login) {
    if (req.session.type === 'member') {
      callback()
    } else if (req.session.type === 'sponsor') {
      res.redirect('/sponsor')
    }
  } else {
    res.redirect('/')
  }
}

var mainsponsorpath
if (args['dev']) {
  mainsponsorpath = './samplesponsors/'
} else {
  mainsponsorpath = './sponsors/'
}

exports.setup = (app, db) => {
  // member PAGE
  app.get('/member', (req, res, next) => {
    check(req, res, next)
  }, (req, res) => {
    db.Sponsor.find((err, sponsors) => {
      if (err) {
        logger.error('Failed to get sponsors for user ' + req.session.data.Login + ': ' + err)
        res.end();
        return
      }
      var ss = []
      sponsors.forEach(sponsor => {
        if (sponsor.info.description)
          sponsor.info.description = markdown.toHTML(sponsor.info.description)
        sponsor.news.forEach(n => {
          if (n.text)
            n.text = markdown.toHTML(n.text)
        })
        var s = {
          username: sponsor.username,
          info: sponsor.info,
          news: sponsor.news,
          positions: []
        }
        sponsor.positions.forEach(position => {
          if (position.description)
            position.description = markdown.toHTML(position.description)
          var pos = {
            name: position.name,
            description: position.description,
            link: position.link,
            apply_local: position.apply_local,
            apply_link: position.apply_link,
            applied: false
          }
          var maybeuser = position.users.filter(user => user.username === req.session.data.Login)
          if (maybeuser.length > 0) {
            var user = maybeuser[0]
            pos.applied = true
            pos.email = user.email
            pos.documents = user.documents
          }
          s.positions.push(pos)
        })
        ss.push(s)
      })
      var data = {
        name: req.session.data.FirstName,
        email: req.session.data.Email,
        sponsors: ss,
        error: req.session.error,
        success: req.session.success
      }
      res.render('member', data, (err, html) => {
        req.session.error = ''
        req.session.success = ''
        res.send(html)
        res.end()
      })
    })
  })

  // apply
  app.post('/member/apply/:sponsor/:posname', (req, res, next) => {
    check(req, res, next)
  }, (req, res) => {
    // check if valid path
    var sponsorpath = mainsponsorpath + req.params.sponsor + '/'
    var pospath = sponsorpath + req.params.posname + '/'
    var path = pospath + req.session.data.FirstName + ' ' + req.session.data.Surname + ' ' + req.session.data.Login + '/'
    if (!fs.existsSync(sponsorpath)) {
      logger.warning(req.params.sponsor + ' sponsor path magically deleted SOMETHING HAS GONE TERRIBLY WRONG or user out of sync')
      req.session.error = 'Something went wrong'
      res.redirect('/member')
    }
    if (!fs.existsSync(pospath)) {
      logger.warning(req.params.posname + ' position, of ' + req.params.sponsor + ' sponsor path magically deleted SOMETHING HAS GONE TERRIBLY WRONG or user out of sync')
      req.session.error = 'Something went wrong'
      res.redirect('/member')
    }
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path)
    }

    db.Sponsor.find({
      username: req.params.sponsor
    }, (err, sponsor) => {
      if (err || !sponsor[0]) {
        logger.error('Failed to find sponsor: ' + err)
        req.session.error = 'Something went wrong'
        res.redirect('/member')
      }
      var data = {
        firstname: req.session.data.FirstName,
        surname: req.session.data.Surname,
        email: req.body.email,
        username: req.session.data.Login,
        documents: []
      }
      for (let i = 0; i < 10; i++) {
        if (req.files['document' + i]) {
          // split file extension
          var ext = req.files['document' + i].name.split('.').pop()
          // Save files
          req.files['document' + i].mv(path + req.body['documentname' + i] + '.' + ext, function (err) {
            if (err) {
              logger.error('Failed to save user document: ' + err)
              req.session.error = 'Something went wrong'
              res.redirect('/member')
            }
          })
          data.documents.push({
            name: req.body['documentname' + i] + '.' + ext
          })
        }
      }
      sponsor[0].positions.forEach(position => {
        if (position.name === req.params.posname) {
          position.users.push(data)
        }
      })

      sponsor[0].save((err, user) => {
        if (err) {
          logger.error('Failed to update sponsor for user application: ' + err)
          req.session.error = 'Something went wrong'
          res.redirect('/member')
        }
        logger.info(req.session.data.Login + ' has successfully applied to ' + req.params.sponsor + "'s " +
          req.params.posname + ' with ' + data.documents.length + ' document(s)')
        req.session.success = 'Successfully applied to ' + req.params.sponsor + "'s " + req.params.posname + ' with ' + data.documents.length + ' document(s)'
        res.redirect('/member')
      })
    })
  })

  // unapply
  app.post('/member/unapply/:sponsor/:posname', (req, res, next) => {
    check(req, res, next)
  }, (req, res) => {
    // check if valid path
    var sponsorpath = mainsponsorpath + req.params.sponsor + '/'
    var pospath = sponsorpath + req.params.posname + '/'
    var path = pospath + req.session.data.FirstName + ' ' + req.session.data.Surname + ' ' + req.session.data.Login + '/'
    if (!fs.existsSync(sponsorpath)) {
      logger.warning(req.params.sponsor + ' sponsor path magically deleted SOMETHING HAS GONE TERRIBLY WRONG or user out of sync')
      req.session.error = 'Something went wrong'
      res.redirect('/member')
    } else if (!fs.existsSync(pospath)) {
      logger.warning(req.params.posname + ' position, of ' + req.params.sponsor + ' sponsor path magically deleted SOMETHING HAS GONE TERRIBLY WRONG or user out of sync')
      req.session.error = 'Something went wrong'
      res.redirect('/member')
    } else {
      if (fs.existsSync(path)) {
        fs.removeSync(path)
      }
    }
    db.Sponsor.find({
      username: req.params.sponsor
    }, (err, sponsor) => {
      if (err || !sponsor[0]) {
        logger.error('Failed to find sponsor: ' + err)
        req.session.error = 'Something went wrong'
        res.redirect('/member')
      }
      sponsor[0].positions.forEach(position => {
        if (position.name === req.params.posname) {
          position.users = position.users.filter(user => user.username !== req.session.data.Login)
        }
      })
      sponsor[0].save((err, user) => {
        if (err) {
          logger.error('Failed to find sponsor for user removing application: ' + err)
          req.session.error = 'Something went wrong'
          res.redirect('/member')
        }
        logger.info(req.session.data.Login + ' has successfully removed his applied to ' + req.params.sponsor + "'s " + req.params.posname)
        req.session.success = 'Successfully removed application for ' + req.params.sponsor + "'s " + req.params.posname
        res.redirect('/member')
      })
    })
  })
}