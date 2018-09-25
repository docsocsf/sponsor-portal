const logger = require('./logger.js')

var check = (req, res, callback) => {
  if (req.session.login) {
    callback()
  } else {
    res.redirect('/')
  }
}

exports.setup = (app, db) => {
  app.get('/API/sponsors/news/:sponsor/:title/', (req, res, next) => {
    check(req, res, next)
  }, (req, res) => {
    logger.info('API request '+req.params.sponsor+' news: ' +req.params.title)
    db.Sponsor.find({
      username: req.params.sponsor
    }, (err, sponsor) => {
      var sent = false
      sponsor[0].news.forEach(news => {
        if (news.title.trim() == req.params.title.trim()) {
          res.send(news)
          sent = true
        }
      })
      if(!sent)
        res.send('')
    })
  })
}