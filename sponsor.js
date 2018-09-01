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
  app.post('/sponsor/sponsor-show-cv/:pos/:user/:name', (req,res,next) => {
    check(req,res,next)
  },(req,res) => {
    var data = fs.readFileSync(__dirname + '/sponsors/positions/' +  req.params.pos + '/' + req.params.user + '/' + req.params.name) 
    res.contentType('application/pdf') 
    res.send(data) 
  }) 
  
  //Add new Position
  app.post('/sponsor/add-position', (req,res,next) => {
    check(req,res,next)
  },(req,res) => {
    db.Sponsor.find({username: req.session.user} , (err, sponsor) => {
      if (err) return 
      if(req.body.name && !sponsor[0].positions.some(position => position.name === req.body.name)){
        var data = {
          name: trim(req.body.name),
          description: req.body.description,
          requirements: req.body.requirements,
          link: req.body.link,
          users: []
        }
        var path = './sponsors/' + req.session.user + '/' +  req.body.name + '/'
        if(!fs.existsSync(path)){
          fs.mkdirSync(path) 
        }
        sponsor[0].positions.push(data) 
        sponsor[0].save((err, user) => {
          if (err) return 
          res.render('sponsor', {sponsor: sponsor[0]})
        }) 
      }else{
        res.render('sponsor', {sponsor: sponsor[0], error: "Position name is blank or already exists"})
      }
    }) 
  }) 
  
  //Remove Position
  app.post('/sponsor/remove-position/:name', (req,res,next) => {
    check(req,res,next)
  },(req,res) => {
    db.Sponsor.find({username: req.session.user} , (err, sponsor) => {
      if (err) return   
      sponsor[0].positions = sponsor[0].positions.filter(position => position.name !== req.params.name) 
      sponsor[0].save((err, user) => {
        if (err) return   
        res.render('sponsor', {sponsor: sponsor[0]})
      }) 
    }) 
  }) 

  app.post('/sponsor/remove-position/', (req,res,next) => {
    check(req,res,next)
  },(req,res) => {
    db.Sponsor.find({username: req.session.user} , (err, sponsor) => {
      if (err) return  
      res.render('sponsor', {sponsor: sponsor[0]})
    }) 
  }) 
  
  //change Password
  app.post('/sponsor/change-password', (req,res,next) => {
    check(req,res,next)
  },(req,res) => {
    db.Sponsor.find({username: req.session.user} , (err, sponsor) => {
      if (err) return  
      if(sponsor[0].password === req.body.oldpass && req.body.pass1 === req.body.pass2) {
        sponsor[0].password = req.body.pass1
        sponsor[0].save((err, user) => {
          if (err) return   
          res.render('sponsor', {name: sponsor[0].name, username: sponsor[0].username, positions: sponsor[0].positions})
        }) 
      }else{
        res.render('sponsor', {name: sponsor[0].name, username: sponsor[0].username, positions: sponsor[0].positions, error: "Error while trying to change password. Please try again."})
      }
    }) 
  }) 
}