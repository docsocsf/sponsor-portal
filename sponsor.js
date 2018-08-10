const fs = require('fs')

exports.setup = (app, db) => {
  
  //sponsor PAGE
  app.get('/sponsor', (req,res,next) => {
    if(req.session.login){
      if(req.session.type == 'sponsor'){
        next() 
      }else if(req.session.type == 'member'){
        res.redirect('/member') 
      }
    }else{
      res.redirect('/') 
    }
  }, (req,res) => {
    db.Sponsor.find({username: req.session.user},(err, sponsor) => {
      res.render('sponsor', {name: sponsor[0].name, username: sponsor[0].username, positions: sponsor[0].positions})
    }) 
  }) 
  
  //sponsor Show CV
  app.post('/sponsor-show-cv/:path/:name', (req,res,next) => {
    if(req.session.login){
      if(req.session.type == 'member'){
        res.redirect('/member') 
      }else if(req.session.type == 'sponsor'){
        next() 
      }else{
        res.redirect('/') 
      }
    }
  },(req,res) => {
    var data = fs.readFileSync(__dirname + '/cvs/' + req.params.path + '/' + req.params.name) 
    res.contentType('application/pdf') 
    res.send(data) 
  }) 
  
  //Add new Position
  app.post('/add-position', (req,res,next) => {
    if(req.session.login){
      if(req.session.type == 'member'){
        res.redirect('/member') 
      }else if(req.session.type == 'sponsor'){
        next() 
      }else{
        res.redirect('/') 
      }
    }
  },(req,res) => {
    db.Sponsor.find({username: req.session.user} , (err, sponsor) => {
      if (err) return next(err) 
      if(!sponsor[0].positions.some(position => position.name === req.body.name)){
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
        res.render('sponsor', {name: sponsor[0].name, username: sponsor[0].username, positions: sponsor[0].positions, error: "Position name already exists"})
      }
    }) 
  }) 
  
  //Remove Position
  app.post('/remove-position/:name', (req,res,next) => {
    if(req.session.login){
      if(req.session.type == 'member'){
        res.redirect('/member') 
      }else if(req.session.type == 'sponsor'){
        next() 
      }else{
        res.redirect('/') 
      }
    }
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
  
  //change-name
  app.post('/change-name', (req,res,next) => {
    if(req.session.login){
      if(req.session.type == 'member'){
        res.redirect('/member') 
      }else if(req.session.type == 'sponsor'){
        next() 
      }else{
        res.redirect('/') 
      }
    }
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
  app.post('/change-username', (req,res,next) => {
    if(req.session.login){
      if(req.session.type == 'member'){
        res.redirect('/member') 
      }else if(req.session.type == 'sponsor'){
        next() 
      }else{
        res.redirect('/') 
      }
    }
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
  app.post('/change-password', (req,res,next) => {
    if(req.session.login){
      if(req.session.type == 'member'){
        res.redirect('/member') 
      }else if(req.session.type == 'sponsor'){
        next() 
      }else{
        res.redirect('/') 
      }
    }
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
  
  // ==============PORTAL===================
  
  //PORTAL LOGIN PAGE
  app.get('/portal-login', (req,res) => {
    res.render('portal-login') 
  }) 
  
  //portal auth
  app.post('/portal-login', (req,res,next) => {
    if(req.session.docsoc){
      res.redirect('/portal') 
    }else{
      next() 
    }
  }, (req,res) => {
    var user = req.body.user 
    var pass = req.body.pass 
    if(user === 'docsoc' && pass === 'docsoc'){
      req.session.docsoc = true 
      res.redirect('/portal') 
    }else{
      res.redirect('/') 
    }
  })
  
  //PORTAL PAGE
  app.get('/portal', (req,res,next) => {
    if(req.session.docsoc){
      next() 
    }else{
      res.redirect('/portal-login') 
    }
  }, (req,res) => {
    db.Sponsor.find((err, s) => {
      res.render('portal', {sponsors: s}) 
    })
  }) 
  
  //Add new sponsor
  app.post('/new-sponsor', (req,res) => {
    //make sponsor
    var sponsor = new db.Sponsor({
      username: req.body.user,
      name: req.body.name,
      password: req.body.pass,
      rank: req.body.rank,
      posts: [],
      positions: []
    }) 
    //save sponsor
    sponsor.save((err, user) => {
      if (err) {
        return next(err)
      } else {
        res.redirect('/portal') 
      }
    }) 
  }) 
  
  //Remove db.Sponsor
  app.post('/remove-sponsor/:user', (req,res) => {
    db.Sponsor.remove({username: req.params.user} , (err) => {
      if (err) {
        return next(err)
      } else {
        res.redirect('/portal') 
      }
    }) 
  }) 
}