const fs = require('fs')

var check = (req,res, callback) => {
  if(req.session.login){
    if(req.session.type == 'sponsor'){
      callback() 
    }else if(req.session.type == 'member'){
      res.redirect('/member') 
    }
  }else{
    res.redirect('/') 
  }
}

exports.setup = (app, db) => {
  
  //sponsor PAGE
  app.get('/sponsor', (req,res,next) => {
    check(req,res,next)
  }, (req,res) => {
    db.Sponsor.find({username: req.session.user},(err, sponsor) => {
      res.render('sponsor', {sponsor: sponsor[0]})
    }) 
  }) 
  
  //sponsor Show CV
  app.post('/sponsor/sponsor-show-cv/:path/:name', (req,res,next) => {
    check(req,res,next)
  },(req,res) => {
    var data = fs.readFileSync(__dirname + '/cvs/' + req.params.path + '/' + req.params.name) 
    res.contentType('application/pdf') 
    res.send(data) 
  }) 
  
  //Add new Position
  app.post('/sponsor/add-position', (req,res,next) => {
    check(req,res,next)
  },(req,res) => {
    db.Sponsor.find({username: req.session.user} , (err, sponsor) => {
      if (err) return next(err) 
      if(req.body.name && !sponsor[0].positions.some(position => position.name === req.body.name)){
        var data = {
          name: req.body.name,
          info: req.body.info,
          users: []
        }
        sponsor[0].positions.push(data) 
        sponsor[0].save((err, user) => {
          if (err) return next(err) 
          res.redirect('/sponsor')
        }) 
      }else{
        res.render('sponsor', {name: sponsor[0].name, username: sponsor[0].username, positions: sponsor[0].positions, error: "Position name is blank or already exists"})
      }
    }) 
  }) 
  
  //Remove Position
  app.post('/sponsor/remove-position/:name', (req,res,next) => {
    check(req,res,next)
  },(req,res) => {
    db.Sponsor.find({username: req.session.user} , (err, sponsor) => {
      if (err) return next(err) 
      sponsor[0].positions = sponsor[0].positions.filter(position => position.name !== req.params.name) 
      sponsor[0].save((err, user) => {
        if (err) return next(err) 
        res.render('sponsor', {name: sponsor[0].name, username: sponsor[0].username, positions: sponsor[0].positions})
      }) 
    }) 
  }) 

  app.post('/sponsor/remove-position/', (req,res,next) => {
    check(req,res,next)
  },(req,res) => {
    db.Sponsor.find({username: req.session.user} , (err, sponsor) => {
      if (err) return next(err)
      res.render('sponsor', {name: sponsor[0].name, username: sponsor[0].username, positions: sponsor[0].positions})
    }) 
  }) 
  
  //change-name
  app.post('/sponsor/change-name', (req,res,next) => {
    check(req,res,next)
  },(req,res) => {
    db.Sponsor.find({username: req.session.user} , (err, sponsor) => {
      if (err) return next(err) 
      sponsor[0].name = req.body.name
      sponsor[0].save((err, user) => {
        if (err) return next(err) 
        res.render('sponsor', {name: sponsor[0].name, username: sponsor[0].username, positions: sponsor[0].positions})
      }) 
    }) 
  })
  
  //change Username
  app.post('/sponsor/change-username', (req,res,next) => {
    check(req,res,next)
  },(req,res) => {
    db.Sponsor.find({username: req.session.user} , (err, sponsor) => {
      if (err) return next(err) 
      sponsor[0].username = req.body.username
      req.session.user = req.body.username
      sponsor[0].save((err, user) => {
        if (err) return next(err) 
        res.render('sponsor', {name: sponsor[0].name, username: sponsor[0].username, positions: sponsor[0].positions})
      }) 
    }) 
  }) 
  
  //change Password
  app.post('/sponsor/change-password', (req,res,next) => {
    check(req,res,next)
  },(req,res) => {
    db.Sponsor.find({username: req.session.user} , (err, sponsor) => {
      if (err) return next(err)
      if(sponsor[0].password === req.body.oldpass && req.body.pass1 === req.body.pass2) {
        sponsor[0].password = req.body.pass1
        sponsor[0].save((err, user) => {
          if (err) return next(err) 
          res.render('sponsor', {name: sponsor[0].name, username: sponsor[0].username, positions: sponsor[0].positions})
        }) 
      }else{
        res.render('sponsor', {name: sponsor[0].name, username: sponsor[0].username, positions: sponsor[0].positions, error: "Error while trying to change password. Please try again."})
      }
    }) 
  }) 
}