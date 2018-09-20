'use strict'
const fs = require('fs-extra')
const zipFolder = require('zip-folder')
const logger = require('./logger.js')
const args = require('args-parser')(process.argv)

var check = (req, res, callback) => {
  if (req.session.login) {
    if (req.session.type === 'sponsor') {
      callback()
    } else if (req.session.type === 'member') {
      res.redirect('/member')
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
  // Sponsor Page
  app.get('/sponsor', (req, res, next) => {
    check(req, res, next)
  }, (req, res) => {
    db.Sponsor.find({ username: req.session.user }, (err, sponsor) => {
      if (err) {
        logger.error('Unable to find sponsor: ' + err)
      } else {
        res.render('sponsor', { sponsor: sponsor[0] })
      }
    })
  })

  app.get('/sponsor/error/:error', (req, res, next) => {
    check(req, res, next)
  }, (req, res) => {
    db.Sponsor.find({ username: req.session.user }, (err, sponsor) => {
      if (err) {
        logger.error('Unable to find sponsor: ' + err)
      } else {
        res.render('sponsor', { sponsor: sponsor[0], err: req.params.error })
      }
    })
  })

  //= ====================POSITIONS========================

  // Show document
  app.post('/sponsor/show/:pos/:filename/:document', (req, res, next) => {
    check(req, res, next)
  }, (req, res) => {
    var sponsorpath = mainsponsorpath + req.session.user + '/'
    if (!fs.existsSync(sponsorpath)) {
      logger.warning(req.session.user + ' sponsor path magically deleted SOMETHING HAS GONE TERRIBLY WRONG')
      fs.mkdirSync(sponsorpath)
      logger.warning('made a temp fix')
    }
    var pospath = sponsorpath + req.params.pos + '/'
    if (!fs.existsSync(pospath)) {
      logger.warning(req.params.pos + ' position, of ' + req.session.user + ' sponsor path magically deleted SOMETHING HAS GONE TERRIBLY WRONG')
      fs.mkdirSync(pospath)
      logger.warning('made a temp fix')
    }
    var userpath = pospath + req.params.filename + '/'
    if (!fs.existsSync(pospath)) {
      logger.warning('user ' + req.params.filename + ' of ' + req.params.pos + ' position, of ' + req.session.user + ' sponsor path magically deleted SOMETHING HAS GONE TERRIBLY WRONG')
      fs.mkdirSync(userpath)
      logger.warning('made a temp fix')
      res.redirect('/sponsor/#positions-tab-nav')
    } else {
      var path = userpath + req.params.document
      logger.info(req.session.user + ' downloading ' + path)
      res.download(path)
    }
  })

  // Download member
  app.post('/sponsor/download/user/:pos/:filename/', (req, res, next) => {
    check(req, res, next)
  }, (req, res) => {
    var sponsorpath = mainsponsorpath + req.session.user + '/'
    if (!fs.existsSync(sponsorpath)) {
      logger.warning(req.session.user + ' sponsor path magically deleted SOMETHING HAS GONE TERRIBLY WRONG')
      fs.mkdirSync(sponsorpath)
      logger.warning('made a temp fix')
    }
    var pospath = sponsorpath + req.params.pos + '/'
    if (!fs.existsSync(pospath)) {
      logger.warning(req.params.pos + ' position, of ' + req.session.user + ' sponsor path magically deleted SOMETHING HAS GONE TERRIBLY WRONG')
      fs.mkdirSync(pospath)
      logger.warning('made a temp fix')
    }
    var path = pospath + req.params.filename
    var zippath = './temp/' + req.params.filename + '.zip'
    zipFolder(path, zippath, function (err) {
      if (err) {
        logger.error('zipFolder: ' + err)
      } else {
        res.download(zippath, () => {
          if (fs.existsSync(zippath)) {
            fs.removeSync(zippath)
          }
        })
        logger.info(req.session.user + ' downloading ' + path)
      }
    })
  })

  // Download Position
  app.post('/sponsor/download/pos/:pos/', (req, res, next) => {
    check(req, res, next)
  }, (req, res) => {
    var sponsorpath = mainsponsorpath + req.session.user + '/'
    if (!fs.existsSync(sponsorpath)) {
      logger.warning(req.session.user + ' sponsor path magically deleted SOMETHING HAS GONE TERRIBLY WRONG')
      fs.mkdirSync(sponsorpath)
      logger.warning('made a temp fix')
    }
    var path = sponsorpath + req.params.pos
    var zippath = './temp/' + req.params.pos + '.zip'
    zipFolder(path, zippath, function (err) {
      if (err) {
        logger.error('zipFolder: ' + err)
      } else {
        res.download(zippath, () => {
          if (fs.existsSync(zippath)) {
            fs.removeSync(zippath)
          }
        })
        logger.info(req.session.user + ' downloading ' + path)
      }
    })
  })

  // Add new Position
  app.post('/sponsor/add-position', (req, res, next) => {
    check(req, res, next)
  }, (req, res) => {
    db.Sponsor.find({ username: req.session.user }, (err, sponsor) => {
      if (err) {
        logger.error('Failed to find sponsor: ' + err)
        return
      }
      if (req.body.name.trim() && !sponsor[0].positions.some(position => position.name === req.body.name.trim())) {
        var data = {
          name: req.body.name.trim(),
          description: req.body.description,
          link: req.body.link,
          users: []
        }
        var sponsorpath = mainsponsorpath + req.session.user + '/'
        if (!fs.existsSync(sponsorpath)) {
          logger.warning(req.session.user + ' sponsor path magically deleted SOMETHING HAS GONE TERRIBLY WRONG')
          fs.mkdirSync(sponsorpath)
          logger.warning('made a temp fix')
        }
        var path = sponsorpath + req.body.name.trim() + '/'
        if (!fs.existsSync(path)) {
          fs.mkdirSync(path)
        }
        sponsor[0].positions.push(data)
        sponsor[0].save((err, user) => {
          if (err) {
            logger.error('Failed to update sponsor on adding new position: ' + err)
            return
          }
          logger.info(req.session.user + ' succesfully added new position ' + req.body.name)
          res.redirect('/sponsor/#positions-tab-nav')
        })
      } else {
        logger.info(req.session.user + ' succesfully failed to add new position because name already exists' + req.body.name)
        res.redirect('/sponsor/error/Position name is blank or already exists/#positions-tab-nav')
      }
    })
  })

  // Remove Position
  app.post('/sponsor/remove-position/:name', (req, res, next) => {
    check(req, res, next)
  }, (req, res) => {
    db.Sponsor.find({ username: req.session.user }, (err, sponsor) => {
      if (err) {
        logger.error('Failed to find sponsor: ' + err)
        return
      }
      var path = mainsponsorpath + req.session.user + '/' + req.params.name + '/'
      if (fs.existsSync(path)) {
        fs.removeSync(path)
      }
      sponsor[0].positions = sponsor[0].positions.filter(position => position.name !== req.params.name)
      sponsor[0].save((err, user) => {
        if (err) {
          logger.error('Failed to update sponsor on removing position: ' + err)
          return
        }
        logger.info(req.session.user + ' succesfully removed position ' + req.params.name)
        res.redirect('/sponsor/#positions-tab-nav')
      })
    })
  })
  app.post('/sponsor/remove-position/', (req, res, next) => {
    check(req, res, next)
  }, (req, res) => {
    res.redirect('/sponsor/#positions-tab-nav')
  })

  //= ======================================NEWS=================================

  // Add news
  app.post('/sponsor/add-news', (req, res, next) => {
    check(req, res, next)
  }, (req, res) => {
    db.Sponsor.find({ username: req.session.user }, (err, sponsor) => {
      if (err) {
        logger.error('Failed to find sponsor: ' + err)
        return
      }
      var news = {
        date: (new Date()).toString(),
        title: req.body.title,
        text: req.body.text,
        link: req.body.link
      }
      sponsor[0].news.push(news)
      sponsor[0].save((err, user) => {
        if (err) {
          logger.error('Failed to update sponsor on adding news: ' + err)
          return
        }
        logger.info(req.session.user + ' succesfully added news ' + req.body.title)
        res.redirect('/sponsor/#news-tab-nav')
      })
    })
  })

  // Remove News
  app.post('/sponsor/remove-news/:date', (req, res, next) => {
    check(req, res, next)
  }, (req, res) => {
    db.Sponsor.find({ username: req.session.user }, (err, sponsor) => {
      if (err) {
        logger.error('Failed to find sponsor: ' + err)
        return
      }
      sponsor[0].news = sponsor[0].news.filter(n => n.date !== req.params.date)
      sponsor[0].save((err, user) => {
        if (err) {
          logger.error('Failed to update sponsor on removing news: ' + err)
          return
        }
        logger.info(req.session.user + ' succesfully removed news created on ' + req.params.date)
        res.redirect('/sponsor/#news-tab-nav')
      })
    })
  })

  app.post('/sponsor/remove-news/', (req, res, next) => {
    check(req, res, next)
  }, (req, res) => {
    res.redirect('/sponsor/#news-tab-nav')
  })

  //= ====================================ACCOUNT=================================

  // Update info
  app.post('/sponsor/update-info', (req, res, next) => {
    check(req, res, next)
  }, (req, res) => {
    db.Sponsor.find({ username: req.session.user }, (err, sponsor) => {
      if (err) {
        logger.error('Failed to find sponsor: ' + err)
        return
      }
      sponsor[0].info.email = req.body.email
      sponsor[0].info.description = req.body.description
      sponsor[0].info.link = req.body.link
      sponsor[0].save((err, user) => {
        if (err) {
          logger.error('Failed to update sponsor on edit info: ' + err)
          return
        }
        logger.info(req.session.user + ' succesfully updated info')
        res.redirect('/sponsor/#info-tab-nav')
      })
    })
  })

  // change Password
  app.post('/sponsor/change-password', (req, res, next) => {
    check(req, res, next)
  }, (req, res) => {
    db.Sponsor.find({ username: req.session.user }, (err, sponsor) => {
      if (err) {
        logger.error('Failed to find sponsor: ' + err)
        return
      }
      if (req.body.new && sponsor[0].password === req.body.old && req.body.new === req.body.new2) {
        sponsor[0].password = req.body.new
        sponsor[0].save((err, user) => {
          if (err) {
            logger.error('Failed to update sponsor on change password: ' + err)
            return
          }
          logger.info(req.session.user + ' succesfully changed password')
          res.redirect('/sponsor/#info-tab-nav')
        })
      } else {
        logger.info(req.session.user + ' failed to changed password')
        res.redirect('/sponsor/error/Error while trying to change password. Please try again./#info-tab-nav')
      }
    })
  })
}
