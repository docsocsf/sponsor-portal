const fs = require('fs-extra')
const logger = require('./logger.js')

var check = (req, res, callback) => {
  if (req.session.login) {
    if (req.session.type == 'member') {
      callback()
    } else if (req.session.type == 'sponsor') {
      res.redirect('/sponsor')
    }
  } else {
    res.redirect('/')
  }
}

exports.setup = (app, db) => {
  // member PAGE
  app.get('/member', (req, res, next) => {
    check(req, res, next)
  }, (req, res) => {
    db.Sponsor.find((error, sponsors) => {
      ss = []
      sponsors.forEach(sponsor => {
        s = {
          username: sponsor.username,
          info: sponsor.info,
          news: sponsor.news,
          positions: []
        }
        sponsor.positions.forEach(position => {
          var pos = {
            name: position.name,
            description: position.description,
            link: position.link,
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
        err: error
      }
      res.render('member', data)
    })
  })

  // apply
  app.post('/member/apply/:sponsor/:posname', (req, res, next) => {
    check(req, res, next)
  }, (req, res) => {
    // check if valid path
    var sponsorpath = './sponsors/' + req.params.sponsor + '/'
    if (!fs.existsSync(sponsorpath)) {
      logger.warning(req.params.sponsor + ' sponsor path magically deleted SOMETHING HAS GONE TERRIBLY WRONG or user out of sync')
      res.redirect('/member')
    }
    var pospath = sponsorpath + req.params.posname + '/'
    if (!fs.existsSync(pospath)) {
      logger.warning(req.params.posname + ' position, of ' + req.params.sponsor + ' sponsor path magically deleted SOMETHING HAS GONE TERRIBLY WRONG or user out of sync')
      res.redirect('/member')
    }
    var path = pospath + req.session.data.FirstName + ' ' + req.session.data.Surname + ' ' + req.session.data.Login + '/'
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path)
    }

    db.Sponsor.find({ username: req.params.sponsor }, (err, sponsor) => {
      if (err) {
        logger.error('Failed to find sponsor: ' + err)
        return
      }
      data = {
        firstname: req.session.data.FirstName,
        surname: req.session.data.Surname,
        email: req.body.email,
        username: req.session.data.Login,
        documents: []
      }
      for (let i = 0; i < 10; i++) {
        if (req.files['document' + i]) {
          // TODO: Implement check names
          var ext = req.files['document' + i].name.split('.').pop()
          // Save files
          req.files['document' + i].mv(path + req.body['documentname' + i] + '.' + ext, function (err) {
            if (err) {
              logger.error('Failed to save user document: ' + err)
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
          return
        }
        logger.info(req.session.data.Login + ' has successfully applied to ' + req.params.sponsor + "'s " +
          req.params.posname + ' with ' + data.documents.length + ' document(s)')
        res.redirect('/member')
      })
    })
  })

  // unapply
  app.post('/member/unapply/:sponsor/:posname', (req, res, next) => {
    check(req, res, next)
  }, (req, res) => {
    // check if valid path
    var sponsorpath = './sponsors/' + req.params.sponsor + '/'
    if (!fs.existsSync(sponsorpath)) {
      logger.warning(req.params.sponsor + ' sponsor path magically deleted SOMETHING HAS GONE TERRIBLY WRONG or user out of sync')
      res.redirect('/member')
    }
    var pospath = sponsorpath + req.params.posname + '/'
    if (!fs.existsSync(pospath)) {
      logger.warning(req.params.posname + ' position, of ' + req.params.sponsor + ' sponsor path magically deleted SOMETHING HAS GONE TERRIBLY WRONG or user out of sync')
      res.redirect('/member')
    }
    var path = pospath + req.session.data.FirstName + ' ' + req.session.data.Surname + ' ' + req.session.data.Login + '/'
    if (fs.existsSync(path)) {
      fs.removeSync(path)
    }

    db.Sponsor.find({ username: req.params.sponsor }, (err, sponsor) => {
      if (err) {
        logger.error('Failed to find sponsor: ' + err)
        return
      }
      sponsor[0].positions.forEach(position => {
        if (position.name === req.params.posname) {
          position.users = position.users.filter(user => user.username !== req.session.data.Login)
        }
      })
      sponsor[0].save((err, user) => {
        if (err) {
          logger.error('Failed to find sponsor for user removing application: ' + err)
          return
        }
        logger.info(req.session.data.Login + ' has successfully removed his applied to ' + req.params.sponsor + "'s " + req.params.posname)
        res.redirect('/member')
      })
    })
  })
}
