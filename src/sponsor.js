'use strict'
const fs = require('fs-extra')
const zipFolder = require('zip-folder')
const logger = require('./logger.js')
const bcrypt = require('bcrypt');
const saltRounds = 10;

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

var addhttp = (url) => {
  if (url && !/^(f|ht)tps?:\/\//i.test(url)) {
    url = "http://" + url;
  }
  return url;
}

exports.setup = (app, db) => {
  // Sponsor Page
  app.get('/sponsor', (req, res, next) => {
    check(req, res, next)
  }, (req, res) => {
    db.Sponsor.find({
      username: req.session.user
    }, (err, sponsor) => {
      if (err) {
        logger.error('Unable to find sponsor: ' + err)
        return
      } else {
        var data = {
          sponsor: sponsor[0],
          error: req.session.error,
          success: req.session.success
        }
        res.render('sponsor', data, (err, html) => {
          req.session.error = ''
          req.session.success = ''
          res.send(html)
        })
      }
    })
  })

  //= ====================POSITIONS========================

  // Show document
  app.post('/sponsor/show/:pos/:filename/:document', (req, res, next) => {
    check(req, res, next)
  }, (req, res) => {
    var sponsorpath = './sponsors/' + req.session.user + '/'
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
      req.session.error = 'Something went wrong'
      res.redirect('/sponsor#positions-tab-nav')
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
    var sponsorpath = './sponsors/' + req.session.user + '/'
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
        req.session.error = 'Something went wrong'
        res.redirect('/sponsor#positions-tab-nav')
      } else {
        res.download(zippath, () => {
          if (fs.existsSync(zippath)) {
            fs.removeSync(zippath)
          }
          logger.info(req.session.user + ' downloading ' + path)
        })
      }
    })
  })

  // Download Position
  app.post('/sponsor/download/pos/:pos/', (req, res, next) => {
    check(req, res, next)
  }, (req, res) => {
    var sponsorpath = './sponsors/' + req.session.user + '/'
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
        req.session.error = 'Something went wrong'
        res.redirect('/sponsor#positions-tab-nav')
      } else {
        res.download(zippath, () => {
          if (fs.existsSync(zippath)) {
            fs.removeSync(zippath)
          }
          logger.info(req.session.user + ' downloading ' + path)
        })
      }
    })
  })

  // Add new Position
  app.post('/sponsor/add-position', (req, res, next) => {
    check(req, res, next)
  }, (req, res) => {
    db.Sponsor.find({
      username: req.session.user
    }, (err, sponsor) => {
      if (err) {
        logger.error('Failed to find sponsor: ' + err)
        req.session.error = 'Something went wrong'
        res.redirect('/sponsor#positions-tab-nav')
      }
      if (req.body.name.trim() && !sponsor[0].positions.some(position => position.name === req.body.name.trim())) {
        var data = {
          name: req.body.name.trim(),
          description: req.body.description,
          link: addhttp(req.body.link),
          apply_local: (req.body.apply_local === 'on'),
          apply_link: addhttp(req.body.apply_link),
          users: []
        }
        if (data.apply_local) {
          var sponsorpath = './sponsors/' + req.session.user + '/'
          if (!fs.existsSync(sponsorpath)) {
            logger.warning(req.session.user + ' sponsor path magically deleted SOMETHING HAS GONE TERRIBLY WRONG')
            fs.mkdirSync(sponsorpath)
            logger.warning('made a temp fix')
          }
          var path = sponsorpath + req.body.name.trim() + '/'
          if (!fs.existsSync(path)) {
            fs.mkdirSync(path)
          }
        }
        sponsor[0].positions.push(data)
        sponsor[0].save((err, user) => {
          if (err) {
            logger.error('Failed to update sponsor on adding new position: ' + err)
            req.session.error = 'Something went wrong'
            res.redirect('/sponsor#positions-tab-nav')
          }
          logger.info(req.session.user + ' successfully added new position ' + req.body.name)
          req.session.success = 'Successfully added new opportunity'
          res.redirect('/sponsor#positions-tab-nav')
        })
      } else {
        logger.info(req.session.user + ' succesfully failed to add new position because name already exists' + req.body.name)
        req.session.error = 'Position name is blank or already exists'
        res.redirect('/sponsor#positions-tab-nav')
      }
    })
  })

  // Remove Position
  app.post('/sponsor/remove-position/:name', (req, res, next) => {
    check(req, res, next)
  }, (req, res) => {
    db.Sponsor.find({
      username: req.session.user
    }, (err, sponsor) => {
      if (err) {
        logger.error('Failed to find sponsor: ' + err)
        req.session.error = 'Something went wrong'
        res.redirect('/sponsor#positions-tab-nav')
      }
      var path = './sponsors/' + req.session.user + '/' + req.params.name + '/'
      if (fs.existsSync(path)) {
        fs.removeSync(path)
      }
      sponsor[0].positions = sponsor[0].positions.filter(position => position.name !== req.params.name)
      sponsor[0].save((err, user) => {
        if (err) {
          logger.error('Failed to update sponsor on removing position: ' + err)
          req.session.error = 'Something went wrong'
          res.redirect('/sponsor#positions-tab-nav')
        }
        logger.info(req.session.user + ' successfully removed position ' + req.params.name)
        req.session.success = 'Successfully removed opporunity'
        res.redirect('/sponsor#positions-tab-nav')
      })
    })
  })
  app.post('/sponsor/remove-position/', (req, res, next) => {
    check(req, res, next)
  }, (req, res) => {
    res.redirect('/sponsor#positions-tab-nav')
  })

  //= ======================================NEWS=================================

  // Add news
  app.post('/sponsor/add-news', (req, res, next) => {
    check(req, res, next)
  }, (req, res) => {
    db.Sponsor.find({
      username: req.session.user
    }, (err, sponsor) => {
      if (err) {
        logger.error('Failed to find sponsor: ' + err)
        req.session.error = 'Something went wrong'
        res.redirect('/sponsor#news-tab-nav')
      }
      var news = {
        date: (new Date()).toString(),
        title: req.body.title,
        text: req.body.text,
        link: addhttp(req.body.link),
        love: 0
      }
      sponsor[0].news.push(news)
      sponsor[0].save((err, user) => {
        if (err) {
          logger.error('Failed to update sponsor on adding news: ' + err)
          req.session.error = 'Something went wrong'
          res.redirect('/sponsor#news-tab-nav')
        }
        logger.info(req.session.user + ' successfully added news ' + req.body.title)
        req.session.success = 'Successfully added new post'
        res.redirect('/sponsor#news-tab-nav')
      })
    })
  })

  // Remove News
  app.post('/sponsor/remove-news/:date', (req, res, next) => {
    check(req, res, next)
  }, (req, res) => {
    db.Sponsor.find({
      username: req.session.user
    }, (err, sponsor) => {
      if (err) {
        logger.error('Failed to find sponsor: ' + err)
        req.session.error = 'Something went wrong'
        res.redirect('/sponsor#news-tab-nav')
      }
      sponsor[0].news = sponsor[0].news.filter(n => n.date !== req.params.date)
      sponsor[0].save((err, user) => {
        if (err) {
          logger.error('Failed to update sponsor on removing news: ' + err)
          req.session.error = 'Something went wrong'
          res.redirect('/sponsor#news-tab-nav')
        }
        logger.info(req.session.user + ' successfully removed news created on ' + req.params.date)
        req.session.success = 'Successfully removed post'
        res.redirect('/sponsor#news-tab-nav')
      })
    })
  })

  app.post('/sponsor/remove-news/', (req, res, next) => {
    check(req, res, next)
  }, (req, res) => {
    res.redirect('/sponsor#news-tab-nav')
  })

  //= ====================================ACCOUNT=================================

  // Update info
  app.post('/sponsor/update-info', (req, res, next) => {
    check(req, res, next)
  }, (req, res) => {
    db.Sponsor.find({
      username: req.session.user
    }, (err, sponsor) => {
      if (err) {
        logger.error('Failed to find sponsor: ' + err)
        req.session.error = 'Something went wrong'
        res.redirect('/sponsor#news-tab-nav')
      }
      sponsor[0].info.email = req.body.email
      sponsor[0].info.description = req.body.description
      sponsor[0].info.link = addhttp(req.body.link)
      sponsor[0].save((err, user) => {
        if (err) {
          logger.error('Failed to update sponsor on edit info: ' + err)
          req.session.error = 'Something went wrong'
          res.redirect('/sponsor#news-tab-nav')
        }
        logger.info(req.session.user + ' successfully updated info')
        req.session.success = 'Saved'
        res.redirect('/sponsor#info-tab-nav')
      })
    })
  })

  // change Password
  app.post('/sponsor/change-password', (req, res, next) => {
    check(req, res, next)
  }, (req, res) => {
    db.Sponsor.find({
      username: req.session.user
    }, (err, sponsor) => {
      if (err) {
        logger.error('Failed to find sponsor: ' + err)
        req.session.error = 'Something went wrong'
        res.redirect('/sponsor#news-tab-nav')
      }
      if (req.body.new && req.body.new === req.body.new2) {
        bcrypt.compare(req.body.old, sponsor[0].password_hash, (err, checkpass) => {
          if (checkpass) {
            bcrypt.hash(req.body.new, saltRounds, (err, pw_hash) => {
              sponsor[0].password_hash = pw_hash
              sponsor[0].save((err, user) => {
                if (err) {
                  logger.error('Failed to update sponsor on change password: ' + err)
                  req.session.error = 'Something went wrong'
                  res.redirect('/sponsor#news-tab-nav')
                }
                logger.info(req.session.user + ' succesfully changed password')
                req.session.success = 'Changed Password'
                res.redirect('/sponsor#info-tab-nav')
              })
            })
          } else {
            logger.info(req.session.user + ' failed to changed password')
            req.session.error = 'Wrong Password'
            res.redirect('/sponsor#info-tab-nav')
          }
        })
      } else {
        logger.info(req.session.user + ' failed to changed password')
        req.session.error = 'Passwords dont match'
        res.redirect('/sponsor#info-tab-nav')
      }
    })
  })
}