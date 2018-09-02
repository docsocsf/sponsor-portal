const fs = require('fs-extra')
const zipFolder = require('zip-folder')

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

  //=====================POSITIONS========================
  
  //Show document
  app.post('/sponsor/show/:pos/:filename/:document', (req,res,next) => {
    check(req,res,next)
  },(req,res) => {
    var path = '../sponsors/' + req.session.user + '/' +  req.params.pos + '/' + req.params.filename + '/' + req.params.document
    var data = fs.readFileSync(path) 
    res.send(data) 
  }) 

  //Download member
  app.post('/sponsor/download/user/:pos/:filename/', (req,res,next) => {
    check(req,res,next)
  },(req,res) => {
    var path = '../sponsors/' + req.session.user + '/' +  req.params.pos + '/' + req.params.filename
    var zippath = '../temp/' + req.params.filename + '.zip'
    zipFolder(path, zippath, function(err) {
      if(err) {
          console.log('oh no!', err);
      } else {
        res.download(zippath, () => {
          if(fs.existsSync(zippath)){
            fs.removeSync(zippath) 
          }
        })
      }
    });
  }) 
  
  //Download Position
  app.post('/sponsor/download/pos/:pos/', (req,res,next) => {
    check(req,res,next)
  },(req,res) => {
    var path = '../sponsors/' + req.session.user + '/' +  req.params.pos
    var zippath = '../temp/' + req.params.pos + '.zip'
    zipFolder(path, zippath, function(err) {
      if(err) {
          console.log('oh no!', err);
      } else {
        res.download(zippath, () => {
          if(fs.existsSync(zippath)){
            fs.removeSync(zippath) 
          }
        })
      }
    });
  }) 
  
  //Add new Position
  app.post('/sponsor/add-position', (req,res,next) => {
    check(req,res,next)
  },(req,res) => {
    db.Sponsor.find({username: req.session.user} , (err, sponsor) => {
      if (err) return 
      if(req.body.name.trim() && !sponsor[0].positions.some(position => position.name === req.body.name.trim())){
        var data = {
          name: req.body.name.trim(),
          description: req.body.description,
          requirements: req.body.requirements,
          link: req.body.link,
          users: []
        }
        var path = '../sponsors/' + req.session.user + '/' +  req.body.name.trim() + '/'
        if(!fs.existsSync(path)){
          fs.mkdirSync(path) 
        }
        sponsor[0].positions.push(data) 
        sponsor[0].save((err, user) => {
          if (err) return 
          res.render('sponsor', {sponsor: sponsor[0]})
        }) 
      }else{
        res.render('sponsor', {sponsor: sponsor[0], err: "Position name is blank or already exists"})
      }
    }) 
  }) 
  
  //Remove Position
  app.post('/sponsor/remove-position/:name', (req,res,next) => {
    check(req,res,next)
  },(req,res) => {
    db.Sponsor.find({username: req.session.user} , (err, sponsor) => {
      if (err) return   
      var path = '../sponsors/' + req.session.user + '/' +  req.params.name + '/'
      if(fs.existsSync(path)){
        fs.removeSync(path) 
      }
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

  //=======================================NEWS=================================








  //=====================================ACCOUNT=================================
  
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